import type { StorageAdapter } from '@/types';
import { STORAGE_PREFIX } from './interface';

export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  async getAll<T>(prefix: string): Promise<T[]> {
    if (typeof window === 'undefined') return [];
    const results: T[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) results.push(JSON.parse(item));
        } catch {
          // skip invalid items
        }
      }
    }
    return results;
  }

  async query<T>(prefix: string, filter?: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll<T>(prefix);
    return filter ? all.filter(filter) : all;
  }

  async exportData(): Promise<string> {
    if (typeof window === 'undefined') return '{}';
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const data = JSON.parse(jsonString) as Record<string, unknown>;
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }
}
