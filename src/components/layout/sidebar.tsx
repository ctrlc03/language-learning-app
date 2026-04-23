'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProgress } from '@/hooks/use-progress';

const CORE_NAV = [
  { href: '/dashboard', label: 'Signal', glyph: '信' },
  { href: '/exercises', label: 'Frequency', glyph: '波', badge: 'LIVE' },
  { href: '/flashcards', label: 'Decay', glyph: '衰' },
  { href: '/chat', label: 'Transmit', glyph: '送' },
  { href: '/listening', label: 'Listen', glyph: '聴' },
];

const ARCHIVE_NAV = [
  { href: '/vocabulary', label: 'Archive', glyph: '庫' },
  { href: '/settings', label: 'Settings', glyph: '設' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { progress } = useProgress();

  const streakDays = progress.streak;
  const weekBlocks = Array.from({ length: 7 }, (_, i) => {
    const isToday = i === new Date().getDay();
    const isOn = i <= new Date().getDay();
    return (
      <div
        key={i}
        className={cn(
          'streak-block',
          isToday ? 'today' : isOn ? 'on' : '',
        )}
      />
    );
  });

  return (
    <aside className="hidden md:flex md:w-[280px] md:flex-col md:border-r md:border-border h-screen sticky top-0"
      style={{ background: 'oklch(0.10 0.04 285 / 0.6)', backdropFilter: 'blur(8px)' }}
    >
      {/* Brand */}
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <div className="brand-mark cjk-jp">言</div>
        <div>
          <div className="font-display font-bold text-sm tracking-[0.15em] text-foreground">
            KOTOBA.EXE
          </div>
          <div className="text-[10px] tracking-[0.1em] text-muted-foreground font-normal">
            v3.14 · NEON DECK
          </div>
        </div>
        <div className="status-dot ml-2" />
      </div>

      {/* Language switch */}
      <div className="flex border-b border-border mx-6 mt-4">
        <button
          onClick={() => setLanguage('japanese')}
          className={cn(
            'flex-1 py-2.5 cjk-jp text-base font-bold transition-all border-r border-border',
            language === 'japanese'
              ? 'text-foreground neon-text-pink'
              : 'text-muted-foreground hover:text-foreground',
            language === 'japanese' && 'bg-primary/15',
          )}
          style={language === 'japanese' ? { background: 'oklch(0.72 0.26 350 / 0.15)' } : {}}
        >
          日
        </button>
        <button
          onClick={() => setLanguage('chinese')}
          className={cn(
            'flex-1 py-2.5 cjk-zh text-base font-bold transition-all',
            language === 'chinese'
              ? 'text-foreground neon-text-cyan'
              : 'text-muted-foreground hover:text-foreground',
          )}
          style={language === 'chinese' ? { background: 'oklch(0.82 0.18 210 / 0.15)' } : {}}
        >
          中
        </button>
      </div>

      {/* Core nav */}
      <div className="px-0 mt-2">
        <div className="px-6 pt-4 pb-2 text-[10px] tracking-[0.2em] text-muted-foreground">
          /// CORE
        </div>
        {CORE_NAV.map(item => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3.5 px-6 py-3 text-xs tracking-[0.1em] font-medium uppercase transition-all border-l-2 border-transparent',
                isActive
                  ? 'text-primary border-l-primary neon-text-pink'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
              style={isActive ? { background: 'linear-gradient(to right, oklch(0.72 0.26 350 / 0.14), transparent)' } : {}}
            >
              <span className="cjk-jp text-lg leading-none w-[22px] text-center opacity-90">
                {item.glyph}
              </span>
              {item.label}
              {item.badge && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 border rounded-sm"
                  style={{
                    background: 'oklch(0.72 0.26 350 / 0.2)',
                    color: 'var(--neon-pink)',
                    borderColor: 'oklch(0.72 0.26 350 / 0.4)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Archive nav */}
      <div className="px-0">
        <div className="px-6 pt-4 pb-2 text-[10px] tracking-[0.2em] text-muted-foreground">
          /// ARCHIVE
        </div>
        {ARCHIVE_NAV.map(item => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3.5 px-6 py-3 text-xs tracking-[0.1em] font-medium uppercase transition-all border-l-2 border-transparent',
                isActive
                  ? 'text-primary border-l-primary neon-text-pink'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
              style={isActive ? { background: 'linear-gradient(to right, oklch(0.72 0.26 350 / 0.14), transparent)' } : {}}
            >
              <span className="cjk-jp text-lg leading-none w-[22px] text-center opacity-90">
                {item.glyph}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Streak tower */}
      <div className="mx-6 mb-5 p-4 border border-border relative overflow-hidden"
        style={{ background: 'oklch(0.08 0.03 285 / 0.6)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent, oklch(0.72 0.26 350 / 0.06))' }}
        />
        <div className="relative z-[1]">
          <div className="text-[9px] tracking-[0.2em] text-muted-foreground">
            ▲ STREAK · UNBROKEN
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display text-3xl font-bold neon-text-pink" style={{ color: 'var(--neon-pink)' }}>
              {streakDays}
            </span>
            <span className="text-[10px] tracking-[0.2em] text-muted-foreground">DAYS</span>
          </div>
          <div className="streak-blocks mt-3">
            {weekBlocks}
          </div>
        </div>
      </div>
    </aside>
  );
}
