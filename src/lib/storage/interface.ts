import type { StorageAdapter } from '@/types';

export type { StorageAdapter };

export const STORAGE_PREFIX = 'langbot:';

export const StorageKeys = {
  conversation: (id: string) => `${STORAGE_PREFIX}conv:${id}`,
  card: (id: string) => `${STORAGE_PREFIX}card:${id}`,
  deck: (id: string) => `${STORAGE_PREFIX}deck:${id}`,
  vocab: (id: string) => `${STORAGE_PREFIX}vocab:${id}`,
  progress: () => `${STORAGE_PREFIX}progress`,
  settings: () => `${STORAGE_PREFIX}settings`,
  activity: (date: string) => `${STORAGE_PREFIX}activity:${date}`,
} as const;

export const StoragePrefixes = {
  conversations: `${STORAGE_PREFIX}conv:`,
  cards: `${STORAGE_PREFIX}card:`,
  decks: `${STORAGE_PREFIX}deck:`,
  vocab: `${STORAGE_PREFIX}vocab:`,
  activity: `${STORAGE_PREFIX}activity:`,
} as const;
