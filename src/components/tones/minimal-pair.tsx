'use client';

import { useEffect, useState } from 'react';
import { toneColor } from '@/lib/tones/utils';
import type { MinimalPairGroup, MinimalPairMember } from '@/lib/tones/data';
import { cn } from '@/lib/utils';
import { autoSpeak, PlayButton } from './tone-pieces';

export interface MinimalPairPrompt {
  group: MinimalPairGroup;
  answer: MinimalPairMember;
}

export function MinimalPair({
  prompt,
  onComplete,
}: {
  prompt: MinimalPairPrompt;
  onComplete: (correct: boolean) => void;
}) {
  const { group, answer } = prompt;
  const [picked, setPicked] = useState<MinimalPairMember | null>(null);

  useEffect(() => {
    autoSpeak(answer.hanzi);
  }, [answer.hanzi]);

  const pick = (m: MinimalPairMember) => {
    if (picked !== null) return;
    setPicked(m);
    onComplete(m.hanzi === answer.hanzi);
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Same sound, different tone — which one did you hear?
      </p>

      <div className="flex justify-center">
        <PlayButton text={answer.hanzi} label="Replay" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {group.members.map((m) => {
          const revealed = picked !== null;
          const isAnswer = m.hanzi === answer.hanzi;
          const isPicked = picked?.hanzi === m.hanzi;
          return (
            <button
              key={m.hanzi}
              onClick={() => pick(m)}
              disabled={revealed}
              className={cn(
                'flex flex-col items-center rounded-xl border-2 p-4 transition-all',
                !revealed && 'border-border hover:bg-primary/5',
                revealed && isAnswer && 'border-success bg-success/10',
                revealed && isPicked && !isAnswer && 'border-destructive bg-destructive/10',
                revealed && !isAnswer && !isPicked && 'opacity-40',
              )}
            >
              <span className="text-3xl cjk leading-none">{m.hanzi}</span>
              <span className="mt-1 font-medium" style={{ color: toneColor(m.tone) }}>
                {m.pinyin}
              </span>
              {revealed && <span className="text-xs text-muted-foreground mt-1">{m.meaning}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
