/**
 * Structured view of the teacher's lesson self-check questions (lessons.json
 * `selfCheck`: free-text q/a pairs), so they can be practised as graded
 * exercises, spoken HSKK prompts, or think-then-reveal cards.
 *
 * Every recogniser validates against the answer key; an item whose structure
 * doesn't check out falls back to `explain` (reveal + self-grade), so no
 * question is lost and none is mis-graded.
 */

import { chineseLessons } from '@/data/chinese/vocabulary';

export type SelfCheckKind =
  /** Arrange the given tiles into the sentence. */
  | 'order'
  /** Fill one or more blanks, from given choices when there are any. */
  | 'blank'
  /** Put a word into a sentence at the right place. */
  | 'insert'
  /** Pick the right reply to a line from a bank of replies. */
  | 'choose-reply'
  /** A question about a reading passage, with lettered options. */
  | 'passage'
  /** A closed question with fixed options (A or B, yes/no, true/false, which is correct). */
  | 'choice'
  /** Rewrite a wrong sentence correctly. */
  | 'correct'
  /** Write the opposite of a word. */
  | 'opposite'
  /** Say or write something in Chinese from an English instruction. */
  | 'translate'
  /** Reply to a Chinese line (HSKK listen-and-answer). */
  | 'reply'
  /** Answer an open question in your own words (HSKK answer-questions). */
  | 'open'
  /** A question answered in English (differences, meanings): reveal and self-grade. */
  | 'explain';

export interface SelfCheckItem {
  /** Stable id: `sc:<lesson>:<index>`. */
  id: string;
  lesson: number;
  /** Position in the lesson's selfCheck list. */
  index: number;
  kind: SelfCheckKind;
  /** The teacher's question and answer, verbatim. */
  q: string;
  a: string;
  /** What to ask, without the format label ("Put in order:", "Fill the blank （…）:" …). */
  prompt: string;
  /** Model answer in characters; multi-part answers are joined. */
  answer?: string;
  /** Pinyin of `answer`, from the key. */
  answerPinyin?: string;
  /** Other complete answers the key accepts. */
  alternates: string[];
  /** Explanation to show after answering. */
  note?: string;
  /** The key's answer is only a suggestion: other answers can be right too. */
  openEnded: boolean;
  /** order: the given tiles, in the teacher's order. */
  tiles?: string[];
  /** blank / choose-reply / passage / choice: the options to choose from. */
  choices?: string[];
  /** blank: index into `choices` for each blank; choose-reply / passage / choice: [index of the right option]. */
  correct?: number[];
  /** blank: the word that fills each blank. */
  fills?: string[];
  /** blank: the sentence with each blank written ___; insert: the sentence to insert into. */
  sentence?: string;
  /** Extra context: the situation for a blank, the word a reply must use, the gist an answer should give. */
  hint?: string;
  /** insert: the word to insert, and the character index in `sentence` where it goes. */
  insertWord?: string;
  insertAt?: number;
  /** reply / open / choose-reply: the Chinese line being answered (what an examiner would say). */
  cue?: string;
  /** English for `cue` (for open prompts it may also carry starters). */
  cueTranslation?: string;
  /** open: an extended answer (HSKK part 3) rather than a one-line reply. */
  extended?: boolean;
  /** passage: the reading passage's title (the matching dialogue's title). */
  passageTitle?: string;
  /** order: English of the sentence, when the teacher gave it. */
  translation?: string;
}

const HAN = /\p{Script=Han}/u;
const BLANK = /_{2,}|＿+/g;
// A Chinese stretch: Han characters plus the punctuation, digits and spaces found inside Chinese sentences
// (the dash joins sentences in one key: "你吃早饭了吗？/ … — 我没吃早饭。").
const ZH_TAIL = /[\p{Script=Han}0-9０-９，。？！、；：“”‘’（）…·—\s/／]*$/u;
const LEADING_JOINERS = /^[\s/／，。？！、；：…·—]+/u;

/** Characters that carry the sentence: Han, digits and Latin, without punctuation or spaces. */
function core(text: string): string {
  return text.normalize('NFKC').replace(/[^\p{Script=Han}0-9A-Za-z]/gu, '');
}

function splitList(list: string): string[] {
  return list
    .split(/\s*[/／]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface Chunk {
  zh: string;
  py: string;
  /** Text between the previous chunk and this one ("— or ", " / ", "A softer version: "). */
  lead: string;
  /** Text right after the closing parenthesis, up to the next chunk. */
  after: string;
}

interface ParsedAnswer {
  /** Leading label before the first chunk: "Sample answer:", "e.g.", "B.", "False — correct:" … */
  label: string;
  parts: Chunk[];
  alternates: string[];
  note?: string;
}

/** Split an answer into "Chinese (pinyin)" chunks, alternates and the explanation around them. */
function parseAnswer(a: string): ParsedAnswer {
  const found: { zh: string; py: string; zhStart: number; end: number }[] = [];
  let consumed = 0;
  for (const m of a.matchAll(/\(([^()]*)\)/g)) {
    const open = m.index;
    const tail = a.slice(consumed, open).match(ZH_TAIL)?.[0] ?? '';
    const trimmed = tail.replace(LEADING_JOINERS, '');
    const zh = trimmed.trim();
    const inner = m[1].trim();
    // Only "中文 (pinyin)" pairs count; "(ordinary verb)" or "(今天我病了… works too.)" are prose.
    if (!HAN.test(zh) || HAN.test(inner) || !/^[\p{L}'’"“]/u.test(inner)) continue;
    found.push({
      zh,
      py: inner.split(/\s+=\s+/)[0].trim(),
      zhStart: open - trimmed.length,
      end: open + m[0].length,
    });
    consumed = open + m[0].length;
  }

  const label = (found.length ? a.slice(0, found[0].zhStart) : '').trim();
  const parts: Chunk[] = [];
  const alternates: string[] = [];
  let note = found.length ? '' : a;
  found.forEach((f, i) => {
    const lead = i === 0 ? '' : a.slice(found[i - 1].end, f.zhStart);
    const after = a.slice(f.end, found[i + 1]?.zhStart ?? a.length);
    const isAlternate =
      (i > 0 && /(^|\s)or\s*$/i.test(lead.trim().replace(/^—\s*/, ''))) ||
      /^\s*(is also (fine|acceptable)|also works|works too)/i.test(after);
    if (isAlternate) alternates.push(f.zh);
    else parts.push({ zh: f.zh, py: f.py, lead, after });
    note += ` ${after}`;
  });

  // Whole-sentence alternates written without pinyin: "— 你是住在十二层吗？ is also fine."
  note = note.replace(
    /(\p{Script=Han}[^()（）。？！]*[。？！])\s*(is also fine|also works|works too)\.?/gu,
    (_, sentence: string) => {
      alternates.push(sentence.trim());
      return ' ';
    },
  );
  note = note
    .replace(/\[suggested answer[^\]]*\]/gi, ' ')
    .replace(/\b(is also (fine|acceptable)|also works)\b/gi, ' ')
    .replace(/(^|\s)—\s*or\s/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[—\-–/;:,.\s]+|[—\-–/;:,\s]+$/g, '')
    .replace(/^\((.*)\)$/, '$1')
    .trim();

  return {
    label,
    parts,
    alternates: [...new Set(alternates)],
    note: /\p{L}/u.test(note) ? note : undefined,
  };
}

function joinParts(parts: Chunk[]): { answer?: string; answerPinyin?: string } {
  if (parts.length === 0) return {};
  return {
    answer: parts.map((p) => p.zh).join(''),
    answerPinyin: parts.map((p) => p.py).join(' '),
  };
}

interface Candidate {
  zh: string;
  py?: string;
}

/** Fill the blanks of `pattern` so it reads as one of the candidate answers. */
function solveBlanks(
  pattern: string,
  candidates: Candidate[],
): { fills: string[]; matched: Candidate } | null {
  const pieces = pattern.split(BLANK).map(core);
  if (pieces.length < 2) return null;
  const escaped = pieces.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`^${escaped.join('(.+?)')}$`, 'u');
  for (const candidate of candidates) {
    const m = core(candidate.zh).match(re);
    if (m) return { fills: m.slice(1), matched: candidate };
  }
  return null;
}

/** Blanks spread over "and" segments, each completed by its own part of the key. */
function solveSegments(
  pattern: string,
  parts: Chunk[],
): { fills: string[]; matched: Candidate } | null {
  const segments = pattern.split(/\s+and\s+/);
  if (segments.length < 2 || segments.length !== parts.length) return null;
  const fills: string[] = [];
  for (const [i, segment] of segments.entries()) {
    const solved = solveBlanks(segment, [parts[i]]);
    if (!solved) return null;
    fills.push(...solved.fills);
  }
  return {
    fills,
    matched: { zh: parts.map((p) => p.zh).join(''), py: parts.map((p) => p.py).join(' ') },
  };
}

/** Numbers written in digits or characters compare equal: 12岁多 ~ 十二岁多. */
function numberShape(text: string): string {
  return core(text).replace(/[0-9]+|[零〇一二两三四五六七八九十百千万]+/g, 'N');
}

type Draft = Omit<
  SelfCheckItem,
  'id' | 'lesson' | 'index' | 'q' | 'a' | 'openEnded' | 'alternates'
> & {
  alternates?: string[];
  openEnded?: boolean;
};

type AnswerFields = Pick<SelfCheckItem, 'answer' | 'answerPinyin' | 'alternates' | 'note'>;

function recognise(q: string, a: string, ans: ParsedAnswer): Draft | null {
  const answer: AnswerFields = {
    ...joinParts(ans.parts),
    alternates: ans.alternates,
    note: ans.note,
  };
  // "B — …", "No — …", "True — …", "B. 美国人。": the verdict or option letter that opens the answer.
  const verdict = a.match(/^(Yes|No|True|False|[A-D])\b/)?.[1];
  let m: RegExpMatchArray | null;

  // Put (the words) in order: 不太 / 游泳 / 得 / 他（English）
  if ((m = q.match(/^Put (?:the words )?in order:\s*(.+)$/))) {
    let list = m[1].trim();
    let translation: string | undefined;
    const gloss = list.match(/\s*[（(]([^（）()]*[A-Za-z][^（）()]*)[）)]\s*$/);
    if (gloss) {
      translation = gloss[1].trim();
      list = list.slice(0, gloss.index).trim();
    }
    const tiles = splitList(list);
    if (!answer.answer || tiles.length < 2) return null;
    // The tiles must spell the answer exactly, in some order.
    const sorted = (s: string) => [...core(s)].sort().join('');
    if (sorted(tiles.join('')) !== sorted(answer.answer)) return null;
    return {
      ...answer,
      kind: 'order',
      prompt: translation ?? 'Put the words in order.',
      tiles,
      translation,
    };
  }

  // Insert 想 into: 我喝点儿红茶。
  if ((m = q.match(/^Insert (\S+) into:\s*(.+)$/))) {
    const [, word, sentence] = m;
    if (!answer.answer) return null;
    const chars = Array.from(sentence);
    const built = (at: number) => [...chars.slice(0, at), word, ...chars.slice(at)].join('');
    const gaps = chars.map((_, at) => at).concat(chars.length);
    // Punctuation decides between the gaps either side of a comma, so match it
    // exactly first; fall back to the characters alone.
    const spaced = (s: string) => s.normalize('NFKC').replace(/\s/g, '');
    const at =
      gaps.find((g) => spaced(built(g)) === spaced(answer.answer!)) ??
      gaps.find((g) => core(built(g)) === core(answer.answer!));
    if (at === undefined) return null;
    return {
      ...answer,
      kind: 'insert',
      prompt: `Insert ${word}`,
      sentence,
      insertWord: word,
      insertAt: at,
    };
  }

  // Choose the reply （a / b / c） to “您想喝点儿什么？” (English)
  if ((m = q.match(/^Choose the reply\s*[（(](.+?)[）)]\s*to\s*“(.+?)”\s*(?:\((.+)\))?\s*$/))) {
    const choices = splitList(m[1]);
    const index = choices.findIndex((c) => core(c) === core(answer.answer ?? ''));
    if (index < 0) return null;
    return {
      ...answer,
      kind: 'choose-reply',
      prompt: m[2],
      cue: m[2],
      cueTranslation: m[3]?.trim(),
      choices,
      correct: [index],
    };
  }

  // Passage “Title”: question（A. x B. y C. z）
  if ((m = q.match(/^Passage\s*“(.+?)”\s*[:：]\s*(.+?)\s*[（(](A\..+)[）)]\s*$/))) {
    const choices = [...m[3].matchAll(/([A-D])\.\s*(.+?)(?=\s+[A-D]\.\s|$)/g)].map((c) =>
      c[2].trim(),
    );
    const index = verdict && /^[A-D]$/.test(verdict) ? verdict.charCodeAt(0) - 65 : -1;
    if (choices.length < 2 || index < 0 || index >= choices.length) return null;
    return {
      ...answer,
      kind: 'passage',
      prompt: m[2].trim(),
      passageTitle: m[1],
      choices,
      correct: [index],
    };
  }

  // Is 想 in 我想我的朋友。 A (want to, modal verb) or B (think about / miss, ordinary verb)?
  if ((m = q.match(/^Is (\S+) in (.+?) A \((.+?)\) or B \((.+?)\)\?$/))) {
    if (verdict !== 'A' && verdict !== 'B') return null;
    return {
      ...answer,
      kind: 'choice',
      prompt: `How is ${m[1]} used here?`,
      sentence: m[2],
      choices: [m[3], m[4]],
      correct: [verdict === 'A' ? 0 : 1],
    };
  }

  // Is this a pivotal sentence (兼语句)? 他去学校跑步了。 / True or false? Correct it if it is wrong: …
  if (
    (m = q.match(
      /^(Is this a pivotal sentence \(兼语句\)\?|True or false\? Correct it if it is wrong:)\s*(.+)$/,
    ))
  ) {
    const choices = m[1].startsWith('Is') ? ['Yes', 'No'] : ['True', 'False'];
    const index = verdict ? choices.indexOf(verdict) : -1;
    if (index < 0) return null;
    return {
      ...answer,
      kind: 'choice',
      prompt: m[1].replace(/:$/, '').trim(),
      sentence: m[2].trim(),
      choices,
      correct: [index],
      note: a.replace(/^(Yes|No|True|False)\s*—\s*/, ''),
    };
  }

  // Which word is more specific to medicines and methods, 有用 or 有效?
  if ((m = q.match(/^Which word is (.+?),\s*(\S+) or (\S+?)\?$/))) {
    // The key opens with the word, then explains with examples: keep them in the note.
    const [first] = ans.parts;
    const choices = [m[2], m[3]];
    const index = first ? choices.findIndex((c) => core(c) === core(first.zh)) : -1;
    if (index < 0) return null;
    return {
      ...answer,
      answer: first.zh,
      answerPinyin: first.py,
      kind: 'choice',
      prompt: `Which word is ${m[1]}?`,
      choices,
      correct: [index],
      note: a.replace(/^[^()]*\([^()]*\)\s*/, ''),
    };
  }

  // Which is correct for "a little over 12 years old": 12岁多 or 12多岁? Why?
  if ((m = q.match(/^Which is correct for "(.+?)":\s*(.+?) or (.+?)\?/))) {
    const choices = [m[2].trim(), m[3].trim()];
    const index = choices.findIndex((c) => numberShape(c) === numberShape(answer.answer ?? ''));
    if (index < 0) return null;
    return {
      ...answer,
      kind: 'choice',
      prompt: `Which is correct for "${m[1]}"?`,
      choices,
      correct: [index],
    };
  }

  // Blanks with choices: Fill the blank （a / b）: … / Fill in a, b or c: … / 有点儿 or 一点儿? … /
  // Complete the sentence with a or b for this situation: … → … / Which verb goes with the noun, a or b: …
  let choices: string[] | undefined;
  let sentence: string | undefined;
  let hint: string | undefined;
  let prompt: string | undefined;
  if ((m = q.match(/^Fill the blank\s*[（(](.+?)[）)]\s*[:：]\s*(.+)$/))) {
    choices = splitList(m[1]);
    sentence = m[2];
    prompt = 'Fill the blank.';
  } else if ((m = q.match(/^Fill in (.+?) or (\S+?):\s*(.+)$/))) {
    choices = [...m[1].split(/\s*,\s*/), m[2]];
    sentence = m[3];
    prompt = `Fill in ${m[1]} or ${m[2]}.`;
  } else if ((m = q.match(/^Fill in the blank:\s*(.+)$/))) {
    sentence = m[1];
    prompt = 'Fill in the blank.';
  } else if ((m = q.match(/^(\S+) or (\S+)\?\s*(.+)$/)) && HAN.test(m[1]) && HAN.test(m[2])) {
    choices = [m[1], m[2]];
    sentence = m[3];
    prompt = `${m[1]} or ${m[2]}?`;
  } else if (
    (m = q.match(
      /^Complete the sentence with (\S+) or (\S+) for this situation:\s*(.+?)\s*→\s*(.+)$/,
    ))
  ) {
    choices = [m[1], m[2]];
    hint = m[3];
    sentence = m[4];
    prompt = `${m[1]} or ${m[2]}?`;
  } else if ((m = q.match(/^Which verb goes with the noun, (\S+) or (\S+?):\s*(.+?)\??$/))) {
    choices = [m[1], m[2]];
    sentence = m[3];
    prompt = `${m[1]} or ${m[2]}?`;
  }
  if (sentence !== undefined) {
    const whole = joinParts(ans.parts);
    const candidates: Candidate[] = [
      ...(whole.answer ? [{ zh: whole.answer, py: whole.answerPinyin }] : []),
      ...ans.parts.map((p) => ({ zh: p.zh, py: p.py })),
    ];
    // Either a candidate is the completed sentence, the blanks of each "and" segment are completed by
    // their own part of the key ("___药 and ___汤": 吃药。喝汤。), or (one blank) the key gives just the word.
    const solved =
      solveBlanks(sentence, candidates) ??
      solveSegments(sentence, ans.parts) ??
      (sentence.match(BLANK)?.length === 1 && ans.parts[0]
        ? {
            fills: [core(ans.parts[0].zh)],
            matched: { zh: fillBlanks(sentence, [ans.parts[0].zh.replace(/[。？！.?!]+$/u, '')]) },
          }
        : null);
    if (!solved) return null;
    const { fills, matched } = solved;
    const correct = choices
      ? fills.map((f) => choices!.findIndex((c) => core(c) === f))
      : undefined;
    if (correct?.some((i) => i < 0)) return null;
    const fillsShown = correct ? correct.map((i) => choices![i]) : fills;
    return {
      ...answer,
      // The full sentence the blanks complete.
      answer: matched.zh,
      answerPinyin: matched.py,
      kind: 'blank',
      prompt: prompt ?? 'Fill the blank.',
      sentence: sentence.replace(BLANK, '___'),
      choices,
      correct,
      fills: fillsShown,
      hint,
    };
  }

  // Correct the sentence: 我是中国的人。
  if ((m = q.match(/^Correct the sentence:\s*(.+)$/))) {
    if (!answer.answer) return null;
    return { ...answer, kind: 'correct', prompt: m[1].trim() };
  }

  // Write the opposite of 高.
  if ((m = q.match(/^Write the opposite of (.+?)\.?$/))) {
    if (!answer.answer) return null;
    return { ...answer, kind: 'opposite', prompt: m[1].trim() };
  }

  // Reply to “我怕狗。” (I'm afraid of dogs.)
  if ((m = q.match(/^Reply to\s*“(.+?)”\s*(?:\((.+)\))?\s*$/))) {
    if (!answer.answer) return null;
    return {
      ...answer,
      kind: 'reply',
      prompt: m[1],
      cue: m[1],
      cueTranslation: m[2]?.trim(),
      openEnded: true,
    };
  }

  // Complete the dialogue: A：他怎么没来？ B：他______。(了)
  if (
    (m = q.match(
      /^Complete the dialogue:\s*A[：:]\s*(.+?)\s*B[：:]\s*(.+?)\s*(?:[（(]([^（）()]+)[）)])?\s*$/,
    ))
  ) {
    if (!answer.answer) return null;
    const [, lineA, lineB, use] = m;
    // The blank can be in A's line instead (A：昨天______上课？(怎么) B：我有事。): then A's
    // question is what gets completed, with its own "(怎么)" as the hint.
    if (lineA.search(BLANK) >= 0) {
      const gloss = lineA.match(/\s*[（(]([^（）()]+)[）)]\s*$/);
      const asked = gloss ? lineA.slice(0, gloss.index) : lineA;
      const solved = solveBlanks(asked, [{ zh: answer.answer, py: answer.answerPinyin }]);
      if (!solved) return null;
      const word = use ?? gloss?.[1];
      return {
        ...answer,
        kind: 'blank',
        prompt: 'Complete the dialogue.',
        sentence: `A：${asked.replace(BLANK, '___')} B：${lineB}`,
        fills: solved.fills,
        hint: word ? `Use ${word}` : undefined,
      };
    }
    return {
      ...answer,
      kind: 'reply',
      prompt: lineB.replace(BLANK, '___'),
      cue: lineA,
      hint: use ? `Use ${use}` : undefined,
    };
  }

  // 这次考试难吗？ Answer: not too hard, preparing carefully is enough.
  if ((m = q.match(/^(\p{Script=Han}.+?)\s*Answer:\s*(.+)$/u))) {
    if (!answer.answer) return null;
    return { ...answer, kind: 'reply', prompt: m[1], cue: m[1], hint: m[2].trim() };
  }

  // Answer in your own words: … / Speaking prompt: … / Free talk: …
  if (
    (m = q.match(
      /^(Answer in your own words|Speaking prompt|Free talk):\s*(.+?)\s*\(([^()]*[A-Za-z][^()]*)\)\s*$/,
    ))
  ) {
    if (!answer.answer) return null;
    return {
      ...answer,
      kind: 'open',
      prompt: m[2].trim(),
      cue: m[2].trim(),
      cueTranslation: m[3].trim(),
      extended: m[1] !== 'Answer in your own words',
      openEnded: true,
    };
  }

  // English → Chinese: How do you say / Say / Ask / an English sentence to translate …
  const asksForChinese =
    /^(How (do|would) you (say|ask|boast)|How does (a|the) doctor (ask|say)|Say\b|Ask\b|Tell someone|What do you say|How do you politely|Name three|Make a|Turn into|Rewrite as|Mum said)/.test(
      q,
    ) ||
    // A plain English sentence to translate. An English wh-question asks about the language instead,
    // unless the whole key is a Chinese sentence ("Why don't you go see a doctor …?").
    (!HAN.test(q) &&
      (!/^(Which|What|How|Where|When|Why)\b/.test(q) || (ans.parts.length > 0 && !ans.note)));
  if (asksForChinese && answer.answer) {
    return { ...answer, kind: 'translate', prompt: q };
  }

  return null;
}

function fillBlanks(sentence: string, fills: string[]): string {
  let i = 0;
  return sentence.replace(BLANK, () => fills[i++] ?? '___');
}

export function parseSelfCheck(lesson: number, index: number, q: string, a: string): SelfCheckItem {
  const ans = parseAnswer(a);
  const base = {
    id: `sc:${lesson}:${index}`,
    lesson,
    index,
    q,
    a,
    openEnded:
      /^(Sample answer|e\.g\.|For example)/i.test(ans.label) || /suggested answer/i.test(a),
  };
  const draft = recognise(q, a, ans);
  if (!draft) {
    return { ...base, kind: 'explain', prompt: q, alternates: [], note: a };
  }
  return {
    ...base,
    ...draft,
    alternates: draft.alternates ?? [],
    openEnded: base.openEnded || !!draft.openEnded,
  };
}

let cache: SelfCheckItem[] | null = null;

/** Every self-check item in lesson order, parsed once. */
export function getAllSelfCheckItems(): SelfCheckItem[] {
  cache ??= chineseLessons.flatMap((lesson) =>
    (lesson.selfCheck ?? []).map((item, i) => parseSelfCheck(lesson.lesson, i, item.q, item.a)),
  );
  return cache;
}

/** Self-check items for one lesson, or for every lesson up to `maxLesson`. */
export function getSelfCheckItems(
  opts: { lesson?: number; maxLesson?: number } = {},
): SelfCheckItem[] {
  return getAllSelfCheckItems().filter(
    (item) =>
      (opts.lesson === undefined || item.lesson === opts.lesson) &&
      (opts.maxLesson === undefined || item.lesson <= opts.maxLesson),
  );
}

export function getSelfCheckItem(id: string): SelfCheckItem | undefined {
  return getAllSelfCheckItems().find((item) => item.id === id);
}
