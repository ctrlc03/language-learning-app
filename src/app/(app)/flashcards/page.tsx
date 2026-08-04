'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSRS } from '@/hooks/use-srs';
import { useProgress } from '@/hooks/use-progress';
import { InkCard } from '@/components/ink/primitives';
import { getLanguageName, getLanguageNativeName } from '@/lib/language/utils';
import {
  getPrebuiltDecks,
  instantiatePrebuiltDeck,
  type PrebuiltDeckDef,
} from '@/lib/flashcards/prebuilt-decks';
import { cardFace, directionOf, isAudioPrompt, DIRECTION_LABEL } from '@/lib/flashcards/direction';
import { speak } from '@/lib/tts/speech';
import type { SRSGrade } from '@/types';

type View = 'decks' | 'review';

export default function FlashcardsPage() {
  const { language, speechRate } = useLanguage();
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>();
  const {
    decks,
    cards,
    queue,
    currentCard,
    startReview,
    gradeCard,
    createDeck,
    addCard,
    loadDecks,
  } = useSRS(selectedDeckId);
  const { recordActivity } = useProgress();
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
    // Record before grading — gradeCard mutates the card's SRS state, and a
    // card is "new" only on the review that introduces it.
    if (currentCard) {
      void recordActivity({
        reviews: 1,
        totalAnswers: 1,
        correctAnswers: g >= 3 ? 1 : 0,
        newCards: currentCard.srs.repetitions === 0 ? 1 : 0,
      });
    }
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

  // Listen-direction cards are audio-first: play the term when the card appears.
  useEffect(() => {
    if (view !== 'review' || !currentCard) return;
    if (isAudioPrompt(currentCard)) {
      speak(currentCard.front, language, speechRate).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard?.id, view]);

  const playCurrent = () => {
    if (currentCard) speak(currentCard.front, language, speechRate).catch(() => {});
  };

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
  const done = currentCard == null;
  // Progress denominator reflects the session queue (remaining + reviewed), not
  // the full multi-direction deck, which is ~3x larger than any one session.
  const totalSegs = Math.max((queue?.total ?? 0) + reviewed, reviewed + (done ? 0 : 1));

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
                {(() => {
                  const face = cardFace(currentCard!);
                  const dir = directionOf(currentCard!);
                  return (
                    <>
                      <div className="flash-dir">
                        {DIRECTION_LABEL[dir]} · {face.promptSub}
                      </div>

                      {/* Prompt */}
                      {face.promptKind === 'audio' ? (
                        <button
                          className="flash-char"
                          onClick={playCurrent}
                          aria-label="Replay audio"
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          🔊
                        </button>
                      ) : face.promptKind === 'text' ? (
                        <div className="flash-meaning" style={{ fontSize: 30, fontWeight: 700 }}>
                          {face.promptMain}
                        </div>
                      ) : face.promptKind === 'sentence' ? (
                        <div className="flash-cloze cjk">{face.promptMain}</div>
                      ) : (
                        <div className="flash-char">{face.promptMain}</div>
                      )}

                      {/* Reveal */}
                      {revealed ? (
                        <>
                          {face.revealTerm && (
                            <div className="flash-char" style={{ marginTop: 4 }}>
                              {currentCard!.front}
                            </div>
                          )}
                          {face.revealReading && (
                            <div className="flash-reading">{currentCard!.reading}</div>
                          )}
                          {face.revealMeaning && (
                            <div className="flash-meaning">{currentCard!.back}</div>
                          )}
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
                    </>
                  );
                })()}
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
            {(() => {
              // Don't reveal the term in the side panel for audio/production
              // prompts until the card is flipped.
              const showTerm =
                !currentCard || !cardFace(currentCard).hideTermUntilRevealed || revealed;
              return (
                <>
                  <div className="box">
                    <div className="g">
                      {currentCard && showTerm ? Array.from(currentCard.front)[0] : '—'}
                    </div>
                  </div>
                  <div className="meta">
                    <span>
                      Reading <b>{(showTerm && currentCard?.reading) || '—'}</b>
                    </span>
                    <span>
                      Chars{' '}
                      <b>{currentCard && showTerm ? Array.from(currentCard.front).length : 0}</b>
                    </span>
                  </div>
                </>
              );
            })()}
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
