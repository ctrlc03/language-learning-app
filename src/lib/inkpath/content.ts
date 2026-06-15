// 墨 INKPATH — derive screen content from the real repository vocabulary data.
import type { Language, VocabularyItem } from '@/types';
import { chineseLessons } from '@/data/chinese/vocabulary';
import { irodoriVocabulary, irodoriLevels } from '@/data/japanese/irodori-vocab';

export interface InkLesson {
  id: string;
  glyph: string;
  title: string;
  sub: string;
  band: string;
  topic: string;
}

export interface InkWord {
  char: string;
  reading: string;
  meaning: string;
  ex?: string;
  exEn?: string;
  tone?: string;
}

export interface InkHero {
  char: string;
  ruby: string;
  title: string;
  desc: string;
  band: string;
  topic: string;
}

function firstChar(s: string): string {
  return Array.from(s)[0] ?? '';
}

/** Day-of-year index for deterministic "word of the day" selection. */
function dayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export function getVocabulary(language: Language): VocabularyItem[] {
  if (language === 'chinese') {
    return chineseLessons.flatMap(l => l.vocabulary as VocabularyItem[]);
  }
  return irodoriVocabulary;
}

export function getLessons(language: Language): InkLesson[] {
  if (language === 'chinese') {
    return chineseLessons.slice(0, 4).map(l => ({
      id: `zh-l${l.lesson}`,
      glyph: firstChar(l.titleChinese || l.title),
      title: l.titleChinese || l.title,
      sub: l.title,
      band: `Lesson ${l.lesson}`,
      topic: `${l.vocabulary.length} words`,
    }));
  }
  return irodoriLevels.map((level, i) => {
    const words = irodoriVocabulary.filter(v => v.level === level);
    const topic = words[0]?.topic?.replace(/^[①-⑨0-9]+/, '') || 'Vocabulary';
    return {
      id: `ja-${i}`,
      glyph: firstChar(words.find(w => /[一-龯]/.test(firstChar(w.word)))?.word || words[0]?.word || '日'),
      title: level,
      sub: topic,
      band: `Irodori`,
      topic: `${words.length} words`,
    };
  });
}

export function getWordOfDay(language: Language): InkWord {
  const vocab = getVocabulary(language).filter(v => v.exampleSentence);
  const pool = vocab.length ? vocab : getVocabulary(language);
  const v = pool[dayIndex() % pool.length];
  return {
    char: v.word,
    reading: v.reading,
    meaning: v.meaning,
    ex: v.exampleSentence,
    exEn: v.exampleTranslation,
  };
}

export function getHero(language: Language): InkHero {
  const lessons = getLessons(language);
  const top = lessons[0];
  const wod = getWordOfDay(language);
  if (language === 'japanese') {
    return {
      char: firstChar(wod.char) || '今',
      ruby: `${wod.reading} · ${wod.meaning}`,
      title: `今日の一筆 —\n${top?.sub ?? 'Today'}`,
      desc: `New words drawn from ${top?.title ?? 'your studies'}. Pick up where you left off and keep the thread of memory intact.`,
      band: top?.band ?? 'Irodori',
      topic: top?.topic ?? '',
    };
  }
  return {
    char: firstChar(wod.char) || '今',
    ruby: `${wod.reading} · ${wod.meaning}`,
    title: `今日一课 —\n${top?.sub ?? 'Today'}`,
    desc: `New words from ${top?.title ?? 'your studies'}. Pick up the thread and carry today's practice forward.`,
    band: top?.band ?? 'HSK',
    topic: top?.topic ?? '',
  };
}
