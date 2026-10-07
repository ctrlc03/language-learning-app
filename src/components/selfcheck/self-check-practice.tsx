'use client';

import { useState } from 'react';
import type { SelfCheckItem } from '@/lib/selfcheck/parse';
import type { MistakeSource } from '@/lib/mistakes';
import { useMistakeLog } from '@/hooks/use-mistakes';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelfCheckCard } from './self-check-card';

interface SelfCheckPracticeProps {
  items: SelfCheckItem[];
  source: MistakeSource;
  title?: string;
}

interface Run {
  items: SelfCheckItem[];
  index: number;
  correct: number;
  missed: SelfCheckItem[];
}

function freshRun(items: SelfCheckItem[]): Run {
  return { items, index: 0, correct: 0, missed: [] };
}

/**
 * A run through a list of self-check items, in order. Every answer goes to the
 * mistake notebook (under `source`) and the day's activity; the end summary
 * offers a re-run of just the misses. The run starts from the first `items`
 * it sees: remount with a `key` to start a different list.
 */
export function SelfCheckPractice({ items, source, title }: SelfCheckPracticeProps) {
  const { recordSelfCheck } = useMistakeLog();
  const { recordActivity } = useProgress();
  const [run, setRun] = useState<Run>(() => freshRun(items));

  const total = run.items.length;
  const item = run.items[run.index];

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No questions to practise here.</p>;
  }

  const handleResult = (current: SelfCheckItem, correct: boolean, answer: string) => {
    recordSelfCheck(current, correct, source, answer);
    recordActivity({ exercises: 1, totalAnswers: 1, correctAnswers: correct ? 1 : 0 });
    setRun((r) => ({
      ...r,
      correct: r.correct + (correct ? 1 : 0),
      missed: correct ? r.missed : [...r.missed, current],
    }));
  };

  if (!item) {
    return (
      <Card>
        <CardContent className="p-5 space-y-4">
          {title && <h3 className="font-semibold text-sm">{title}</h3>}
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {run.correct} / {total}
            </p>
            <p className="text-xs text-muted-foreground">
              {run.missed.length === 0 ? 'All correct.' : `${run.missed.length} to practise again.`}
            </p>
          </div>

          {run.missed.length > 0 && (
            <ul className="space-y-1.5">
              {run.missed.map((m) => (
                <li key={m.id} className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <p>{m.cue ?? m.prompt}</p>
                  {m.answer && <p className="cjk text-xs text-muted-foreground">{m.answer}</p>}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            {run.missed.length > 0 && (
              <Button onClick={() => setRun(freshRun(run.missed))}>Practise the missed ones</Button>
            )}
            <Button variant="outline" onClick={() => setRun(freshRun(items))}>
              Start over
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        {title && <span>{title}</span>}
        <span className="ml-auto">
          {run.index + 1} / {total} · {run.correct} correct
        </span>
      </div>
      <SelfCheckCard
        key={`${run.index}:${item.id}`}
        item={item}
        onResult={(correct, answer) => handleResult(item, correct, answer)}
        onNext={() => setRun((r) => ({ ...r, index: r.index + 1 }))}
      />
    </div>
  );
}
