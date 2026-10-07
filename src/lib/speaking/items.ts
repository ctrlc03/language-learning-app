/**
 * Content for HSKK Beginner (初级) speaking practice, built from the course data
 * up to the learner's current lesson:
 *   Part 1 听后重复  repeat a short sentence you hear
 *   Part 2 听后回答  answer a question you hear in one short sentence
 *   Part 3 回答问题  answer an open prompt for up to 90 seconds
 */

import { chineseDialogues } from '@/data/chinese/dialogues';
import { chineseGrammarRules } from '@/data/chinese/grammar';
import { pickWeight, weightedSample, type MasteryMap, type MasteryMeta } from '@/lib/mastery';
import { toPinyin } from '@/lib/language/pinyin';
import { getSelfCheckItems } from '@/lib/selfcheck/parse';
import { makeRng } from '@/lib/tones/utils';

export type SpeakingPart = 'repeat' | 'answer' | 'talk';

/** Part 1: a sentence to hear and repeat. */
export interface RepeatItem {
  /** `rep:<text>` */
  id: string;
  part: 'repeat';
  lesson: number;
  text: string;
  pinyin: string;
  english: string;
}

/** Part 2: a question to hear and answer in one short sentence. */
export interface AnswerItem {
  /** `ans:<self-check id>` or `ans:<dialogue id>:<line index>` */
  id: string;
  part: 'answer';
  lesson: number;
  question: string;
  questionEnglish?: string;
  /** A model answer. */
  answer: string;
  answerPinyin: string;
  answerEnglish?: string;
  hint?: string;
}

/** Part 3: an open prompt to talk about. */
export interface TalkItem {
  /** `talk:<id>` */
  id: string;
  part: 'talk';
  lesson: number;
  prompt: string;
  english: string;
  sample: string;
  samplePinyin: string;
  sampleEnglish?: string;
  /** Sentence openers to get started with. */
  starters: string[];
}

export type SpeakingItem = RepeatItem | AnswerItem | TalkItem;

export interface SpeakingPools {
  repeat: RepeatItem[];
  answer: AnswerItem[];
  talk: TalkItem[];
}

/** How many items one run of each part asks. */
export const RUN_SIZE: Record<SpeakingPart, number> = { repeat: 10, answer: 8, talk: 2 };

/** Part 3 needs at least this many self-check prompts before the authored ones are left out. */
const MIN_SELF_CHECK_TALK = 4;

const HAN = /\p{Script=Han}/gu;

function hanCount(text: string): number {
  return text.match(HAN)?.length ?? 0;
}

/** Text that reads and sounds as one plain sentence: no placeholders, brackets, slashes or Latin. */
function isPlain(text: string): boolean {
  return !/[A-Za-z…～~/／（）()_＿]/.test(text);
}

function core(text: string): string {
  return text.replace(/[^\p{Script=Han}0-9]/gu, '');
}

// ---- Part 1 ----

function repeatPool(lesson: number): RepeatItem[] {
  const out: RepeatItem[] = [];
  const seen = new Set<string>();
  const add = (text: string, pinyin: string, english: string, at: number) => {
    const n = hanCount(text);
    const key = core(text);
    if (n < 4 || n > 16 || !isPlain(text) || seen.has(key)) return;
    seen.add(key);
    out.push({ id: `rep:${text}`, part: 'repeat', lesson: at, text, pinyin, english });
  };

  for (const d of chineseDialogues) {
    if (d.lesson > lesson) continue;
    for (const line of d.lines) add(line.text, line.pinyin, line.translation, d.lesson);
  }
  for (const rule of chineseGrammarRules) {
    const first = Math.min(...rule.lessons);
    if (first > lesson) continue;
    for (const ex of rule.examples) add(ex.chinese, ex.pinyin, ex.english, first);
  }
  return out;
}

// ---- Part 2 ----

const QUESTION_END = /[？?]$/;

function answerPool(lesson: number): AnswerItem[] {
  const out: AnswerItem[] = [];
  const seen = new Set<string>();
  const add = (item: AnswerItem) => {
    const key = core(item.question);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(item);
  };

  for (const sc of getSelfCheckItems({ maxLesson: lesson })) {
    const fits =
      sc.kind === 'reply' ||
      sc.kind === 'choose-reply' ||
      (sc.kind === 'open' && sc.extended !== true);
    if (!fits || !sc.cue || !sc.answer || !isPlain(sc.cue) || !isPlain(sc.answer)) continue;
    add({
      id: `ans:${sc.id}`,
      part: 'answer',
      lesson: sc.lesson,
      question: sc.cue,
      questionEnglish: sc.cueTranslation,
      answer: sc.answer,
      answerPinyin: sc.answerPinyin ?? toPinyin(sc.answer),
      hint: sc.hint,
    });
  }

  for (const d of chineseDialogues) {
    if (d.lesson > lesson) continue;
    d.lines.forEach((line, i) => {
      const reply = d.lines[i + 1];
      if (!reply || reply.speaker === line.speaker) return;
      if (line.speaker === 'Narrator' || reply.speaker === 'Narrator') return;
      if (!QUESTION_END.test(line.text.trim())) return;
      for (const t of [line.text, reply.text]) {
        const n = hanCount(t);
        if (n < 4 || n > 20) return;
      }
      add({
        id: `ans:${d.id}:${i}`,
        part: 'answer',
        lesson: d.lesson,
        question: line.text,
        questionEnglish: line.translation,
        answer: reply.text,
        answerPinyin: reply.pinyin,
        answerEnglish: reply.translation,
      });
    });
  }
  return out;
}

// ---- Part 3 ----

interface AuthoredPrompt {
  id: string;
  lesson: number;
  prompt: string;
  english: string;
  sample: string;
  samplePinyin: string;
  sampleEnglish: string;
  starters: string[];
}

/** Prompts for the early lessons, whose self-checks have no extended speaking prompts. */
const AUTHORED_PROMPTS: AuthoredPrompt[] = [
  {
    id: 'own-feel',
    lesson: 3,
    prompt: '你忙吗？累吗？',
    english: 'Are you busy? Are you tired?',
    sample: '我很忙，也很累。我也很饿。',
    samplePinyin: 'Wǒ hěn máng, yě hěn lèi. Wǒ yě hěn è.',
    sampleEnglish: "I'm very busy and also very tired. I'm very hungry too.",
    starters: ['我很……', '我也很……'],
  },
  {
    id: 'own-family',
    lesson: 6,
    prompt: '你家有几口人？他们是谁？',
    english: 'How many people are in your family? Who are they?',
    sample: '我家有四口人，爸爸、妈妈、哥哥和我。',
    samplePinyin: 'Wǒ jiā yǒu sì kǒu rén, bàba, māma, gēge hé wǒ.',
    sampleEnglish: 'There are four people in my family: Dad, Mum, my older brother and me.',
    starters: ['我家有……口人', '他们是……'],
  },
  {
    id: 'own-birthday',
    lesson: 9,
    prompt: '你的生日是几月几号？',
    english: 'When is your birthday?',
    sample: '我的生日是十月五号。我和朋友一起吃饭。',
    samplePinyin: 'Wǒ de shēngrì shì shí yuè wǔ hào. Wǒ hé péngyou yìqǐ chī fàn.',
    sampleEnglish: 'My birthday is on the fifth of October. I eat with my friends.',
    starters: ['我的生日是……', '我和……一起……'],
  },
  {
    id: 'own-near',
    lesson: 10,
    prompt: '你家附近有超市吗？有公园吗？',
    english: 'Is there a supermarket near your home? A park?',
    sample: '我家附近有超市和公园。公园在超市的旁边。',
    samplePinyin: 'Wǒ jiā fùjìn yǒu chāoshì hé gōngyuán. Gōngyuán zài chāoshì de pángbiān.',
    sampleEnglish:
      'Near my home there is a supermarket and a park. The park is next to the supermarket.',
    starters: ['我家附近有……', '……在……的旁边'],
  },
  {
    id: 'own-day',
    lesson: 12,
    prompt: '你每天几点起床？几点上班？',
    english: 'What time do you get up every day? What time do you start work?',
    sample: '我每天早上七点起床，八点上班。下午六点下班。',
    samplePinyin: 'Wǒ měi tiān zǎoshang qī diǎn qǐchuáng, bā diǎn shàngbān. Xiàwǔ liù diǎn xiàbān.',
    sampleEnglish: 'Every morning I get up at seven and start work at eight. I finish work at six.',
    starters: ['我每天早上……', '我……点……'],
  },
  {
    id: 'own-food',
    lesson: 13,
    prompt: '说说你喜欢吃什么。',
    english: 'Talk about the food you like.',
    sample: '我喜欢吃饺子和面条，也喜欢喝茶。',
    samplePinyin: 'Wǒ xǐhuan chī jiǎozi hé miàntiáo, yě xǐhuan hē chá.',
    sampleEnglish: 'I like dumplings and noodles, and I like drinking tea too.',
    starters: ['我喜欢吃……', '我也喜欢……'],
  },
  {
    id: 'own-why',
    lesson: 15,
    prompt: '你为什么学中文？',
    english: 'Why do you study Chinese?',
    sample: '因为我想去北京旅游，所以我学中文。',
    samplePinyin: 'Yīnwèi wǒ xiǎng qù Běijīng lǚyóu, suǒyǐ wǒ xué Zhōngwén.',
    sampleEnglish: 'Because I want to travel to Beijing, so I study Chinese.',
    starters: ['因为我想……', '所以我……'],
  },
  {
    id: 'own-weekend',
    lesson: 17,
    prompt: '说说你周末做什么。',
    english: 'Say what you do at the weekend.',
    sample: '周末我不上班。我喜欢看书，也喜欢跑步。',
    samplePinyin: 'Zhōumò wǒ bú shàngbān. Wǒ xǐhuan kàn shū, yě xǐhuan pǎobù.',
    sampleEnglish: "I don't work at the weekend. I like reading, and I like running too.",
    starters: ['周末我……', '我喜欢……，也喜欢……'],
  },
];

function splitStarters(...texts: (string | undefined)[]): { english: string; starters: string[] } {
  const base = texts[0] ?? '';
  for (const text of texts) {
    const m = text?.match(/\s*Starters?:\s*(.+)$/i);
    if (!m) continue;
    const starters = m[1]
      .split(/\s*[/／]\s*/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    return { english: base.replace(/\s*Starters?:.*$/i, '').trim(), starters };
  }
  return { english: base, starters: [] };
}

function talkPool(lesson: number): TalkItem[] {
  const out: TalkItem[] = [];
  for (const sc of getSelfCheckItems({ maxLesson: lesson })) {
    if (sc.kind !== 'open' || sc.extended !== true || !sc.cue || !sc.answer) continue;
    const { english, starters } = splitStarters(sc.cueTranslation, sc.note);
    out.push({
      id: `talk:${sc.id}`,
      part: 'talk',
      lesson: sc.lesson,
      prompt: sc.cue,
      english,
      sample: sc.answer,
      samplePinyin: sc.answerPinyin ?? toPinyin(sc.answer),
      // The note is the English of the sample answer, unless it holds the starters.
      sampleEnglish: sc.note && !/Starters?:/i.test(sc.note) ? sc.note : undefined,
      starters,
    });
  }
  if (out.length < MIN_SELF_CHECK_TALK) {
    for (const p of AUTHORED_PROMPTS) {
      if (p.lesson > lesson) continue;
      out.push({
        id: `talk:${p.id}`,
        part: 'talk',
        lesson: p.lesson,
        prompt: p.prompt,
        english: p.english,
        sample: p.sample,
        samplePinyin: p.samplePinyin,
        sampleEnglish: p.sampleEnglish,
        starters: p.starters,
      });
    }
  }
  return out;
}

/** Everything the three parts can ask at `lesson`. */
export function buildSpeakingPools(lesson: number): SpeakingPools {
  return { repeat: repeatPool(lesson), answer: answerPool(lesson), talk: talkPool(lesson) };
}

/** One run of a part: weak and unseen items come up more often. */
export function sampleRun(
  part: SpeakingPart,
  pools: SpeakingPools,
  map: MasteryMap,
): SpeakingItem[] {
  const pool: SpeakingItem[] = pools[part];
  return weightedSample(pool, (i) => pickWeight(map[i.id]), RUN_SIZE[part], makeRng(Date.now()));
}

/** How an item shows up in the weak-spot list. */
export function itemMeta(item: SpeakingItem): MasteryMeta {
  switch (item.part) {
    case 'repeat':
      return { label: item.text, sublabel: item.pinyin, group: 'Repeat' };
    case 'answer':
      return { label: item.question, sublabel: item.questionEnglish, group: 'Listen & answer' };
    case 'talk':
      return { label: item.prompt, sublabel: item.english, group: 'Talk' };
  }
}
