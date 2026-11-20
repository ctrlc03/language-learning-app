'use client';

import { useRef, useState } from 'react';
import { MAX_SEEN_IDS, requestAiExercise } from '@/lib/exercises/ai';
import type { DifficultyLevel, Exercise } from '@/types';

export interface ListeningQuizRunner {
  exercise: Exercise | null;
  loading: boolean;
  error: string | null;
  /** Shows the next quiz: the one written while the last was answered, when it still fits. */
  next: () => Promise<void>;
}

/** AI listening quizzes for the learner's lesson, the next written while the current one is answered. */
export function useListeningQuiz(lesson: number, difficulty: DifficultyLevel): ListeningQuizRunner {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Words already practised, so each quiz is built around a new one. */
  const seen = useRef<string[]>([]);
  /** The next quiz and the settings it was asked for; it resolves null when it couldn't be written. */
  const queued = useRef<{ key: string; promise: Promise<Exercise | null> } | null>(null);

  const key = `${lesson}|${difficulty}`;
  const write = () =>
    requestAiExercise({
      language: 'chinese',
      difficulty,
      exerciseType: 'listening',
      lesson,
      seen: seen.current.slice(-MAX_SEEN_IDS),
    });

  const next = async () => {
    const ready = queued.current?.key === key ? queued.current.promise : null;
    queued.current = null;
    setLoading(true);
    setError(null);
    try {
      const quiz = (ready && (await ready)) ?? (await write());
      seen.current = [...seen.current, quiz.sourceId ?? quiz.id];
      setExercise(quiz);
      queued.current = { key, promise: write().catch(() => null) };
    } catch (err) {
      setExercise(null);
      setError(err instanceof Error ? err.message : 'Could not write a listening quiz. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return { exercise, loading, error, next };
}
