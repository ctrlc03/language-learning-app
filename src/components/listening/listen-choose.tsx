'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { speak } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ListenAndChooseProps {
  text: string;
  question: string;
  options: string[];
  correctIndex: number;
  onComplete: (correct: boolean) => void;
}

export function ListenAndChoose({ text, question, options, correctIndex, onComplete }: ListenAndChooseProps) {
  const { language, speechRate } = useLanguage();
  const [selected, setSelected] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = useCallback(async () => {
    setPlaying(true);
    try {
      await speak(text, language, speechRate);
    } catch {
      // TTS not available
    } finally {
      setPlaying(false);
    }
  }, [text, language, speechRate]);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    onComplete(index === correctIndex);
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <Button onClick={handlePlay} disabled={playing} size="lg" className="gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
          Listen
        </Button>
      </div>

      <p className="text-center font-medium">{question}</p>

      <div className="space-y-2">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
            className={cn(
              'w-full text-left p-3 rounded-lg border text-sm transition-colors',
              selected === null
                ? 'border-border hover:border-primary/50 hover:bg-primary/5'
                : i === correctIndex
                  ? 'border-success bg-success/10 text-success'
                  : selected === i
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border opacity-50'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
