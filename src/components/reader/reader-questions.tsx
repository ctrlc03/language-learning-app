'use client';

import { useState } from 'react';
import { SelfCheckCard } from '@/components/selfcheck/self-check-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMistakeLog } from '@/hooks/use-mistakes';
import { useProgress } from '@/hooks/use-progress';
import type { SelfCheckItem } from '@/lib/selfcheck/parse';

interface ReaderQuestionsProps {
  items: SelfCheckItem[];
}

/** The lesson's questions about a passage, one after another; each answer goes to the mistake notebook. */
export function ReaderQuestions({ items }: ReaderQuestionsProps) {
  const { recordSelfCheck } = useMistakeLog();
  const { recordActivity } = useProgress();
  const [index, setIndex] = useState(0);
  const [right, setRight] = useState(0);
  // Bumped on "Try again" so the cards remount even though the item ids repeat.
  const [round, setRound] = useState(0);

  if (items.length === 0) return null;

  const done = index >= items.length;
  const item = items[index];

  return (
    <section aria-label="Questions about the text" className="space-y-3">
      <h2 className="text-lg font-semibold">
        Questions<span className="cjk text-muted-foreground"> · 问题</span>
      </h2>

      {done ? (
        <Card>
          <CardContent className="space-y-3 p-5 text-center">
            <p className="text-lg font-semibold">
              {right} of {items.length} right
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIndex(0);
                setRight(0);
                setRound((r) => r + 1);
              }}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Question {index + 1} of {items.length}
          </p>
          <SelfCheckCard
            key={`${round}:${item.id}`}
            item={item}
            passageShown
            onResult={(correct, answer) => {
              recordSelfCheck(item, correct, 'reader', answer);
              void recordActivity({
                exercises: 1,
                totalAnswers: 1,
                correctAnswers: correct ? 1 : 0,
              });
              if (correct) setRight((n) => n + 1);
            }}
            onNext={() => setIndex((i) => i + 1)}
          />
        </>
      )}
    </section>
  );
}
