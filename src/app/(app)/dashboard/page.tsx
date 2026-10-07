'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStorage } from '@/contexts/StorageContext';
import { useCurrentLesson } from '@/hooks/use-current-lesson';
import { useProgress } from '@/hooks/use-progress';
import { InkCard, Ring, todayParts } from '@/components/ink/primitives';
import { getLanguageNativeName, getLanguageName } from '@/lib/language/utils';
import { getLessons, getWordOfDay, getHero, getVocabulary } from '@/lib/inkpath/content';
import {
  countWords,
  forLanguage,
  lessonProgress,
  loadDeckData,
  type DeckData,
} from '@/lib/inkpath/stats';
import { buildReviewQueue, newCardsLeftToday } from '@/lib/srs/scheduler';
import { getToday } from '@/lib/utils';
import type { Language } from '@/types';

// Monday-first, in the script of the language being studied.
const WEEK: Record<Language, string[]> = {
  japanese: ['月', '火', '水', '木', '金', '土', '日'],
  chinese: ['一', '二', '三', '四', '五', '六', '日'],
};

interface DeckStats {
  /** This language's decks and their cards. */
  data: DeckData;
  words: number;
  /** Cards in learning or due for review. */
  due: number;
  /** New cards still allowed today. */
  fresh: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { language, settings } = useLanguage();
  const storage = useStorage();
  const [currentLesson] = useCurrentLesson();
  const { progress, todayActivity } = useProgress();
  const [stats, setStats] = useState<DeckStats | null>(null);
  const { maxNewCardsPerDay } = settings;

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = forLanguage(await loadDeckData(storage), language);
      const queue = buildReviewQueue(
        data.cards,
        await newCardsLeftToday(storage, maxNewCardsPerDay),
      );
      if (!alive) return;
      setStats({
        data,
        words: countWords(data.cards),
        due: queue.learning.length + queue.due.length,
        fresh: queue.newCards.length,
      });
    })();
    return () => {
      alive = false;
    };
  }, [storage, language, maxNewCardsPerDay]);

  const lessons = useMemo(() => getLessons(language, currentLesson), [language, currentLesson]);
  const hero = useMemo(() => getHero(language, currentLesson), [language, currentLesson]);
  const wod = useMemo(() => getWordOfDay(language, currentLesson), [language, currentLesson]);
  const corpus = useMemo(() => getVocabulary(language).length, [language]);
  const rings = useMemo(
    () => lessons.map((les) => (stats ? lessonProgress(les, stats.data) : 0)),
    [lessons, stats],
  );

  const isJp = language === 'japanese';
  const native = getLanguageNativeName(language);
  const latin = getLanguageName(language).toUpperCase();
  const t = todayParts();

  const reviews = todayActivity?.reviews ?? 0;
  const newToday = todayActivity?.newCards ?? 0;
  const accuracy =
    todayActivity && todayActivity.totalAnswers > 0
      ? Math.round((todayActivity.correctAnswers / todayActivity.totalAnswers) * 100)
      : null;

  // Current week, Monday-first. The streak runs up to today if there was activity today,
  // otherwise up to yesterday.
  const todayIdx = (new Date().getDay() + 6) % 7;
  const lastLit = progress.lastActiveDate === getToday() ? todayIdx : todayIdx - 1;

  return (
    <>
      <div className="page-top">
        <div>
          <div className="greet">{isJp ? 'おはよう。' : '早安。'}</div>
          <h1>
            Today<span className="cjk"> · {isJp ? '今日' : '今天'}</span>
          </h1>
        </div>
        <div className="date">
          {t.weekday}
          <b>
            {t.month} {t.day}
          </b>
          {t.year} · {latin}
        </div>
      </div>

      <div className="today-grid">
        <InkCard className="hero">
          <div className="seal-corner" />
          <div className="hero-text">
            <div className="eyebrow">
              ▍ {hero.band} · {hero.topic}
            </div>
            <h2>{hero.title}</h2>
            <p>{hero.desc}</p>
            <div className="cta-row">
              <button className="btn solid" onClick={() => router.push('/session')}>
                Start session →
              </button>
              <button className="btn outline" onClick={() => router.push('/flashcards')}>
                Continue lesson
              </button>
            </div>
            <div className="meta-row">
              <div className="mi">
                <div className="k">Reviews today</div>
                <div className="v">{reviews}</div>
              </div>
              <div className="mi">
                <div className="k">New cards</div>
                <div className="v">+{newToday}</div>
              </div>
              <div className="mi">
                <div className="k">Accuracy</div>
                <div className="v">{accuracy === null ? '—' : `${accuracy}%`}</div>
              </div>
            </div>
          </div>
          <div className="hero-char">
            {hero.char}
            <span className="ruby">{hero.ruby}</span>
          </div>
        </InkCard>

        <div className="stat-row">
          <InkCard className="stat accent">
            <div className="cjk-watermark">炎</div>
            <div className="k">Streak</div>
            <div className="v">
              {progress.streak}
              <small>{progress.streak === 1 ? 'day' : 'days'}</small>
            </div>
            <div className="seal-cal">
              {WEEK[language].map((c, i) => {
                const lit = progress.streak > 0 && i <= lastLit && i > lastLit - progress.streak;
                return (
                  <div key={i} className={`d ${lit ? 'on' : ''} ${i === todayIdx ? 'today' : ''}`}>
                    {c}
                  </div>
                );
              })}
            </div>
          </InkCard>
          <InkCard className="stat">
            <div className="cjk-watermark">{isJp ? '語' : '词'}</div>
            <div className="k">{native} words in decks</div>
            <div className="v">{stats ? stats.words : '—'}</div>
            <div className="s">{corpus} words in library</div>
          </InkCard>
          <InkCard className="stat">
            <div className="cjk-watermark">待</div>
            <div className="k">Cards to review</div>
            <div className="v">
              {stats ? (
                <>
                  {stats.due + stats.fresh}
                  <small>{stats.due + stats.fresh === 1 ? 'card' : 'cards'}</small>
                </>
              ) : (
                '—'
              )}
            </div>
            <div className="s">
              {stats &&
                (stats.data.decks.length === 0
                  ? 'Add a deck in Study to begin'
                  : `${stats.due} due · ${stats.fresh} new today`)}
            </div>
          </InkCard>
        </div>

        <InkCard
          title="Your lessons"
          cjk={isJp ? '課' : '课'}
          meta={`${native} · ${lessons.length} threads`}
        >
          <div className="lesson-list">
            {lessons.map((les, i) => {
              const pct = Math.round(rings[i] * 100);
              return (
                <div
                  key={les.id}
                  className="lesson-item"
                  onClick={() => router.push('/flashcards')}
                >
                  <div className="glyph">{les.glyph}</div>
                  <div className="main">
                    <div className="title">{les.title}</div>
                    <div className="sub">{les.sub}</div>
                    <div className="tags">
                      <span className="tag">{les.band}</span>
                      <span className="tag">{les.topic}</span>
                    </div>
                  </div>
                  <Ring
                    value={rings[i]}
                    label={stats ? `${pct}%` : undefined}
                    title={stats ? `${pct}% of words reviewed` : undefined}
                  />
                </div>
              );
            })}
          </div>
        </InkCard>

        <InkCard title="Word of the day" cjk={isJp ? '今日の語' : '每日一词'} meta={native}>
          <div className="wotd">
            <div className="big">{wod.char}</div>
            <div className="reading">{wod.reading}</div>
            <div className="meaning">{wod.meaning}</div>
            {wod.ex && (
              <div className="ex">
                <div className="cjk">{wod.ex}</div>
                <div className="en">{wod.exEn}</div>
              </div>
            )}
          </div>
        </InkCard>
      </div>
    </>
  );
}
