'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { speak } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface DictationExerciseProps {
  text: string;
  hint?: string;
  onComplete: (correct: boolean) => void;
}

export function DictationExercise({ text, hint, onComplete }: DictationExerciseProps) {
  const { language, speechRate } = useLanguage();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
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

  const handlePlaySlow = useCallback(async () => {
    setPlaying(true);
    try {
      await speak(text, language, speechRate * 0.6);
    } catch {
      // TTS not available
    } finally {
      setPlaying(false);
    }
  }, [text, language, speechRate]);

  const handleSubmit = () => {
    setSubmitted(true);
    const isCorrect = answer.trim() === text.trim();
    onComplete(isCorrect);
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <p className="text-muted-foreground text-sm mb-4">Listen and type what you hear</p>
        <div className="flex justify-center gap-3">
          <Button onClick={handlePlay} disabled={playing} size="lg" className="gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Play
          </Button>
          <Button onClick={handlePlaySlow} disabled={playing} variant="outline" size="lg" className="gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Slow
          </Button>
        </div>
      </div>

      {hint && !submitted && (
        <p className="text-sm text-muted-foreground text-center">Hint: {hint}</p>
      )}

      <div className="flex gap-2">
        <Input
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type what you heard..."
          disabled={submitted}
          onKeyDown={e => e.key === 'Enter' && !submitted && handleSubmit()}
          className="text-lg"
        />
        {!submitted && (
          <Button onClick={handleSubmit} disabled={!answer.trim()}>
            Check
          </Button>
        )}
      </div>

      {submitted && (
        <div className={cn(
          'p-4 rounded-lg border',
          answer.trim() === text.trim()
            ? 'bg-success/10 border-success/30'
            : 'bg-destructive/10 border-destructive/30'
        )}>
          <p className="font-medium">
            {answer.trim() === text.trim() ? 'Correct!' : 'Not quite'}
          </p>
          {answer.trim() !== text.trim() && (
            <div className="mt-2 text-sm">
              <p>Your answer: <span className="text-destructive">{answer}</span></p>
              <p>Correct: <span className="text-success font-medium">{text}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
