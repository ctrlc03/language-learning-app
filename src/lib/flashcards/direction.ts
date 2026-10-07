/**
 * Recall-direction helpers. A vocabulary item is drilled from several angles;
 * each direction decides what the card prompts with and what it reveals.
 */

import type { CardDirection, Flashcard } from '@/types';

export const CARD_DIRECTIONS: CardDirection[] = ['read', 'listen', 'produce', 'cloze'];

export const DIRECTION_LABEL: Record<CardDirection, string> = {
  read: 'Read',
  listen: 'Listen',
  produce: 'Produce',
  cloze: 'Cloze',
};

// How the prompt should be displayed:
//  - 'char'     : large native term (single word/character)
//  - 'text'     : medium text (an English meaning)
//  - 'sentence' : a native-script sentence (cloze)
//  - 'audio'    : audio only, no visible prompt
export type PromptKind = 'char' | 'text' | 'sentence' | 'audio';

export interface CardFace {
  /** Prompt text shown before reveal ('' when the prompt is audio only). */
  promptMain: string;
  promptKind: PromptKind;
  /** Small instruction under the prompt. */
  promptSub: string;
  /** Showing the native term would spoil the answer until revealed. */
  hideTermUntilRevealed: boolean;
  /** On reveal, show the native term prominently (listen/produce/cloze answers). */
  revealTerm: boolean;
  revealReading: boolean;
  revealMeaning: boolean;
}

export function directionOf(card: Flashcard): CardDirection {
  return card.direction ?? 'read';
}

/** Whether the card is audio-first (auto-play the term on appearance). */
export function isAudioPrompt(card: Flashcard): boolean {
  return directionOf(card) === 'listen';
}

// A cloze card shows the example with the target term replaced by this blank.
const CLOZE_BLANK = '＿＿';

// Native-script text a learner can read context from (Chinese hanzi, Japanese kana/kanji).
const NATIVE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

/**
 * The sentence with every occurrence of `word` blanked out, or null when it
 * isn't there. All of them: a word that repeats ("你渴不渴") would otherwise
 * leave the answer in the prompt.
 */
function blankOut(sentence: string, word: string): string | null {
  return word !== '' && sentence.includes(word) ? sentence.replaceAll(word, CLOZE_BLANK) : null;
}

/**
 * Whether a word makes a usable cloze card: its example sentence contains it,
 * and blanking it leaves other native-script text to infer it from. An example
 * that is only the word ("可以吗？" for 可以吗) would leave a bare blank.
 */
export function canCloze(word: string, exampleSentence: string | undefined): boolean {
  const blanked = exampleSentence ? blankOut(exampleSentence, word) : null;
  return blanked !== null && NATIVE_SCRIPT.test(blanked);
}

/** The example sentence with the target term replaced by a blank. */
export function clozeSentence(card: Flashcard): string {
  const sentence = card.exampleSentence ?? '';
  if (!sentence) return '____';
  return (
    blankOut(sentence, card.front) ??
    `${sentence} （${'＿'.repeat(Math.max(1, [...card.front].length))}）`
  );
}

export function cardFace(card: Flashcard): CardFace {
  switch (directionOf(card)) {
    case 'listen':
      return {
        promptMain: '',
        promptKind: 'audio',
        promptSub: 'Listen — what word is this?',
        hideTermUntilRevealed: true,
        revealTerm: true,
        revealReading: true,
        revealMeaning: true,
      };
    case 'produce':
      return {
        promptMain: card.back,
        promptKind: 'text',
        promptSub: 'Recall the word',
        hideTermUntilRevealed: true,
        revealTerm: true,
        revealReading: true,
        revealMeaning: false,
      };
    case 'cloze':
      return {
        promptMain: clozeSentence(card),
        promptKind: 'sentence',
        promptSub: 'Fill in the blank',
        hideTermUntilRevealed: true,
        revealTerm: true,
        revealReading: true,
        revealMeaning: true,
      };
    case 'read':
    default:
      return {
        promptMain: card.front,
        promptKind: 'char',
        promptSub: 'What does this mean?',
        hideTermUntilRevealed: false,
        revealTerm: false,
        revealReading: true,
        revealMeaning: true,
      };
  }
}

/**
 * Whether the term may be spoken before the answer is revealed: only when the
 * prompt is the term itself ('read') or audio ('listen'). For 'produce' and
 * 'cloze' the term IS the answer, so hearing it first gives it away. After the
 * reveal any card may be spoken.
 */
export function canSpeakBeforeReveal(card: Flashcard): boolean {
  return !cardFace(card).hideTermUntilRevealed || isAudioPrompt(card);
}
