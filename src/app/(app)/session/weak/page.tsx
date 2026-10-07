'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStorage } from '@/contexts/StorageContext';
import { useProgress } from '@/hooks/use-progress';
import { useMastery } from '@/hooks/use-mastery';
import { useMistakeLog } from '@/hooks/use-mistakes';
import { useSpeechInit } from '@/hooks/use-speech';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExerciseShell } from '@/components/exercises/exercise-shell';
import { SelfCheckCard } from '@/components/selfcheck/self-check-card';
import { ToneStep } from '@/components/session/tone-step';
import { buildWeakSession, type DrillItem, type WeakSessionPlan } from '@/lib/session/weak';
import { SOURCE_LABELS } from '@/lib/mistakes';
import { plural } from '@/lib/utils';
import type { ExerciseResult } from '@/types';

type Phase = 'loading' | 'empty' | 'running' | 'done';

interface Tally {
  answered: number;
  correct: number;
  /** Notebook mistakes answered. */
  retried: number;
}

/**
 * Weak-spot practice: retries the mistake notebook first, then the grammar
 * patterns and tones answered wrong most often. Every answer feeds the same
 * notebook and mastery stores, so a mistake answered right twice in a row
 * leaves the notebook.
 */
export default function WeakSessionPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const storage = useStorage();
  const { recordActivity } = useProgress();
  const { recordExercise, recordSelfCheck } = useMistakeLog();
  const {
    map: grammarMastery,
    loading: grammarLoading,
    record: recordGrammar,
  } = useMastery('grammar');
  const { map: toneMastery, loading: toneLoading, record: recordTone } = useMastery('tones');

  const [phase, setPhase] = useState<Phase>('loading');
  const [plan, setPlan] = useState<WeakSessionPlan | null>(null);
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState<Tally>({ answered: 0, correct: 0, retried: 0 });

  useSpeechInit();

  // Build once both mastery maps are in; `built` pins the plan so the writes
  // made while practising can't rebuild the queue mid-run.
  const built = useRef(false);
  useEffect(() => {
    if (built.current || grammarLoading || toneLoading) return;
    built.current = true;
    (async () => {
      const next = await buildWeakSession(storage, { language, grammarMastery, toneMastery });
      setPlan(next);
      setPhase(next.items.length === 0 ? 'empty' : 'running');
    })();
  }, [storage, language, grammarMastery, toneMastery, grammarLoading, toneLoading]);

  const current: DrillItem | null = plan?.items[index] ?? null;
  const total = plan?.items.length ?? 0;

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= total) {
        setPhase('done');
        return i;
      }
      return i + 1;
    });
  }, [total]);

  const count = (correct: boolean, retry = false) => {
    void recordActivity({ exercises: 1, totalAnswers: 1, correctAnswers: correct ? 1 : 0 });
    setTally((t) => ({
      answered: t.answered + 1,
      correct: t.correct + (correct ? 1 : 0),
      retried: t.retried + (retry ? 1 : 0),
    }));
  };

  const handleExercise = (item: Extract<DrillItem, { kind: 'exercise' }>) => {
    return (result: ExerciseResult) => {
      recordExercise(item.exercise, result.correct, item.source, result.userAnswer);
      const rule = item.ruleId ? plan?.rules.find((r) => r.id === item.ruleId) : undefined;
      if (rule) {
        recordGrammar(rule.id, result.correct, {
          label: rule.title,
          sublabel: rule.pattern,
          group: 'grammar',
        });
      }
      count(result.correct, item.retry);
    };
  };

  const handleSelfCheck = (item: Extract<DrillItem, { kind: 'selfcheck' }>) => {
    return (correct: boolean, answer: string) => {
      recordSelfCheck(item.item, correct, item.source, answer);
      count(correct, item.retry);
    };
  };

  const handleTone = (item: Extract<DrillItem, { kind: 'tone' }>) => {
    return (correct: boolean) => {
      recordTone(`id:${item.item.hanzi}`, correct, {
        label: item.item.hanzi,
        sublabel: item.item.pinyin,
        group: `Tone ${item.item.tone}`,
      });
      count(correct);
    };
  };

  if (phase === 'loading') {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto">
        <p className="text-sm text-muted-foreground">Gathering your weak spots…</p>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-4">
        <h1 className="text-xl font-bold tracking-tight">Weak spots</h1>
        <p className="text-sm text-muted-foreground">
          {language === 'chinese'
            ? 'Nothing to retry yet. Misses from Practice, the daily session, Learn, lesson self-checks and the Reader collect in Mistakes, and the grammar patterns and tones you often miss come up here.'
            : 'Nothing to retry yet. Misses from Practice and the daily session collect in Mistakes and come up here.'}
        </p>
        <Button onClick={() => router.push('/session')}>Start the daily session →</Button>
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
              <h2 className="text-lg font-bold">Weak spots done</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {tally.correct} / {tally.answered} correct · {pct}%
              </p>
              {tally.retried > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {plural(tally.retried, 'mistake')} retried. Two right answers in a row take one
                  out of{' '}
                  <Link href="/mistakes" className="underline underline-offset-2">
                    Mistakes
                  </Link>
                  .
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/mistakes')}>
                Mistakes
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
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight truncate">Weak spots</h1>
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

      {current?.kind === 'exercise' && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-[11px]">
            {current.ruleId ? current.label : `${current.label} · ${SOURCE_LABELS[current.source]}`}
          </Badge>
          <ExerciseShell
            key={current.id}
            exercise={current.exercise}
            onComplete={handleExercise(current)}
            onNext={advance}
          />
        </div>
      )}

      {current?.kind === 'selfcheck' && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-[11px]">
            {current.label} · {SOURCE_LABELS[current.source]}
          </Badge>
          <SelfCheckCard
            key={current.id}
            item={current.item}
            onResult={handleSelfCheck(current)}
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
