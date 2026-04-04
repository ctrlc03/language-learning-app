'use client';

import { useState } from 'react';
import type { MultipleChoiceData } from '@/types';
import { cn } from '@/lib/utils';

interface MultipleChoiceProps {
  data: MultipleChoiceData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function MultipleChoice({ data, onSubmit, disabled }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (disabled) return;
    setSelected(index);
    onSubmit(data.options[index], index === data.correctIndex);
  };

  return (
    <div className="space-y-2.5">
      {data.options.map((option, i) => (
        <button
          key={i}
          onClick={() => handleSelect(i)}
          disabled={disabled}
          className={cn(
            'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
            selected === null
              ? 'border-border hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.99]'
              : i === data.correctIndex
                ? 'border-success/50 bg-success/10 text-success'
                : selected === i
                  ? 'border-destructive/50 bg-destructive/10 text-destructive'
                  : 'border-border/50 opacity-40'
          )}
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current/20 text-xs font-semibold mr-3">
            {String.fromCharCode(65 + i)}
          </span>
          {option}
        </button>
      ))}
      {disabled && data.explanation && (
        <p className="text-xs text-muted-foreground pt-1 leading-relaxed whitespace-pre-line">{data.explanation}</p>
      )}
    </div>
  );
}
