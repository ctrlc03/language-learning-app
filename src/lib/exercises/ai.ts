/**
 * AI-written practice exercises: the contract between the Practice page and
 * /api/exercises/generate. Chinese exercises are written from the course, using
 * only the words and grammar taught up to the learner's lesson (see
 * ai-builder.ts); Japanese has AI translation only, written by level.
 */

import type { DifficultyLevel, Exercise, ExerciseType } from '@/types';

/** Chinese exercise types the AI writes from the course. */
export const AI_EXERCISE_TYPES = [
  'multiple-choice',
  'sentence-mc',
  'fill-in-blank',
  'sentence-construction',
  'grammar-drill',
  'dialogue-comprehension',
  'translation',
] as const satisfies readonly ExerciseType[];

export type AiExerciseType = (typeof AI_EXERCISE_TYPES)[number];

export function isAiExerciseType(type: ExerciseType): type is AiExerciseType {
  return (AI_EXERCISE_TYPES as readonly ExerciseType[]).includes(type);
}

/** Most practised source ids a request may carry; the newest are kept. */
export const MAX_SEEN_IDS = 300;

export type GenerateExerciseRequest =
  | {
      language: 'chinese';
      difficulty: DifficultyLevel;
      exerciseType: AiExerciseType;
      /** The learner's lesson: the exercise uses only words and grammar taught up to it. */
      lesson: number;
      /** A chosen chapter (lesson number): the exercise practises that lesson. */
      chapter?: number;
      /** Source ids (vocabulary or grammar rule ids) already practised; others come first. */
      seen?: string[];
    }
  | {
      language: 'japanese';
      difficulty: DifficultyLevel;
      exerciseType: 'translation';
      /** Recent questions, so the next one differs. */
      previousQuestions?: string[];
    };

export interface GenerateExerciseResponse {
  exercise: Exercise;
}

/** An exercise from the server; rejects with the server's learner-readable message. */
export async function requestAiExercise(body: GenerateExerciseRequest): Promise<Exercise> {
  let res: Response;
  try {
    res = await fetch('/api/exercises/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const payload = (await res.json().catch(() => null)) as
    (Partial<GenerateExerciseResponse> & { error?: unknown }) | null;
  if (!res.ok || !payload?.exercise?.data?.type) {
    throw new Error(
      typeof payload?.error === 'string' && payload.error
        ? payload.error
        : 'Failed to generate an exercise. Please try again.',
    );
  }
  return payload.exercise;
}
