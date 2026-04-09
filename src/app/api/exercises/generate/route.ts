import { getAnthropicClient } from '@/lib/claude/client';
import { buildExerciseGenerationPrompt } from '@/lib/claude/prompts/exercises';
import type { Language, DifficultyLevel, ExerciseType } from '@/types';

function buildToolForType(exerciseType: ExerciseType) {
  const baseProperties = {
    question: { type: 'string' as const, description: 'The main question or prompt for the student' },
    instruction: { type: 'string' as const, description: 'Brief instructions telling the student what to do' },
  };

  const typeSchemas: Record<ExerciseType, { properties: Record<string, unknown>; required: string[] }> = {
    'multiple-choice': {
      properties: {
        ...baseProperties,
        options: { type: 'array' as const, items: { type: 'string' as const }, description: 'Array of 4 answer choices' },
        correctIndex: { type: 'number' as const, description: 'Zero-based index of the correct answer (0-3)' },
        explanation: { type: 'string' as const, description: 'Why the correct answer is right' },
      },
      required: ['question', 'instruction', 'options', 'correctIndex', 'explanation'],
    },
    'sentence-mc': {
      properties: {
        ...baseProperties,
        options: { type: 'array' as const, items: { type: 'string' as const }, description: 'Array of 4 answer choices' },
        correctIndex: { type: 'number' as const, description: 'Zero-based index of the correct answer (0-3)' },
        explanation: { type: 'string' as const, description: 'Why the correct answer is right' },
      },
      required: ['question', 'instruction', 'options', 'correctIndex', 'explanation'],
    },
    'fill-in-blank': {
      properties: {
        ...baseProperties,
        sentence: { type: 'string' as const, description: 'Sentence with ___ marking the blank' },
        answer: { type: 'string' as const, description: 'The correct answer for the blank' },
        acceptableAnswers: { type: 'array' as const, items: { type: 'string' as const }, description: 'Other acceptable answers' },
        hint: { type: 'string' as const, description: 'Optional hint for the student' },
      },
      required: ['question', 'instruction', 'sentence', 'answer', 'acceptableAnswers'],
    },
    'translation': {
      properties: {
        ...baseProperties,
        sourceText: { type: 'string' as const, description: 'Text to translate' },
        sourceLanguage: { type: 'string' as const, description: 'Language of the source text (e.g. "english" or "chinese")' },
        targetLanguage: { type: 'string' as const, description: 'Language to translate into' },
        sampleAnswer: { type: 'string' as const, description: 'A good sample translation' },
      },
      required: ['question', 'instruction', 'sourceText', 'sourceLanguage', 'targetLanguage', 'sampleAnswer'],
    },
    'sentence-construction': {
      properties: {
        ...baseProperties,
        words: { type: 'array' as const, items: { type: 'string' as const }, description: 'Scrambled words/particles to arrange' },
        correctOrder: { type: 'string' as const, description: 'The words joined in correct order' },
        translation: { type: 'string' as const, description: 'English translation of the correct sentence' },
      },
      required: ['question', 'instruction', 'words', 'correctOrder', 'translation'],
    },
    'character-recognition': {
      properties: {
        ...baseProperties,
        character: { type: 'string' as const, description: 'The character to identify' },
        options: { type: 'array' as const, items: { type: 'string' as const }, description: 'Array of 4 meaning choices' },
        correctIndex: { type: 'number' as const, description: 'Zero-based index of the correct meaning (0-3)' },
        reading: { type: 'string' as const, description: 'Pinyin or hiragana reading' },
        meaning: { type: 'string' as const, description: 'Correct English meaning' },
      },
      required: ['question', 'instruction', 'character', 'options', 'correctIndex', 'reading', 'meaning'],
    },
    'grammar-drill': {
      properties: {
        ...baseProperties,
        grammarPoint: { type: 'string' as const, description: 'The grammar pattern being tested' },
        sentence: { type: 'string' as const, description: 'Sentence with ___ marking the blank' },
        answer: { type: 'string' as const, description: 'The correct answer' },
        acceptableAnswers: { type: 'array' as const, items: { type: 'string' as const }, description: 'Other acceptable answers' },
        explanation: { type: 'string' as const, description: 'Explanation of the grammar point' },
      },
      required: ['question', 'instruction', 'grammarPoint', 'sentence', 'answer', 'acceptableAnswers', 'explanation'],
    },
    'dialogue-reading': {
      properties: {
        ...baseProperties,
        title: { type: 'string' as const, description: 'Dialogue title' },
        setting: { type: 'string' as const, description: 'Dialogue setting description' },
      },
      required: ['question', 'instruction', 'title', 'setting'],
    },
  };

  const schema = typeSchemas[exerciseType];

  return {
    name: 'create_exercise' as const,
    description: `Create a ${exerciseType} language learning exercise. Return all fields at the top level.`,
    input_schema: {
      type: 'object' as const,
      properties: schema.properties,
      required: schema.required,
    },
  };
}

function buildExerciseData(exerciseType: ExerciseType, input: Record<string, unknown>) {
  // Extract only the exercise-specific fields (not question/instruction)
  const { question, instruction, ...rest } = input;

  switch (exerciseType) {
    case 'multiple-choice':
      return {
        type: 'multiple-choice' as const,
        options: (rest.options as string[]) ?? [],
        correctIndex: (rest.correctIndex as number) ?? 0,
        explanation: (rest.explanation as string) ?? '',
      };
    case 'sentence-mc':
      return {
        type: 'multiple-choice' as const,
        options: (rest.options as string[]) ?? [],
        correctIndex: (rest.correctIndex as number) ?? 0,
        explanation: (rest.explanation as string) ?? '',
      };
    case 'fill-in-blank':
      return {
        type: 'fill-in-blank' as const,
        sentence: (rest.sentence as string) ?? '',
        answer: (rest.answer as string) ?? '',
        acceptableAnswers: (rest.acceptableAnswers as string[]) ?? [],
        hint: (rest.hint as string) ?? undefined,
      };
    case 'translation':
      return {
        type: 'translation' as const,
        sourceText: (rest.sourceText as string) ?? '',
        sourceLanguage: (rest.sourceLanguage as string) ?? 'english',
        targetLanguage: (rest.targetLanguage as string) ?? 'chinese',
        sampleAnswer: (rest.sampleAnswer as string) ?? '',
      };
    case 'sentence-construction':
      return {
        type: 'sentence-construction' as const,
        words: (rest.words as string[]) ?? [],
        correctOrder: (rest.correctOrder as string) ?? '',
        translation: (rest.translation as string) ?? '',
      };
    case 'character-recognition':
      return {
        type: 'character-recognition' as const,
        character: (rest.character as string) ?? '',
        options: (rest.options as string[]) ?? [],
        correctIndex: (rest.correctIndex as number) ?? 0,
        reading: (rest.reading as string) ?? '',
        meaning: (rest.meaning as string) ?? '',
      };
    case 'grammar-drill':
      return {
        type: 'grammar-drill' as const,
        grammarPoint: (rest.grammarPoint as string) ?? '',
        sentence: (rest.sentence as string) ?? '',
        answer: (rest.answer as string) ?? '',
        acceptableAnswers: (rest.acceptableAnswers as string[]) ?? [],
        explanation: (rest.explanation as string) ?? '',
      };
    case 'dialogue-reading':
      return {
        type: 'dialogue-reading' as const,
        title: (rest.title as string) ?? '',
        setting: (rest.setting as string) ?? '',
        lines: [],
      };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { language, difficulty, exerciseType, topic, previousQuestions } = body as {
      language: Language;
      difficulty: DifficultyLevel;
      exerciseType: ExerciseType;
      topic?: string;
      previousQuestions?: string[];
    };

    const client = getAnthropicClient();
    const prompt = buildExerciseGenerationPrompt(language, difficulty, exerciseType, topic, previousQuestions);
    const tool = buildToolForType(exerciseType);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [tool],
      tool_choice: { type: 'tool', name: 'create_exercise' },
      messages: [{ role: 'user', content: prompt }],
    });

    const toolUse = response.content.find(block => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('No tool use in response');
    }

    const input = toolUse.input as Record<string, unknown>;
    const data = buildExerciseData(exerciseType, input);

    return Response.json({
      question: (input.question as string) ?? 'Complete the exercise',
      instruction: (input.instruction as string) ?? '',
      data,
    });
  } catch (error) {
    console.error('Exercise generation error:', error);
    return Response.json(
      { error: 'Failed to generate exercise' },
      { status: 500 }
    );
  }
}
