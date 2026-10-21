'use client';

import { useEffect, useRef } from 'react';
import { numberedToMarked } from '@/lib/language/pinyin';
import { cn } from '@/lib/utils';
import type { PinyinKeyboard } from '@/hooks/use-pinyin-keyboard';

const LETTER_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const TONES = [
  { tone: 1, mark: 'ā', name: 'First tone' },
  { tone: 2, mark: 'á', name: 'Second tone' },
  { tone: 3, mark: 'ǎ', name: 'Third tone' },
  { tone: 4, mark: 'à', name: 'Fourth tone' },
  { tone: 5, mark: 'a', name: 'Neutral tone' },
];

/** Tapping a key mustn't take focus (and the caret) away from the text box. */
function keepFocus(e: React.MouseEvent) {
  e.preventDefault();
}

interface KeyProps {
  onPress: () => void;
  /** Accessible name, when the key's face doesn't say it. */
  label?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Key({ onPress, label, disabled, className, children }: KeyProps) {
  return (
    <button
      type="button"
      onMouseDown={keepFocus}
      onClick={onPress}
      aria-label={label}
      disabled={disabled}
      className={cn(
        'flex h-10 min-w-0 flex-1 items-center justify-center gap-0.5 rounded-md bg-background text-sm',
        'ring-1 ring-border active:bg-muted disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** The typed pinyin with its tones marked, syllables split by apostrophes: "nǐ'hao". */
function composition(keyboard: PinyinKeyboard): string {
  if (!keyboard.syllables) return keyboard.typed;
  return keyboard.syllables.map((s) => numberedToMarked(s.letters + (s.tone || ''))).join("'");
}

interface PinyinKeyboardPanelProps {
  keyboard: PinyinKeyboard;
  /** Whether the Send key may send (there's a message and nothing being typed). */
  canSend: boolean;
}

/**
 * On-screen pinyin keyboard: type pinyin, then tap the characters (or a whole
 * guessed phrase) to put them in the message. Tone keys narrow the choices;
 * space takes the first; ↵ types the letters as they are.
 */
export function PinyinKeyboardPanel({ keyboard, canSend }: PinyinKeyboardPanelProps) {
  const { typed, candidates, status, press } = keyboard;
  const strip = useRef<HTMLDivElement>(null);

  // New pinyin, new candidates: show them from the first.
  useEffect(() => {
    strip.current?.scrollTo({ left: 0 });
  }, [typed]);

  let hint: React.ReactNode = null;
  if (status === 'unavailable') {
    hint = (
      <span>
        Couldn&rsquo;t load the characters.{' '}
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={keyboard.retry}
          className="text-primary underline underline-offset-2"
        >
          <span>Try again</span>
        </button>
      </span>
    );
  } else if (status === 'loading') {
    hint = <span>Loading characters…</span>;
  } else if (typed && !keyboard.syllables) {
    hint = <span>Not pinyin: ↵ types it as it is.</span>;
  } else if (!typed) {
    hint = <span>Type pinyin, then tap the characters. Tone keys narrow the choices.</span>;
  }

  return (
    <div
      role="group"
      aria-label="Pinyin keyboard"
      className="mx-auto mt-2 max-w-xl select-none space-y-2"
    >
      <div className="flex min-h-5 items-baseline gap-3 px-1 text-sm">
        {typed && <span className="font-medium text-primary">{composition(keyboard)}</span>}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>

      <div ref={strip} className="flex min-h-[3.75rem] gap-1 overflow-x-auto pb-1">
        {candidates.map((c, i) => (
          <button
            key={c.text}
            type="button"
            onMouseDown={keepFocus}
            onClick={() => keyboard.pick(i)}
            className={cn(
              'shrink-0 rounded-md px-2 py-1 text-left ring-1',
              i === 0 ? 'bg-primary/10 ring-primary/40' : 'bg-background ring-border',
            )}
          >
            <span className="cjk block text-lg leading-tight">{c.text}</span>
            <span className="block text-[11px] text-muted-foreground">{c.pinyin}</span>
            {c.gloss && (
              <span className="block max-w-[9rem] truncate text-[10px] text-muted-foreground">
                {c.gloss}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {LETTER_ROWS.map((row, r) => (
          <div key={row} className={cn('flex gap-1', r === 1 && 'px-[5%]')}>
            {r === 2 && (
              <Key label="Syllable break" onPress={() => press({ kind: 'separator' })}>
                <span>&rsquo;</span>
              </Key>
            )}
            {[...row].map((letter) => (
              <Key
                key={letter}
                label={letter === 'v' ? 'v, for ü' : undefined}
                onPress={() => press({ kind: 'letter', letter })}
              >
                <span>{letter}</span>
                {letter === 'v' && <span className="text-[10px] text-muted-foreground">ü</span>}
              </Key>
            ))}
            {r === 2 && (
              <Key label="Backspace" onPress={() => press({ kind: 'backspace' })}>
                <span aria-hidden="true">⌫</span>
              </Key>
            )}
          </div>
        ))}

        <div className="flex gap-1">
          {TONES.map((t) => (
            <Key
              key={t.tone}
              label={t.name}
              disabled={!keyboard.canTone}
              onPress={() => press({ kind: 'tone', tone: t.tone })}
            >
              <span>{t.mark}</span>
              <span className="text-[10px] text-muted-foreground">{t.tone}</span>
            </Key>
          ))}
        </div>

        <div className="flex gap-1">
          {['，', '。'].map((mark) => (
            <Key key={mark} onPress={() => press({ kind: 'punctuation', mark })}>
              <span className="cjk">{mark}</span>
            </Key>
          ))}
          <Key
            label={typed ? 'Space: take the first choice' : 'Space'}
            className="flex-[3]"
            onPress={() => press({ kind: 'space' })}
          >
            <span className="text-xs text-muted-foreground">space</span>
          </Key>
          {['？', '！'].map((mark) => (
            <Key key={mark} onPress={() => press({ kind: 'punctuation', mark })}>
              <span className="cjk">{mark}</span>
            </Key>
          ))}
          <Key
            label={typed ? 'Type the letters as they are' : 'Send'}
            disabled={!typed && !canSend}
            className="flex-[1.5]"
            onPress={() => press({ kind: 'enter' })}
          >
            <span className={cn(!typed && 'text-xs')}>{typed ? '↵' : 'Send'}</span>
          </Key>
        </div>
      </div>
    </div>
  );
}
