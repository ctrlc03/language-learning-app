'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type HanziWriterType from 'hanzi-writer';
import type { CharDataLoaderFn } from 'hanzi-writer';
import { Button } from '@/components/ui/button';

type Writer = InstanceType<typeof HanziWriterType>;

interface HanziPadProps {
  char: string;
  size?: number;
  /** Called when a quiz for this character is completed. */
  onQuizComplete?: (result: { char: string; totalMistakes: number }) => void;
}

/**
 * Wraps hanzi-writer for stroke-order animation and draw-to-quiz. hanzi-writer
 * is browser-only, so it's imported dynamically and (re)created in an effect.
 * Stroke data is loaded from self-hosted /hanzi-data (built by
 * scripts/build-hanzi-data.mjs) so writing practice works fully offline.
 */
const loadCharData: CharDataLoaderFn = (char, onLoad, onError) => {
  fetch(`/hanzi-data/${encodeURIComponent(char)}.json`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`no data for ${char}`))))
    .then(onLoad)
    .catch(onError);
};

export function HanziPad({ char, size = 260, onQuizComplete }: HanziPadProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<Writer | null>(null);
  const [mode, setMode] = useState<'idle' | 'quizzing'>('idle');

  useEffect(() => {
    let cancelled = false;
    const target = targetRef.current;
    if (!target) return;
    target.innerHTML = '';
    setMode('idle');

    import('hanzi-writer').then(({ default: HanziWriter }) => {
      if (cancelled || !targetRef.current) return;
      writerRef.current = HanziWriter.create(targetRef.current, char, {
        width: size,
        height: size,
        padding: 8,
        showOutline: true,
        showCharacter: true,
        charDataLoader: loadCharData,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 180,
        strokeColor: '#2563eb',
        outlineColor: '#cbd5e1',
        drawingColor: '#16a34a',
        highlightColor: '#f59e0b',
      });
    });

    return () => {
      cancelled = true;
      writerRef.current = null;
      if (target) target.innerHTML = '';
    };
  }, [char, size]);

  const animate = useCallback(() => {
    setMode('idle');
    writerRef.current?.showCharacter();
    writerRef.current?.animateCharacter();
  }, []);

  const quiz = useCallback(() => {
    const w = writerRef.current;
    if (!w) return;
    setMode('quizzing');
    w.quiz({
      showHintAfterMisses: 2,
      onComplete: (summary: { totalMistakes: number }) => {
        setMode('idle');
        onQuizComplete?.({ char, totalMistakes: summary.totalMistakes });
      },
    });
  }, [char, onQuizComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={targetRef}
        className="rounded-xl border bg-card"
        style={{ width: size, height: size }}
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={animate} disabled={mode === 'quizzing'}>
          ▶ Stroke order
        </Button>
        <Button onClick={quiz}>✎ Practice</Button>
      </div>
      {mode === 'quizzing' && (
        <p className="text-sm text-muted-foreground">Draw the strokes in order…</p>
      )}
    </div>
  );
}
