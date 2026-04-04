import { getAnthropicClient } from '@/lib/claude/client';
import { buildExerciseEvaluationPrompt } from '@/lib/claude/prompts/exercises';
import type { Language, DifficultyLevel } from '@/types';

export async function POST(request: Request) {
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
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Exercise: ${exercise.question}\nInstruction: ${exercise.instruction}\nExercise data: ${JSON.stringify(exercise.data)}\n\nStudent's answer: ${userAnswer}`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      const evaluation = JSON.parse(text);
      return Response.json(evaluation);
    } catch {
      return Response.json({
        correct: false,
        feedback: text,
        suggestedAnswer: '',
        vocabulary: [],
      });
    }
  } catch (error) {
    console.error('Exercise evaluation error:', error);
    return Response.json(
      { error: 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
