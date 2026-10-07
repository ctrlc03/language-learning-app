'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { initVoices, isSpeechSupported, speechErrorMessage } from '@/lib/tts/speech';

export function useSpeechInit() {
  useEffect(() => {
    if (isSpeechSupported()) {
      initVoices();
    }
  }, []);
}

const NOTICE_MS = 4000;

/**
 * A brief message for when audio can't play (no Mandarin voice installed, no speech engine). It
 * clears itself after a few seconds so it never blocks the page; show it with `<SpeechNotice>`.
 */
export function useSpeechNotice() {
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reportSpeechError = useCallback((err: unknown) => {
    window.clearTimeout(timer.current);
    setNotice(speechErrorMessage(err));
    timer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  return { notice, reportSpeechError };
}

export { isSpeechSupported };
