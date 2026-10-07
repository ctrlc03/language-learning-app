'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStorage } from '@/contexts/StorageContext';
import { StoragePrefixes } from '@/lib/storage/interface';
import { isNew } from '@/lib/srs/sm2';
import { buildReviewQueue, newCardsLeftToday } from '@/lib/srs/scheduler';
import { InkCard } from '@/components/ink/primitives';
import { getLanguageNativeName } from '@/lib/language/utils';
import { plural } from '@/lib/utils';
import type { Flashcard, FlashcardDeck } from '@/types';

interface QueueRow {
  id: string;
  char: string;
  reading: string;
  meaning: string;
  mem: number;
  due: string;
  dueNow: boolean;
}

const clamp01 = (n: number) => Math.max(0.04, Math.min(0.99, n));

/** A row for a card the learner has already met. `dueNow` follows the study queue. */
function toRow(card: Flashcard, now: number, dueNow: boolean): QueueRow {
  const interval = Math.max(card.srs.interval, 0);
  const daysUntil = (card.srs.nextReviewDate - now) / 86400000;
  const mem = interval > 0 ? clamp01(0.5 + (daysUntil / interval) * 0.5) : 0.18;
  let due = 'now';
  if (!dueNow) {
    const hours = daysUntil * 24;
    due = hours < 24 ? `${Math.max(1, Math.round(hours))}h` : `${Math.round(daysUntil)}d`;
  }
  return {
    id: card.id,
    char: card.front,
    reading: card.reading,
    meaning: card.back,
    mem,
    due,
    dueNow,
  };
}

export default function ReviewPage() {
  const router = useRouter();
  const { language, settings } = useLanguage();
  const storage = useStorage();
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [newToday, setNewToday] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoaded(false);
      const decks = await storage.getAll<FlashcardDeck>(StoragePrefixes.decks);
      const deckIds = new Set(decks.filter((d) => d.language === language).map((d) => d.id));
      const cards = await storage.query<Flashcard>(StoragePrefixes.cards, (c) =>
        deckIds.has(c.deckId),
      );
      // The same split Study uses, so "due" here is what a review serves. Cards
      // never reviewed have a due date too (their creation time) but are New,
      // not due, overdue or fading: they stay out of the queue, the memory
      // figures and the table, and count only as today's allowance of new cards.
      const newLeft = await newCardsLeftToday(storage, settings.maxNewCardsPerDay);
      const queue = buildReviewQueue(cards, newLeft);
      const dueIds = new Set([...queue.learning, ...queue.due].map((c) => c.id));
      const now = Date.now();
      const built = cards
        .filter((c) => !isNew(c.srs))
        .map((c) => toRow(c, now, dueIds.has(c.id)))
        .sort((a, b) => a.mem - b.mem);
      if (active) {
        setRows(built);
        setNewToday(queue.newCards.length);
        setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [storage, language, settings.maxNewCardsPerDay]);

  const native = getLanguageNativeName(language);
  const due = useMemo(() => rows.filter((r) => r.dueNow).length, [rows]);
  const fading = useMemo(() => rows.filter((r) => r.mem < 0.5).length, [rows]);
  const settled = useMemo(() => rows.filter((r) => r.mem >= 0.7).length, [rows]);

  const size = 200,
    stroke = 10,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const ratio = rows.length ? due / rows.length : 0;

  return (
    <>
      <div className="page-top">
        <div>
          <div className="greet">
            {language === 'japanese' ? '記憶を結び直す' : '温故知新'} · retie the threads of memory
          </div>
          <h1>
            Review<span className="cjk"> · {language === 'japanese' ? '復習' : '复习'}</span>
          </h1>
        </div>
        <div className="date">
          {native} queue
          <b>{plural(rows.length, 'card')}</b>
          {due} due now
        </div>
      </div>

      {loaded && rows.length === 0 ? (
        <InkCard style={{ padding: 48, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 64,
              color: 'var(--primary)',
              marginBottom: 16,
            }}
          >
            {language === 'japanese' ? '無' : '无'}
          </div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 22,
              color: 'var(--ink)',
              marginBottom: 10,
            }}
          >
            No cards to revisit yet
          </div>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 22 }}>
            Study a deck first — once you have reviewed some cards, they’ll surface here as memory
            fades.
          </p>
          <button className="btn solid" onClick={() => router.push('/flashcards')}>
            Go to Study →
          </button>
        </InkCard>
      ) : (
        <div className="review-grid">
          <InkCard className="revisit-summary" title="Due today" cjk="期">
            <div className="moon-dial">
              <svg width={size} height={size}>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth={stroke}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={stroke}
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - ratio)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="center">
                <div className="num">{due}</div>
                <div className="lab">to revisit</div>
              </div>
            </div>
            <div className="revisit-note">
              Memory fades along a curve. Revisiting a word just before you’d forget it carves it
              deeper.{' '}
              {due > 0
                ? `${due === 1 ? 'This card has' : `These ${due} cards have`} reached that moment.`
                : 'No cards have reached that moment yet.'}
            </div>
            <div className="revisit-legend">
              <div className="lg warm">
                <div className="k">Fading</div>
                <div className="v">{fading}</div>
              </div>
              <div className="lg cool">
                <div className="k">Settled</div>
                <div className="v">{settled}</div>
              </div>
              <div className="lg">
                <div className="k">New</div>
                <div className="v">{newToday}</div>
              </div>
            </div>
            <button
              className="btn solid"
              style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
              onClick={() => router.push('/flashcards')}
            >
              Begin review →
            </button>
          </InkCard>

          <InkCard
            title="Memory queue"
            cjk={language === 'japanese' ? '記憶' : '记忆'}
            meta="ordered by urgency"
          >
            <div className="revisit-table">
              <div className="rt-head">
                <span>Glyph</span>
                <span>Reading</span>
                <span>Meaning</span>
                <span>Memory</span>
                <span>Due</span>
              </div>
              {rows.slice(0, 40).map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className="rt-row"
                  onClick={() => router.push('/flashcards')}
                >
                  <span className="g">{row.char}</span>
                  <span className="r">{row.reading}</span>
                  <span className="m">{row.meaning}</span>
                  <span className="mem-wrap">
                    <span className="lab">{Math.round(row.mem * 100)}% retained</span>
                    <span className="mem-bar">
                      <span className="fill" style={{ width: `${row.mem * 100}%` }} />
                    </span>
                  </span>
                  <span className="due">{row.due}</span>
                </button>
              ))}
            </div>
          </InkCard>
        </div>
      )}
    </>
  );
}
