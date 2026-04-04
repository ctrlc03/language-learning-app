'use client';

import { useState } from 'react';
import type { FillInBlankData } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FillInBlankProps {
  data: FillInBlankData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function FillInBlank({ data, onSubmit, disabled }: FillInBlankProps) {
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    const trimmed = answer.trim();
    const isCorrect = trimmed === data.answer ||
      data.acceptableAnswers.includes(trimmed);
    onSubmit(trimmed, isCorrect);
  };

  const handleOptionClick = (option: string, index: number) => {
    if (disabled) return;
    setSelected(index);
    const isCorrect = option === data.answer ||
      data.acceptableAnswers.includes(option);
    onSubmit(option, isCorrect);
  };

  const parts = data.sentence.split('___');
  const hasOptions = data.options && data.options.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        {parts[0]}
        <span className="inline-block min-w-[60px] border-b-2 border-primary/60 mx-1 pb-0.5">
          {disabled ? (
            <span className="text-success font-semibold">{data.answer}</span>
          ) : selected !== null && hasOptions ? (
            <span className="font-medium">{data.options![selected]}</span>
          ) : '\u00A0'}
        </span>
        {parts[1]}
      </p>

      {data.hint && !disabled && !hasOptions && (
        <p className="text-xs text-muted-foreground">Hint: {data.hint}</p>
      )}

      {!disabled && hasOptions && (
        <div className="grid grid-cols-2 gap-2">
          {data.options!.map((option, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(option, i)}
              disabled={disabled}
              className={cn(
                'rounded-xl border border-border bg-card px-4 py-3 text-left',
                'transition-all active:scale-[0.98]',
                'hover:border-primary/40 hover:bg-primary/5',
                'text-base font-medium'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {disabled && hasOptions && (
        <div className="grid grid-cols-2 gap-2">
          {data.options!.map((option, i) => {
            const isCorrect = i === data.correctIndex;
            const wasSelected = i === selected;
            return (
              <div
                key={i}
                className={cn(
                  'rounded-xl border px-4 py-3 text-base font-medium',
                  isCorrect && 'border-success/50 bg-success/10 text-success',
                  wasSelected && !isCorrect && 'border-destructive/50 bg-destructive/10 text-destructive opacity-60',
                  !isCorrect && !wasSelected && 'border-border opacity-40'
                )}
              >
                {option}
              </div>
            );
          })}
        </div>
      )}

      {!disabled && !hasOptions && (
        <div className="flex gap-2">
          <Input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            onKeyDown={e => e.key === 'Enter' && answer.trim() && handleSubmit()}
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={!answer.trim()}>
            Check
          </Button>
        </div>
      )}
    </div>
  );
}
