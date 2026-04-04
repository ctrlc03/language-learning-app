'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import type { Language, DifficultyLevel } from '@/types';

export function TopBar() {
  const { language, difficulty, setLanguage, setDifficulty } = useLanguage();
  const { resolvedTheme, setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4">
      {/* Mobile menu button placeholder */}
      <div className="md:hidden" id="mobile-menu-trigger" />

      <div className="flex items-center gap-2 ml-auto">
        {/* Language selector */}
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setLanguage('chinese')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              language === 'chinese'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => setLanguage('japanese')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              language === 'japanese'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            日本語
          </button>
        </div>

        {/* Difficulty selector */}
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
          className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const next = resolvedTheme === 'dark' ? 'light' : 'dark';
            setTheme(next);
          }}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </Button>
      </div>
    </header>
  );
}
