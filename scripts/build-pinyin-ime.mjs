/**
 * Builds the dictionary behind the on-screen pinyin keyboard in the chat: the
 * commonest characters and words with their pinyin, how common they are and a
 * short English gloss, plus every course word. Uses the `hanzi` library's data
 * at build time (CC-CEDICT readings and glosses, Jun Da's character frequencies,
 * the Leiden Weibo word frequencies) and writes a compact JSON served from
 * public/, which the keyboard loads the first time it opens.
 *
 * Output shape:
 *   { entries: [["你好", "ni3 hao3", 64, "hello"], ...] }   // commonest first
 *   - pinyin: one numbered syllable per character, ü written v, 5 for the
 *     neutral tone, an erhua 儿 as "r5"; a capital first letter marks a name
 *   - cost: 10 × −ln(frequency), so lower is commoner; course words get a bonus
 *
 * Run via `npm run build:pinyin-ime`.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { convert, pinyin } from 'pinyin-pro';

const require = createRequire(import.meta.url);
const hanziData = require('hanzi/lib/data/index.js');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LESSONS_FILE = join(root, 'src/data/chinese/lessons.json');
const BASE_VOCAB_FILE = join(root, 'src/data/chinese/vocabulary.ts');
const OUT_DIR = join(root, 'public');
const OUT_FILE = join(OUT_DIR, 'pinyin-ime.json');

/** Commonest characters kept, by Jun Da's frequency list. */
const CHAR_LIMIT = 4500;
/** Commonest words of two to four characters kept, by the Leiden Weibo counts. */
const WORD_LIMIT = 10000;
/** Course words rank as if this much commoner (in cost units: 10 ≈ 2.7×). */
const COURSE_BONUS = 20;
/** Cost a course word of two or more characters is at least as common as: Weibo counts undersell everyday speech (你好). */
const COURSE_WORD_CAP = 70;
/** Cost of a course word or character that is too rare for the lists above. */
const RARE_COST = 120;
/** A character's other readings when no word shows how often each is used. */
const UNSEEN_SECONDARY_SHARE = 0.15;
const GLOSS_MAX = 24;

const HAN_ONLY = /^\p{Script=Han}+$/u;

/** "lu:4" / "lü4" / "LV4" / "ma" / "ma0" → "lv4" / "ma5"; null when it isn't a syllable. */
function normalizeSyllable(raw) {
  let s = raw.toLowerCase().replace(/u:/g, 'v').replace(/ü/g, 'v');
  if (!/\d$/.test(s)) s += '5';
  s = s.replace(/0$/, '5');
  return /^[a-z]+[1-5]$/.test(s) ? s : null;
}

/** Space-separated numbered syllables, one per character, or null. */
function normalizeReading(raw, text) {
  const syllables = raw.trim().split(/\s+/).map(normalizeSyllable);
  if (syllables.length !== [...text].length || syllables.some((s) => s === null)) return null;
  return syllables.join(' ');
}

function toneless(reading) {
  return reading.replace(/\d/g, '');
}

// ── CC-CEDICT: readings and glosses ─────────────────────────────
/** simplified → [{ reading, proper, defs }] in dictionary order */
const cedict = new Map();
for (const line of hanziData.loadCCEDICT().split('\n')) {
  if (line.startsWith('#')) continue;
  const m = line.match(/^\S+ (\S+) \[([^\]]+)\] \/(.+)\/\s*$/);
  if (!m) continue;
  const [, text, rawReading, defs] = m;
  if (!HAN_ONLY.test(text)) continue;
  const reading = normalizeReading(rawReading, text);
  if (!reading) continue;
  const list = cedict.get(text) ?? [];
  list.push({ reading, proper: /^[A-Z]/.test(rawReading.trim()), defs: defs.split('/') });
  cedict.set(text, list);
}

/** Senses that say nothing about the meaning: cross-references, measure words, names. */
const NOT_A_SENSE =
  /^(CL:|surname |variant of|old variant|archaic|see |also written|also pr\.|abbr\. |used in |erhua variant|Taiwan pr\.|\(Tw\)|\(old\)|\(dialect\)|\(literary\)|\(bound form\) see|\(bound form\) used in)/i;

/** A short gloss from a list of senses: the first one or two that fit. */
function shortGloss(senses) {
  const clean = senses
    .map((s) =>
      s
        .replace(/\[[^\]]*\]/g, '') // pinyin of cross-references
        .replace(/[^\s|]+\|/g, '') // traditional|simplified pairs keep the simplified form
        .replace(/^\((bound form|coll\.|lit\.|fig\.|math\.)\)\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((s) => s && !NOT_A_SENSE.test(s));
  let gloss = '';
  for (const sense of clean) {
    const next = gloss ? `${gloss}, ${sense}` : sense;
    if (next.length > GLOSS_MAX) break;
    gloss = next;
    if (gloss.length >= GLOSS_MAX / 2) break;
  }
  if (!gloss && clean[0]) gloss = `${clean[0].slice(0, GLOSS_MAX - 1).trimEnd()}…`;
  return gloss;
}

/** pinyin-pro's reading of a word on its own, numbered like the dictionary. */
function contextReading(text) {
  const syllables = pinyin(text, { toneType: 'num', type: 'array' });
  return normalizeReading(syllables.join(' '), text);
}

/** Characters pinyin-pro reads wrongly on their own: 了 is le far more often than liǎo. */
const OWN_READING = { 了: 'le5', 得: 'de5', 地: 'de5', 只: 'zhi3', 干: 'gan4' };

/** A character's commonest reading when it stands alone. */
function ownReading(char) {
  return OWN_READING[char] ?? contextReading(char);
}

/** The dictionary entry for a word's commonest reading: the one pinyin-pro reads, else the first. */
function pickEntry(text) {
  const entries = cedict.get(text);
  if (!entries) return null;
  const usual = contextReading(text);
  return (
    entries.find((e) => e.reading === usual && !e.proper) ??
    entries.find((e) => e.reading === usual) ??
    entries.find((e) => usual && toneless(e.reading) === toneless(usual) && !e.proper) ??
    entries.find((e) => !e.proper) ??
    entries[0]
  );
}

/** Whether the dictionary only knows these sounds as a name (Běijīng, Zhōngwén). */
function isName(text, reading) {
  const same = (cedict.get(text) ?? []).filter((e) => toneless(e.reading) === toneless(reading));
  return same.length > 0 && same.every((e) => e.proper);
}

function glossFor(text, reading) {
  const entries = cedict.get(text) ?? [];
  const own = entries.filter((e) => e.reading === reading);
  // A word's common senses before its use as a name (清 clear, not the Qing dynasty).
  const ordered = [...own.filter((e) => !e.proper), ...own.filter((e) => e.proper), ...entries];
  for (const e of ordered) {
    const gloss = shortGloss(e.defs);
    if (gloss) return gloss;
  }
  return '';
}

// ── Frequencies ─────────────────────────────────────────────────
/** Jun Da: [{ char, count, readings, meaning }], commonest first. */
const junda = [];
let jundaTotal = 0;
for (const line of hanziData.loadJunda().split('\n')) {
  const f = line.split('\t');
  if (f.length < 5) continue;
  const count = Number(f[2]);
  if (!Number.isFinite(count)) continue;
  jundaTotal += count;
  const readings = [...new Set(f[4].split('/').map(normalizeSyllable).filter(Boolean))];
  junda.push({ char: f[1], count, readings, meaning: f[5] ?? '' });
}
const jundaByChar = new Map(junda.map((j) => [j.char, j]));

/** Leiden Weibo word counts (Chinese words of up to four characters). */
const leiden = new Map();
let leidenTotal = 0;
for (const line of hanziData.loadLeiden().split('\n')) {
  const at = line.lastIndexOf(',');
  if (at <= 0) continue;
  const count = Number(line.slice(at + 1));
  if (!Number.isFinite(count)) continue;
  leidenTotal += count;
  const word = line.slice(0, at);
  if (HAN_ONLY.test(word) && [...word].length <= 4) leiden.set(word, count);
}

function cost(count, total) {
  return Math.round(10 * Math.log(total / count));
}

/** text|reading → { text, reading, cost, gloss, proper } */
const entries = new Map();
/** text → keys of its entries */
const byText = new Map();
function put(text, reading, entryCost, gloss, proper) {
  const key = `${text}|${reading}`;
  const known = entries.get(key);
  if (known && known.cost <= entryCost) return;
  entries.set(key, { text, reading, cost: entryCost, gloss, proper });
  const keys = byText.get(text) ?? new Set();
  keys.add(key);
  byText.set(text, keys);
}
function entriesOf(text) {
  return [...(byText.get(text) ?? [])].map((key) => entries.get(key));
}
function remove(entry) {
  const key = `${entry.text}|${entry.reading}`;
  entries.delete(key);
  byText.get(entry.text)?.delete(key);
}

// ── Words ───────────────────────────────────────────────────────
// How often each reading of a character is used, from the words it appears in
// (的 is almost always de, rarely dí or dì).
const readingUse = new Map();
const words = [];
for (const [word, count] of leiden) {
  const chars = [...word];
  let reading;
  if (chars.length === 1) {
    reading = ownReading(word);
  } else {
    reading = pickEntry(word)?.reading;
    if (reading) words.push({ word, count, reading });
  }
  if (!reading) continue;
  const syllables = reading.split(' ');
  chars.forEach((ch, i) => {
    const use = readingUse.get(ch) ?? new Map();
    use.set(syllables[i], (use.get(syllables[i]) ?? 0) + count);
    readingUse.set(ch, use);
  });
}
words.sort((a, b) => b.count - a.count);
for (const { word, count, reading } of words.slice(0, WORD_LIMIT)) {
  put(word, reading, cost(count, leidenTotal), glossFor(word, reading), isName(word, reading));
}

// ── Characters ──────────────────────────────────────────────────
function addCharacter(char, count, readings, meaning) {
  const use = readingUse.get(char) ?? new Map();
  const seen = readings.reduce((n, r) => n + (use.get(r) ?? 0), 0);
  // Jun Da lists readings alphabetically; without usage, assume the standalone one is commonest.
  const usual = readings.includes(ownReading(char)) ? ownReading(char) : readings[0];
  for (const reading of readings) {
    let share;
    if (seen > 0) share = ((use.get(reading) ?? 0) + 1) / (seen + readings.length);
    else if (reading === usual) share = 1 - UNSEEN_SECONDARY_SHARE;
    else share = UNSEEN_SECONDARY_SHARE / (readings.length - 1);
    const gloss = glossFor(char, reading) || shortGloss(meaning.split('/'));
    put(char, reading, cost(count * share, jundaTotal), gloss, false);
  }
}
for (const { char, count, readings, meaning } of junda.slice(0, CHAR_LIMIT)) {
  if (readings.length > 0) addCharacter(char, count, readings, meaning);
}

// ── Course words ────────────────────────────────────────────────
const lessons = JSON.parse(readFileSync(LESSONS_FILE, 'utf8')).lessons;
const course = new Map();
for (const lesson of lessons) {
  for (const v of lesson.vocabulary ?? []) {
    if (HAN_ONLY.test(v.word) && !course.has(v.word)) course.set(v.word, v);
  }
}
// The basic HSK words in vocabulary.ts (你好, 谢谢), read as text since it's TypeScript.
const baseVocab = readFileSync(BASE_VOCAB_FILE, 'utf8');
for (const m of baseVocab.matchAll(
  /word: '([^']+)',\s*reading: '([^']+)',\s*meaning: '((?:[^'\\]|\\.)*)'/g,
)) {
  const [, word, reading, meaning] = m;
  if (HAN_ONLY.test(word) && !course.has(word)) {
    course.set(word, { word, reading, meaning: meaning.replace(/\\(.)/g, '$1') });
  }
}

let courseAdded = 0;
for (const [word, v] of course) {
  const written = v.reading.trim();
  let reading = normalizeReading(convert(written, { format: 'symbolToNum' }), word);
  if (!reading) {
    // Erhua readings (zhèr) don't map one syllable per character: use the dictionary's.
    reading = pickEntry(word)?.reading;
    if (!reading) continue;
  }
  const proper = written[0] !== written[0].toLowerCase() || isName(word, reading);
  const gloss = v.meaning.length <= GLOSS_MAX ? v.meaning : shortGloss(v.meaning.split(/[;,]/));
  // The same word under the dictionary's tones (bù kè qi for the course's bú kè qi); a
  // character's other tones are other words (zhī and zhǐ).
  const sameWord = entriesOf(word).filter((e) =>
    [...word].length === 1 ? e.reading === reading : toneless(e.reading) === toneless(reading),
  );
  let base = sameWord.length > 0 ? Math.min(...sameWord.map((e) => e.cost)) : RARE_COST;
  if ([...word].length > 1) base = Math.min(base, COURSE_WORD_CAP);
  sameWord.forEach(remove);
  if (sameWord.length === 0) courseAdded++;
  put(word, reading, base - COURSE_BONUS, gloss, proper);

  // Each character of a course word can be typed on its own.
  for (const char of word) {
    if (byText.get(char)?.size) continue;
    const j = jundaByChar.get(char);
    if (j && j.readings.length > 0) addCharacter(char, j.count, j.readings, j.meaning);
    else {
      const entry = pickEntry(char);
      if (entry) put(char, entry.reading, RARE_COST, glossFor(char, entry.reading), false);
    }
  }
}

// ── Output ──────────────────────────────────────────────────────
const out = [...entries.values()]
  .sort((a, b) => a.cost - b.cost)
  .map((e) => {
    const reading = e.proper ? e.reading[0].toUpperCase() + e.reading.slice(1) : e.reading;
    return [e.text, reading, e.cost, e.gloss];
  });
const json = JSON.stringify({ entries: out });
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, json);

const chars = out.filter((e) => [...e[0]].length === 1).length;
console.log(
  `pinyin-ime: ${out.length} entries (${chars} character readings, ${out.length - chars} words, ` +
    `${courseAdded} course words added), ${Math.round(json.length / 1024)} KB, ` +
    `${Math.round(gzipSync(json).length / 1024)} KB gzipped.`,
);
