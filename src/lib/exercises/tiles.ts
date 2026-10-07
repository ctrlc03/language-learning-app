/**
 * Helpers for working with a Chinese example sentence word by word: cutting it
 * into word tiles from its own pinyin, comparing the order a learner built with
 * the accepted ones, and listing the alternative orders a tile puzzle accepts.
 *
 * Chinese lets a time expression sit either before the subject or right after
 * it (昨天我给妈妈打电话了 / 我昨天给妈妈打电话了). Rejecting the order the
 * learner happened to pick would mark a correct sentence wrong, so the
 * generators list those alternatives and the checker accepts them. Only orders
 * that are certainly valid are produced: unless the tiles are a plain
 * "time + pronoun + predicate" sentence (or the reverse), nothing is added.
 */

import type { SentenceConstructionData } from '@/types';

// Sentence-final / internal punctuation, so a tile string compares char-for-char.
const PUNCT = /[，。！？、：；“”‘’…—·（）《》【】,.!?:;"'()]/g;

export function stripPunct(s: string): string {
  return s.replace(PUNCT, '');
}

/** A sentence reduced to its characters: no punctuation, no whitespace. */
export function normalizeOrder(s: string): string {
  return stripPunct(s).replace(/\s+/g, '');
}

/** Whether `answer` is the canonical sentence or one of its listed alternatives. */
export function isAcceptedOrder(
  answer: string,
  data: Pick<SentenceConstructionData, 'correctOrder' | 'acceptableOrders'>,
): boolean {
  const given = normalizeOrder(answer);
  return [data.correctOrder, ...(data.acceptableOrders ?? [])].some(
    (order) => normalizeOrder(order) === given,
  );
}

// Count syllables in one pinyin word ≈ number of maximal vowel runs. Each Mandarin
// syllable carries exactly one vowel nucleus, so counting vowel groups recovers
// the hanzi count for that word. Erhua (final 儿) is handled by the caller.
const VOWELS =
  'aeiouüvàáâãäāăạảấầẩẫậắằẳẵặèéêëēĕẹẻếềểễệìíîïĩīĭịỉòóôõöōŏọỏốồổỗộớờởỡợùúûüũūŭụủǔǘǜǚǖñ`ǎěǐǒǔ';
function syllableCount(pinyinWord: string): number {
  const w = pinyinWord.toLowerCase();
  let count = 0;
  let inVowel = false;
  for (const ch of w) {
    const isVowel = VOWELS.includes(ch);
    if (isVowel && !inVowel) count++;
    inVowel = isVowel;
  }
  return count;
}

/**
 * Cut `chinese` into words guided by its space-delimited `pinyin` (one pinyin
 * word per Chinese word). Returns aligned {words, readings} — readings in
 * lower case, so a tile never shows a capital that gives away where the
 * sentence starts — or null when it cannot reproduce the source exactly (erhua,
 * syllable-count drift, stray characters).
 */
export function segmentByPinyin(
  chinese: string,
  pinyin: string,
): { words: string[]; readings: string[] } | null {
  const chars = Array.from(stripPunct(chinese));
  const pinyinWords = stripPunct(pinyin).trim().split(/\s+/).filter(Boolean);
  if (chars.length === 0 || pinyinWords.length === 0) return null;

  const words: string[] = [];
  const readings: string[] = [];
  let idx = 0;
  for (const pw of pinyinWords) {
    let n = syllableCount(pw);
    // Erhua: a pinyin word ending in 'r' pulls an extra 儿 the vowel-count
    // missed. We only bump when a 儿 actually sits at that position, and the
    // full-reconstruction check below rejects any wrong guess — so this is safe
    // even for standalone 二/儿 syllables.
    if (pw.toLowerCase().endsWith('r') && chars[idx + n] === '儿') n += 1;
    if (n < 1) return null;
    const slice = chars.slice(idx, idx + n);
    if (slice.length !== n) return null;
    words.push(slice.join(''));
    readings.push(pw.toLowerCase());
    idx += n;
  }
  // Every source character must be consumed for the tiles to be trustworthy.
  if (idx !== chars.length) return null;
  if (words.join('') !== chars.join('')) return null;
  return { words, readings };
}

const NUM = '(?:\\d{1,2}|[一二两三四五六七八九十]+)';
const DAY = '(?:今天|昨天|明天|前天|后天|每天|天天)';
const PART_OF_DAY = '(?:早上|早晨|上午|中午|下午|傍晚|晚上|夜里)';
// A bare 一点 is "a little" as often as "one o'clock" (一点也不…), so it needs a suffix.
const CLOCK = `(?:(?:\\d{1,2}|[二两三四五六七八九十])点(?:半|钟|${NUM}分)?|一点(?:半|钟|${NUM}分))`;
const WEEK =
  '(?:[上下这]个?(?:星期|礼拜|周)[一二三四五六日天]?|[上下这]个?月|每个?(?:月|星期|礼拜|周)|(?:星期|礼拜|周)[一二三四五六日天]|[上下这]个?周末|周末)';
const SEASON = '(?:春天|夏天|秋天|冬天)';
const YEAR = '(?:[今去明前后]年|每年)';
const DATE = `${NUM}月(?:${NUM}[号日])?`;
const STANDALONE =
  '(?:现在|以前|以后|平时|最近|刚才|昨晚|今晚|明晚|今早|小时候|那时候|这时候|有时候)';

// A complete time expression, however the tiles split it (上 + 个 + 月, 昨天 + 下午 …).
const TIME_EXPRESSION = new RegExp(
  `^(?:${DAY}${PART_OF_DAY}?${CLOCK}?|${PART_OF_DAY}${CLOCK}?|${CLOCK}|${WEEK}${PART_OF_DAY}?${CLOCK}?|${YEAR}${SEASON}?|${SEASON}|${DATE}|${STANDALONE})$`,
);

// Pronoun subjects only: a bare noun might be half of a compound the tiles split.
const SUBJECT_PRONOUNS = [
  '我',
  '你',
  '他',
  '她',
  '它',
  '您',
  '我们',
  '你们',
  '他们',
  '她们',
  '它们',
  '咱们',
  '大家',
];

// A tile that makes the pronoun or time expression before it a possessor or part
// of a plural rather than a free-standing subject / adverbial (我的…, 昨天的…, 我 + 们).
const BINDS_TO_PREVIOUS = ['的', '们'];

// Longest time expression among the tiles starting at `from`, as a tile count.
function timeExpressionLength(words: string[], from: number): number {
  let best = 0;
  let joined = '';
  for (let len = 1; from + len <= words.length && len <= 6; len++) {
    joined += words[from + len - 1];
    if (TIME_EXPRESSION.test(joined)) best = len;
  }
  return best;
}

/**
 * Other orders of the same tiles that are certainly valid, as joined strings.
 * `words` is the canonical order. Currently: a time expression before a pronoun
 * subject may follow it instead, and vice versa.
 */
export function alternativeOrders(words: string[]): string[] {
  const leading = timeExpressionLength(words, 0);
  if (leading > 0) {
    const subject = words[leading];
    const next = words[leading + 1];
    if (
      subject !== undefined &&
      next !== undefined &&
      SUBJECT_PRONOUNS.includes(subject) &&
      !BINDS_TO_PREVIOUS.includes(next)
    ) {
      return [[subject, ...words.slice(0, leading), ...words.slice(leading + 1)].join('')];
    }
    return [];
  }

  if (SUBJECT_PRONOUNS.includes(words[0])) {
    const len = timeExpressionLength(words, 1);
    const next = words[1 + len];
    if (len > 0 && next !== undefined && !BINDS_TO_PREVIOUS.includes(next)) {
      return [[...words.slice(1, 1 + len), words[0], ...words.slice(1 + len)].join('')];
    }
  }
  return [];
}
