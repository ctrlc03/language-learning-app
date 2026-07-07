/**
 * Tone helpers: extract tone numbers from pinyin, colour syllables by tone,
 * and build tone-identification / tone-pair drills from the vocabulary pool so
 * every prompt is a real hanzi the TTS engine can pronounce.
 */

import { pinyin } from 'pinyin-pro';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { TONES, type ToneNumber } from './data';

const HAN_RE = /\p{Script=Han}/u;

/** Tone number (1–4, or 5 for neutral) for a single toned pinyin syllable. */
function toneFromNumbered(numbered: string): ToneNumber {
  const digit = numbered.match(/[1-5]/);
  if (!digit) return 5; // pinyin-pro omits the digit for neutral tone
  const n = Number(digit[0]);
  return (n >= 1 && n <= 5 ? n : 5) as ToneNumber;
}

export interface ToneSyllable {
  text: string; // syllable with tone marks, e.g. "hǎo"
  tone: ToneNumber;
}

/** Per-syllable tone breakdown for a Chinese word. */
export function getTones(word: string): ToneSyllable[] {
  if (!HAN_RE.test(word)) return [];
  const marked = pinyin(word, { type: 'array' }) as string[];
  const numbered = pinyin(word, { toneType: 'num', type: 'array' }) as string[];
  return marked.map((text, i) => ({ text, tone: toneFromNumbered(numbered[i] ?? '') }));
}

/** Hex colour for a tone, for inline styling of pinyin. */
export function toneColor(tone: ToneNumber): string {
  return TONES[tone].color;
}

// ---- Seeded RNG so drills are stable within a session but vary across them ----

export function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Drill builders ----

export interface ToneIdItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  tone: ToneNumber;
}

/** Single-character words with a clear 1–4 tone, for "which tone did you hear?". */
export function getToneIdItems(seed: number, limit = 40): ToneIdItem[] {
  const rng = makeRng(seed);
  const seen = new Set<string>();
  const items: ToneIdItem[] = [];

  for (const v of chineseVocabulary) {
    if ([...v.word].length !== 1) continue; // single hanzi only
    if (seen.has(v.word)) continue;
    const tones = getTones(v.word);
    if (tones.length !== 1) continue;
    const tone = tones[0].tone;
    if (tone === 5) continue; // neutral is hard to hear in isolation
    seen.add(v.word);
    items.push({ hanzi: v.word, pinyin: tones[0].text, meaning: v.meaning, tone });
  }

  return shuffle(items, rng).slice(0, limit);
}

export interface TonePairItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  pair: [ToneNumber, ToneNumber];
  options: [ToneNumber, ToneNumber][]; // includes the correct pair
}

const pairKey = (p: [ToneNumber, ToneNumber]) => `${p[0]}-${p[1]}`;

/** Two-character words, for "which tone pair did you hear?". */
export function getTonePairItems(seed: number, limit = 40): TonePairItem[] {
  const rng = makeRng(seed);
  const seen = new Set<string>();
  const base: Omit<TonePairItem, 'options'>[] = [];

  for (const v of chineseVocabulary) {
    if ([...v.word].length !== 2) continue;
    if (seen.has(v.word)) continue;
    const tones = getTones(v.word);
    if (tones.length !== 2) continue;
    seen.add(v.word);
    base.push({
      hanzi: v.word,
      pinyin: tones.map((t) => t.text).join(''),
      meaning: v.meaning,
      pair: [tones[0].tone, tones[1].tone],
    });
  }

  const allPairs = Array.from(new Set(base.map((b) => pairKey(b.pair)))).map(
    (k) => k.split('-').map(Number) as [ToneNumber, ToneNumber],
  );

  return shuffle(base, rng)
    .slice(0, limit)
    .map((b) => {
      const distractors = shuffle(
        allPairs.filter((p) => pairKey(p) !== pairKey(b.pair)),
        rng,
      ).slice(0, 3);
      return { ...b, options: shuffle([b.pair, ...distractors], rng) };
    });
}
