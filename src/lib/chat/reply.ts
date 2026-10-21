/**
 * Splits an AI chat reply in Chinese into what the message bubble shows. The
 * model writes each line of Chinese followed by its pinyin and English:
 *
 *   你好！你今天忙吗？
 *   PY: Nǐ hǎo! Nǐ jīntiān máng ma?
 *   EN: Hello! Are you busy today?
 *
 * A Chinese line without usable pinyin (an older reply, or a slip by the model)
 * gets it from pinyin-pro, so every line has pinyin. Lines without Chinese are
 * English notes, such as the bracketed "(You've met every goal…)".
 */

import { hasHan, toPinyin } from '@/lib/language/pinyin';

export interface ReplyLine {
  chinese: string;
  pinyin: string;
  /** Empty when the model gave none. */
  english: string;
}

export type ReplyPart = { kind: 'line'; line: ReplyLine } | { kind: 'note'; text: string };

const TAGGED = /^(PY|EN)\s*[:：]\s*(.*)$/i;
/** A tag whose colon hasn't streamed in yet. */
const PARTIAL_TAG = /^(P|PY|E|EN)$/i;

/** A line of Chinese, as opposed to English that quotes a word or two ("You used 你好 well."). */
function isChineseLine(text: string): boolean {
  if (!hasHan(text)) return false;
  const english = text.match(/[A-Za-z]+/g)?.length ?? 0;
  const han = text.match(/\p{Script=Han}/gu)?.length ?? 0;
  return english < 3 || english <= han;
}

/**
 * The parts of a reply. While it is still streaming (`settled` false), the last
 * line gets no pinyin of the app's own: the model's PY line may be on its way.
 */
export function parseChineseReply(content: string, settled = true): ReplyPart[] {
  const parts: ReplyPart[] = [];
  let current: ReplyLine | null = null;
  for (const raw of content.split('\n')) {
    const text = raw.trim();
    if (!text || PARTIAL_TAG.test(text)) continue;
    const tagged = text.match(TAGGED);
    if (tagged) {
      const value = tagged[2].trim();
      if (tagged[1].toUpperCase() === 'PY') {
        if (current && !current.pinyin && !hasHan(value)) current.pinyin = value;
      } else if (current && !current.english) {
        current.english = value;
      } else if (value) {
        parts.push({ kind: 'note', text: value });
      }
    } else if (isChineseLine(text)) {
      current = { chinese: text, pinyin: '', english: '' };
      parts.push({ kind: 'line', line: current });
    } else {
      current = null;
      parts.push({ kind: 'note', text });
    }
  }
  const waiting = settled ? null : parts[parts.length - 1];
  for (const part of parts) {
    if (part.kind === 'line' && !part.line.pinyin && part !== waiting) {
      // pinyin-pro spaces punctuation like syllables: "nǐ hǎo ！" → "nǐ hǎo！"
      part.line.pinyin = toPinyin(part.line.chinese).replace(/ (?=[，。！？；：、）」』”])/g, '');
    }
  }
  return parts;
}

/** The Chinese of a reply, for reading it aloud without its pinyin and English. */
export function replyChinese(parts: ReplyPart[]): string {
  return parts.flatMap((part) => (part.kind === 'line' ? [part.line.chinese] : [])).join('\n');
}
