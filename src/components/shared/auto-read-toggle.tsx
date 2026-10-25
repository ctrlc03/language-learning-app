'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { stopSpeaking } from '@/lib/tts/speech';
import { cn } from '@/lib/utils';

const SPEAKER =
  'M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z';
const WAVES = 'M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424';
const CROSS = 'M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25';

/**
 * Mutes or unmutes the reading-aloud of answers in exercises (the readAnswersAloud setting).
 * Muting also cuts off an answer that is being read.
 */
export function AutoReadToggle() {
  const { settings, updateSettings } = useLanguage();
  const on = settings.readAnswersAloud;

  return (
    <button
      type="button"
      onClick={() => {
        if (on) stopSpeaking();
        updateSettings({ readAnswersAloud: !on });
      }}
      title={on ? 'Answers are read aloud. Tap to mute.' : 'Muted. Tap to have answers read aloud.'}
      className={cn(
        'flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1 text-[11px] transition-colors hover:text-primary',
        on ? 'text-muted-foreground' : 'text-primary',
      )}
    >
      <svg
        aria-hidden
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={`${on ? WAVES : CROSS}${SPEAKER}`} />
      </svg>
      <span>{on ? 'Sound on' : 'Muted'}</span>
    </button>
  );
}
