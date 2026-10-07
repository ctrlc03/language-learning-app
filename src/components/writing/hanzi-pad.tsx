'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type HanziWriterType from 'hanzi-writer';
import type { CharDataLoaderFn } from 'hanzi-writer';
import { Button } from '@/components/ui/button';

type Writer = InstanceType<typeof HanziWriterType>;

export interface AttemptResult {
  char: string;
  totalMistakes: number;
  /** A hint (button or automatic after misses) was shown during the attempt. */
  hinted: boolean;
  /** The outline was shown, so the learner copied rather than recalled. */
  traced: boolean;
  /** The learner asked for the answer instead of finishing. */
  gaveUp: boolean;
}

/** Only a recalled, unaided, mistake-free attempt counts as clean. */
export function isCleanAttempt(r: AttemptResult): boolean {
  return r.totalMistakes === 0 && !r.hinted && !r.traced && !r.gaveUp;
}

interface HanziPadProps {
  char: string;
  size?: number;
  /** Called once when the attempt ends: finished, or the learner gave up. */
  onAttemptEnd?: (result: AttemptResult) => void;
  /** Called when no stroke data exists for the character. */
  onMissingData?: (char: string) => void;
}

/**
 * Wraps hanzi-writer for recall practice: the pad starts blank (no outline, no
 * character) and the learner draws from memory. Stroke data is loaded from
 * self-hosted /hanzi-data (built by scripts/build-hanzi-data.mjs) so writing
 * practice works fully offline. hanzi-writer is browser-only, so it's imported
 * dynamically and (re)created in an effect.
 */
const loadCharData: CharDataLoaderFn = (char, onLoad, onError) => {
  fetch(`/hanzi-data/${encodeURIComponent(char)}.json`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`no data for ${char}`))))
    .then(onLoad)
    .catch(onError);
};

type Phase = 'loading' | 'drawing' | 'ended' | 'missing';

export function HanziPad({ char, size = 260, onAttemptEnd, onMissingData }: HanziPadProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<Writer | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [tracing, setTracing] = useState(false);

  // Latest callbacks without re-creating the writer when the parent re-renders.
  const onEndRef = useRef(onAttemptEnd);
  const onMissingRef = useRef(onMissingData);
  useEffect(() => {
    onEndRef.current = onAttemptEnd;
    onMissingRef.current = onMissingData;
  });

  // Per-attempt state, read from hanzi-writer callbacks.
  const hintedRef = useRef(false);
  const tracedRef = useRef(false);
  const nextStrokeRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const target = targetRef.current;
    if (!target) return;
    target.innerHTML = '';
    setPhase('loading');
    setTracing(false);
    hintedRef.current = false;
    tracedRef.current = false;
    nextStrokeRef.current = 0;

    import('hanzi-writer').then(({ default: HanziWriter }) => {
      if (cancelled || !targetRef.current) return;
      const finish = (totalMistakes: number, gaveUp: boolean) => {
        setPhase('ended');
        onEndRef.current?.({
          char,
          totalMistakes,
          hinted: hintedRef.current,
          traced: tracedRef.current,
          gaveUp,
        });
      };
      const writer = HanziWriter.create(targetRef.current, char, {
        width: size,
        height: size,
        padding: 8,
        showOutline: false,
        showCharacter: false,
        charDataLoader: loadCharData,
        onLoadCharDataError: () => {
          if (cancelled) return;
          setPhase('missing');
          onMissingRef.current?.(char);
        },
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 180,
        strokeColor: '#2563eb',
        outlineColor: '#cbd5e1',
        drawingColor: '#16a34a',
        highlightColor: '#f59e0b',
      });
      writerRef.current = writer;
      writer.quiz({
        showHintAfterMisses: 2,
        onCorrectStroke: (s) => {
          nextStrokeRef.current = s.strokeNum + 1;
        },
        onMistake: (s) => {
          // hanzi-writer flashes the stroke after this many misses on it.
          if (s.mistakesOnStroke >= 2) hintedRef.current = true;
        },
        onComplete: (summary: { totalMistakes: number }) => {
          if (!cancelled) finish(summary.totalMistakes, false);
        },
      });
      setPhase((p) => (p === 'missing' ? p : 'drawing'));
    });

    return () => {
      cancelled = true;
      writerRef.current?.cancelQuiz();
      writerRef.current = null;
      if (target) target.innerHTML = '';
    };
  }, [char, size]);

  const hint = useCallback(() => {
    hintedRef.current = true;
    void writerRef.current?.highlightStroke(nextStrokeRef.current);
  }, []);

  const toggleTrace = useCallback(() => {
    const w = writerRef.current;
    if (!w) return;
    tracedRef.current = true;
    if (tracing) void w.hideOutline();
    else void w.showOutline();
    setTracing(!tracing);
  }, [tracing]);

  const showAnswer = useCallback(() => {
    const w = writerRef.current;
    if (!w) return;
    w.cancelQuiz();
    w.showCharacter();
    setPhase('ended');
    onEndRef.current?.({
      char,
      totalMistakes: 0,
      hinted: hintedRef.current,
      traced: tracedRef.current,
      gaveUp: true,
    });
  }, [char]);

  const animate = useCallback(() => {
    writerRef.current?.animateCharacter();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={targetRef}
        className="rounded-xl border bg-card"
        style={{ width: size, height: size, display: phase === 'missing' ? 'none' : undefined }}
      />
      {phase === 'missing' ? (
        <div
          className="rounded-xl border bg-card flex items-center justify-center text-center text-sm text-muted-foreground p-4"
          style={{ width: size, height: size }}
          role="status"
        >
          No stroke data for {char}. Skip it to move on.
        </div>
      ) : phase === 'ended' ? (
        <Button variant="outline" onClick={animate}>
          ▶ Stroke order
        </Button>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={hint} disabled={phase !== 'drawing'}>
            Hint
          </Button>
          <Button
            variant={tracing ? 'secondary' : 'outline'}
            onClick={toggleTrace}
            disabled={phase !== 'drawing'}
            aria-pressed={tracing}
          >
            Trace
          </Button>
          <Button variant="ghost" onClick={showAnswer} disabled={phase !== 'drawing'}>
            Show answer
          </Button>
        </div>
      )}
      {phase === 'drawing' && (
        <p className="text-sm text-muted-foreground">
          {tracing
            ? 'Tracing — this attempt won’t count towards mastery.'
            : 'Draw the character from memory, stroke by stroke.'}
        </p>
      )}
    </div>
  );
}
