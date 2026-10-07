'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStorage } from '@/contexts/StorageContext';
import { useProgress } from '@/hooks/use-progress';
import { useCurrentLesson } from '@/hooks/use-current-lesson';
import { useMastery } from '@/hooks/use-mastery';
import { useMistakeLog } from '@/hooks/use-mistakes';
import { useSpeechInit, useSpeechNotice } from '@/hooks/use-speech';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExerciseShell } from '@/components/exercises/exercise-shell';
import { ToneStep } from '@/components/session/tone-step';
import { SpeakButton, SpeechNotice } from '@/components/shared/speak-button';
import { buildSession, type SessionItem, type SessionPlan } from '@/lib/session/build';
import { calculateNextReview } from '@/lib/srs/sm2';
import { StorageKeys } from '@/lib/storage/interface';
import {
  cardFace,
  canSpeakBeforeReveal,
  directionOf,
  isAudioPrompt,
  DIRECTION_LABEL,
} from '@/lib/flashcards/direction';
import { speak } from '@/lib/tts/speech';
import { cn, plural } from '@/lib/utils';
import type { ExerciseResult, Flashcard, SRSGrade } from '@/types';

type Phase = 'loading' | 'empty' | 'running' | 'done';

interface Tally {
  answered: number;
  correct: number;
  cards: number;
  /** Exercise misses, filed in the mistake notebook. */
  missed: number;
}

/**
 * The daily session: one queue that interleaves due flashcards, a grammar
 * pattern check, a dialogue, recall exercises and weak tone items. Works fully
 * offline. Everything answered here feeds the same progress + mastery stores the
 * individual modes write to, so the streak and weak-spot views stay honest.
 */
export default function SessionPage() {
  const router = useRouter();
  const { language, difficulty, speechRate, settings } = useLanguage();
  const { maxNewCardsPerDay } = settings;
  const [currentLesson] = useCurrentLesson();
  const storage = useStorage();
  const { recordActivity } = useProgress();
  const { recordExercise } = useMistakeLog();
  const {
    map: grammarMastery,
    loading: grammarLoading,
    record: recordGrammar,
  } = useMastery('grammar');
  const { map: toneMastery, loading: toneLoading, record: recordTone } = useMastery('tones');

  const [phase, setPhase] = useState<Phase>('loading');
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState<Tally>({ answered: 0, correct: 0, cards: 0, missed: 0 });
  const [revealed, setRevealed] = useState(false);

  useSpeechInit();

  // The mastery maps load from storage asynchronously — build only once they're
  // in, otherwise the first session of the day would be sampled with an empty
  // map and lose its weak-item weighting. `built` then pins the plan so mastery
  // writes mid-session can't rebuild the queue under the learner.
  const built = useRef(false);
  useEffect(() => {
    if (built.current || grammarLoading || toneLoading) return;
    built.current = true;
    (async () => {
      const next = await buildSession(storage, {
        language,
        difficulty,
        grammarMastery,
        toneMastery,
        maxNewCardsPerDay,
        currentLesson,
      });
      setPlan(next);
      setPhase(next.items.length === 0 ? 'empty' : 'running');
    })();
  }, [
    storage,
    language,
    difficulty,
    grammarMastery,
    toneMastery,
    grammarLoading,
    toneLoading,
    maxNewCardsPerDay,
    currentLesson,
  ]);

  const current: SessionItem | null = plan?.items[index] ?? null;
  const total = plan?.items.length ?? 0;

  const advance = useCallback(() => {
    setRevealed(false);
    setIndex((i) => {
      const next = i + 1;
      if (next >= total) {
        setPhase('done');
        return i;
      }
      return next;
    });
  }, [total]);

  // Audio-first cards should play as soon as they appear, same as in /flashcards.
  // The sound is the whole prompt there, so a failure must say why.
  const { notice: speechNotice, reportSpeechError } = useSpeechNotice();
  useEffect(() => {
    if (current?.kind === 'card' && isAudioPrompt(current.card)) {
      speak(current.card.front, language, speechRate).catch(reportSpeechError);
    }
  }, [current, language, speechRate, reportSpeechError]);

  const gradeCard = async (card: Flashcard, grade: SRSGrade) => {
    const updated: Flashcard = {
      ...card,
      srs: calculateNextReview(card.srs, grade),
      updatedAt: Date.now(),
    };
    await storage.set(StorageKeys.card(updated.id), updated);
    void recordActivity({
      reviews: 1,
      totalAnswers: 1,
      correctAnswers: grade >= 3 ? 1 : 0,
      newCards: card.srs.repetitions === 0 ? 1 : 0,
    });
    setTally((t) => ({
      ...t,
      answered: t.answered + 1,
      correct: t.correct + (grade >= 3 ? 1 : 0),
      cards: t.cards + 1,
    }));
    advance();
  };

  const handleExercise = (item: Extract<SessionItem, { kind: 'exercise' }>) => {
    return (result: ExerciseResult) => {
      void recordActivity({
        exercises: 1,
        totalAnswers: 1,
        correctAnswers: result.correct ? 1 : 0,
      });
      if (item.ruleId && plan?.rule) {
        recordGrammar(item.ruleId, result.correct, {
          label: plan.rule.title,
          sublabel: plan.rule.pattern,
          group: 'grammar',
        });
      }
      recordExercise(item.exercise, result.correct, 'session', result.userAnswer);
      setTally((t) => ({
        ...t,
        answered: t.answered + 1,
        correct: t.correct + (result.correct ? 1 : 0),
        missed: t.missed + (result.correct ? 0 : 1),
      }));
    };
  };

  const handleTone = (item: Extract<SessionItem, { kind: 'tone' }>) => {
    return (correct: boolean) => {
      recordTone(`id:${item.item.hanzi}`, correct, {
        label: item.item.hanzi,
        sublabel: item.item.pinyin,
        group: `Tone ${item.item.tone}`,
      });
      void recordActivity({ exercises: 1, totalAnswers: 1, correctAnswers: correct ? 1 : 0 });
      setTally((t) => ({
        ...t,
        answered: t.answered + 1,
        correct: t.correct + (correct ? 1 : 0),
      }));
    };
  };

  if (phase === 'loading') {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto">
        <p className="text-sm text-muted-foreground">Building today&apos;s session…</p>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-4">
        <h1 className="text-xl font-bold tracking-tight">Daily session</h1>
        <p className="text-sm text-muted-foreground">
          Nothing to build a session from yet — add a deck in Study and the session will mix your
          due cards with grammar, dialogue and tone practice.
        </p>
        <Button onClick={() => router.push('/flashcards')}>Go to Study →</Button>
      </div>
    );
  }

  if (phase === 'done') {
    const pct = tally.answered ? Math.round((tally.correct / tally.answered) * 100) : 0;
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-3xl">{pct >= 80 ? '🎉' : '👍'}</p>
            <div>
              <h2 className="text-lg font-bold">Session complete</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {tally.correct} / {tally.answered} correct · {pct}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {plural(tally.cards, 'card')} reviewed
                {plan?.rule ? ` · pattern: ${plan.rule.title}` : ''}
              </p>
              {tally.missed > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {plural(tally.missed, 'miss', 'misses')} saved to{' '}
                  <Link href="/mistakes" className="underline underline-offset-2">
                    Mistakes
                  </Link>{' '}
                  to retry later.
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/progress')}>
                Weak spots
              </Button>
              <Button className="flex-1" onClick={() => router.push('/dashboard')}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-4">
      <SpeechNotice message={speechNotice} />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight truncate">Daily session</h1>
          <p className="text-[11px] text-muted-foreground">
            {index + 1} / {total} · {tally.correct}/{tally.answered} correct
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setPhase('done')}>
          End
        </Button>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(index / Math.max(total, 1)) * 100}%` }}
        />
      </div>

      {current?.kind === 'card' && (
        <CardStep
          card={current.card}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onGrade={(g) => void gradeCard(current.card, g)}
        />
      )}

      {current?.kind === 'exercise' && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-[11px]">
            {current.label}
          </Badge>
          <ExerciseShell
            key={current.id}
            exercise={current.exercise}
            onComplete={handleExercise(current)}
            onNext={advance}
          />
        </div>
      )}

      {current?.kind === 'tone' && (
        <ToneStep
          key={current.id}
          item={current.item}
          onComplete={handleTone(current)}
          onNext={advance}
        />
      )}
    </div>
  );
}

function CardStep({
  card,
  revealed,
  onReveal,
  onGrade,
}: {
  card: Flashcard;
  revealed: boolean;
  onReveal: () => void;
  onGrade: (grade: SRSGrade) => void;
}) {
  const face = cardFace(card);
  const dir = directionOf(card);
  return (
    <Card>
      <CardContent className="p-6 space-y-5 text-center">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[11px]">
            {DIRECTION_LABEL[dir]}
          </Badge>
          {(revealed || canSpeakBeforeReveal(card)) && <SpeakButton text={card.front} />}
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">{face.promptSub}</p>
          {face.promptKind === 'audio' ? (
            <p className="text-3xl">🔊</p>
          ) : (
            <p
              className={cn(
                'font-semibold',
                face.promptKind === 'char' && 'text-4xl cjk',
                face.promptKind === 'sentence' && 'text-xl cjk',
                face.promptKind === 'text' && 'text-xl',
              )}
            >
              {face.promptMain}
            </p>
          )}
          {revealed && (
            <>
              {face.revealTerm && <p className="text-3xl font-semibold cjk">{card.front}</p>}
              {face.revealReading && (
                <p className="text-sm text-muted-foreground">{card.reading}</p>
              )}
              {face.revealMeaning && <p className="text-base">{card.back}</p>}
            </>
          )}
        </div>

        {revealed ? (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => onGrade(1)}>
              Again
            </Button>
            <Button variant="outline" onClick={() => onGrade(4)}>
              Good
            </Button>
            <Button onClick={() => onGrade(5)}>Easy</Button>
          </div>
        ) : (
          <Button variant="outline" onClick={onReveal}>
            Show answer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
