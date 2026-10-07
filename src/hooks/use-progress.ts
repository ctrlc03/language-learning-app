'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { INITIAL_SNAPSHOT, getProgressStore } from '@/lib/progress';

/**
 * Streak, running totals and today's activity. Every caller shares one store per storage adapter,
 * so recording activity anywhere updates the top-bar streak chip and any open page immediately.
 */
export function useProgress() {
  const store = getProgressStore(useStorage());
  const { progress, todayActivity, loading } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => INITIAL_SNAPSHOT,
  );

  useEffect(() => {
    void store.refresh();
  }, [store]);

  return { progress, todayActivity, loading, recordActivity: store.recordActivity };
}
