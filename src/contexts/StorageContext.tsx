'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { StorageAdapter } from '@/types';
import { LocalStorageAdapter } from '@/lib/storage/local-storage';
import { IndexedDBAdapter, isIndexedDBAvailable } from '@/lib/storage/indexeddb';
import { requestPersistentStorage } from '@/lib/storage/persist';

const StorageContext = createContext<StorageAdapter | null>(null);

// IndexedDB is the real store (no 5 MB cap, async writes). localStorage remains
// the fallback where IDB is unavailable. Existing localStorage data is copied
// across on the IDB adapter's first open.
function createAdapter(): StorageAdapter {
  return isIndexedDBAvailable() ? new IndexedDBAdapter() : new LocalStorageAdapter();
}

export function StorageProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialiser: one adapter per provider, created on first render only.
  const [storage] = useState<StorageAdapter>(createAdapter);

  useEffect(() => {
    void requestPersistentStorage();
  }, []);

  return <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>;
}

export function useStorage(): StorageAdapter {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error('useStorage must be used within StorageProvider');
  return ctx;
}
