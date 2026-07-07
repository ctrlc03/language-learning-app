'use client';

import { useEffect, useState } from 'react';
import { type ToneIdItem } from '@/lib/tones/utils';
import { type ToneNumber } from '@/lib/tones/data';
import { autoSpeak, ColoredPinyin, PlayButton, ToneChoice } from './tone-pieces';

const CHOICES: ToneNumber[] = [1, 2, 3, 4];

export function ToneIdentify({
  item,
  onComplete,
}: {
  item: ToneIdItem;
  onComplete: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<ToneNumber | null>(null);

  // Auto-play on mount — the point is to hear it, not read it.
  useEffect(() => {
    autoSpeak(item.hanzi);
  }, [item.hanzi]);

  const pick = (tone: ToneNumber) => {
    if (picked !== null) return;
    setPicked(tone);
    onComplete(tone === item.tone);
  };

  const stateFor = (tone: ToneNumber): 'idle' | 'correct' | 'wrong' | 'dim' => {
    if (picked === null) return 'idle';
    if (tone === item.tone) return 'correct';
    if (tone === picked) return 'wrong';
    return 'dim';
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">Which tone did you hear?</p>

      <div className="flex justify-center">
        <PlayButton text={item.hanzi} label="Replay" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {CHOICES.map((t) => (
          <ToneChoice key={t} tone={t} state={stateFor(t)} onClick={() => pick(t)} />
        ))}
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
