'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SpeakButton } from '@/components/shared/speak-button';
import { MASTERED_STREAK, SOURCE_LABELS, type Mistake } from '@/lib/mistakes';
import { cn } from '@/lib/utils';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "today", "yesterday", "3 days ago" by calendar day. */
export function relativeDay(then: number, now: number): string {
  const days = Math.max(0, Math.round((startOfDay(now) - startOfDay(then)) / DAY_MS));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

interface MistakeRowProps {
  mistake: Mistake;
  now: number;
  onRemove: (mistake: Mistake) => Promise<void>;
}

// Chinese or Japanese text to pronounce; many answers are English meanings.
const SPOKEN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

export function MistakeRow({ mistake, now, onRemove }: MistakeRowProps) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { prompt, answer, answerPinyin, note, lastAnswer, misses, streak, source } = mistake;
  const speakable = SPOKEN.test(answer);
  const filled = Math.min(streak, MASTERED_STREAK);

  const remove = async () => {
    setRemoving(true);
    try {
      await onRemove(mistake);
    } finally {
      setRemoving(false);
      setConfirming(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium cjk break-words min-w-0">{prompt}</p>
          <Badge variant="outline" className="shrink-0">
            {SOURCE_LABELS[source]}
          </Badge>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground">Answer</span>
          <span className="cjk text-success font-medium break-words">{answer}</span>
          {answerPinyin && (
            <span className="text-sm text-muted-foreground break-words">{answerPinyin}</span>
          )}
          {speakable && <SpeakButton text={answer} size="icon" className="h-8 w-8" />}
        </div>

        {note && <p className="text-sm text-muted-foreground whitespace-pre-line">{note}</p>}

        {lastAnswer && (
          <p className="text-sm">
            <span className="text-muted-foreground">You answered: </span>
            <span className="cjk text-destructive break-words">{lastAnswer}</span>
          </p>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>missed {misses}×</span>
            <span
              className="inline-flex items-center gap-1"
              role="img"
              aria-label={`${filled} of ${MASTERED_STREAK} right answers in a row`}
            >
              {Array.from({ length: MASTERED_STREAK }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={cn(
                    'h-2 w-2 rounded-full border',
                    i < filled ? 'bg-success border-success' : 'border-muted-foreground/50',
                  )}
                />
              ))}
            </span>
            <span>seen {relativeDay(mistake.lastSeen, now)}</span>
          </div>

          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Remove?</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={removing}
                onClick={remove}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={removing}
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
