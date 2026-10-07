'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechNotice } from '@/hooks/use-speech';
import type { CaptureState } from '@/hooks/use-speech-capture';
import { canRecognize, canRecord } from '@/lib/speech/capture';
import { speak, stopSpeaking } from '@/lib/tts/speech';
import { Button } from '@/components/ui/button';
import { SpeakButton, SpeechNotice } from '@/components/shared/speak-button';
import { cn } from '@/lib/utils';

const noSubscribe = () => () => {};

export interface CaptureSupport {
  recognition: boolean;
  recording: boolean;
  any: boolean;
}

/** What this browser can do with the microphone (false until hydrated). */
export function useCaptureSupport(): CaptureSupport {
  const recognition = useSyncExternalStore(noSubscribe, canRecognize, () => false);
  const recording = useSyncExternalStore(noSubscribe, canRecord, () => false);
  return { recognition, recording, any: recognition || recording };
}

/** Plays Chinese text with the text-to-speech voice; replays on every press. */
export function ListenButton({ text, label = 'Listen' }: { text: string; label?: string }) {
  const { speechRate } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const { notice, reportSpeechError } = useSpeechNotice();

  useEffect(() => () => stopSpeaking(), []);

  const play = async () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setPlayed(true);
    try {
      await speak(text, 'chinese', speechRate);
    } catch (err) {
      reportSpeechError(err);
    } finally {
      setPlaying(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={play}>
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
            />
          </svg>
          <span>{playing ? 'Playing… tap to stop' : played ? `${label} again` : label}</span>
        </span>
      </Button>
      <SpeechNotice message={notice} />
    </>
  );
}

/** Starts and stops a capture; shows what is being heard while it runs. */
export function MicControl({
  state,
  interim,
  onStart,
  onStop,
  idleLabel = 'Speak',
}: {
  state: CaptureState;
  interim: string;
  onStart: () => void;
  onStop: () => void;
  idleLabel?: string;
}) {
  const listening = state === 'listening';
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={listening ? 'destructive' : 'primary'}
        size="lg"
        disabled={state === 'starting'}
        onClick={listening ? onStop : onStart}
        aria-pressed={listening}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
            />
          </svg>
          <span>
            {state === 'starting' ? 'Starting…' : listening ? 'Listening… tap to stop' : idleLabel}
          </span>
        </span>
      </Button>
      {listening && (
        <p className="cjk min-h-6 text-lg text-muted-foreground" aria-live="polite">
          {interim}
        </p>
      )}
    </div>
  );
}

/** A capture problem, shown where the learner is looking. */
export function CaptureProblem({ problem }: { problem: string | null }) {
  if (!problem) return null;
  return (
    <p className="text-sm text-destructive" role="status">
      {problem}
    </p>
  );
}

/** Leaves out the recording and goes straight to the answer and self-rating. */
export function SkipRecording({ onSkip }: { onSkip: () => void }) {
  return (
    <Button type="button" variant="ghost" size="lg" onClick={onSkip}>
      <span className="text-sm text-muted-foreground underline underline-offset-4">
        Skip recording
      </span>
    </Button>
  );
}

/** "Did that go well?" as two toggle buttons. */
export function SelfRate({
  value,
  onChange,
  question,
  yes,
  no = 'Not yet',
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  question: string;
  yes: string;
  no?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{question}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          aria-pressed={value === true}
          className={cn(value === true && 'border-success bg-success/10 text-success')}
          onClick={() => onChange(true)}
        >
          <span>{yes}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-pressed={value === false}
          className={cn(value === false && 'border-destructive bg-destructive/10 text-destructive')}
          onClick={() => onChange(false)}
        >
          <span>{no}</span>
        </Button>
      </div>
    </div>
  );
}

/** The learner's own recording, to play back beside the model. */
export function Recording({ url, modelText }: { url: string | null; modelText?: string }) {
  if (!url) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground">Your recording</span>
      <audio controls src={url} aria-label="Your recording" className="h-10 max-w-full" />
      {modelText && (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          Model
          <SpeakButton text={modelText} />
        </span>
      )}
    </div>
  );
}

/** A Chinese sentence with its pinyin and English, and a button to hear it. */
export function Sentence({
  label,
  text,
  pinyin,
  english,
}: {
  label: string;
  text: string;
  pinyin?: string;
  english?: string;
}) {
  return (
    <div className="space-y-1 border border-border bg-muted/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="cjk text-xl">{text}</p>
          {pinyin && <p className="text-sm text-muted-foreground">{pinyin}</p>}
          {english && <p className="text-sm text-muted-foreground">{english}</p>}
        </div>
        <SpeakButton text={text} />
      </div>
    </div>
  );
}

/** What recognition heard, when it heard something. */
export function Transcript({ text }: { text: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">You said: </span>
      {text ? (
        <span className="cjk text-base">{text}</span>
      ) : (
        <span className="text-muted-foreground">
          nothing was recognised. Compare with the model yourself.
        </span>
      )}
    </p>
  );
}

/** m:ss left of `seconds`, counting from when it mounts. */
export function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      setLeft(Math.max(0, seconds - Math.floor((Date.now() - started) / 1000)));
    }, 250);
    return () => window.clearInterval(id);
  }, [seconds]);

  const minutes = Math.floor(left / 60);
  const rest = String(left % 60).padStart(2, '0');
  return (
    <span
      role="timer"
      aria-label={`${left} seconds left`}
      className={cn('text-lg tabular-nums', left <= 10 && 'text-destructive')}
    >
      {minutes}:{rest}
    </span>
  );
}
