'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { speak, stopSpeaking } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/types';
import { cn } from '@/lib/utils';

interface SpeakButtonProps {
  text: string;
  language?: Language;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

export function SpeakButton({ text, language: langOverride, size = 'icon', className }: SpeakButtonProps) {
  const { language: contextLang, speechRate } = useLanguage();
  const language = langOverride ?? contextLang;
  const [speaking, setSpeaking] = useState(false);

  const handleClick = useCallback(async () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    try {
      await speak(text, language, speechRate);
    } catch {
      // Speech not available or cancelled
    } finally {
      setSpeaking(false);
    }
  }, [text, language, speechRate, speaking]);

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={cn('text-muted-foreground hover:text-primary', className)}
      aria-label={speaking ? 'Stop speaking' : 'Speak'}
    >
      {speaking ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      )}
    </Button>
  );
}
