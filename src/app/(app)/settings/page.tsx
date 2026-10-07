'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStorage } from '@/contexts/StorageContext';
import { useCurrentLesson } from '@/hooks/use-current-lesson';
import { useSpeechNotice } from '@/hooks/use-speech';
import { SpeechNotice } from '@/components/shared/speak-button';
import { chineseLessons } from '@/data/chinese/vocabulary';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLanguageName, getAnnotationType } from '@/lib/language/utils';
import { plural } from '@/lib/utils';
import {
  getAvailableVoices,
  speak,
  setPreferredVoice,
  getPreferredVoiceName,
} from '@/lib/tts/speech';
import { parseBackup, summarizeBackup, type BackupSummary } from '@/lib/storage/backup';
import { requestPersistentStorage } from '@/lib/storage/persist';
import type { Language, DifficultyLevel, ImportMode } from '@/types';

export default function SettingsPage() {
  const {
    language,
    difficulty,
    showAnnotations,
    speechRate,
    setLanguage,
    setDifficulty,
    setShowAnnotations,
    setSpeechRate,
    settings,
    updateSettings,
  } = useLanguage();
  const { theme, setTheme } = useTheme();
  const storage = useStorage();
  const [currentLesson, setCurrentLesson] = useCurrentLesson();
  const [pendingImport, setPendingImport] = useState<{
    name: string;
    text: string;
    summary: BackupSummary;
  } | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [importStatus, setImportStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  // undefined = still checking, null = unsupported by this browser
  const [persisted, setPersisted] = useState<boolean | null | undefined>(undefined);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const { notice: speechNotice, reportSpeechError } = useSpeechNotice();

  useEffect(() => {
    const loadVoices = () => {
      const available = getAvailableVoices(language);
      setVoices(available);
      setSelectedVoiceName(getPreferredVoiceName(language) ?? '');
    };
    loadVoices();
    // Voices may load asynchronously
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }
  }, [language]);

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoiceName(voiceName);
    if (voiceName === '') {
      setPreferredVoice(language, null);
    } else {
      const voice = voices.find((v) => v.name === voiceName);
      if (voice) setPreferredVoice(language, voice);
    }
  };

  const handleTestVoice = () => {
    const sample =
      language === 'chinese' ? '你好，我是你的中文老师。' : 'こんにちは、日本語の先生です。';
    speak(sample, language, speechRate).catch(reportSpeechError);
  };

  const handleExport = async () => {
    const data = await storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `langbot-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshPersistence = useCallback(() => {
    requestPersistentStorage().then(setPersisted);
  }, []);

  useEffect(() => {
    refreshPersistence();
  }, [refreshPersistence]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after a fix
    if (!file) return;
    setPendingImport(null);
    try {
      const text = await file.text();
      setPendingImport({ name: file.name, text, summary: summarizeBackup(parseBackup(text)) });
      setImportStatus(null);
    } catch (err) {
      setImportStatus({
        ok: false,
        text: err instanceof Error ? err.message : 'Could not read this file.',
      });
    }
  };

  const handleImport = async () => {
    if (!pendingImport || importing) return;
    if (
      importMode === 'replace' &&
      !window.confirm(
        'Replace ALL data on this device with the contents of this file? Anything not in the file will be deleted.',
      )
    ) {
      return;
    }
    setImporting(true);
    try {
      await storage.importData(pendingImport.text, importMode);
      setImportStatus({ ok: true, text: 'Import complete. Reloading…' });
      // Hooks keep stale copies of progress/settings in memory and would overwrite the
      // imported data on their next write, so start from a clean page.
      window.location.reload();
    } catch (err) {
      setImportStatus({
        ok: false,
        text: err instanceof Error ? err.message : 'Import failed. Your data was not changed.',
      });
      setImporting(false);
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="page-top">
        <div>
          <div className="greet">
            {language === 'japanese' ? '設定 · preferences' : '设置 · preferences'}
          </div>
          <h1>
            Settings<span className="cjk"> · {language === 'japanese' ? '設定' : '设置'}</span>
          </h1>
        </div>
      </div>

      {/* Language & Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Language</label>
            <div className="flex gap-2 mt-1">
              {(['chinese', 'japanese'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    language === lang
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {getLanguageName(lang)}
                </button>
              ))}
            </div>
          </div>

          {language === 'chinese' && (
            <div>
              <label className="text-sm font-medium" htmlFor="current-lesson">
                Current lesson
              </label>
              <select
                id="current-lesson"
                value={currentLesson}
                onChange={(e) => setCurrentLesson(parseInt(e.target.value, 10))}
                className="block w-full mt-1 h-10 rounded-lg border border-border bg-background px-3 text-sm"
              >
                {chineseLessons.map((l) => (
                  <option key={l.lesson} value={l.lesson}>
                    Lesson {l.lesson} · {l.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Today, Session, Practice and Listening draw on lessons up to this one.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Difficulty</label>
            <div className="flex flex-wrap gap-2 p-2">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                    difficulty === diff
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {
                (
                  {
                    chinese: {
                      beginner:
                        'AI chat and exercises: simple words, short sentences, translations',
                      intermediate: 'AI chat and exercises: longer sentences, more new words',
                      advanced: 'AI chat and exercises: natural, native-like language',
                    },
                    japanese: {
                      beginner: 'JLPT N5 + Irodori Starter',
                      intermediate: 'JLPT N5-N4 + Irodori Starter & Elementary 1',
                      advanced: 'All vocabulary (JLPT N5-N1 + all Irodori levels)',
                    },
                  } as Record<string, Record<string, string>>
                )[language]?.[difficulty]
              }
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show {getAnnotationType(language)}</p>
              <p className="text-xs text-muted-foreground">
                Display pronunciation guides above characters
              </p>
            </div>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                showAnnotations ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  showAnnotations ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">Speech Rate: {speechRate.toFixed(1)}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full mt-1 accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow (0.5x)</span>
              <span>Normal (1.0x)</span>
              <span>Fast (2.0x)</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Voice</label>
            <div className="flex gap-2 mt-1">
              <select
                value={selectedVoiceName}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="flex-1 min-w-0 h-10 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Auto-select best voice</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang}
                    {v.localService ? ', local' : ', remote'})
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={handleTestVoice} className="shrink-0">
                Test
              </Button>
              <SpeechNotice message={speechNotice} />
            </div>
            {voices.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No {getLanguageName(language)} voices found on this device. TTS may not work.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">New Cards per Day</label>
            <Input
              type="number"
              value={settings.maxNewCardsPerDay}
              onChange={(e) =>
                updateSettings({ maxNewCardsPerDay: parseInt(e.target.value) || 20 })
              }
              min={1}
              max={100}
              className="mt-1 w-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2 mt-1">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                    theme === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {t === 'light' ? '☀ Light' : '☾ Dark'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The palette also follows your language —{' '}
            <span className="cjk" style={{ color: 'var(--bar-jp)', fontWeight: 700 }}>
              藍
            </span>{' '}
            indigo washi for Japanese,{' '}
            <span className="cjk" style={{ color: 'var(--bar-zh)', fontWeight: 700 }}>
              朱
            </span>{' '}
            cinnabar rice-paper for Chinese.
          </p>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Browser storage</p>
            {persisted === undefined ? null : persisted === null ? (
              <p className="text-xs text-muted-foreground mt-1">
                This browser cannot protect stored data from being cleared. Export a backup
                regularly.
              </p>
            ) : persisted ? (
              <p className="text-xs text-muted-foreground mt-1">
                Protected: the browser will not clear your study data to free up space.
              </p>
            ) : (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Not protected: the browser may clear your study data when the device runs low on
                  space. Export a backup regularly.
                </p>
                <Button onClick={refreshPersistence} variant="outline" size="sm">
                  Request protection
                </Button>
              </div>
            )}
          </div>

          <div>
            <Button onClick={handleExport} variant="outline">
              Export All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Download all your data as a JSON file
            </p>
          </div>

          <div>
            <label htmlFor="import-file" className="text-sm font-medium">
              Import Data
            </label>
            <input
              id="import-file"
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="block w-full mt-1 text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted"
            />
            {pendingImport && (
              <div className="mt-3 space-y-3 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium break-all">{pendingImport.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plural(pendingImport.summary.cards, 'card')} ·{' '}
                    {plural(pendingImport.summary.decks, 'deck')} ·{' '}
                    {plural(pendingImport.summary.activityDays, 'day')} of activity ·{' '}
                    {plural(pendingImport.summary.conversations, 'conversation')}
                  </p>
                </div>
                <div className="space-y-2">
                  {(
                    [
                      [
                        'merge',
                        'Merge',
                        'Add what is missing; keep what you have unless the file has a newer copy.',
                      ],
                      [
                        'replace',
                        'Replace',
                        'Delete everything on this device first, then import the file.',
                      ],
                    ] as const
                  ).map(([mode, label, hint]) => (
                    <label key={mode} className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="import-mode"
                        checked={importMode === mode}
                        onChange={() => setImportMode(mode)}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-medium">{label}</span>
                        <span className="block text-xs text-muted-foreground">{hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleImport}
                    variant={importMode === 'replace' ? 'destructive' : 'outline'}
                    size="sm"
                    disabled={importing}
                  >
                    {importMode === 'replace' ? 'Replace all data' : 'Merge into my data'}
                  </Button>
                  <Button
                    onClick={() => setPendingImport(null)}
                    variant="ghost"
                    size="sm"
                    disabled={importing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {importStatus && (
              <p
                role={importStatus.ok ? 'status' : 'alert'}
                className={`text-xs mt-2 ${importStatus.ok ? 'text-muted-foreground' : 'text-destructive'}`}
              >
                {importStatus.text}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
