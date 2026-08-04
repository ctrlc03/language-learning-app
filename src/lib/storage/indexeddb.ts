/**
 * IndexedDB-backed storage.
 *
 * localStorage was the original adapter, but it is synchronous, capped at ~5 MB
 * per origin, and throws QuotaExceededError mid-write once a few thousand cards
 * plus journal entries accumulate — losing the write with no way to recover it.
 * IndexedDB has no practical cap for this workload and writes off the main
 * thread.
 *
 * Everything lives in one object store keyed by the same `langbot:*` strings the
 * localStorage adapter used, so prefix scans (`getAll`) still work via a key
 * range and no call site needs to change. On first use we copy any existing
 * localStorage data across, then leave the original in place as a backup.
 */

import type { StorageAdapter } from '@/types';
import { STORAGE_PREFIX } from './interface';

const DB_NAME = 'langbot';
const DB_VERSION = 1;
const STORE = 'kv';
const MIGRATION_FLAG = 'langbot:migrated-to-idb';

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Key range covering every key starting with `prefix`. */
function prefixRange(prefix: string): IDBKeyRange {
  return IDBKeyRange.bound(prefix, prefix + '￿', false, false);
}

export function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

export class IndexedDBAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).then(async (db) => {
      await this.migrateFromLocalStorage(db);
      return db;
    });
    return this.dbPromise;
  }

  /**
   * One-time copy of `langbot:*` keys out of localStorage. Runs inside the same
   * open() promise so no read can observe a half-migrated database.
   */
  private async migrateFromLocalStorage(db: IDBDatabase): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    const entries: [string, unknown][] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(STORAGE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      try {
        entries.push([key, JSON.parse(raw)]);
      } catch {
        entries.push([key, raw]);
      }
    }

    if (entries.length > 0) {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      // Don't clobber anything already in IDB — IDB is the newer source of truth.
      for (const [key, value] of entries) {
        const existing = await promisify(store.get(key));
        if (existing === undefined) store.put(value, key);
      }
      await txDone(tx);
    }

    localStorage.setItem(MIGRATION_FLAG, String(Date.now()));
  }

  async get<T>(key: string): Promise<T | null> {
    if (!isIndexedDBAvailable()) return null;
    const db = await this.open();
    const tx = db.transaction(STORE, 'readonly');
    const value = await promisify(tx.objectStore(STORE).get(key));
    return (value as T) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!isIndexedDBAvailable()) return;
    const db = await this.open();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    await txDone(tx);
  }

  async delete(key: string): Promise<void> {
    if (!isIndexedDBAvailable()) return;
    const db = await this.open();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    await txDone(tx);
  }

  async getAll<T>(prefix: string): Promise<T[]> {
    if (!isIndexedDBAvailable()) return [];
    const db = await this.open();
    const tx = db.transaction(STORE, 'readonly');
    const values = await promisify(tx.objectStore(STORE).getAll(prefixRange(prefix)));
    return values as T[];
  }

  async query<T>(prefix: string, filter?: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll<T>(prefix);
    return filter ? all.filter(filter) : all;
  }

  async exportData(): Promise<string> {
    if (!isIndexedDBAvailable()) return '{}';
    const db = await this.open();
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const range = prefixRange(STORAGE_PREFIX);
    const [keys, values] = await Promise.all([
      promisify(store.getAllKeys(range)),
      promisify(store.getAll(range)),
    ]);
    const data: Record<string, unknown> = {};
    keys.forEach((key, i) => {
      data[String(key)] = values[i];
    });
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    if (!isIndexedDBAvailable()) return;
    const data = JSON.parse(jsonString) as Record<string, unknown>;
    const db = await this.open();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(STORAGE_PREFIX)) store.put(value, key);
    }
    await txDone(tx);
  }

  /** Wipe every app key. Used by the offline-reset button. */
  async clearAll(): Promise<void> {
    if (!isIndexedDBAvailable()) return;
    const db = await this.open();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(prefixRange(STORAGE_PREFIX));
    await txDone(tx);
  }
}
