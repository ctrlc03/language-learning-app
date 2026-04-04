'use client';

import { useEffect } from 'react';
import { initVoices, isSpeechSupported } from '@/lib/tts/speech';

export function useSpeechInit() {
  useEffect(() => {
    if (isSpeechSupported()) {
      initVoices();
    }
  }, []);
}

export { isSpeechSupported };
