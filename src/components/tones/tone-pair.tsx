'use client';

import { useEffect, useState } from 'react';
import type { TonePairItem } from '@/lib/tones/utils';
import { TONES, type ToneNumber } from '@/lib/tones/data';
import { autoSpeak, ColoredPinyin, PlayButton } from './tone-pieces';
import { cn } from '@/lib/utils';

function PairLabel({ pair }: { pair: [ToneNumber, ToneNumber] }) {
  return (
    <span className="flex items-center gap-1 text-lg font-semibold">
      {pair.map((t, i) => (
        <span key={i} style={{ color: TONES[t].color }}>
          {TONES[t].mark}
          <span className="text-xs align-super">{t === 5 ? '·' : t}</span>
        </span>
      ))}
    </span>
  );
}

const key = (p: [ToneNumber, ToneNumber]) => `${p[0]}-${p[1]}`;

export function TonePair({
  item,
  onComplete,
}: {
  item: TonePairItem;
  onComplete: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    autoSpeak(item.hanzi);
  }, [item.hanzi]);

  const pick = (p: [ToneNumber, ToneNumber]) => {
    if (picked !== null) return;
    setPicked(key(p));
    onComplete(key(p) === key(item.pair));
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">Which tone pair did you hear?</p>

      <div className="flex justify-center">
        <PlayButton text={item.hanzi} label="Replay" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {item.options.map((p) => {
          const revealed = picked !== null;
          const isAnswer = key(p) === key(item.pair);
          const isPicked = key(p) === picked;
          return (
            <button
              key={key(p)}
              onClick={() => pick(p)}
              disabled={revealed}
              className={cn(
                'flex items-center justify-center rounded-xl border-2 p-4 transition-all',
                !revealed && 'border-border hover:bg-primary/5',
                revealed && isAnswer && 'border-success bg-success/10',
                revealed && isPicked && !isAnswer && 'border-destructive bg-destructive/10',
                revealed && !isAnswer && !isPicked && 'opacity-40',
              )}
            >
              <PairLabel pair={p} />
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="text-center space-y-1">
          <div className="text-4xl cjk">{item.hanzi}</div>
          <ColoredPinyin word={item.hanzi} className="text-lg" />
          <div className="text-sm text-muted-foreground">{item.meaning}</div>
        </div>
      )}
    </div>
  );
}
