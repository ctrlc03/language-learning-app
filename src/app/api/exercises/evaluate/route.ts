import { z } from 'zod';
import {
  aiError,
  aiErrorResponse,
  getAnthropicClient,
  missingKeyResponse,
} from '@/lib/claude/client';
import { extractJsonObject } from '@/lib/claude/extract-json';
import { buildExerciseEvaluationPrompt } from '@/lib/claude/prompts/exercises';
import type { Language, DifficultyLevel } from '@/types';

const evaluationSchema = z.object({
  correct: z.boolean(),
  feedback: z.string(),
  suggestedAnswer: z.string().default(''),
  vocabulary: z
    .array(z.object({ word: z.string(), reading: z.string().default(''), meaning: z.string() }))
    .default([]),
});

export async function POST(request: Request) {
  const missingKey = missingKeyResponse();
  if (missingKey) return missingKey;

  try {
    const body = await request.json();
    const { language, difficulty, exercise, userAnswer } = body as {
      language: Language;
      difficulty: DifficultyLevel;
      exercise: { question: string; instruction: string; data: Record<string, unknown> };
      userAnswer: string;
    };

    const client = getAnthropicClient();
    const systemPrompt = buildExerciseEvaluationPrompt(language, difficulty);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Exercise: ${exercise.question}\nInstruction: ${exercise.instruction}\nExercise data: ${JSON.stringify(exercise.data)}\n\nStudent's answer: ${userAnswer}`,
        },
      ],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const parsed = evaluationSchema.safeParse(extractJsonObject(text));
    if (!parsed.success) {
      console.error('Exercise evaluation: unparseable model reply:', text);
      return aiError('The AI reply could not be understood. Please try again.', 502);
    }
    return Response.json(parsed.data);
  } catch (error) {
    console.error('Exercise evaluation error:', error);
    return aiErrorResponse(error, 'Failed to evaluate answer');
  }
}
