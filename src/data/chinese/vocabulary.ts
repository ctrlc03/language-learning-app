import type { VocabularyItem } from '@/types';
import lessonsData from './lessons.json';

// Original HSK-organized vocabulary
const baseVocabulary: VocabularyItem[] = [
  // HSK 1
  {
    id: 'zh-001',
    language: 'chinese',
    word: '你好',
    reading: 'nǐ hǎo',
    meaning: 'hello',
    partOfSpeech: 'interjection',
    level: 'HSK 1',
    topic: 'greetings',
    exampleSentence: '你好，我叫小明。',
    exampleTranslation: 'Hello, my name is Xiao Ming.',
  },
  {
    id: 'zh-002',
    language: 'chinese',
    word: '谢谢',
    reading: 'xiè xie',
    meaning: 'thank you',
    partOfSpeech: 'interjection',
    level: 'HSK 1',
    topic: 'greetings',
    exampleSentence: '谢谢你的帮助。',
    exampleTranslation: 'Thank you for your help.',
  },
  {
    id: 'zh-003',
    language: 'chinese',
    word: '再见',
    reading: 'zài jiàn',
    meaning: 'goodbye',
    partOfSpeech: 'interjection',
    level: 'HSK 1',
    topic: 'greetings',
    exampleSentence: '再见，明天见！',
    exampleTranslation: 'Goodbye, see you tomorrow!',
  },
  {
    id: 'zh-004',
    language: 'chinese',
    word: '我',
    reading: 'wǒ',
    meaning: 'I, me',
    partOfSpeech: 'pronoun',
    level: 'HSK 1',
    topic: 'pronouns',
    exampleSentence: '我是中国人。',
    exampleTranslation: 'I am Chinese.',
  },
  {
    id: 'zh-005',
    language: 'chinese',
    word: '你',
    reading: 'nǐ',
    meaning: 'you',
    partOfSpeech: 'pronoun',
    level: 'HSK 1',
    topic: 'pronouns',
    exampleSentence: '你是哪里人？',
    exampleTranslation: 'Where are you from?',
  },
  {
    id: 'zh-006',
    language: 'chinese',
    word: '他',
    reading: 'tā',
    meaning: 'he, him',
    partOfSpeech: 'pronoun',
    level: 'HSK 1',
    topic: 'pronouns',
    exampleSentence: '他是我的朋友。',
    exampleTranslation: 'He is my friend.',
  },
  {
    id: 'zh-007',
    language: 'chinese',
    word: '她',
    reading: 'tā',
    meaning: 'she, her',
    partOfSpeech: 'pronoun',
    level: 'HSK 1',
    topic: 'pronouns',
    exampleSentence: '她很漂亮。',
    exampleTranslation: 'She is very pretty.',
  },
  {
    id: 'zh-008',
    language: 'chinese',
    word: '是',
    reading: 'shì',
    meaning: 'to be',
    partOfSpeech: 'verb',
    level: 'HSK 1',
    topic: 'basic verbs',
    exampleSentence: '这是我的书。',
    exampleTranslation: 'This is my book.',
  },
  {
    id: 'zh-009',
    language: 'chinese',
    word: '有',
    reading: 'yǒu',
    meaning: 'to have',
    partOfSpeech: 'verb',
    level: 'HSK 1',
    topic: 'basic verbs',
    exampleSentence: '我有一只猫。',
    exampleTranslation: 'I have a cat.',
  },
  {
    id: 'zh-010',
    language: 'chinese',
    word: '吃',
    reading: 'chī',
    meaning: 'to eat',
    partOfSpeech: 'verb',
    level: 'HSK 1',
    topic: 'food',
    exampleSentence: '我们吃午饭吧。',
    exampleTranslation: "Let's eat lunch.",
  },
  {
    id: 'zh-011',
    language: 'chinese',
    word: '喝',
    reading: 'hē',
    meaning: 'to drink',
    partOfSpeech: 'verb',
    level: 'HSK 1',
    topic: 'food',
    exampleSentence: '你想喝什么？',
    exampleTranslation: 'What would you like to drink?',
  },
  {
    id: 'zh-012',
    language: 'chinese',
    word: '水',
    reading: 'shuǐ',
    meaning: 'water',
    partOfSpeech: 'noun',
    level: 'HSK 1',
    topic: 'food',
    exampleSentence: '请给我一杯水。',
    exampleTranslation: 'Please give me a glass of water.',
  },
  {
    id: 'zh-013',
    language: 'chinese',
    word: '大',
    reading: 'dà',
    meaning: 'big',
    partOfSpeech: 'adjective',
    level: 'HSK 1',
    topic: 'adjectives',
    exampleSentence: '这个房间很大。',
    exampleTranslation: 'This room is very big.',
  },
  {
    id: 'zh-014',
    language: 'chinese',
    word: '小',
    reading: 'xiǎo',
    meaning: 'small',
    partOfSpeech: 'adjective',
    level: 'HSK 1',
    topic: 'adjectives',
    exampleSentence: '我有一条小狗。',
    exampleTranslation: 'I have a small dog.',
  },
  {
    id: 'zh-015',
    language: 'chinese',
    word: '好',
    reading: 'hǎo',
    meaning: 'good',
    partOfSpeech: 'adjective',
    level: 'HSK 1',
    topic: 'adjectives',
    exampleSentence: '今天天气很好。',
    exampleTranslation: 'The weather is very good today.',
  },
  {
    id: 'zh-016',
    language: 'chinese',
    word: '一',
    reading: 'yī',
    meaning: 'one',
    partOfSpeech: 'number',
    level: 'HSK 1',
    topic: 'numbers',
  },
  {
    id: 'zh-017',
    language: 'chinese',
    word: '二',
    reading: 'èr',
    meaning: 'two',
    partOfSpeech: 'number',
    level: 'HSK 1',
    topic: 'numbers',
  },
  {
    id: 'zh-018',
    language: 'chinese',
    word: '三',
    reading: 'sān',
    meaning: 'three',
    partOfSpeech: 'number',
    level: 'HSK 1',
    topic: 'numbers',
  },
  {
    id: 'zh-019',
    language: 'chinese',
    word: '学生',
    reading: 'xué sheng',
    meaning: 'student',
    partOfSpeech: 'noun',
    level: 'HSK 1',
    topic: 'school',
    exampleSentence: '我是大学生。',
    exampleTranslation: 'I am a university student.',
  },
  {
    id: 'zh-020',
    language: 'chinese',
    word: '老师',
    reading: 'lǎo shī',
    meaning: 'teacher',
    partOfSpeech: 'noun',
    level: 'HSK 1',
    topic: 'school',
    exampleSentence: '王老师很好。',
    exampleTranslation: 'Teacher Wang is very nice.',
  },
  // HSK 2
  {
    id: 'zh-021',
    language: 'chinese',
    word: '因为',
    reading: 'yīn wèi',
    meaning: 'because',
    partOfSpeech: 'conjunction',
    level: 'HSK 2',
    topic: 'grammar',
    exampleSentence: '因为下雨了，所以我没去。',
    exampleTranslation: "Because it rained, I didn't go.",
  },
  {
    id: 'zh-022',
    language: 'chinese',
    word: '所以',
    reading: 'suǒ yǐ',
    meaning: 'therefore',
    partOfSpeech: 'conjunction',
    level: 'HSK 2',
    topic: 'grammar',
    exampleSentence: '我很累，所以想睡觉。',
    exampleTranslation: 'I am very tired, so I want to sleep.',
  },
  {
    id: 'zh-023',
    language: 'chinese',
    word: '可以',
    reading: 'kě yǐ',
    meaning: 'can, may',
    partOfSpeech: 'verb',
    level: 'HSK 2',
    topic: 'grammar',
    exampleSentence: '我可以帮你吗？',
    exampleTranslation: 'Can I help you?',
  },
  {
    id: 'zh-024',
    language: 'chinese',
    word: '已经',
    reading: 'yǐ jīng',
    meaning: 'already',
    partOfSpeech: 'adverb',
    level: 'HSK 2',
    topic: 'grammar',
    exampleSentence: '我已经吃过了。',
    exampleTranslation: 'I have already eaten.',
  },
  {
    id: 'zh-025',
    language: 'chinese',
    word: '手机',
    reading: 'shǒu jī',
    meaning: 'cell phone',
    partOfSpeech: 'noun',
    level: 'HSK 2',
    topic: 'technology',
    exampleSentence: '我的手机在桌子上。',
    exampleTranslation: 'My phone is on the table.',
  },
  // HSK 3
  {
    id: 'zh-026',
    language: 'chinese',
    word: '环境',
    reading: 'huán jìng',
    meaning: 'environment',
    partOfSpeech: 'noun',
    level: 'HSK 3',
    topic: 'society',
    exampleSentence: '我们应该保护环境。',
    exampleTranslation: 'We should protect the environment.',
  },
  {
    id: 'zh-027',
    language: 'chinese',
    word: '经验',
    reading: 'jīng yàn',
    meaning: 'experience',
    partOfSpeech: 'noun',
    level: 'HSK 3',
    topic: 'work',
    exampleSentence: '你有工作经验吗？',
    exampleTranslation: 'Do you have work experience?',
  },
  {
    id: 'zh-028',
    language: 'chinese',
    word: '虽然',
    reading: 'suī rán',
    meaning: 'although',
    partOfSpeech: 'conjunction',
    level: 'HSK 3',
    topic: 'grammar',
    exampleSentence: '虽然很难，但是很有趣。',
    exampleTranslation: 'Although it is difficult, it is very interesting.',
  },
  {
    id: 'zh-029',
    language: 'chinese',
    word: '但是',
    reading: 'dàn shì',
    meaning: 'but, however',
    partOfSpeech: 'conjunction',
    level: 'HSK 3',
    topic: 'grammar',
    exampleSentence: '我很想去，但是没有时间。',
    exampleTranslation: "I really want to go, but I don't have time.",
  },
  {
    id: 'zh-030',
    language: 'chinese',
    word: '文化',
    reading: 'wén huà',
    meaning: 'culture',
    partOfSpeech: 'noun',
    level: 'HSK 3',
    topic: 'culture',
    exampleSentence: '中国文化很丰富。',
    exampleTranslation: 'Chinese culture is very rich.',
  },
];

/**
 * Same characters and same pronunciation → one vocabulary item. Keying on the
 * reading as well keeps genuinely different words apart: 只 zhī (classifier)
 * and 只 zhǐ (only), 得 de (particle) and 得 děi (must).
 */
function vocabKey(word: string, reading: string): string {
  return `${word}|${reading
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\s'’]/g, '')}`;
}

// Every lesson that teaches each word, so a lesson's practice includes words it
// revisits from earlier lessons (L31's 跑步 and 正在 were first taught earlier).
const lessonsByKey = new Map<string, number[]>();
for (const lesson of lessonsData.lessons) {
  for (const entry of lesson.vocabulary) {
    const key = vocabKey(entry.word, entry.reading);
    const taughtIn = lessonsByKey.get(key);
    if (!taughtIn) lessonsByKey.set(key, [lesson.lesson]);
    else if (!taughtIn.includes(lesson.lesson)) taughtIn.push(lesson.lesson);
  }
}

// Build vocabulary from lesson slides: one item per word, from the lesson that
// first teaches it.
function buildLessonVocabulary(): VocabularyItem[] {
  const existing = new Set(baseVocabulary.map((v) => vocabKey(v.word, v.reading)));
  const items: VocabularyItem[] = [];
  let counter = 100;

  for (const lesson of lessonsData.lessons) {
    for (const entry of lesson.vocabulary) {
      const key = vocabKey(entry.word, entry.reading);
      if (existing.has(key)) continue;
      existing.add(key);

      items.push({
        id: `zh-l${lesson.lesson}-${String(counter++).padStart(3, '0')}`,
        language: 'chinese',
        word: entry.word,
        reading: entry.reading,
        meaning: entry.meaning,
        partOfSpeech: entry.partOfSpeech,
        level: lesson.title,
        lessons: lessonsByKey.get(key),
        topic: entry.topic,
        exampleSentence: entry.exampleSentence,
        examplePinyin: (entry as Record<string, string>).examplePinyin,
        exampleTranslation: entry.exampleTranslation,
      });
    }
  }

  return items;
}

const lessonVocabulary = buildLessonVocabulary();

// Combined vocabulary: base HSK items (tagged with any lessons that also teach
// them) + lesson-extracted items
export const chineseVocabulary: VocabularyItem[] = [
  ...baseVocabulary.map((v) => {
    const lessons = lessonsByKey.get(vocabKey(v.word, v.reading));
    return lessons ? { ...v, lessons } : v;
  }),
  ...lessonVocabulary,
];

// ── Lesson data ───────────────────────────────────────────────
// lessons.json is a plain JSON import, so TypeScript infers a union of the
// shapes it happens to contain and optional fields (notes, selfCheck) become
// unreachable. These interfaces are the contract; the cast below applies it.

export interface LessonVocabEntry {
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
  topic: string;
  exampleSentence?: string;
  examplePinyin?: string;
  exampleTranslation?: string;
}

export interface LessonExample {
  chinese: string;
  pinyin: string;
  english: string;
}

/** A prose section of a lesson write-up: the teaching, not just the word list. */
export interface LessonNote {
  heading: string;
  body: string;
  examples?: LessonExample[];
  table?: { headers: string[]; rows: string[][] };
}

export interface LessonEntry {
  lesson: number;
  title: string;
  titleChinese: string;
  vocabulary: LessonVocabEntry[];
  notes?: LessonNote[];
  selfCheck?: { q: string; a: string }[];
}

// Export lesson data for flashcard decks
export const chineseLessons = lessonsData.lessons as unknown as LessonEntry[];

/** Lessons that ship written notes, newest first — the Learn page's reading list. */
export function getLessonsWithNotes(): LessonEntry[] {
  return chineseLessons
    .filter((l) => l.notes && l.notes.length > 0)
    .sort((a, b) => b.lesson - a.lesson);
}

export function getLesson(lessonNumber: number): LessonEntry | undefined {
  return chineseLessons.find((l) => l.lesson === lessonNumber);
}

/** Highest lesson number shipped — the default current lesson. */
export const LATEST_LESSON = Math.max(...chineseLessons.map((l) => l.lesson));

/** The learner's current lesson: the saved choice if that lesson exists, else the latest. */
export function resolveCurrentLesson(saved?: number): number {
  return saved !== undefined && chineseLessons.some((l) => l.lesson === saved)
    ? saved
    : LATEST_LESSON;
}

/** Words a lesson teaches, including ones first introduced in an earlier lesson. */
export function getLessonVocabulary(lesson: number): VocabularyItem[] {
  return chineseVocabulary.filter((v) => v.lessons?.includes(lesson));
}

/** Words taught up to and including `currentLesson`, plus the HSK 1 core list. */
export function getCourseVocabulary(currentLesson: number): VocabularyItem[] {
  return chineseVocabulary.filter(
    (v) => v.level === 'HSK 1' || v.lessons?.some((n) => n <= currentLesson),
  );
}

// Get all unique levels
export function getChineseLevels(): string[] {
  const levels = new Set(chineseVocabulary.map((v) => v.level).filter(Boolean));
  return Array.from(levels) as string[];
}
