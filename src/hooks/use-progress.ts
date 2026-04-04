'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UserProgress, DailyActivity } from '@/types';
import { useStorage } from '@/contexts/StorageContext';
import { StorageKeys, StoragePrefixes } from '@/lib/storage/interface';
import { getToday } from '@/lib/utils';

const DEFAULT_PROGRESS: UserProgress = {
  streak: 0,
  lastActiveDate: '',
  dailyActivity: [],
  totalReviews: 0,
  totalExercises: 0,
  totalConversations: 0,
};

export function useProgress() {
  const storage = useStorage();
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    const saved = await storage.get<UserProgress>(StorageKeys.progress());
    if (saved) setProgress(saved);

    const today = getToday();
    const activity = await storage.get<DailyActivity>(StorageKeys.activity(today));
    setTodayActivity(activity);

    return saved ?? DEFAULT_PROGRESS;
  }, [storage]);

  const updateStreak = useCallback(
    async (prog: UserProgress) => {
      const today = getToday();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (prog.lastActiveDate === today) return prog;

      let newStreak = prog.streak;
      if (prog.lastActiveDate === yesterday) {
        newStreak += 1;
      } else if (prog.lastActiveDate !== today) {
        newStreak = 1;
      }

      const updated: UserProgress = {
        ...prog,
        streak: newStreak,
        lastActiveDate: today,
      };

      await storage.set(StorageKeys.progress(), updated);
      setProgress(updated);
      return updated;
    },
    [storage]
  );

  const recordActivity = useCallback(
    async (update: Partial<DailyActivity>) => {
      const today = getToday();
      const existing = await storage.get<DailyActivity>(StorageKeys.activity(today));
      const activity: DailyActivity = existing ?? {
        date: today,
        reviews: 0,
        exercises: 0,
        conversationMessages: 0,
        newCards: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      };

      if (update.reviews) activity.reviews += update.reviews;
      if (update.exercises) activity.exercises += update.exercises;
      if (update.conversationMessages) activity.conversationMessages += update.conversationMessages;
      if (update.newCards) activity.newCards += update.newCards;
      if (update.correctAnswers) activity.correctAnswers += update.correctAnswers;
      if (update.totalAnswers) activity.totalAnswers += update.totalAnswers;

      await storage.set(StorageKeys.activity(today), activity);
      setTodayActivity(activity);

      // Update streak
      const prog = await storage.get<UserProgress>(StorageKeys.progress());
      if (prog) await updateStreak(prog);
    },
    [storage, updateStreak]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadProgress();
      setLoading(false);
    })();
  }, [loadProgress]);

  return {
    progress,
    todayActivity,
    loading,
    loadProgress,
    recordActivity,
    updateStreak,
  };
}
