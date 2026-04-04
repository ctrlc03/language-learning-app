'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStorage } from '@/contexts/StorageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLanguageName, getAnnotationType } from '@/lib/language/utils';
import { getAvailableVoices, speak, setPreferredVoice, getPreferredVoiceName } from '@/lib/tts/speech';
import type { Language, DifficultyLevel } from '@/types';

export default function SettingsPage() {
  const {
    language, difficulty, showAnnotations, speechRate,
    setLanguage, setDifficulty, setShowAnnotations, setSpeechRate,
    settings, updateSettings,
  } = useLanguage();
  const { theme, setTheme } = useTheme();
  const storage = useStorage();
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

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
      const voice = voices.find(v => v.name === voiceName);
      if (voice) setPreferredVoice(language, voice);
    }
  };

  const handleTestVoice = () => {
    const sample = language === 'chinese' ? '你好，我是你的中文老师。' : 'こんにちは、日本語の先生です。';
    speak(sample, language, speechRate);
  };

  const handleExport = async () => {
    const data = await storage.exportData();
    setExportData(data);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `langbot-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importData.trim()) return;
    try {
      await storage.importData(importData);
      setImportStatus('Data imported successfully! Refresh the page to see changes.');
      setImportData('');
    } catch {
      setImportStatus('Failed to import data. Please check the format.');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Language & Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Language</label>
            <div className="flex gap-2 mt-1">
              {(['chinese', 'japanese'] as Language[]).map(lang => (
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

          <div>
            <label className="text-sm font-medium">Difficulty</label>
            <div className="flex gap-2 p-2">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map(diff => (
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
              onChange={e => setSpeechRate(parseFloat(e.target.value))}
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
                onChange={e => handleVoiceChange(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Auto-select best voice</option>
                {voices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang}{v.localService ? ', local' : ', remote'})
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={handleTestVoice} className="shrink-0">
                Test
              </Button>
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
              onChange={e => updateSettings({ maxNewCardsPerDay: parseInt(e.target.value) || 20 })}
              min={1}
              max={100}
              className="mt-1 w-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                  theme === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={handleExport} variant="outline">
              Export All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Download all your data as a JSON file
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Import Data</label>
            <textarea
              value={importData}
              onChange={e => setImportData(e.target.value)}
              placeholder="Paste exported JSON data here..."
              className="w-full h-24 mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex items-center gap-2 mt-1">
              <Button onClick={handleImport} variant="outline" size="sm" disabled={!importData.trim()}>
                Import
              </Button>
              {importStatus && (
                <p className="text-xs text-muted-foreground">{importStatus}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
