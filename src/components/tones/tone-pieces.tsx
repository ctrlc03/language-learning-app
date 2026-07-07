'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { speak } from '@/lib/tts/speech';
import { getTones, toneColor } from '@/lib/tones/utils';
import { TONES, type ToneNumber } from '@/lib/tones/data';
import { cn } from '@/lib/utils';

// Auto-play fires from useEffect, which React StrictMode double-invokes in dev;
// two speak() calls can also race past each other's cancel(). Dedupe identical
// auto-plays that land within a short window so each item is heard once.
let lastAuto = { text: '', at: 0 };
export function autoSpeak(text: string, rate = 0.6) {
  const now = performance.now();
  if (lastAuto.text === text && now - lastAuto.at < 1200) return;
  lastAuto = { text, at: now };
  speak(text, 'chinese', rate).catch(() => {});
}

/** Pinyin rendered with each syllable coloured by its tone. */
export function ColoredPinyin({ word, className }: { word: string; className?: string }) {
  const tones = getTones(word);
  return (
    <span className={className}>
      {tones.map((s, i) => (
        <span key={i} style={{ color: toneColor(s.tone) }}>
          {s.text}
          {i < tones.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

/** Play a Chinese string aloud; shared button used across tone drills. */
export function PlayButton({
  text,
  rate = 0.6,
  label = 'Play',
  size = 'lg',
}: {
  text: string;
  rate?: number;
  label?: string;
  size?: 'sm' | 'lg';
}) {
  const [playing, setPlaying] = useState(false);
  const play = useCallback(async () => {
    setPlaying(true);
    try {
      await speak(text, 'chinese', rate);
    } catch {
      // TTS unavailable
    } finally {
      setPlaying(false);
    }
  }, [text, rate]);

  return (
    <Button onClick={play} disabled={playing} size={size} className="gap-2">
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
        />
      </svg>
      {playing ? 'Playing…' : label}
    </Button>
  );
}

/** A large tone button (1–4 / neutral) used in the identify drill. */
export function ToneChoice({
  tone,
  state,
  onClick,
}: {
  tone: ToneNumber;
  state: 'idle' | 'correct' | 'wrong' | 'dim';
  onClick: () => void;
}) {
  const info = TONES[tone];
  return (
    <button
      onClick={onClick}
      disabled={state !== 'idle'}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all',
        state === 'idle' && 'hover:bg-primary/5',
        state === 'wrong' && 'opacity-40',
        state === 'dim' && 'opacity-40',
      )}
      style={{
        borderColor: state === 'idle' || state === 'correct' ? info.color : undefined,
        backgroundColor: state === 'correct' ? info.color + '22' : undefined,
      }}
    >
      <span className="text-3xl leading-none" style={{ color: info.color }}>
        {info.mark}
      </span>
      <span className="mt-1 text-sm font-medium">Tone {tone === 5 ? '·' : tone}</span>
      <span className="text-xs text-muted-foreground">{info.contour}</span>
    </button>
  );
}
