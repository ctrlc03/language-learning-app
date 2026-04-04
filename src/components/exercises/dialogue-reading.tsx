'use client';

import { useState, useRef, useCallback } from 'react';
import type { DialogueReadingData } from '@/types';
import { speak, speakEnglish, stopSpeaking } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import { SpeakButton } from '@/components/shared/speak-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DialogueReadingProps {
  data: DialogueReadingData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function DialogueReading({ data, onSubmit, disabled }: DialogueReadingProps) {
  const { language, speechRate } = useLanguage();
  const [revealedLines, setRevealedLines] = useState(1);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const cancelledRef = useRef(false);

  const allRevealed = revealedLines >= data.lines.length;

  const handleRevealNext = () => {
    if (!allRevealed) {
      setRevealedLines(prev => prev + 1);
    }
  };

  const handleListenAll = useCallback(async () => {
    cancelledRef.current = false;
    setPlaying(true);
    setRevealedLines(data.lines.length);
    for (let i = 0; i < data.lines.length; i++) {
      if (cancelledRef.current) break;
      setPlayingIndex(i);
      try {
        await speak(data.lines[i].text, language, speechRate);
      } catch { /* skip */ }
      if (cancelledRef.current) break;
      if (showTranslation) {
        try {
          await speakEnglish(data.lines[i].translation, speechRate);
        } catch { /* skip */ }
        if (cancelledRef.current) break;
      }
      if (!cancelledRef.current) {
        await new Promise(r => setTimeout(r, 800));
      }
    }
    setPlaying(false);
    setPlayingIndex(-1);
  }, [data.lines, language, speechRate, showTranslation]);

  const handleStopListening = useCallback(() => {
    cancelledRef.current = true;
    stopSpeaking();
    setPlaying(false);
    setPlayingIndex(-1);
  }, []);

  const handleFinish = () => {
    setFinished(true);
    onSubmit('completed', true);
  };

  // Assign colors to speakers
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
          onClick={() => setShowPinyin(v => !v)}
          className={cn(
            'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
            showPinyin
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30'
          )}
        >
          Pinyin {showPinyin ? 'ON' : 'OFF'}
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
            'text-[11px] px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1',
            playing
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'border-border text-muted-foreground hover:border-primary/30'
          )}
        >
          {playing ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Listen All
            </>
          )}
        </button>
      </div>

      {/* Dialogue lines */}
      <div className="space-y-3">
        {data.lines.slice(0, revealedLines).map((line, i) => {
          const speakerIndex = speakers.indexOf(line.speaker);
          const colorClass = speakerColors[speakerIndex % speakerColors.length];
          const isLeft = speakerIndex % 2 === 0;

          return (
            <div
              key={i}
              className={cn(
                'flex gap-2',
                isLeft ? 'justify-start' : 'justify-end'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 space-y-1 transition-all',
                  isLeft
                    ? 'bg-muted rounded-tl-sm'
                    : 'bg-primary/10 rounded-tr-sm',
                  playingIndex === i && 'ring-2 ring-primary/50'
                )}
              >
                {/* Speaker label */}
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-[11px] font-semibold', colorClass)}>
                    {line.speaker}
                  </span>
                  <SpeakButton text={line.text} size="icon" />
                </div>

                {/* Chinese text */}
                <p className="text-base font-medium leading-relaxed">
                  {line.text}
                </p>

                {/* Pinyin */}
                {showPinyin && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {line.pinyin}
                  </p>
                )}

                {/* Translation */}
                {showTranslation && (
                  <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
                    {line.translation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {!disabled && !finished && (
        <div className="flex gap-2 pt-1">
          {!allRevealed ? (
            <Button onClick={handleRevealNext} className="flex-1" size="lg">
              Next Line ({revealedLines}/{data.lines.length})
            </Button>
          ) : (
            <Button onClick={handleFinish} className="flex-1" size="lg">
              Complete Dialogue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
