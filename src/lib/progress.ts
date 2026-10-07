/**
 * Streak, totals and today's counters.
 *
 * The pure functions fold one update into stored state. The store keeps one live copy per storage
 * adapter, runs storage writes one at a time and notifies subscribers, so every `useProgress`
 * instance (the top-bar streak chip, the page being studied) sees a change the moment it lands.
 */

import type { DailyActivity, StorageAdapter, UserProgress } from '@/types';
import { StorageKeys, StoragePrefixes } from '@/lib/storage/interface';
import { getToday, shiftDay } from '@/lib/utils';

export const EMPTY_PROGRESS: UserProgress = {
  streak: 0,
  lastActiveDate: '',
  totalReviews: 0,
  totalExercises: 0,
};

function emptyActivity(date: string): DailyActivity {
  return {
    date,
    reviews: 0,
    exercises: 0,
    conversationMessages: 0,
    newCards: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  };
}

/** Keeps only the fields the record still has, so older stored shapes load cleanly. */
function readProgress(saved: UserProgress | null): UserProgress {
  return {
    streak: saved?.streak ?? 0,
    lastActiveDate: saved?.lastActiveDate ?? '',
    totalReviews: saved?.totalReviews ?? 0,
    totalExercises: saved?.totalExercises ?? 0,
  };
}

/** Adds an update to a day's counters. Older records may lack newer counters, so each starts at 0. */
function addActivity(day: DailyActivity, update: Partial<DailyActivity>): DailyActivity {
  const sum = (key: Exclude<keyof DailyActivity, 'date'>) => (day[key] ?? 0) + (update[key] ?? 0);
  return {
    date: day.date,
    reviews: sum('reviews'),
    exercises: sum('exercises'),
    conversationMessages: sum('conversationMessages'),
    newCards: sum('newCards'),
    correctAnswers: sum('correctAnswers'),
    totalAnswers: sum('totalAnswers'),
  };
}

/** Counts the update into the totals and moves the streak on if this is the first activity today. */
function advanceProgress(
  progress: UserProgress,
  update: Partial<DailyActivity>,
  today: string,
): UserProgress {
  const next: UserProgress = {
    ...progress,
    totalReviews: progress.totalReviews + (update.reviews ?? 0),
    totalExercises: progress.totalExercises + (update.exercises ?? 0),
  };
  // `<` rather than `!==`: after travelling west the local date can trail the last active date.
  if (progress.lastActiveDate < today) {
    next.streak = progress.lastActiveDate === shiftDay(today, -1) ? progress.streak + 1 : 1;
    next.lastActiveDate = today;
  }
  return next;
}

/** The streak as it stands today: it survives until the end of the day after the last activity. */
function currentStreak(progress: UserProgress, today: string): number {
  return progress.lastActiveDate >= shiftDay(today, -1) ? progress.streak : 0;
}

/** Whether anything was recorded on a day. Records may predate newer counters, so each defaults to 0. */
export function hasActivity(day: DailyActivity): boolean {
  return (day.reviews ?? 0) + (day.exercises ?? 0) + (day.conversationMessages ?? 0) > 0;
}

/** Totals and streak rebuilt from stored daily records, for a learner whose progress record was never written. */
function progressFromHistory(days: DailyActivity[]): UserProgress {
  const active = days.filter(hasActivity);
  const dates = new Set(active.map((d) => d.date));
  const lastActiveDate = [...dates].sort().at(-1) ?? '';
  let streak = 0;
  for (let day = lastActiveDate; dates.has(day); day = shiftDay(day, -1)) streak += 1;
  return {
    streak,
    lastActiveDate,
    totalReviews: active.reduce((sum, d) => sum + (d.reviews ?? 0), 0),
    totalExercises: active.reduce((sum, d) => sum + (d.exercises ?? 0), 0),
  };
}

export interface ProgressSnapshot {
  /** `streak` is the live streak: 0 once a day has been missed, whatever is stored. */
  progress: UserProgress;
  todayActivity: DailyActivity | null;
  loading: boolean;
}

export const INITIAL_SNAPSHOT: ProgressSnapshot = {
  progress: EMPTY_PROGRESS,
  todayActivity: null,
  loading: true,
};

export interface ProgressStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ProgressSnapshot;
  /** Loads from storage the first time it is called each day; later calls are no-ops. */
  refresh: () => Promise<void>;
  /** Adds to today's counters, the running totals and the streak. */
  recordActivity: (update: Partial<DailyActivity>) => Promise<void>;
}

/**
 * The stored progress record. With no record yet, start from the daily history already stored, so a
 * learner who has been studying keeps their streak and totals instead of restarting at zero.
 */
async function loadProgress(storage: StorageAdapter): Promise<UserProgress> {
  const saved = await storage.get<UserProgress>(StorageKeys.progress());
  return saved
    ? readProgress(saved)
    : progressFromHistory(await storage.getAll<DailyActivity>(StoragePrefixes.activity));
}

function createProgressStore(storage: StorageAdapter): ProgressStore {
  let snapshot = INITIAL_SNAPSHOT;
  let loadedDay: string | null = null;
  let queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<() => void>();

  const publish = (progress: UserProgress, todayActivity: DailyActivity | null, today: string) => {
    snapshot = {
      progress: { ...progress, streak: currentStreak(progress, today) },
      todayActivity,
      loading: false,
    };
    listeners.forEach((notify) => notify());
  };

  // Storage read-modify-write cycles run one at a time, so two quick calls can't overwrite each other.
  const serialize = <T>(job: () => Promise<T>): Promise<T> => {
    const run = queue.then(job);
    queue = run.catch(() => undefined);
    return run;
  };

  const refresh = async () => {
    const today = getToday();
    if (loadedDay === today) return;
    loadedDay = today;
    try {
      await serialize(async () => {
        const [progress, activity] = await Promise.all([
          loadProgress(storage),
          storage.get<DailyActivity>(StorageKeys.activity(today)),
        ]);
        publish(progress, activity, today);
      });
    } catch (error) {
      loadedDay = null;
      throw error;
    }
  };

  const recordActivity = (update: Partial<DailyActivity>) =>
    serialize(async () => {
      const today = getToday();
      const [before, existing] = await Promise.all([
        loadProgress(storage),
        storage.get<DailyActivity>(StorageKeys.activity(today)),
      ]);
      const activity = addActivity(existing ?? emptyActivity(today), update);
      const progress = advanceProgress(before, update, today);
      await storage.set(StorageKeys.activity(today), activity);
      await storage.set(StorageKeys.progress(), progress);
      loadedDay = today;
      publish(progress, activity, today);
    });

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    refresh,
    recordActivity,
  };
}

const stores = new WeakMap<StorageAdapter, ProgressStore>();

/** The one store for a storage adapter. */
export function getProgressStore(storage: StorageAdapter): ProgressStore {
  let store = stores.get(storage);
  if (!store) {
    store = createProgressStore(storage);
    stores.set(storage, store);
  }
  return store;
}
