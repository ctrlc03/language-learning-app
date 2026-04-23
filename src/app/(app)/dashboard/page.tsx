'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProgress } from '@/hooks/use-progress';
import { useSRS } from '@/hooks/use-srs';
import { Panel } from '@/components/ui/panel';
import { Clock } from '@/components/layout/clock';
import { getLanguageName } from '@/lib/language/utils';
import lessons from '@/data/chinese/lessons.json';

export default function DashboardPage() {
  const { language, difficulty } = useLanguage();
  const { progress, todayActivity } = useProgress();
  const { decks, cards } = useSRS();

  const dueCards = useMemo(() => {
    const langDecks = decks.filter(d => d.language === language);
    const deckIds = new Set(langDecks.map(d => d.id));
    const langCards = cards.filter(c => deckIds.has(c.deckId));
    return langCards.slice(0, 6).map(card => ({
      char: card.front,
      reading: card.reading || '',
      meaning: card.back,
      lang: language === 'chinese' ? 'zh' : 'jp',
      decay: Math.random() * 0.6 + 0.3,
    }));
  }, [decks, cards, language]);

  const frequencies = useMemo(() => {
    if (language !== 'chinese') return [];
    const data = (lessons as { lessons: { lesson: number; title: string; titleChinese?: string; vocabulary: unknown[] }[] }).lessons;
    return data.slice(0, 4).map((l, i) => ({
      id: `zh-l${l.lesson}`,
      lang: 'zh' as const,
      freq: `${76 + i * 12}.${(l.lesson * 3) % 10}`,
      band: `L${l.lesson}`,
      title: l.titleChinese || l.title,
      subtitle: l.title,
      topic: `${l.vocabulary.length} terms`,
      status: i === 0 ? 'in_progress' : i === 2 ? 'locked' : 'new',
    }));
  }, [language]);

  const accuracy = todayActivity && todayActivity.totalAnswers > 0
    ? Math.round((todayActivity.correctAnswers / todayActivity.totalAnswers) * 100)
    : 0;

  const activity = useMemo(() => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return days.map((d, i) => {
      const act = progress.dailyActivity?.[progress.dailyActivity.length - 7 + i];
      return { day: d, minutes: act ? (act.reviews + act.exercises) * 2 : Math.floor(Math.random() * 30 + 5) };
    });
  }, [progress]);

  return (
    <div className="p-5 md:p-8 lg:px-12">
      {/* Page header */}
      <div className="flex items-end justify-between mb-7 border-b border-dashed border-border pb-5">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5">
            KOTOBA.EXE / <span className="text-primary font-medium">SIGNAL</span> / {new Date().toISOString().slice(0, 10).replace(/-/g, '.')}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[0.08em]">
            SIGNAL<span className="text-muted-foreground font-medium">·DECK</span>
          </h1>
        </div>
        <div className="hidden md:block">
          <Clock />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
        {/* Hero panel - spans full width */}
        <Panel className="lg:col-span-2 p-7 md:p-8 overflow-hidden relative">
          {/* Background kanji watermark */}
          <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 cjk-jp font-bold text-[280px] md:text-[380px] leading-none pointer-events-none select-none"
            style={{
              color: 'oklch(0.72 0.26 350 / 0.08)',
              textShadow: '2px 0 0 oklch(0.72 0.26 350 / 0.08), -2px 0 0 oklch(0.82 0.18 210 / 0.08)',
            }}
          >
            言
          </div>

          <div className="relative z-[1]">
            <div className="text-[10px] tracking-[0.3em] text-primary mb-3">
              ▲ BROADCAST · 今日 · TODAY
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-[0.04em] leading-tight mb-3">
              {language === 'chinese' ? '你好' : 'こんにちは'}，<br />
              <span style={{ color: 'var(--neon-cyan)' }}>TUNE IN</span>.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl tracking-[0.04em]">
              {frequencies.length > 0 ? `${frequencies.filter(f => f.status !== 'locked').length} active frequencies waiting. ` : ''}
              Your {getLanguageName(language)} signal is building.
              {dueCards.length > 0 && ` ${dueCards.length} items decaying — stabilize before midnight to keep your streak intact.`}
            </p>

            {/* Metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <MetricCard label="STREAK" value={progress.streak} unit="d" color="pink" sparkle="▲" />
              <MetricCard label="REVIEWS" value={todayActivity?.reviews ?? 0} color="cyan" sparkle="◆" />
              <MetricCard label="EXERCISES" value={todayActivity?.exercises ?? 0} color="lime" sparkle="◉" />
              <MetricCard label="ACCURACY" value={accuracy} unit="%" color="amber" sparkle="△" />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/exercises">
                <button className="font-mono text-[11px] tracking-[0.2em] uppercase px-5 py-3 font-bold inline-flex items-center gap-2.5 transition-all"
                  style={{
                    color: 'oklch(0.10 0 0)',
                    background: 'var(--neon-pink)',
                    border: '1px solid var(--neon-pink)',
                    boxShadow: '0 0 24px oklch(0.72 0.26 350 / 0.5)',
                  }}
                >
                  TUNE·IN <span>▶</span>
                </button>
              </Link>
              <Link href="/flashcards">
                <button className="font-mono text-[11px] tracking-[0.2em] uppercase px-5 py-3 font-medium inline-flex items-center gap-2.5 border transition-all hover:bg-[oklch(0.82_0.18_210/0.12)]"
                  style={{ color: 'var(--neon-cyan)', borderColor: 'var(--border)' }}
                >
                  REPAIR DECAY ↻
                </button>
              </Link>
            </div>
          </div>
        </Panel>

        {/* Frequencies list */}
        {frequencies.length > 0 && (
          <Panel tag="FREQUENCIES" meta={`${frequencies.length} AVAIL`}>
            <div className="p-1">
              {frequencies.map(f => (
                <Link key={f.id} href={f.status === 'locked' ? '#' : '/exercises'}>
                  <div className={`grid grid-cols-[72px_1fr_auto] gap-4 px-4 py-3.5 items-center border-b border-border/50 last:border-b-0 transition-colors ${f.status === 'locked' ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer hover:bg-primary/[0.06]'}`}>
                    <div className="font-display text-lg font-bold tracking-[0.04em]"
                      style={{ color: 'var(--neon-cyan)', textShadow: '0 0 6px oklch(0.82 0.18 210 / 0.5)' }}
                    >
                      {f.freq}<span className="text-[8px] tracking-[0.1em] text-muted-foreground font-normal font-mono ml-0.5">MHz</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="cjk-zh text-lg font-bold truncate">{f.title}</span>
                        <span className="text-[10px] tracking-[0.15em] text-muted-foreground">· {f.subtitle}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground tracking-[0.1em] flex gap-2">
                        <span className="px-1.5 border border-border font-medium"
                          style={{ color: 'var(--neon-cyan)', borderColor: 'oklch(0.82 0.18 210 / 0.4)' }}
                        >
                          {f.band}
                        </span>
                        <span>{f.topic}</span>
                      </div>
                    </div>
                    <div className="text-[10px] tracking-[0.2em] px-3 py-1.5 border border-border text-muted-foreground">
                      {f.status === 'locked' ? 'LOCKED △' : f.status === 'in_progress' ? 'RESUME ▶' : 'ENTER ▶'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        )}

        {/* Decay queue */}
        <Panel tag="DECAY·QUEUE" meta={dueCards.length > 0 ? 'AMBER = URGENT' : 'ALL CLEAR'}>
          {dueCards.length > 0 ? (
            <div className="grid grid-cols-2">
              {dueCards.map((d, i) => (
                <Link key={i} href="/flashcards">
                  <div className="px-4 py-3.5 border-r border-b border-border/50 [&:nth-child(2n)]:border-r-0 grid grid-cols-[44px_1fr_auto] gap-3 items-center cursor-pointer transition-colors hover:bg-primary/[0.06]">
                    <div className={`${d.lang === 'zh' ? 'cjk-zh' : 'cjk-jp'} text-2xl font-bold text-center leading-none`}>
                      {d.char}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-muted-foreground tracking-[0.05em]">{d.reading}</div>
                      <div className="text-xs font-medium tracking-[0.1em] uppercase truncate">{d.meaning}</div>
                    </div>
                    <div className="decay-meter">
                      <div className="decay-meter-fill" style={{ height: `${Math.round(d.decay * 100)}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs tracking-[0.15em]">
              NO DECAY DETECTED · ALL STABLE
            </div>
          )}
        </Panel>

        {/* Activity chart */}
        <Panel tag="ACTIVITY · 7D" meta="INTENSITY" className="lg:col-span-2">
          <div className="px-5 py-4 flex justify-between items-end h-[160px] gap-3">
            {activity.map((a, i) => {
              const max = Math.max(...activity.map(x => x.minutes), 1);
              const h = (a.minutes / max) * 110;
              const isToday = i === activity.length - 2;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative" style={{ height: `${h}px` }}>
                    <div className={`absolute inset-0 activity-bar-col ${isToday ? 'today-bar' : ''}`} />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground tracking-[0.1em]">
                      {a.minutes}
                    </div>
                  </div>
                  <div className={`text-[10px] tracking-[0.15em] ${isToday ? 'text-[var(--neon-lime)]' : 'text-muted-foreground'}`}>
                    {a.day}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color, sparkle }: {
  label: string;
  value: number;
  unit?: string;
  color: 'pink' | 'cyan' | 'lime' | 'amber';
  sparkle: string;
}) {
  const colorVar: Record<string, string> = {
    pink: 'var(--neon-pink)',
    cyan: 'var(--neon-cyan)',
    lime: 'var(--neon-lime)',
    amber: 'var(--neon-amber)',
  };

  return (
    <div className="p-4 border border-border relative overflow-hidden"
      style={{ background: 'oklch(0.14 0.04 285 / 0.7)' }}
    >
      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">{sparkle}</span>
      <div className="text-[9px] tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold mt-1.5 tracking-[0.02em]"
        style={{ color: colorVar[color], textShadow: `0 0 8px ${colorVar[color]}40` }}
      >
        {value}{unit || ''}
      </div>
    </div>
  );
}
