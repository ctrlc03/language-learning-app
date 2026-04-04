'use client';

import { useState } from 'react';
import type { CharacterRecognitionData } from '@/types';
import { SpeakButton } from '@/components/shared/speak-button';
import { cn } from '@/lib/utils';

interface CharacterRecognitionProps {
  data: CharacterRecognitionData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function CharacterRecognition({ data, onSubmit, disabled }: CharacterRecognitionProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (disabled) return;
    setSelected(index);
    onSubmit(data.options[index], index === data.correctIndex);
  };

  return (
    <div className="space-y-5">
      <div className="text-center py-4">
        <p className="text-5xl md:text-6xl font-bold tracking-wide">{data.character}</p>
        <div className="mt-3">
          <SpeakButton text={data.character} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {data.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={disabled}
            className={cn(
              'px-4 py-3.5 rounded-xl border text-center text-sm font-medium transition-all',
              selected === null
                ? 'border-border hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.98]'
                : i === data.correctIndex
                  ? 'border-success/50 bg-success/10 text-success'
                  : selected === i
                    ? 'border-destructive/50 bg-destructive/10 text-destructive'
                    : 'border-border/50 opacity-40'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {disabled && (
        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">{data.reading}</span>
          {' — '}
          {data.meaning}
        </p>
      )}
    </div>
  );
}
