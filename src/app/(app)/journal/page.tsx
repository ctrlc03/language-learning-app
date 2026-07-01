'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '@/hooks/use-progress';
import { useSRS } from '@/hooks/use-srs';
import { useStorage } from '@/contexts/StorageContext';
import { StoragePrefixes } from '@/lib/storage/interface';
import { InkCard } from '@/components/ink/primitives';
import type { DailyActivity } from '@/types';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// fixed per-skill weights so the matrix reads as a varied profile, scaled by
// each language's real corpus coverage.
const SKILLS: { name: string; w: number }[] = [
  { name: 'Reading', w: 0.92 },
  { name: 'Listening', w: 0.7 },
  { name: 'Writing', w: 0.8 },
  { name: 'Speaking', w: 0.55 },
  { name: 'Grammar', w: 0.85 },
  { name: 'Vocabulary', w: 1.0 },
];

export default function JournalPage() {
  const { progress } = useProgress();
  const { decks } = useSRS();
  const storage = useStorage();
  const [daysActive, setDaysActive] = useState(0);

  useEffect(() => {
    (async () => {
      const acts = await storage.getAll<DailyActivity>(StoragePrefixes.activity);
      setDaysActive(acts.length);
    })();
  }, [storage]);

  const jpWords = useMemo(
    () => decks.filter((d) => d.language === 'japanese').reduce((s, d) => s + d.cardCount, 0),
    [decks],
  );
  const zhWords = useMemo(
    () => decks.filter((d) => d.language === 'chinese').reduce((s, d) => s + d.cardCount, 0),
    [decks],
  );

  const xp =
    progress.totalReviews * 5 + progress.totalExercises * 8 + progress.totalConversations * 10;
  const level = Math.floor(xp / 300) + 1;
  const xpFloor = (level - 1) * 300;
  const xpToNext = level * 300;
  const xpPct = Math.round(((xp - xpFloor) / (xpToNext - xpFloor)) * 100);

  const jpFactor = clamp01(0.25 + jpWords / 300);
  const zhFactor = clamp01(0.25 + zhWords / 300);

  const achievements = [
    {
      id: 'a1',
      glyph: '続',
      title: '30-Day Path',
      sub: 'A month unbroken',
      on: progress.streak >= 30,
    },
    {
      id: 'a2',
      glyph: '百',
      title: 'Hundred Glyphs',
      sub: '100 cards',
      on: jpWords + zhWords >= 100,
    },
    { id: 'a3', glyph: '束', title: 'Deck Builder', sub: '3 decks studied', on: decks.length >= 3 },
    {
      id: 'a4',
      glyph: '復',
      title: 'Steady Revisit',
      sub: '50 reviews',
      on: progress.totalReviews >= 50,
    },
    {
      id: 'a5',
      glyph: '話',
      title: 'First Words',
      sub: 'A conversation',
      on: progress.totalConversations >= 1,
    },
    {
      id: 'a6',
      glyph: '流',
      title: 'Flow State',
      sub: '100-day streak',
      on: progress.streak >= 100,
    },
  ];
  const earned = achievements.filter((a) => a.on).length;

  return (
    <>
      <div className="page-top">
        <div>
          <div className="greet">あなたの歩み · your path so far</div>
          <h1>
            Journal<span className="cjk"> · 記録</span>
          </h1>
        </div>
        <div className="date">
          Days walked
          <b>{daysActive}</b>
          streak {progress.streak}
        </div>
      </div>

      <div className="journal-grid">
        <div className="side-stack">
          <InkCard className="profile">
            <div className="seal-avatar" />
            <div className="handle">Wayfarer</div>
            <div className="role">Level {level} · 修行者</div>
            <div className="xp-track">
              <div className="fill" style={{ width: `${clamp01(xpPct / 100) * 100}%` }} />
            </div>
            <div className="xp-meta">
              <span>{xp} XP</span>
              <span>{xpToNext} next</span>
            </div>
            <div className="grid2">
              <div className="c">
                <div className="k">Streak</div>
                <div className="v">{progress.streak}d</div>
              </div>
              <div className="c">
                <div className="k">Active</div>
                <div className="v">{daysActive}d</div>
              </div>
              <div className="c">
                <div className="k">日本語</div>
                <div className="v">{jpWords}</div>
              </div>
              <div className="c">
                <div className="k">中文</div>
                <div className="v">{zhWords}</div>
              </div>
            </div>
          </InkCard>
        </div>

        <div className="side-stack">
          <InkCard className="matrix-card" title="Skill matrix" cjk="技">
            <div className="matrix-head">
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Dual-track proficiency</span>
              <div className="lg">
                <span>
                  <i className="jp" />
                  日本語
                </span>
                <span>
                  <i className="zh" />
                  中文
                </span>
              </div>
            </div>
            {SKILLS.map((s) => {
              const jp = Math.round(clamp01(jpFactor * s.w) * 100);
              const zh = Math.round(clamp01(zhFactor * s.w) * 100);
              return (
                <div key={s.name} className="skill">
                  <div className="nm">{s.name}</div>
                  <div className="sbar jp">
                    <div className="fill" style={{ width: `${jp}%` }} />
                    <span className="pct">{jp}</span>
                  </div>
                  <div className="sbar zh">
                    <div className="fill" style={{ width: `${zh}%` }} />
                    <span className="pct">{zh}</span>
                  </div>
                </div>
              );
            })}
          </InkCard>

          <InkCard
            className="seals-card"
            title="Seals earned"
            cjk="印"
            meta={`${earned} / ${achievements.length}`}
          >
            <div className="seals-grid">
              {achievements.map((a) => (
                <div key={a.id} className={`seal-item ${a.on ? 'on' : 'off'}`}>
                  <div className="stamp">{a.glyph}</div>
                  <div className="t">{a.title}</div>
                  <div className="s">{a.sub}</div>
                </div>
              ))}
            </div>
          </InkCard>
        </div>
      </div>
    </>
  );
}
