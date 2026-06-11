/**
 * Pinyin helpers for Chinese exercise content. Wraps pinyin-pro so any
 * Chinese sentence — including distractor options and base-vocab examples
 * that ship without hand-written pinyin — can be annotated for beginners.
 */

import { pinyin } from 'pinyin-pro';
import type { FuriSegment } from '@/types';

const HAN_RE = /\p{Script=Han}/u;

/** Whether the text contains at least one Chinese character. */
export function hasHan(text: string): boolean {
  return HAN_RE.test(text);
}

/**
 * Full pinyin line for a sentence (tone marks, space-separated), passing
 * non-Chinese runs (blanks like ___, punctuation, Latin) through unchanged.
 */
export function toPinyin(text: string): string {
  if (!hasHan(text)) return '';
  return pinyin(text, { toneType: 'symbol', nonZh: 'consecutive' });
}

/**
 * Per-character ruby segments for a sentence: Chinese characters carry their
 * pinyin reading (rendered above via <ruby>, same as Japanese furigana);
 * everything else renders as plain text.
 */
export function pinyinSegments(text: string): FuriSegment[] {
  if (!hasHan(text)) return [{ t: text }];

  const tokens = pinyin(text, { type: 'all', nonZh: 'consecutive' });
  const segments: FuriSegment[] = [];

  for (const token of tokens) {
    if (token.isZh && token.pinyin) {
      segments.push({ t: token.origin, r: token.pinyin });
    } else if (segments.length > 0 && !segments[segments.length - 1].r) {
      // Merge consecutive plain runs
      segments[segments.length - 1].t += token.origin;
    } else {
      segments.push({ t: token.origin });
    }
  }

  return segments;
}
