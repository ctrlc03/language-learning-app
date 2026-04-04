'use client';

import { useState } from 'react';
import type { GrammarDrillData } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GrammarDrillProps {
  data: GrammarDrillData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function GrammarDrill({ data, onSubmit, disabled }: GrammarDrillProps) {
  const [answer, setAnswer] = useState('');
  const [mode, setMode] = useState<'choice' | 'type'>(data.options ? 'choice' : 'type');
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    const trimmed = answer.trim().toLowerCase();
    const isCorrect = trimmed === data.answer ||
      trimmed === data.answer.toLowerCase() ||
      data.acceptableAnswers.some(a => a.toLowerCase() === trimmed);
    onSubmit(answer.trim(), isCorrect);
  };

  const handleOptionSelect = (index: number) => {
    if (disabled) return;
    setSelected(index);
    const isCorrect = index === data.correctIndex;
    onSubmit(data.options![index], isCorrect);
  };

  const parts = data.sentence.split('___');

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="text-[11px]">
        {data.grammarPoint}
      </Badge>

      {data.pinyin && (
        <p className="text-sm text-muted-foreground leading-relaxed tracking-wide">
          {data.pinyin}
        </p>
      )}

      <p className="text-base leading-relaxed">
        {parts[0]}
        <span className="inline-block min-w-[60px] border-b-2 border-primary/60 mx-1 pb-0.5">
          {disabled ? <span className="text-success font-semibold">{data.answer}</span> : '\u00A0'}
        </span>
        {parts[1]}
      </p>

      {data.translation && !disabled && (
        <p className="text-xs text-muted-foreground">
          Translation: <span className="text-foreground/70">{data.translation}</span>
        </p>
      )}

      {/* Mode toggle (only when options are available and not yet answered) */}
      {!disabled && data.options && (
        <div className="flex gap-1.5">
          <button
            onClick={() => setMode('choice')}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
              mode === 'choice'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/30'
            )}
          >
            Multiple Choice
          </button>
          <button
            onClick={() => setMode('type')}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
              mode === 'type'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/30'
            )}
          >
            Type Answer
          </button>
        </div>
      )}

      {/* Multiple choice mode */}
      {!disabled && mode === 'choice' && data.options && (
        <div className="space-y-2">
          {data.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(i)}
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
        </div>
      )}

      {/* Answered MC state */}
      {disabled && mode === 'choice' && data.options && (
        <div className="space-y-2">
          {data.options.map((option, i) => (
            <div
              key={i}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm',
                i === data.correctIndex
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
            </div>
          ))}
        </div>
      )}

      {/* Type answer mode */}
      {!disabled && mode === 'type' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type characters, pinyin, or English..."
              onKeyDown={e => e.key === 'Enter' && answer.trim() && handleSubmit()}
              autoFocus
            />
            <Button onClick={handleSubmit} disabled={!answer.trim()}>
              Check
            </Button>
          </div>
        </div>
      )}

      {disabled && data.explanation && (
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{data.explanation}</p>
      )}
    </div>
  );
}
