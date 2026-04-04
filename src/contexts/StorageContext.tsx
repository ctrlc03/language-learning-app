'use client';

import { createContext, useContext, useRef } from 'react';
import type { StorageAdapter } from '@/types';
import { LocalStorageAdapter } from '@/lib/storage/local-storage';

const StorageContext = createContext<StorageAdapter | null>(null);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const storageRef = useRef<StorageAdapter>(new LocalStorageAdapter());

  return (
    <StorageContext.Provider value={storageRef.current}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage(): StorageAdapter {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error('useStorage must be used within StorageProvider');
  return ctx;
}
