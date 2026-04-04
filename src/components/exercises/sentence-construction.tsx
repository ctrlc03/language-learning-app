'use client';

import { useState } from 'react';
import type { SentenceConstructionData } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SentenceConstructionProps {
  data: SentenceConstructionData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function SentenceConstruction({ data, onSubmit, disabled }: SentenceConstructionProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([...data.words].sort(() => Math.random() - 0.5));

  const handleSelect = (word: string, index: number) => {
    if (disabled) return;
    setSelected(prev => [...prev, word]);
    setAvailable(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeselect = (word: string, index: number) => {
    if (disabled) return;
    setAvailable(prev => [...prev, word]);
    setSelected(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const answer = selected.join('');
    const isCorrect = answer === data.correctOrder;
    onSubmit(answer, isCorrect);
  };

  const handleClear = () => {
    setAvailable([...data.words].sort(() => Math.random() - 0.5));
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Translation: <span className="text-foreground/80">{data.translation}</span>
      </p>

      {/* Drop area */}
      <div className="min-h-[52px] px-4 py-3 rounded-xl border-2 border-dashed border-border/60 flex flex-wrap gap-2 items-center">
        {selected.length === 0 && (
          <span className="text-muted-foreground/50 text-xs">Tap words below to build the sentence...</span>
        )}
        {selected.map((word, i) => (
          <button
            key={`s-${i}`}
            onClick={() => handleDeselect(word, i)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              disabled
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 active:scale-[0.98]'
            )}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {available.map((word, i) => (
          <button
            key={`a-${i}`}
            onClick={() => handleSelect(word, i)}
            disabled={disabled}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03] transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {word}
          </button>
        ))}
      </div>

      {!disabled && (
        <div className="flex gap-2 pt-1">
          <Button onClick={handleSubmit} disabled={selected.length === 0}>
            Check
          </Button>
          <Button variant="ghost" onClick={handleClear} disabled={selected.length === 0}>
            Clear
          </Button>
        </div>
      )}

      {disabled && (
        <p className="text-xs text-muted-foreground pt-1">
          Correct: <span className="font-medium text-foreground">{data.correctOrder}</span>
        </p>
      )}
    </div>
  );
}
