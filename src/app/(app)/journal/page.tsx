'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStorage } from '@/contexts/StorageContext';
import { useMastery } from '@/hooks/use-mastery';
import { useProgress } from '@/hooks/use-progress';
import { InkCard } from '@/components/ink/primitives';
import { directionOf } from '@/lib/flashcards/direction';
import {
  countConversations,
  countStudiedDecks,
  countWords,
  forLanguage,
  loadDeckData,
  masteryAccuracy,
  reviewShare,
  type Metric,
} from '@/lib/inkpath/stats';
import { hasActivity } from '@/lib/progress';
import { StoragePrefixes } from '@/lib/storage/interface';
import type { Conversation, DailyActivity, Language } from '@/types';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** What the card decks say about one language. */
interface Track {
  /** Distinct words in the language's decks. */
  words: number;
  vocabulary: Metric | null;
  listening: Metric | null;
}

interface JournalData {
  /** Days with anything recorded. */
  daysActive: number;
  /** Conversations with at least one message from the learner. */
  conversations: number;
  studiedDecks: number;
  japanese: Track;
  chinese: Track;
}

/** One language's bar in a skill row; no data shows an empty bar and '—'. */
function SkillBar({ track, metric }: { track: 'jp' | 'zh'; metric: Metric | null }) {
  const pct = metric ? Math.round(clamp01(metric.value) * 100) : null;
  return (
    <div className={`sbar ${track}`} title={metric ? `${metric.n} ${metric.unit}` : 'No data yet'}>
      <div className="fill" style={{ width: `${pct ?? 0}%` }} />
      <span className="pct">{pct ?? '—'}</span>
    </div>
  );
}

export default function JournalPage() {
  const { language } = useLanguage();
  const storage = useStorage();
  const { progress, loading: progressLoading } = useProgress();
  const grammar = useMastery('grammar');
  const tones = useMastery('tones');
  const writing = useMastery('writing');
  const classifiers = useMastery('classifiers');
  const numbers = useMastery('numbers');
  const typing = useMastery('typing');
  const [data, setData] = useState<JournalData | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [deckData, days, conversations] = await Promise.all([
        loadDeckData(storage),
        storage.getAll<DailyActivity>(StoragePrefixes.activity),
        storage.getAll<Conversation>(StoragePrefixes.conversations),
      ]);
      if (!alive) return;
      const trackOf = (lang: Language): Track => {
        const { cards } = forLanguage(deckData, lang);
        return {
          words: countWords(cards),
          vocabulary: reviewShare(cards),
          listening: reviewShare(cards.filter((c) => directionOf(c) === 'listen')),
        };
      };
      setData({
        daysActive: days.filter(hasActivity).length,
        conversations: countConversations(conversations),
        studiedDecks: countStudiedDecks(deckData),
        japanese: trackOf('japanese'),
        chinese: trackOf('chinese'),
      });
    })();
    return () => {
      alive = false;
    };
  }, [storage]);

  const drillsLoading =
    grammar.loading ||
    tones.loading ||
    writing.loading ||
    classifiers.loading ||
    numbers.loading ||
    typing.loading;
  // Wait for everything so XP and the seals never flash a partial figure.
  if (!data || progressLoading || drillsLoading) return null;

  const isJp = language === 'japanese';

  const xp = progress.totalReviews * 5 + progress.totalExercises * 8 + data.conversations * 10;
  const level = Math.floor(xp / 300) + 1;
  const xpFloor = (level - 1) * 300;
  const xpToNext = level * 300;
  const xpPct = Math.round(((xp - xpFloor) / (xpToNext - xpFloor)) * 100);

  // The drills below are Chinese-only, so the Japanese track has nothing to show for them.
  const skills: { name: string; jp: Metric | null; zh: Metric | null }[] = [
    { name: 'Vocabulary', jp: data.japanese.vocabulary, zh: data.chinese.vocabulary },
    { name: 'Listening', jp: data.japanese.listening, zh: data.chinese.listening },
    { name: 'Grammar', jp: null, zh: masteryAccuracy(grammar.map) },
    { name: 'Tones', jp: null, zh: masteryAccuracy(tones.map) },
    { name: 'Writing', jp: null, zh: masteryAccuracy(writing.map) },
    { name: 'Classifiers', jp: null, zh: masteryAccuracy(classifiers.map) },
    { name: 'Numbers', jp: null, zh: masteryAccuracy(numbers.map) },
    { name: 'Typing', jp: null, zh: masteryAccuracy(typing.map) },
  ];

  const achievements = [
    {
      id: 'a1',
      glyph: isJp ? '続' : '续',
      title: '30-Day Path',
      sub: 'A month unbroken',
      on: progress.streak >= 30,
    },
    {
      id: 'a2',
      glyph: '百',
      title: 'Hundred Glyphs',
      sub: '100 words',
      on: data.japanese.words + data.chinese.words >= 100,
    },
    {
      id: 'a3',
      glyph: '束',
      title: 'Deck Builder',
      sub: '3 decks studied',
      on: data.studiedDecks >= 3,
    },
    {
      id: 'a4',
      glyph: isJp ? '復' : '复',
      title: 'Steady Revisit',
      sub: '50 reviews',
      on: progress.totalReviews >= 50,
    },
    {
      id: 'a5',
      glyph: isJp ? '話' : '话',
      title: 'First Words',
      sub: 'A conversation',
      on: data.conversations >= 1,
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
          <div className="greet">{isJp ? 'あなたの歩み' : '你的足迹'} · your path so far</div>
          <h1>
            Journal<span className="cjk"> · {isJp ? '記録' : '记录'}</span>
          </h1>
        </div>
        <div className="date">
          Days walked
          <b>{data.daysActive}</b>
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
                <div className="v">{data.daysActive}d</div>
              </div>
              <div className="c">
                <div className="k">{isJp ? '日本語' : '日语'}</div>
                <div className="v">{data.japanese.words}</div>
              </div>
              <div className="c">
                <div className="k">中文</div>
                <div className="v">{data.chinese.words}</div>
              </div>
            </div>
          </InkCard>
        </div>

        <div className="side-stack">
          <InkCard
            className="matrix-card"
            title="Skill matrix"
            cjk="技"
            meta="cards in review · answers correct"
          >
            <div className="matrix-head">
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Dual-track proficiency</span>
              <div className="lg">
                <span>
                  <i className="jp" />
                  {isJp ? '日本語' : '日语'}
                </span>
                <span>
                  <i className="zh" />
                  中文
                </span>
              </div>
            </div>
            {skills.map((s) => (
              <div key={s.name} className="skill">
                <div className="nm">{s.name}</div>
                <SkillBar track="jp" metric={s.jp} />
                <SkillBar track="zh" metric={s.zh} />
              </div>
            ))}
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
