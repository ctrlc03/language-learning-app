/**
 * The candidate engine behind the chat's on-screen pinyin keyboard: turns typed
 * pinyin ("woxiangqu", "ni3hao", "xi'an") into characters and words to pick
 * from. The dictionary (public/pinyin-ime.json, built by
 * scripts/build-pinyin-ime.mjs) holds the commonest characters and words plus
 * every course word, each with its pinyin, a frequency cost and a short gloss.
 */

import { numberedToMarked } from './pinyin';
import { isSyllable, splitTyped, syllablesStartingWith } from './pinyin-syllables';

/** [characters, numbered pinyin, cost, gloss] as public/pinyin-ime.json stores them, commonest first. */
type StoredEntry = [string, string, number, string];

interface DictionaryWord {
  text: string;
  /** Numbered pinyin as stored: "ni3 hao3", "Bei3 jing1" (a name), "zhe4 r5". */
  reading: string;
  /** Tone of each syllable: 1–4, 5 for the neutral tone. */
  tones: number[];
  /** 10 × −ln(frequency): lower is commoner. */
  cost: number;
  gloss: string;
}

export interface KeyboardDictionary {
  /** Toneless syllables joined by spaces ("ni hao") → words, commonest first. */
  words: Map<string, DictionaryWord[]>;
  /** Most syllables in one word. */
  longest: number;
}

export function buildKeyboardDictionary(entries: StoredEntry[]): KeyboardDictionary {
  const words = new Map<string, DictionaryWord[]>();
  let longest = 1;
  for (const [text, reading, cost, gloss] of entries) {
    const syllables = reading.toLowerCase().split(' ');
    const letters = syllables.map((s) => s.slice(0, -1));
    const word: DictionaryWord = {
      text,
      reading,
      tones: syllables.map((s) => Number(s.slice(-1))),
      cost,
      gloss,
    };
    longest = Math.max(longest, letters.length);
    const keys = [letters.join(' ')];
    // An erhua 儿 is typed r (zhèr) or er (zhe'er).
    if (letters.includes('r')) keys.push(letters.map((l) => (l === 'r' ? 'er' : l)).join(' '));
    for (const key of keys) {
      const list = words.get(key);
      if (list) list.push(word);
      else words.set(key, [word]);
    }
  }
  return { words, longest };
}

let loading: Promise<KeyboardDictionary | null> | null = null;

/** Loads the dictionary once; null when it can't be fetched, and the next call tries again. */
export function loadKeyboardDictionary(): Promise<KeyboardDictionary | null> {
  loading ??= fetch('/pinyin-ime.json')
    .then((r) => (r.ok ? (r.json() as Promise<{ entries: StoredEntry[] }>) : null))
    .then((data) => (data ? buildKeyboardDictionary(data.entries) : null))
    .catch(() => null)
    .then((dictionary) => {
      if (!dictionary) loading = null;
      return dictionary;
    });
  return loading;
}

export interface TypedSyllable {
  /** Toneless letters, ü typed v. */
  letters: string;
  /** Tone typed after it: 1–4, 5 for the neutral tone, 0 when none. */
  tone: number;
  /** Still being typed: the "h" of "nih" may become hao, hen, hui…. */
  unfinished: boolean;
  /** Where it ends in the typed text, its tone digit and apostrophe included. */
  end: number;
}

/**
 * Splits typed pinyin into syllables: "ni3hao" → ni (third tone), hao; "xi'an"
 * → xi, an. Letters typed together split into the fewest syllables ("xian" is
 * one). Null when it isn't pinyin.
 */
export function parseTyped(typed: string): TypedSyllable[] | null {
  const out: TypedSyllable[] = [];
  let i = 0;
  while (i < typed.length) {
    const c = typed[i];
    const last = out[out.length - 1];
    if (c === "'") {
      if (last) last.end = i + 1;
      i++;
    } else if (c >= '1' && c <= '5') {
      // A tone follows a syllable's letters directly.
      if (!last || last.tone || last.end !== i) return null;
      last.tone = Number(c);
      last.end = i + 1;
      i++;
    } else if (c >= 'a' && c <= 'z') {
      let j = i;
      while (j < typed.length && typed[j] >= 'a' && typed[j] <= 'z') j++;
      const atEnd = j === typed.length;
      const pieces = splitTyped(typed.slice(i, j), atEnd);
      if (!pieces) return null;
      for (const letters of pieces) {
        i += letters.length;
        out.push({ letters, tone: 0, unfinished: false, end: i });
      }
      const tail = out[out.length - 1];
      if (atEnd && !isSyllable(tail.letters)) tail.unfinished = true;
    } else {
      return null;
    }
  }
  return out;
}

export interface KeyboardCandidate {
  text: string;
  /** Tone-marked pinyin, syllables spaced as on vocab cards: "nǐ hǎo", "Běi jīng". */
  pinyin: string;
  gloss: string;
  /** How many typed syllables it uses up, from the first. */
  length: number;
}

/** Cost of each word in a guessed sentence, so fewer, longer words win. */
const WORD_COST = 25;
/** Sentence-final particles, likelier at the end of what was typed (吧 over 把, 吗 over 码). */
const FINAL_PARTICLES = new Set(['吗', '呢', '吧', '啊', '呀', '啦', '嘛', '了']);
const FINAL_PARTICLE_BONUS = 30;
/** Extra cost of a character straight after itself, which words outside the dictionary rarely do (事实, not 是是). */
const REPEAT_COST = 60;

/**
 * What the typed syllables could be, best first: a guess at the whole phrase
 * (我想去吃饭 for woxiangquchifan), then words for as many syllables from the
 * start as match, longest first, down to single characters. Typed tones filter.
 */
export function findCandidates(
  dictionary: KeyboardDictionary,
  typed: TypedSyllable[],
  limit = 40,
): KeyboardCandidate[] {
  const n = typed.length;
  if (n === 0) return [];

  const memo = new Map<number, DictionaryWord[]>();
  /** Words for typed[from..to), commonest first. */
  const matches = (from: number, to: number): DictionaryWord[] => {
    const id = from * (n + 1) + to;
    const known = memo.get(id);
    if (known) return known;
    const span = typed.slice(from, to);
    const head = span
      .slice(0, -1)
      .map((s) => `${s.letters} `)
      .join('');
    const last = span[span.length - 1];
    let endings = [last.letters];
    if (last.unfinished) {
      endings = syllablesStartingWith(last.letters);
      // A lone r ending a word may be its erhua (zher → 这儿).
      if (last.letters === 'r') endings.push('r');
    }
    const found: DictionaryWord[] = [];
    for (const ending of endings) {
      for (const word of dictionary.words.get(head + ending) ?? []) {
        if (span.every((s, k) => !s.tone || s.tone === word.tones[k])) found.push(word);
      }
    }
    if (endings.length > 1) found.sort((a, b) => a.cost - b.cost);
    memo.set(id, found);
    return found;
  };

  const out: KeyboardCandidate[] = [];
  const seen = new Set<string>();
  const add = (candidate: KeyboardCandidate) => {
    if (out.length >= limit || seen.has(candidate.text)) return;
    seen.add(candidate.text);
    out.push(candidate);
  };

  // The likeliest split of everything typed into words.
  const best = Array.from({ length: n + 1 }, () => ({
    cost: Infinity,
    from: -1,
    word: null as DictionaryWord | null,
  }));
  best[0].cost = 0;
  for (let to = 1; to <= n; to++) {
    for (let from = Math.max(0, to - dictionary.longest); from < to; from++) {
      if (best[from].cost === Infinity) continue;
      let word: DictionaryWord | undefined;
      let wordCost = Infinity;
      for (const w of matches(from, to)) {
        let c = w.cost;
        if (to === n && FINAL_PARTICLES.has(w.text)) c -= FINAL_PARTICLE_BONUS;
        if (w.tones.length === 1 && best[from].word?.text === w.text) c += REPEAT_COST;
        if (c < wordCost) [word, wordCost] = [w, c];
      }
      if (!word) continue;
      const cost = best[from].cost + wordCost + WORD_COST;
      if (cost < best[to].cost) best[to] = { cost, from, word };
    }
  }
  const toCandidate = (word: DictionaryWord, length: number): KeyboardCandidate => ({
    text: word.text,
    pinyin: numberedToMarked(word.reading),
    gloss: word.gloss,
    length,
  });
  if (best[n].word && best[n].from > 0) {
    const words: DictionaryWord[] = [];
    for (let at = n; at > 0; at = best[at].from) {
      const word = best[at].word;
      if (word) words.unshift(word);
    }
    const text = words.map((w) => w.text).join('');
    // Pieces that make up a word the dictionary knows: offer the word, with its gloss.
    const known = matches(0, n).find((w) => w.text === text);
    add(
      known
        ? toCandidate(known, n)
        : {
            text,
            pinyin: words.map((w) => numberedToMarked(w.reading)).join(' '),
            gloss: '',
            length: n,
          },
    );
  }

  for (let to = n; to >= 1; to--) {
    for (const word of matches(0, to)) add(toCandidate(word, to));
  }
  return out;
}
