'use client';

import { useState } from 'react';
import type { TranslationData } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TranslationExerciseProps {
  data: TranslationData;
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

export function TranslationExercise({ data, onSubmit, disabled }: TranslationExerciseProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    onSubmit(answer.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[11px]">{data.sourceLanguage}</Badge>
        <span className="text-muted-foreground text-xs">&rarr;</span>
        <Badge variant="outline" className="text-[11px]">{data.targetLanguage}</Badge>
      </div>

      <div className="px-4 py-3 bg-muted/50 rounded-xl">
        <p className="text-base font-medium leading-relaxed">{data.sourceText}</p>
      </div>

      {!disabled && (
        <div className="space-y-3">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your translation..."
            className="w-full min-h-[80px] rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={!answer.trim()}>
            Submit
          </Button>
        </div>
      )}

      {disabled && data.sampleAnswer && (
        <div className="px-4 py-3 bg-primary/5 rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Sample answer</p>
          <p className="text-sm font-medium">{data.sampleAnswer}</p>
        </div>
      )}
    </div>
  );
}
