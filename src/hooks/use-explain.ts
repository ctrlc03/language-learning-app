'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExplainRequest, Explanation } from '@/lib/compose/explain';

export interface ExplainedText {
  /** The text as it was sent; the learner may have changed it since. */
  text: string;
  explanation: Explanation;
}

export interface Explainer {
  /** The latest explanation; null before the first. */
  result: ExplainedText | null;
  loading: boolean;
  error: string | null;
  explain: (text: string) => void;
  /** Forgets the explanation and drops a request in flight. */
  reset: () => void;
}

const OFFLINE_MESSAGE =
  'Could not reach the AI. Check your connection; the word-by-word meanings work offline.';

function isExplanation(value: unknown): value is Explanation {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.translation === 'string' &&
    typeof v.correct === 'boolean' &&
    typeof v.corrected === 'string' &&
    typeof v.correctedPinyin === 'string' &&
    Array.isArray(v.notes) &&
    v.notes.every((note) => typeof note === 'string')
  );
}

/** Asks the AI what Chinese the learner wrote means and whether it is right. */
export function useExplain(lesson: number): Explainer {
  const [result, setResult] = useState<ExplainedText | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  // An explanation that arrives after the learner has left goes nowhere.
  useEffect(() => {
    const pending = controller;
    return () => pending.current?.abort();
  }, []);

  const request = async (text: string) => {
    controller.current?.abort();
    const own = new AbortController();
    controller.current = own;
    setLoading(true);
    setError(null);
    try {
      const body: ExplainRequest = { text, lesson };
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: own.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      if (own.signal.aborted) return;
      if (!res.ok) {
        const message =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Could not explain that. Try again.';
        setError(message);
        return;
      }
      if (!isExplanation(data)) {
        setError('The explanation came back in an unexpected shape. Try again.');
        return;
      }
      setResult({ text, explanation: data });
    } catch {
      if (!own.signal.aborted) setError(OFFLINE_MESSAGE);
    } finally {
      if (!own.signal.aborted) setLoading(false);
    }
  };

  const reset = () => {
    controller.current?.abort();
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return { result, loading, error, explain: (text) => void request(text), reset };
}
