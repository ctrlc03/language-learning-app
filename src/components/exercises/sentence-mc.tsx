'use client';

import { useState } from 'react';
import type { SentenceMcData } from '@/types';
import { Furigana } from '@/components/shared/furigana';
import { SpeakButton } from '@/components/shared/speak-button';
import { cn } from '@/lib/utils';

interface SentenceMcProps {
  data: SentenceMcData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function SentenceMC({ data, onSubmit, disabled }: SentenceMcProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (i: number) => {
    if (disabled || selected !== null) return;
    setSelected(i);
    onSubmit(data.options[i], i === data.correctIndex);
  };

  const answered = selected !== null;

  return (
    <div className="space-y-4">
      {/* Stimulus: the Japanese sentence (with furigana) for toMeaning */}
      {data.direction === 'toMeaning' && (
        <div className="flex items-start justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-lg font-medium">
            {data.sentenceFurigana
              ? <Furigana segments={data.sentenceFurigana} />
              : data.sentence}
          </p>
          <SpeakButton text={data.sentence} size="icon" />
        </div>
      )}

      {/* Options */}
      <div className="space-y-2.5">
        {data.options.map((option, i) => {
          const furi = data.optionFurigana?.[i];
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={disabled || answered}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                !answered
                  ? 'border-border hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.98]'
                  : i === data.correctIndex
                    ? 'border-success/50 bg-success/10 text-success'
                    : selected === i
                      ? 'border-destructive/50 bg-destructive/10 text-destructive'
                      : 'border-border/50 opacity-40'
              )}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current/20 text-xs font-semibold mr-3 align-middle">
                {String.fromCharCode(65 + i)}
              </span>
              {furi ? <Furigana segments={furi} className="text-base" /> : option}
            </button>
          );
        })}
      </div>

      {/* After answering: show the sentence + reading + meaning for context */}
      {answered && (
        <div className="text-xs text-muted-foreground leading-relaxed space-y-0.5 pt-1">
          {data.direction === 'toSentence' && (
            <p className="text-foreground/80">
              {data.sentenceFurigana
                ? <Furigana segments={data.sentenceFurigana} />
                : data.sentence}
            </p>
          )}
          <p>{data.translation}</p>
          {data.explanation && <p>{data.explanation}</p>}
        </div>
      )}
    </div>
  );
}
