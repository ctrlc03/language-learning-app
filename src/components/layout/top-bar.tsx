'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Clock } from '@/components/layout/clock';
import type { DifficultyLevel } from '@/types';

export function TopBar() {
  const { language, difficulty, setLanguage, setDifficulty } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border px-4 md:px-6"
      style={{
        background: 'oklch(0.10 0.04 285 / 0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Mobile brand */}
      <div className="md:hidden flex items-center gap-2">
        <div className="brand-mark cjk-jp text-sm" style={{ width: 24, height: 24, fontSize: 14 }}>言</div>
        <span className="font-display text-xs font-bold tracking-[0.15em]">KOTOBA.EXE</span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Status indicators - desktop only */}
        <div className="hidden lg:flex items-center gap-5 text-[11px] tracking-[0.1em] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            LINK <span className="font-medium" style={{ color: 'var(--neon-lime)' }}>◉ ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            MODE <span className="font-medium text-foreground">DUAL·CJK</span>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex items-center border border-border" style={{ background: 'oklch(0.14 0.05 285)' }}>
          <button
            onClick={() => setLanguage('chinese')}
            className={`h-8 px-3 text-xs tracking-[0.1em] transition-colors ${
              language === 'chinese'
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={language === 'chinese' ? { background: 'oklch(0.82 0.18 210 / 0.15)', color: 'var(--neon-cyan)' } : {}}
          >
            中文
          </button>
          <button
            onClick={() => setLanguage('japanese')}
            className={`h-8 px-3 text-xs tracking-[0.1em] transition-colors border-l border-border ${
              language === 'japanese'
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={language === 'japanese' ? { background: 'oklch(0.72 0.26 350 / 0.15)', color: 'var(--neon-pink)' } : {}}
          >
            日本語
          </button>
        </div>

        {/* Difficulty selector */}
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
          className="h-8 border border-border px-2 text-[11px] tracking-[0.1em] text-foreground hidden sm:block"
          style={{ background: 'oklch(0.14 0.05 285)' }}
        >
          <option value="beginner">BEGINNER</option>
          <option value="intermediate">INTERMEDIATE</option>
          <option value="advanced">ADVANCED</option>
        </select>

        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 border border-border text-[10px] tracking-[0.1em]"
          style={{ borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)', background: 'oklch(0.14 0.05 285)' }}
        >
          ● REC
        </div>

        {/* Clock - desktop only */}
        <div className="hidden md:block">
          <Clock />
        </div>
      </div>
    </header>
  );
}
