import type Anthropic from '@anthropic-ai/sdk';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  aiError,
  aiErrorResponse,
  getAnthropicClient,
  missingKeyResponse,
} from '@/lib/claude/client';
import {
  buildCourseExerciseSystem,
  buildCourseExerciseTask,
  buildJapaneseTranslationPrompt,
} from '@/lib/claude/prompts/exercises';
import { courseWordList } from '@/lib/chat/scenarios';
import { chineseLessons } from '@/data/chinese/vocabulary';
import { AI_EXERCISE_TYPES, MAX_SEEN_IDS, type GenerateExerciseResponse } from '@/lib/exercises/ai';
import {
  buildExercise,
  EXERCISE_TOOL,
  exerciseTool,
  planExercise,
  type BuildResult,
  type ExercisePlan,
} from '@/lib/exercises/ai-builder';
import type { DifficultyLevel, Exercise, TranslationData } from '@/types';

const MODEL = 'claude-haiku-4-5-20251001';
/** A reply that strays from the course is sent back once with what was wrong. */
const MAX_ATTEMPTS = 2;

const shippedLessons = new Set(chineseLessons.map((l) => l.lesson));
const lessonNumber = z
  .number()
  .int()
  .refine((n) => shippedLessons.has(n), { message: 'Unknown lesson' });
const difficulty = z.enum(['beginner', 'intermediate', 'advanced']);

const requestSchema = z.discriminatedUnion('language', [
  z.object({
    language: z.literal('chinese'),
    difficulty,
    exerciseType: z.enum(AI_EXERCISE_TYPES),
    lesson: lessonNumber,
    chapter: lessonNumber.optional(),
    seen: z.array(z.string().max(100)).max(MAX_SEEN_IDS).default([]),
  }),
  z.object({
    language: z.literal('japanese'),
    difficulty,
    exerciseType: z.literal('translation'),
    previousQuestions: z.array(z.string().max(500)).max(10).default([]),
  }),
]);

/** One model call for `plan`: the exercise, or why the reply can't be used. */
async function attempt(
  client: Anthropic,
  system: string,
  plan: ExercisePlan,
  problems: readonly string[],
): Promise<BuildResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system,
    tools: [exerciseTool(plan)],
    tool_choice: { type: 'tool', name: EXERCISE_TOOL },
    messages: [{ role: 'user', content: buildCourseExerciseTask(plan, problems) }],
  });
  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    return { problem: `Call the ${EXERCISE_TOOL} tool with the exercise.` };
  }
  return buildExercise(plan, toolUse.input, Math.random);
}

/** A Chinese exercise written from the course words and grammar up to the learner's lesson. */
async function courseExercise(client: Anthropic, plan: ExercisePlan): Promise<Exercise | null> {
  const system = buildCourseExerciseSystem(
    plan.lesson,
    plan.difficulty,
    courseWordList(plan.lesson),
  );
  const problems: string[] = [];
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const result = await attempt(client, system, plan, problems);
    if ('exercise' in result) return result.exercise;
    console.error(`Exercise (${plan.type}) attempt ${i + 1} unusable: ${result.problem}`);
    problems.push(result.problem);
  }
  return null;
}

const japaneseTranslationTool: Anthropic.Tool = {
  name: 'create_exercise',
  description:
    'Create a translation language learning exercise. Return all fields at the top level.',
  input_schema: {
    type: 'object',
    properties: {
      question: { type: 'string', description: 'The main question or prompt for the student' },
      instruction: {
        type: 'string',
        description: 'Brief instructions telling the student what to do',
      },
      sourceText: { type: 'string', description: 'Text to translate' },
      sourceLanguage: {
        type: 'string',
        description: 'Language of the source text ("english" or "japanese")',
      },
      targetLanguage: { type: 'string', description: 'Language to translate into' },
      sampleAnswer: { type: 'string', description: 'A good sample translation' },
    },
    required: [
      'question',
      'instruction',
      'sourceText',
      'sourceLanguage',
      'targetLanguage',
      'sampleAnswer',
    ],
  },
};

const japaneseTranslationInput = z.object({
  question: z.string().default('Translate this sentence.'),
  instruction: z.string().default(''),
  sourceText: z.string().min(1),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  sampleAnswer: z.string().default(''),
});

const asLanguage = (name: string) => (/japanese/i.test(name) ? 'japanese' : 'english');

/** A Japanese translation exercise at the learner's level (Japanese has no course lessons). */
async function japaneseTranslation(
  client: Anthropic,
  level: DifficultyLevel,
  previousQuestions: readonly string[],
): Promise<Exercise | null> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: [japaneseTranslationTool],
    tool_choice: { type: 'tool', name: japaneseTranslationTool.name },
    messages: [{ role: 'user', content: buildJapaneseTranslationPrompt(level, previousQuestions) }],
  });
  const toolUse = response.content.find((block) => block.type === 'tool_use');
  const parsed = japaneseTranslationInput.safeParse(
    toolUse?.type === 'tool_use' ? toolUse.input : null,
  );
  if (!parsed.success) return null;
  const input = parsed.data;
  const data: TranslationData = {
    type: 'translation',
    sourceText: input.sourceText,
    sourceLanguage: asLanguage(input.sourceLanguage),
    targetLanguage: asLanguage(input.targetLanguage),
    sampleAnswer: input.sampleAnswer,
  };
  return {
    id: nanoid(),
    type: 'translation',
    language: 'japanese',
    difficulty: level,
    question: input.question,
    instruction: input.instruction,
    data,
    createdAt: Date.now(),
  };
}

export async function POST(request: Request) {
  const missingKey = missingKeyResponse();
  if (missingKey) return missingKey;

  try {
    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return aiError('That exercise request was not valid.', 400);
    }
    const body = parsedBody.data;
    const client = getAnthropicClient();

    let exercise: Exercise | null;
    if (body.language === 'chinese') {
      const plan = planExercise(
        {
          type: body.exerciseType,
          difficulty: body.difficulty,
          lesson: body.lesson,
          chapter: body.chapter,
          seen: body.seen,
        },
        Math.random,
      );
      if (!plan) {
        return aiError('There is nothing to practise this way in the chosen lessons yet.', 422);
      }
      exercise = await courseExercise(client, plan);
    } else {
      exercise = await japaneseTranslation(client, body.difficulty, body.previousQuestions);
    }

    if (!exercise) {
      return aiError('The AI could not write a usable exercise this time. Please try again.', 502);
    }
    const payload: GenerateExerciseResponse = { exercise };
    return Response.json(payload);
  } catch (error) {
    console.error('Exercise generation error:', error);
    return aiErrorResponse(error, 'Failed to generate exercise');
  }
}
