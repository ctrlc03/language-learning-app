'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language, DifficultyLevel, AppSettings } from '@/types';
import { useStorage } from './StorageContext';
import { StorageKeys } from '@/lib/storage/interface';

interface LanguageContextValue {
  language: Language;
  difficulty: DifficultyLevel;
  showAnnotations: boolean;
  speechRate: number;
  setLanguage: (lang: Language) => void;
  setDifficulty: (diff: DifficultyLevel) => void;
  setShowAnnotations: (show: boolean) => void;
  setSpeechRate: (rate: number) => void;
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'chinese',
  difficulty: 'beginner',
  showAnnotations: true,
  speechRate: 0.8,
  maxNewCardsPerDay: 20,
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const storage = useStorage();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.get<AppSettings>(StorageKeys.settings()).then(saved => {
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });
      setLoaded(true);
    });
  }, [storage]);

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettings(prev => {
        const next = { ...prev, ...partial };
        storage.set(StorageKeys.settings(), next);
        return next;
      });
    },
    [storage]
  );

  const value: LanguageContextValue = {
    language: settings.language,
    difficulty: settings.difficulty,
    showAnnotations: settings.showAnnotations,
    speechRate: settings.speechRate,
    setLanguage: (lang) => updateSettings({ language: lang }),
    setDifficulty: (diff) => updateSettings({ difficulty: diff }),
    setShowAnnotations: (show) => updateSettings({ showAnnotations: show }),
    setSpeechRate: (rate) => updateSettings({ speechRate: rate }),
    settings,
    updateSettings,
  };

  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
