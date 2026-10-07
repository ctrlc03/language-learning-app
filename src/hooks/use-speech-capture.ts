'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  canRecognize,
  canRecord,
  startCapture,
  type Capture,
  type CaptureResult,
} from '@/lib/speech/capture';
import { stopSpeaking } from '@/lib/tts/speech';

export type CaptureState = 'idle' | 'starting' | 'listening' | 'done';

export interface SpeechCaptureOptions {
  /** Keep listening across pauses until stop() (long answers); otherwise one utterance ends it. */
  continuous?: boolean;
  maxMs?: number;
}

const noSubscribe = () => () => {};

/**
 * One answer spoken aloud: start → listening → done, with the live transcript
 * and, when done, what was recognised and a recording to play back. A new
 * start (or unmount) discards the previous answer and its recording.
 */
export function useSpeechCapture({ continuous = false, maxMs }: SpeechCaptureOptions = {}) {
  const [state, setState] = useState<CaptureState>('idle');
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const capture = useRef<Capture | null>(null);
  const audioUrl = useRef<string | null>(null);
  // Bumped by every start/reset, so a superseded capture can't write its result.
  const generation = useRef(0);

  // Feature support differs between server and browser: read it after hydration.
  const recognition = useSyncExternalStore(noSubscribe, canRecognize, () => false);
  const recording = useSyncExternalStore(noSubscribe, canRecord, () => false);

  const discard = useCallback(() => {
    generation.current++;
    capture.current?.stop();
    capture.current = null;
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = null;
  }, []);

  const reset = useCallback(() => {
    discard();
    setState('idle');
    setInterim('');
    setResult(null);
    setProblem(null);
  }, [discard]);

  const start = useCallback(async () => {
    reset();
    stopSpeaking(); // the model's voice must not end up in the recording
    const gen = generation.current;
    const current = () => gen === generation.current;
    setState('starting');
    try {
      const c = await startCapture({
        continuous,
        maxMs,
        onInterim: (text) => current() && setInterim(text),
        onProblem: (message) => current() && setProblem(message),
      });
      if (!current()) {
        // Superseded while the microphone was starting: drop its recording too.
        c.stop();
        void c.done.then((r) => r.audioUrl && URL.revokeObjectURL(r.audioUrl));
        return;
      }
      capture.current = c;
      setState('listening');
      const r = await c.done;
      if (!current()) {
        if (r.audioUrl) URL.revokeObjectURL(r.audioUrl);
        return;
      }
      capture.current = null;
      audioUrl.current = r.audioUrl;
      setResult(r);
      setProblem(r.problem);
      setState('done');
    } catch (err) {
      if (!current()) return;
      setProblem(err instanceof Error ? err.message : "The microphone couldn't start.");
      setState('idle');
    }
  }, [continuous, maxMs, reset]);

  const stop = useCallback(() => capture.current?.stop(), []);

  useEffect(() => discard, [discard]);

  return {
    state,
    interim,
    result,
    problem,
    start,
    stop,
    reset,
    supported: { recognition, recording, any: recognition || recording },
  };
}
