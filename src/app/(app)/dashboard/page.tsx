'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProgress } from '@/hooks/use-progress';
import { useSRS } from '@/hooks/use-srs';
import { InkCard, Ring, todayParts } from '@/components/ink/primitives';
import { getLanguageNativeName, getLanguageName } from '@/lib/language/utils';
import { getLessons, getWordOfDay, getHero, getVocabulary } from '@/lib/inkpath/content';

const CAL = ['月', '火', '水', '木', '金', '土', '日'];

export default function DashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { progress, todayActivity } = useProgress();
  const { decks } = useSRS();

  const lessons = useMemo(() => getLessons(language), [language]);
  const hero = useMemo(() => getHero(language), [language]);
  const wod = useMemo(() => getWordOfDay(language), [language]);

  const native = getLanguageNativeName(language);
  const latin = getLanguageName(language).toUpperCase();
  const t = todayParts();

  const wordsInDecks = useMemo(
    () => decks.filter((d) => d.language === language).reduce((sum, d) => sum + d.cardCount, 0),
    [decks, language],
  );
  const corpus = useMemo(() => getVocabulary(language).length, [language]);

  const reviews = todayActivity?.reviews ?? 0;
  const exercises = todayActivity?.exercises ?? 0;
  const minutesToday = Math.min((reviews + exercises) * 2, 120);
  const newToday = todayActivity?.newCards ?? 0;
  const accuracy =
    todayActivity && todayActivity.totalAnswers > 0
      ? Math.round((todayActivity.correctAnswers / todayActivity.totalAnswers) * 100)
      : 0;

  // current week, Monday-first, lit up to (and including) today within the streak
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <>
      <div className="page-top">
        <div>
          <div className="greet">{language === 'japanese' ? 'おはよう。' : '早安。'}</div>
          <h1>
            Today<span className="cjk"> · 今日</span>
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
              <button className="btn solid" onClick={() => router.push('/flashcards')}>
                Continue lesson →
              </button>
              <button className="btn outline" onClick={() => router.push('/review')}>
                Review queue
              </button>
            </div>
            <div className="meta-row">
              <div className="mi">
                <div className="k">Reviews today</div>
                <div className="v">{reviews}</div>
              </div>
              <div className="mi">
                <div className="k">New words</div>
                <div className="v">+{newToday}</div>
              </div>
              <div className="mi">
                <div className="k">Accuracy</div>
                <div className="v">{accuracy}%</div>
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
              <small>days</small>
            </div>
            <div className="seal-cal">
              {CAL.map((c, i) => (
                <div
                  key={i}
                  className={`d ${i < todayIdx && i >= todayIdx - progress.streak ? 'on' : ''} ${i === todayIdx ? 'today' : ''}`}
                >
                  {c}
                </div>
              ))}
            </div>
          </InkCard>
          <InkCard className="stat">
            <div className="cjk-watermark">語</div>
            <div className="k">{native} words in decks</div>
            <div className="v">{wordsInDecks}</div>
            <div className="s">{corpus} words in library</div>
          </InkCard>
          <InkCard className="stat">
            <div className="cjk-watermark">時</div>
            <div className="k">Time today</div>
            <div className="v">
              {minutesToday}
              <small>min</small>
            </div>
            <div className="s">
              Goal 30 min · {Math.min(Math.round((minutesToday / 30) * 100), 100)}% complete
            </div>
          </InkCard>
        </div>

        <InkCard title="Your lessons" cjk="課" meta={`${native} · ${lessons.length} threads`}>
          <div className="lesson-list">
            {lessons.map((les) => (
              <div key={les.id} className="lesson-item" onClick={() => router.push('/flashcards')}>
                <div className="glyph">{les.glyph}</div>
                <div className="main">
                  <div className="title">{les.title}</div>
                  <div className="sub">{les.sub}</div>
                  <div className="tags">
                    <span className="tag">{les.band}</span>
                    <span className="tag">{les.topic}</span>
                  </div>
                </div>
                <Ring value={0.15} label="→" />
              </div>
            ))}
          </div>
        </InkCard>

        <InkCard title="Word of the day" cjk="今日の語" meta={native}>
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
