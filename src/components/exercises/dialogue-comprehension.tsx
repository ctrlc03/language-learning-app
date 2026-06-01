'use client';

import { useState, useRef, useCallback } from 'react';
import type { DialogueComprehensionExerciseData } from '@/types';
import { speak, stopSpeaking } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import { SpeakButton } from '@/components/shared/speak-button';
import { cn } from '@/lib/utils';

interface DialogueComprehensionProps {
  data: DialogueComprehensionExerciseData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function DialogueComprehension({ data, onSubmit, disabled }: DialogueComprehensionProps) {
  const { language, speechRate } = useLanguage();
  const [showReading, setShowReading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const cancelledRef = useRef(false);

  const readingLabel = language === 'japanese' ? 'Furigana' : 'Pinyin';

  const handleSelect = (index: number) => {
    if (disabled || selected !== null) return;
    setSelected(index);
    onSubmit(data.options[index], index === data.correctIndex);
  };

  const handleListenAll = useCallback(async () => {
    cancelledRef.current = false;
    setPlaying(true);
    for (let i = 0; i < data.lines.length; i++) {
      if (cancelledRef.current) break;
      setPlayingIndex(i);
      try {
        await speak(data.lines[i].text, language, speechRate);
      } catch { /* skip */ }
      if (cancelledRef.current) break;
      await new Promise(r => setTimeout(r, 600));
    }
    setPlaying(false);
    setPlayingIndex(-1);
  }, [data.lines, language, speechRate]);

  const handleStopListening = useCallback(() => {
    cancelledRef.current = true;
    stopSpeaking();
    setPlaying(false);
    setPlayingIndex(-1);
  }, []);

  const speakers = [...new Set(data.lines.map(l => l.speaker))];
  const speakerColors = [
    'text-blue-600 dark:text-blue-400',
    'text-emerald-600 dark:text-emerald-400',
    'text-purple-600 dark:text-purple-400',
    'text-amber-600 dark:text-amber-400',
  ];

  return (
    <div className="space-y-4">
      {/* Setting */}
      <p className="text-xs text-muted-foreground italic">{data.setting}</p>

      {/* Toggle controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowReading(v => !v)}
          className={cn(
            'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
            showReading
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30'
          )}
        >
          {readingLabel} {showReading ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setShowTranslation(v => !v)}
          className={cn(
            'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
            showTranslation
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30'
          )}
        >
          Translation {showTranslation ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => playing ? handleStopListening() : handleListenAll()}
          className={cn(
            'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
            playing
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'border-border text-muted-foreground hover:border-primary/30'
          )}
        >
          {playing ? 'Stop' : 'Listen All'}
        </button>
      </div>

      {/* Dialogue lines (all revealed) */}
      <div className="space-y-3">
        {data.lines.map((line, i) => {
          const speakerIndex = speakers.indexOf(line.speaker);
          const colorClass = speakerColors[speakerIndex % speakerColors.length];
          const isLeft = speakerIndex % 2 === 0;

          return (
            <div key={i} className={cn('flex gap-2', isLeft ? 'justify-start' : 'justify-end')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 space-y-1 transition-all',
                  isLeft ? 'bg-muted rounded-tl-sm' : 'bg-primary/10 rounded-tr-sm',
                  playingIndex === i && 'ring-2 ring-primary/50'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-[11px] font-semibold', colorClass)}>{line.speaker}</span>
                  <SpeakButton text={line.text} size="icon" />
                </div>
                <p className="text-base font-medium leading-relaxed">{line.text}</p>
                {showReading && line.pinyin && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{line.pinyin}</p>
                )}
                {showTranslation && (
                  <p className="text-xs text-muted-foreground/70 italic leading-relaxed">{line.translation}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehension question */}
      <div className="pt-2 space-y-2.5 border-t border-dashed border-border">
        <p className="text-sm font-semibold leading-snug pt-3">{data.question}</p>
        {data.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={disabled || selected !== null}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
              selected === null
                ? 'border-border hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.98]'
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
        {selected !== null && data.explanation && (
          <p className="text-xs text-muted-foreground pt-1 leading-relaxed whitespace-pre-line">{data.explanation}</p>
        )}
      </div>
    </div>
  );
}
