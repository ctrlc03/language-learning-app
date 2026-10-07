'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { resolveCurrentLesson } from '@/data/chinese/vocabulary';

/**
 * The Chinese lesson the learner is on (defaults to the latest shipped lesson)
 * and a setter. Practice, Listening, Session and Today scope to lessons up to it.
 */
export function useCurrentLesson(): [number, (lesson: number) => void] {
  const { settings, updateSettings } = useLanguage();
  const setCurrentLesson = useCallback(
    (lesson: number) => updateSettings({ currentLesson: lesson }),
    [updateSettings],
  );
  return [resolveCurrentLesson(settings.currentLesson), setCurrentLesson];
}
