'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSRS } from '@/hooks/use-srs';
import { useProgress } from '@/hooks/use-progress';
import { useSpeechNotice } from '@/hooks/use-speech';
import { SpeechNotice } from '@/components/shared/speak-button';
import { plural } from '@/lib/utils';
import { InkCard } from '@/components/ink/primitives';
import { getLanguageName, getLanguageNativeName } from '@/lib/language/utils';
import {
  getPrebuiltDecks,
  instantiatePrebuiltDeck,
  shippedDeckId,
  type PrebuiltDeckDef,
} from '@/lib/flashcards/prebuilt-decks';
import {
  cardFace,
  canSpeakBeforeReveal,
  directionOf,
  isAudioPrompt,
  CARD_DIRECTIONS,
  DIRECTION_LABEL,
} from '@/lib/flashcards/direction';
import { speak } from '@/lib/tts/speech';
import type { SRSGrade } from '@/types';

type View = 'decks' | 'review';

export default function FlashcardsPage() {
  const { language, speechRate, settings } = useLanguage();
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>();
  const { decks, queue, currentCard, startReview, gradeCard, createDeck, syncDecks } =
    useSRS(selectedDeckId);
  const { recordActivity } = useProgress();
  const [view, setView] = useState<View>('decks');
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const { notice: speechNotice, reportSpeechError } = useSpeechNotice();

  const native = getLanguageNativeName(language);
  const latin = getLanguageName(language).toUpperCase();
  const languageDecks = decks.filter((d) => d.language === language);
  const addedIds = new Set(languageDecks.map(shippedDeckId));
  const availablePrebuilt = getPrebuiltDecks(language).filter((p) => !addedIds.has(p.id));

  // Stored copies of shipped decks are brought in step with the current data
  // when the deck list opens. A review waits for it (see beginReview) so the
  // repair can't overwrite a card that was just graded.
  const syncing = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    syncing.current = syncDecks().catch((err) => console.error('Deck sync failed:', err));
  }, [syncDecks]);

  const beginReview = async (deckId: string) => {
    await syncing.current;
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
      await createDeck(result.deck, result.cards);
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
        // Space on a focused button is that button's own activation.
        if (e.target instanceof HTMLElement && e.target.closest('button')) return;
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

  // Listen-direction cards are audio-first: play the term when the card
  // appears. It is the prompt there; produce and cloze cards stay silent until
  // revealed, since their term is the answer. A failure must say why, since the
  // sound is the whole prompt.
  useEffect(() => {
    if (view !== 'review' || !currentCard) return;
    if (isAudioPrompt(currentCard)) {
      speak(currentCard.front, language, speechRate).catch(reportSpeechError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard?.id, view]);

  const playCurrent = () => {
    if (currentCard) speak(currentCard.front, language, speechRate).catch(reportSpeechError);
  };

  // ---------------- DECK PICKER ----------------
  if (view === 'decks') {
    return (
      <>
        <div className="page-top">
          <div>
            <div className="greet">
              {language === 'japanese' ? '束を選ぶ' : '选卡组'} · choose a deck
            </div>
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
                <button
                  key={d.id}
                  type="button"
                  className="lesson-item"
                  onClick={() => beginReview(d.id)}
                >
                  <span className="glyph">{Array.from(d.name)[0]}</span>
                  <span className="main">
                    <span className="title">{d.name}</span>
                    <span className="sub">{d.description}</span>
                    <span className="tags">
                      <span className="tag">{d.cardCount} cards</span>
                    </span>
                  </span>
                  <span className="btn outline">Study →</span>
                </button>
              ))}
            </div>
          </InkCard>
        )}

        <InkCard
          title="From the library"
          cjk={language === 'japanese' ? '蔵' : '藏'}
          meta={`${availablePrebuilt.length} available`}
        >
          <div className="lesson-list">
            {availablePrebuilt.map((p) => (
              <button
                key={p.id}
                type="button"
                className="lesson-item"
                disabled={creating}
                onClick={() => handleSelectPrebuilt(p)}
              >
                <span className="glyph">
                  {Array.from(p.name.replace(/^[^：:]*[：:]\s*/, ''))[0]}
                </span>
                <span className="main">
                  <span className="title">{p.name}</span>
                  <span className="sub">{p.description}</span>
                  <span className="tags">
                    <span className="tag">{p.cardCount} cards</span>
                  </span>
                </span>
                <span className="btn solid">{creating ? '…' : 'Begin →'}</span>
              </button>
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
  const done = currentCard == null;
  // Progress denominator reflects the session queue (remaining + reviewed), not
  // the full multi-direction deck, which is ~3x larger than any one session.
  const totalSegs = Math.max((queue?.total ?? 0) + reviewed, reviewed + (done ? 0 : 1));

  // The side panel counts what is left instead of listing it: a card's face is
  // its answer, and the cards still to come must not show theirs.
  const left = queue ? [...queue.learning, ...queue.due, ...queue.newCards] : [];
  const leftByDirection = CARD_DIRECTIONS.map((direction) => ({
    direction,
    n: left.filter((c) => directionOf(c) === direction).length,
  })).filter(({ n }) => n > 0);

  return (
    <>
      <SpeechNotice message={speechNotice} />
      <div className="page-top">
        <div>
          <button type="button" className="greet back-link" onClick={() => setView('decks')}>
            ← back to decks
          </button>
          <h1>
            <span className="cjk">{language === 'japanese' ? '学習' : '学习'}</span>
          </h1>
        </div>
        <div className="date">
          {done
            ? reviewed > 0
              ? 'Complete'
              : 'All caught up'
            : `Card ${reviewed + 1} of ${totalSegs}`}
          <b>{done ? 100 : Math.round((reviewed / totalSegs) * 100)}%</b>
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
              {reviewed > 0 ? (
                <>
                  <div className="flash-meaning">Review complete</div>
                  <div className="flash-hint">
                    You revisited {plural(reviewed, 'card')}. Well walked.
                  </div>
                </>
              ) : (
                <>
                  <div className="flash-meaning">All caught up</div>
                  <div className="flash-hint">
                    Nothing is due in this deck right now. New cards arrive{' '}
                    {settings.maxNewCardsPerDay} a day.
                  </div>
                </>
              )}
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
                  // Audio of the term is offered before reveal only where the
                  // prompt is the term or audio; after reveal, always.
                  const canSpeak =
                    face.promptKind !== 'audio' && (revealed || canSpeakBeforeReveal(currentCard!));
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

                      {canSpeak && (
                        <button
                          onClick={playCurrent}
                          aria-label="Play audio"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 24,
                          }}
                        >
                          🔊
                        </button>
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
          <InkCard className="trace" title="Glyph" cjk={language === 'japanese' ? '筆' : '笔'}>
            {(() => {
              // The term waits for the flip where it would give the answer away
              // (listen, produce, cloze), and the reading is part of every
              // answer, so it waits too.
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
                      Reading <b>{(revealed && currentCard?.reading) || '—'}</b>
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

          <InkCard title="This session" cjk="束" meta={`${reviewed}/${totalSegs}`}>
            <div className="queue-list">
              <CountRow label="New" n={queue?.newCards.length ?? 0} />
              <CountRow label="Learning" n={queue?.learning.length ?? 0} />
              <CountRow label="Due" n={queue?.due.length ?? 0} />
            </div>
            {leftByDirection.length > 0 && (
              <div className="queue-list" style={{ borderTop: '1px solid var(--line)' }}>
                {leftByDirection.map(({ direction, n }) => (
                  <CountRow key={direction} label={DIRECTION_LABEL[direction]} n={n} />
                ))}
              </div>
            )}
          </InkCard>
        </div>
      </div>
    </>
  );
}

function CountRow({ label, n }: { label: string; n: number }) {
  return (
    <div className="queue-row">
      <span className="g" style={{ fontSize: 18 }}>
        {n}
      </span>
      <span className="m">{label}</span>
    </div>
  );
}
