'use client';

import { useEffect, useMemo, useState } from 'react';
import { findCandidates, loadKeyboardDictionary, parseTyped } from '@/lib/language/pinyin-keyboard';
import type {
  KeyboardCandidate,
  KeyboardDictionary,
  TypedSyllable,
} from '@/lib/language/pinyin-keyboard';

/** The text box the keyboard types into. */
export interface KeyboardTarget {
  /** Puts text at the caret, replacing any selection. */
  insert: (text: string) => void;
  /** Deletes the selection, or the character before the caret. */
  deleteBack: () => void;
  send: () => void;
}

export type KeyboardKey =
  | { kind: 'letter'; letter: string }
  | { kind: 'tone'; tone: number }
  | { kind: 'separator' }
  | { kind: 'space' }
  | { kind: 'backspace' }
  | { kind: 'enter' }
  | { kind: 'clear' }
  | { kind: 'punctuation'; mark: string };

export interface PinyinKeyboard {
  /** The dictionary loads the first time the keyboard opens. */
  status: 'loading' | 'ready' | 'unavailable';
  /** Pinyin typed and not yet turned into characters. */
  typed: string;
  /** `typed` split into syllables; null when it isn't pinyin. */
  syllables: TypedSyllable[] | null;
  candidates: KeyboardCandidate[];
  /** Whether a tone key would apply to the last syllable typed. */
  canTone: boolean;
  press: (key: KeyboardKey) => void;
  pick: (index: number) => void;
  retry: () => void;
}

/** Longest pinyin held before it has to be turned into characters. */
const MAX_TYPED = 60;

/** Chinese punctuation the keyboard types, keyed by the ASCII mark a physical keyboard sends. */
export const CHINESE_PUNCTUATION: Record<string, string> = {
  ',': '，',
  '.': '。',
  '?': '？',
  '!': '！',
};

/**
 * The keyboard key a physical key press stands for while the on-screen keyboard
 * is open, or null to leave it to the text box. Letters always go to the pinyin;
 * the rest only matter mid-pinyin (space picks the first candidate, Enter types
 * the letters as they are, 1–5 add a tone).
 */
export function keyForKeyPress(key: string, composing: boolean): KeyboardKey | null {
  if (/^[a-z]$/.test(key)) return { kind: 'letter', letter: key };
  if (!composing) return null;
  if (/^[1-5]$/.test(key)) return { kind: 'tone', tone: Number(key) };
  if (key in CHINESE_PUNCTUATION) return { kind: 'punctuation', mark: CHINESE_PUNCTUATION[key] };
  switch (key) {
    case "'":
      return { kind: 'separator' };
    case ' ':
      return { kind: 'space' };
    case 'Enter':
      return { kind: 'enter' };
    case 'Backspace':
      return { kind: 'backspace' };
    case 'Escape':
      return { kind: 'clear' };
    default:
      return null;
  }
}

/** A pinyin input method for `target`: typed pinyin, its candidates, and what each key does. */
export function usePinyinKeyboard(open: boolean, target: KeyboardTarget): PinyinKeyboard {
  const [dictionary, setDictionary] = useState<KeyboardDictionary | null>(null);
  const [failed, setFailed] = useState(false);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!open || dictionary || failed) return;
    let live = true;
    loadKeyboardDictionary().then((loaded) => {
      if (!live) return;
      if (loaded) setDictionary(loaded);
      else setFailed(true);
    });
    return () => {
      live = false;
    };
  }, [open, dictionary, failed]);

  const syllables = useMemo(() => parseTyped(typed), [typed]);
  const candidates = useMemo(
    () => (dictionary && syllables ? findCandidates(dictionary, syllables) : []),
    [dictionary, syllables],
  );
  const last = syllables?.[syllables.length - 1];
  const canTone = !!last && !last.unfinished && typed.length > 0;

  /** The first candidate, or the letters as typed when nothing matches. */
  const takeFirst = (): string => {
    const first = candidates[0];
    if (!first || !syllables) {
      setTyped('');
      return typed;
    }
    setTyped(typed.slice(syllables[first.length - 1].end).replace(/^'+/, ''));
    return first.text;
  };

  const press = (key: KeyboardKey) => {
    switch (key.kind) {
      case 'letter':
        if (typed.length < MAX_TYPED) setTyped(typed + key.letter);
        return;
      case 'tone':
        // A second tone key replaces the first: ni3 then 2 is ni2.
        if (canTone) setTyped(typed.replace(/[1-5]?$/, String(key.tone)));
        return;
      case 'separator':
        if (/[a-z1-5]$/.test(typed)) setTyped(`${typed}'`);
        return;
      case 'space':
        target.insert(typed ? takeFirst() : ' ');
        return;
      case 'backspace':
        if (typed) setTyped(typed.slice(0, -1));
        else target.deleteBack();
        return;
      case 'enter':
        if (typed) {
          target.insert(typed);
          setTyped('');
        } else {
          target.send();
        }
        return;
      case 'clear':
        setTyped('');
        return;
      case 'punctuation':
        target.insert((typed ? takeFirst() : '') + key.mark);
        return;
    }
  };

  const pick = (index: number) => {
    const candidate = candidates[index];
    if (!candidate || !syllables) return;
    target.insert(candidate.text);
    setTyped(typed.slice(syllables[candidate.length - 1].end).replace(/^'+/, ''));
  };

  // Clearing the failure runs the loading effect again.
  const retry = () => setFailed(false);

  const status = dictionary ? 'ready' : failed ? 'unavailable' : 'loading';
  return { status, typed, syllables, candidates, canTone, press, pick, retry };
}
