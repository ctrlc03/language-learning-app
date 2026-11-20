'use client';

import { useEffect, useRef, useState } from 'react';
import { SpeakButton, SpeechNotice } from '@/components/shared/speak-button';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechNotice } from '@/hooks/use-speech';
import { speak, stopSpeaking } from '@/lib/tts/speech';
import type { SpeechVoice } from '@/lib/tts/speech';
import { cn } from '@/lib/utils';
import type { Language, ListeningQuizData } from '@/types';

interface ListeningQuizProps {
  data: ListeningQuizData;
  language: Language;
  /** `note`: why a wrong pick is wrong, shown with the verdict. */
  onSubmit: (answer: string, isCorrect: boolean, note?: string) => void;
  disabled: boolean;
}

/** Slow playback, as in the dictation drill. */
const SLOW = 0.6;
/** Silence between turns. */
const LINE_GAP_MS = 600;

const SPEAKER_COLORS = [
  'text-blue-600 dark:text-blue-400',
  'text-emerald-600 dark:text-emerald-400',
];

function PlayIcon({ stop }: { stop?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={
          stop
            ? 'M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z'
            : 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z'
        }
      />
    </svg>
  );
}

/**
 * A listening quiz: play the conversation, each speaker in their own voice, and
 * answer the question; the words appear once it is answered. Until then each line
 * shows only who says it and roughly how long it is.
 */
export function ListeningQuiz({ data, language, onSubmit, disabled }: ListeningQuizProps) {
  const { speechRate } = useLanguage();
  const { notice, reportSpeechError } = useSpeechNotice();
  const [selected, setSelected] = useState<number | null>(null);
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const playRun = useRef(0);

  const speakers = [...new Set(data.lines.map((l) => l.speaker))];
  const sideOf = (speaker: string) => speakers.indexOf(speaker) % 2;
  const voiceOf = (speaker: string): SpeechVoice => (sideOf(speaker) === 0 ? 'main' : 'other');
  const answered = selected !== null;
  const playing = playingLine !== null;

  // Leaving the quiz silences the conversation.
  useEffect(() => {
    const run = playRun;
    return () => {
      run.current++;
      stopSpeaking();
    };
  }, []);

  const play = async (rate: number) => {
    const run = ++playRun.current;
    try {
      for (let i = 0; i < data.lines.length; i++) {
        if (i > 0) await new Promise((resolve) => setTimeout(resolve, LINE_GAP_MS));
        if (playRun.current !== run) return;
        setPlayingLine(i);
        const line = data.lines[i];
        await speak(line.text, language, rate, voiceOf(line.speaker));
      }
    } catch (err) {
      reportSpeechError(err);
    } finally {
      if (playRun.current === run) setPlayingLine(null);
    }
  };

  const stop = () => {
    playRun.current++;
    stopSpeaking();
    setPlayingLine(null);
  };

  // A line's own speaker takes over: its speak() cuts the conversation off, which must not
  // carry on to the next line.
  const haltPlay = () => {
    playRun.current++;
    setPlayingLine(null);
  };

  const choose = (index: number) => {
    if (disabled || answered) return;
    setSelected(index);
    onSubmit(data.options[index], index === data.correctIndex, data.whyWrong?.[index] ?? undefined);
  };

  const toggleClass = (on: boolean) =>
    cn(
      'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
      on
        ? 'bg-primary/10 border-primary/30 text-primary'
        : 'border-border text-muted-foreground hover:border-primary/30',
    );

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground italic">{data.setting}</p>

      <div className="flex justify-center gap-3">
        <Button
          size="lg"
          className="gap-2"
          onClick={() => (playing ? stop() : void play(speechRate))}
        >
          <PlayIcon stop={playing} />
          <span>{playing ? 'Stop' : 'Play'}</span>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="gap-2"
          disabled={playing}
          onClick={() => void play(speechRate * SLOW)}
        >
          <PlayIcon />
          <span>Slow</span>
        </Button>
      </div>

      {answered && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={showPinyin}
            onClick={() => setShowPinyin((v) => !v)}
            className={toggleClass(showPinyin)}
          >
            <span>Pinyin</span>
          </button>
          <button
            type="button"
            aria-pressed={showEnglish}
            onClick={() => setShowEnglish((v) => !v)}
            className={toggleClass(showEnglish)}
          >
            <span>English</span>
          </button>
        </div>
      )}

      <ol className="space-y-2" aria-label="The conversation">
        {data.lines.map((line, i) => {
          const side = sideOf(line.speaker);
          const length = [...line.text].length;
          return (
            <li key={i} className={cn('flex', side === 0 ? 'justify-start' : 'justify-end')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-1.5 space-y-1 transition-all',
                  side === 0 ? 'bg-muted rounded-tl-sm' : 'bg-primary/10 rounded-tr-sm',
                  playingLine === i && 'ring-2 ring-primary/50',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn('text-[11px] font-semibold', SPEAKER_COLORS[side])}>
                    {line.speaker}
                  </span>
                  {!answered && (
                    <span
                      role="img"
                      aria-label={`Line ${i + 1}, hidden until you answer`}
                      className="block h-2.5 rounded-full bg-foreground/10"
                      style={{ width: `${Math.min(Math.max(length, 3), 16) * 0.75}rem` }}
                    />
                  )}
                  <span onClickCapture={haltPlay} className="ml-auto">
                    <SpeakButton
                      text={line.text}
                      language={language}
                      voice={voiceOf(line.speaker)}
                      className="h-8 w-8"
                    />
                  </span>
                </div>
                {answered && (
                  <div className="pb-1">
                    <p className="cjk text-base font-medium leading-relaxed" lang="zh-CN">
                      {line.text}
                    </p>
                    {showPinyin && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{line.pinyin}</p>
                    )}
                    {showEnglish && (
                      <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
                        {line.translation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="pt-2 space-y-2.5 border-t border-dashed border-border">
        <p className="text-sm font-semibold leading-snug pt-3">{data.question}</p>
        {data.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => choose(i)}
            disabled={disabled || answered}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
              !answered
                ? 'border-border hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.98]'
                : i === data.correctIndex
                  ? 'border-success/50 bg-success/10 text-success'
                  : selected === i
                    ? 'border-destructive/50 bg-destructive/10 text-destructive'
                    : 'border-border/50 opacity-40',
            )}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current/20 text-xs font-semibold mr-3">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
        {answered && data.explanation && (
          <p className="text-xs text-muted-foreground pt-1 leading-relaxed whitespace-pre-line">
            {data.explanation}
          </p>
        )}
      </div>

      <SpeechNotice message={notice} />
    </div>
  );
}
