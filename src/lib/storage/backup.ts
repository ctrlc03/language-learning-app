import { STORAGE_PREFIX, StoragePrefixes } from './interface';

export type BackupData = Record<string, unknown>;

export interface BackupSummary {
  keys: number;
  cards: number;
  decks: number;
  activityDays: number;
  conversations: number;
}

/**
 * Parse and validate an exported backup. Throws an Error whose message is safe to
 * show the user: the payload must be a JSON object and every key must be a `langbot:*`
 * storage key, so a wrong file can never write foreign keys into the store.
 */
export function parseBackup(json: string): BackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('This file is not an inkpath backup: expected a JSON object of stored data.');
  }
  const keys = Object.keys(parsed);
  if (keys.length === 0) {
    throw new Error('This backup is empty: there is nothing to import.');
  }
  const foreign = keys.find((key) => !key.startsWith(STORAGE_PREFIX));
  if (foreign !== undefined) {
    throw new Error(
      `This file is not an inkpath backup: key "${foreign}" does not start with "${STORAGE_PREFIX}".`,
    );
  }
  return parsed as BackupData;
}

export function summarizeBackup(data: BackupData): BackupSummary {
  const count = (prefix: string) =>
    Object.keys(data).filter((key) => key.startsWith(prefix)).length;
  return {
    keys: Object.keys(data).length,
    cards: count(StoragePrefixes.cards),
    decks: count(StoragePrefixes.decks),
    activityDays: count(StoragePrefixes.activity),
    conversations: count(StoragePrefixes.conversations),
  };
}

function updatedAtOf(value: unknown): number | null {
  if (typeof value !== 'object' || value === null) return null;
  const updatedAt = (value as { updatedAt?: unknown }).updatedAt;
  return typeof updatedAt === 'number' ? updatedAt : null;
}

/**
 * Merge rule: an imported value replaces an existing one only when both carry a
 * numeric `updatedAt` and the imported one is newer. Otherwise the existing value
 * is kept; missing keys are always added (callers check existence first).
 */
export function importedValueWins(existing: unknown, imported: unknown): boolean {
  const existingAt = updatedAtOf(existing);
  const importedAt = updatedAtOf(imported);
  return existingAt !== null && importedAt !== null && importedAt > existingAt;
}
