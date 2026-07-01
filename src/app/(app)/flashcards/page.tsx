'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSRS } from '@/hooks/use-srs';
import { InkCard } from '@/components/ink/primitives';
import { getLanguageName, getLanguageNativeName } from '@/lib/language/utils';
import {
  getPrebuiltDecks,
  instantiatePrebuiltDeck,
  type PrebuiltDeckDef,
} from '@/lib/flashcards/prebuilt-decks';
import type { SRSGrade } from '@/types';

type View = 'decks' | 'review';

export default function FlashcardsPage() {
  const { language } = useLanguage();
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>();
  const { decks, cards, currentCard, startReview, gradeCard, createDeck, addCard, loadDecks } =
    useSRS(selectedDeckId);
  const [view, setView] = useState<View>('decks');
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const native = getLanguageNativeName(language);
  const latin = getLanguageName(language).toUpperCase();
  const languageDecks = decks.filter((d) => d.language === language);
  const existingNames = new Set(languageDecks.map((d) => d.name));
  const availablePrebuilt = getPrebuiltDecks(language).filter((p) => !existingNames.has(p.name));

  const beginReview = async (deckId: string) => {
    setSelectedDeckId(deckId);
    await startReview(deckId);
    setReviewed(0);
    setRevealed(false);
    setView('review');
  };

  const handleSelectPrebuilt = async (prebuilt: PrebuiltDeckDef) => {
    if (creating) return;
    setCreating(true);
    try {
      const result = instantiatePrebuiltDeck(prebuilt.id);
      if (!result) return;
      await createDeck(result.deck);
      for (const card of result.cards) await addCard(card);
      await loadDecks();
      await beginReview(result.deck.id);
    } finally {
      setCreating(false);
    }
  };

  const grade = (g: SRSGrade) => {
    gradeCard(g);
    setRevealed(false);
    setReviewed((r) => r + 1);
  };

  // keyboard: space reveals, 1/2/3 grade
  useEffect(() => {
    if (view !== 'review') return;
    const h = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setRevealed((r) => !r);
      } else if (revealed && currentCard) {
        if (e.key === '1') grade(1);
        else if (e.key === '2') grade(4);
        else if (e.key === '3') grade(5);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // ---------------- DECK PICKER ----------------
  if (view === 'decks') {
    return (
      <>
        <div className="page-top">
          <div>
            <div className="greet">束を選ぶ · choose a deck</div>
            <h1>
              Study<span className="cjk"> · 学</span>
            </h1>
          </div>
          <div className="date">
            {native} decks
            <b>{languageDecks.length + availablePrebuilt.length}</b>
            {latin} LIBRARY
          </div>
        </div>

        {languageDecks.length > 0 && (
          <InkCard
            title="Your decks"
            cjk="束"
            meta={`${languageDecks.length}`}
            style={{ marginBottom: 24 }}
          >
            <div className="lesson-list">
              {languageDecks.map((d) => (
                <div key={d.id} className="lesson-item" onClick={() => beginReview(d.id)}>
                  <div className="glyph">{Array.from(d.name)[0]}</div>
                  <div className="main">
                    <div className="title">{d.name}</div>
                    <div className="sub">{d.description}</div>
                    <div className="tags">
                      <span className="tag">{d.cardCount} cards</span>
                    </div>
                  </div>
                  <span className="btn outline">Study →</span>
                </div>
              ))}
            </div>
          </InkCard>
        )}

        <InkCard title="From the library" cjk="蔵" meta={`${availablePrebuilt.length} available`}>
          <div className="lesson-list">
            {availablePrebuilt.map((p) => (
              <div key={p.id} className="lesson-item" onClick={() => handleSelectPrebuilt(p)}>
                <div className="glyph">{Array.from(p.name.replace(/^[^：:]*[：:]\s*/, ''))[0]}</div>
                <div className="main">
                  <div className="title">{p.name}</div>
                  <div className="sub">{p.description}</div>
                  <div className="tags">
                    <span className="tag">{p.cardCount} cards</span>
                  </div>
                </div>
                <span className="btn solid">{creating ? '…' : 'Begin →'}</span>
              </div>
            ))}
            {availablePrebuilt.length === 0 && languageDecks.length === 0 && (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--ink-faint)' }}>
                No decks available for {native}.
              </div>
            )}
          </div>
        </InkCard>
      </>
    );
  }

  // ---------------- REVIEW / FLASHCARD ----------------
  const deck = cards;
  const totalSegs = Math.max(deck.length, reviewed + 1);
  const done = currentCard == null;

  return (
    <>
      <div className="page-top">
        <div>
          <div className="greet" style={{ cursor: 'pointer' }} onClick={() => setView('decks')}>
            ← back to decks
          </div>
          <h1>
            <span className="cjk">学習</span>
          </h1>
        </div>
        <div className="date">
          {done ? 'Complete' : `Card ${reviewed + 1} of ${totalSegs}`}
          <b>{Math.round((reviewed / totalSegs) * 100)}%</b>
          {latin} DECK
        </div>
      </div>

      <div className="study-grid">
        <InkCard className="flashcard">
          <div className="flash-prog">
            {Array.from({ length: totalSegs }).map((_, i) => (
              <div
                key={i}
                className={`seg ${i < reviewed ? 'done' : i === reviewed ? 'active' : ''}`}
              />
            ))}
          </div>

          {done ? (
            <div className="flash-body">
              <div className="flash-char" style={{ fontSize: 96, color: 'var(--primary)' }}>
                了
              </div>
              <div className="flash-meaning">Review complete</div>
              <div className="flash-hint">You revisited {reviewed} cards. Well walked.</div>
              <button className="btn solid" onClick={() => setView('decks')}>
                Back to decks →
              </button>
            </div>
          ) : (
            <>
              <div className="flash-body" key={currentCard!.id}>
                <div className="flash-char">{currentCard!.front}</div>
                {revealed ? (
                  <>
                    <div className="flash-reading">{currentCard!.reading}</div>
                    <div className="flash-meaning">{currentCard!.back}</div>
                    {currentCard!.exampleSentence && (
                      <div className="flash-ex">
                        <div className="cjk">{currentCard!.exampleSentence}</div>
                        {currentCard!.exampleTranslation && (
                          <div className="en">{currentCard!.exampleTranslation}</div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flash-hint">Press space to reveal</div>
                )}
              </div>
              <div className="flash-actions">
                {!revealed ? (
                  <button className="grade reveal" onClick={() => setRevealed(true)}>
                    <div className="lab">Reveal</div>
                    <div className="key">space</div>
                  </button>
                ) : (
                  <>
                    <button className="grade again" onClick={() => grade(1)}>
                      <div className="lab">{language === 'japanese' ? 'もう一度' : '再来'}</div>
                      <div className="key">1 · again</div>
                    </button>
                    <button className="grade good" onClick={() => grade(4)}>
                      <div className="lab">{language === 'japanese' ? '良い' : '不错'}</div>
                      <div className="key">2 · good</div>
                    </button>
                    <button className="grade easy" onClick={() => grade(5)}>
                      <div className="lab">{language === 'japanese' ? '簡単' : '简单'}</div>
                      <div className="key">3 · easy</div>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </InkCard>

        <div className="side-stack">
          <InkCard className="trace" title="Glyph" cjk="筆">
            <div className="box">
              <div className="g">{currentCard ? Array.from(currentCard.front)[0] : '—'}</div>
            </div>
            <div className="meta">
              <span>
                Reading <b>{currentCard?.reading || '—'}</b>
              </span>
              <span>
                Chars <b>{currentCard ? Array.from(currentCard.front).length : 0}</b>
              </span>
            </div>
          </InkCard>

          <InkCard title="This deck" cjk="束" meta={`${reviewed}/${totalSegs}`}>
            <div className="queue-list">
              {deck.slice(0, 12).map((c, i) => (
                <div
                  key={c.id}
                  className={`queue-row ${currentCard && c.id === currentCard.id ? 'active' : i < reviewed ? 'done' : ''}`}
                >
                  <span className="g">{Array.from(c.front)[0]}</span>
                  <span className="m">{c.back}</span>
                  <span className="st">
                    {currentCard && c.id === currentCard.id ? '●' : i < reviewed ? '✓' : i + 1}
                  </span>
                </div>
              ))}
            </div>
          </InkCard>
        </div>
      </div>
    </>
  );
}
