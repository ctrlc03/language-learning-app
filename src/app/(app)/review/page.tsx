'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStorage } from '@/contexts/StorageContext';
import { StoragePrefixes } from '@/lib/storage/interface';
import { InkCard } from '@/components/ink/primitives';
import { getLanguageNativeName } from '@/lib/language/utils';
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

function toRow(card: Flashcard, now: number): QueueRow {
  const interval = Math.max(card.srs.interval, 0);
  const daysUntil = (card.srs.nextReviewDate - now) / 86400000;
  const dueNow = card.srs.nextReviewDate <= now || card.srs.repetitions === 0;
  const mem = interval > 0 ? clamp01(0.5 + (daysUntil / interval) * 0.5) : 0.18;
  let due = 'now';
  if (!dueNow) {
    const hours = daysUntil * 24;
    due = hours < 24 ? `${Math.max(1, Math.round(hours))}h` : `${Math.round(daysUntil)}d`;
  }
  return { id: card.id, char: card.front, reading: card.reading, meaning: card.back, mem, due, dueNow };
}

export default function ReviewPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const storage = useStorage();
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoaded(false);
      const decks = await storage.getAll<FlashcardDeck>(StoragePrefixes.decks);
      const deckIds = new Set(decks.filter(d => d.language === language).map(d => d.id));
      const cards = await storage.query<Flashcard>(StoragePrefixes.cards, c => deckIds.has(c.deckId));
      const now = Date.now();
      const built = cards.map(c => toRow(c, now)).sort((a, b) => a.mem - b.mem);
      if (active) {
        setRows(built);
        setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [storage, language]);

  const native = getLanguageNativeName(language);
  const due = useMemo(() => rows.filter(r => r.dueNow).length, [rows]);
  const fading = useMemo(() => rows.filter(r => r.mem < 0.5).length, [rows]);
  const settled = useMemo(() => rows.filter(r => r.mem >= 0.7).length, [rows]);

  const size = 200,
    stroke = 10,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const ratio = rows.length ? due / rows.length : 0;

  return (
    <>
      <div className="page-top">
        <div>
          <div className="greet">記憶を結び直す · retie the threads of memory</div>
          <h1>
            Review<span className="cjk"> · 復習</span>
          </h1>
        </div>
        <div className="date">
          {native} queue
          <b>{rows.length} cards</b>
          {due} due now
        </div>
      </div>

      {loaded && rows.length === 0 ? (
        <InkCard style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 64, color: 'var(--primary)', marginBottom: 16 }}>無</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 10 }}>
            No cards to revisit yet
          </div>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 22 }}>
            Study a deck first — once you have cards, they’ll surface here as memory fades.
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
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
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
              Memory fades along a curve. Revisiting a word just before you’d forget it carves it deeper. These {due}{' '}
              cards have reached that moment.
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
            </div>
            <button
              className="btn solid"
              style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
              onClick={() => router.push('/flashcards')}
            >
              Begin review →
            </button>
          </InkCard>

          <InkCard title="Memory queue" cjk="記憶" meta="ordered by urgency">
            <div className="revisit-table">
              <div className="rt-head">
                <span>Glyph</span>
                <span>Reading</span>
                <span>Meaning</span>
                <span>Memory</span>
                <span>Due</span>
              </div>
              {rows.slice(0, 40).map(row => (
                <div key={row.id} className="rt-row" onClick={() => router.push('/flashcards')}>
                  <span className="g">{row.char}</span>
                  <span className="r">{row.reading}</span>
                  <span className="m">{row.meaning}</span>
                  <div className="mem-wrap">
                    <div className="lab">{Math.round(row.mem * 100)}% retained</div>
                    <div className="mem-bar">
                      <div className="fill" style={{ width: `${row.mem * 100}%` }} />
                    </div>
                  </div>
                  <span className="due">{row.due}</span>
                </div>
              ))}
            </div>
          </InkCard>
        </div>
      )}
    </>
  );
}
