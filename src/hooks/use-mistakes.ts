'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  dismissMistake,
  loadMistakes,
  recordExerciseResult,
  recordSelfCheckResult,
  retryOrder,
  type Mistake,
  type MistakeSource,
} from '@/lib/mistakes';
import type { SelfCheckItem } from '@/lib/selfcheck/parse';
import type { Exercise } from '@/types';

/** Feeds answers into the mistake notebook: a miss files the item, right answers retire it. */
export function useMistakeLog() {
  const storage = useStorage();

  const recordExercise = useCallback(
    (exercise: Exercise, correct: boolean, source: MistakeSource, userAnswer?: string) => {
      void recordExerciseResult(storage, exercise, correct, source, userAnswer);
    },
    [storage],
  );

  const recordSelfCheck = useCallback(
    (item: SelfCheckItem, correct: boolean, source: MistakeSource, userAnswer?: string) => {
      void recordSelfCheckResult(storage, item, correct, source, userAnswer);
    },
    [storage],
  );

  return { recordExercise, recordSelfCheck };
}

/** The notebook for the current language: open mistakes in retry order, plus every record. */
export function useMistakes() {
  const storage = useStorage();
  const { language } = useLanguage();
  const [all, setAll] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadMistakes(storage, language);
      if (alive) {
        setAll(loaded);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [storage, language, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const dismiss = useCallback(
    async (mistake: Mistake) => {
      await dismissMistake(storage, mistake);
      reload();
    },
    [storage, reload],
  );

  const open = useMemo(() => retryOrder(all), [all]);
  const masteredCount = all.length - open.length;

  return { open, masteredCount, loading, reload, dismiss };
}
