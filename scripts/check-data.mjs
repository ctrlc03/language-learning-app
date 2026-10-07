/**
 * Validates the shipped Chinese content before a build.
 *
 * The data files are hand-authored, and a typo in them is invisible until it
 * shows up mid-drill as a broken exercise or a sentence in the wrong language.
 * These checks are cheap and catch the mistakes that actually happen: an example
 * sentence that doesn't contain its own word, pinyin whose syllable count can't
 * match the hanzi, duplicate ids, latin letters inside Chinese text, and grammar
 * rules pointing at lessons that don't exist.
 *
 * Exits non-zero on errors; warnings are printed but don't fail the build.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// ── lessons.json ──────────────────────────────────────────────
const lessons = JSON.parse(
  readFileSync(join(root, 'src/data/chinese/lessons.json'), 'utf8'),
).lessons;

const HAN = /[一-鿿]/;
const LATIN = /[A-Za-z]/;
const ALL_HAN = /^[一-鿿]+$/;

const lessonNumbers = new Set();
for (const lesson of lessons) {
  const tag = `lesson ${lesson.lesson}`;
  if (lessonNumbers.has(lesson.lesson)) err(`${tag}: duplicate lesson number`);
  lessonNumbers.add(lesson.lesson);
  if (!lesson.title || !lesson.titleChinese) err(`${tag}: missing title`);

  const words = new Set();
  for (const v of lesson.vocabulary) {
    const where = `${tag} · ${v.word}`;
    if (!HAN.test(v.word)) err(`${where}: word has no Chinese characters`);
    if (LATIN.test(v.word)) err(`${where}: word contains latin letters`);
    if (words.has(v.word)) warn(`${where}: duplicated within the lesson`);
    words.add(v.word);
    if (!v.reading) err(`${where}: missing reading`);
    else if (ALL_HAN.test(v.word)) {
      // One syllable per character, so readings line up with the hanzi; an erhua
      // 儿 merges into the syllable before it (哪儿 nǎr).
      const syllables = v.reading.trim().split(/\s+/).length;
      const chars = [...v.word].length;
      const erhua = [...v.word].slice(1).filter((c) => c === '儿').length;
      if (syllables > chars || syllables < chars - erhua) {
        err(`${where}: reading "${v.reading}" needs one space-separated syllable per character`);
      }
    }
    if (!v.meaning) err(`${where}: missing meaning`);

    if (v.exampleSentence) {
      if (LATIN.test(v.exampleSentence)) {
        err(`${where}: example sentence contains latin letters — "${v.exampleSentence}"`);
      }
      if (!v.exampleSentence.includes(v.word)) {
        warn(`${where}: example sentence does not contain the word`);
      }
      if (!v.examplePinyin) warn(`${where}: example sentence has no pinyin`);
      if (!v.exampleTranslation) warn(`${where}: example sentence has no translation`);
    }
  }

  for (const note of lesson.notes ?? []) {
    if (!note.heading || !note.body) err(`${tag}: note section missing heading or body`);
    for (const row of note.table?.rows ?? []) {
      if (row.length !== note.table.headers.length) {
        err(`${tag} · ${note.heading}: table row width does not match headers`);
      }
    }
  }
  for (const item of lesson.selfCheck ?? []) {
    if (!item.q || !item.a) err(`${tag}: self-check entry missing q or a`);
  }
}

// ── grammar.ts ────────────────────────────────────────────────
// Parsed with regex rather than imported: the file is TypeScript and this script
// runs as plain node before the build.
const grammar = readFileSync(join(root, 'src/data/chinese/grammar.ts'), 'utf8');
const ruleIds = new Set();
for (const m of grammar.matchAll(/id: '(gr-\d+)',\s*\n\s*lessons: \[([^\]]*)\],/g)) {
  const [, id, lessonList] = m;
  if (ruleIds.has(id)) err(`grammar ${id}: duplicate rule id`);
  ruleIds.add(id);
  const nums = lessonList
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  if (nums.length === 0) warn(`grammar ${id}: no lessons tagged`);
  for (const n of nums) {
    if (!lessonNumbers.has(n)) err(`grammar ${id}: tagged with unknown lesson ${n}`);
  }
}
const declaredRules = [...grammar.matchAll(/id: '(gr-\d+)'/g)].length;
if (declaredRules !== ruleIds.size) {
  err(`grammar: ${declaredRules - ruleIds.size} rule(s) missing a lessons: [...] tag`);
}

// Latin letters inside a target-language string means an untranslated word slipped
// through (e.g. '我today生病了'). Punctuation and full-width forms are fine.
function checkTargetStrings(source, file, field) {
  for (const m of source.matchAll(new RegExp(`${field}: '([^']*)'`, 'g'))) {
    const text = m[1];
    if (!HAN.test(text)) continue;
    if (LATIN.test(text)) err(`${file}: latin letters inside Chinese text — "${text}"`);
  }
}
checkTargetStrings(grammar, 'grammar.ts', 'chinese');

// ── dialogues.ts ──────────────────────────────────────────────
const dialogues = readFileSync(join(root, 'src/data/chinese/dialogues.ts'), 'utf8');
const dialogueIds = new Set();
for (const m of dialogues.matchAll(/id: '(dlg-[^']+)'/g)) {
  if (dialogueIds.has(m[1])) err(`dialogues: duplicate id ${m[1]}`);
  dialogueIds.add(m[1]);
}
checkTargetStrings(dialogues, 'dialogues.ts', 'text');
for (const m of dialogues.matchAll(/lesson: (\d+),/g)) {
  const n = Number(m[1]);
  if (!lessonNumbers.has(n)) err(`dialogues: reference to unknown lesson ${n}`);
}

// ── report ────────────────────────────────────────────────────
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);

console.log(
  `checked ${lessons.length} lessons, ${ruleIds.size} grammar rules, ${dialogueIds.size} dialogues — ` +
    `${errors.length} error(s), ${warnings.length} warning(s)`,
);

if (errors.length > 0) process.exit(1);
