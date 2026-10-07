// 墨 INKPATH — derive screen content from the real repository vocabulary data.
import type { Language, VocabularyItem } from '@/types';
import {
  chineseLessons,
  chineseVocabulary,
  getCourseVocabulary,
  getLessonVocabulary,
} from '@/data/chinese/vocabulary';
import { irodoriVocabulary, irodoriLevels } from '@/data/japanese/irodori-vocab';

/** Lessons listed on Today: the current one and the few just before it. */
const LESSONS_SHOWN = 4;

export interface InkLesson {
  id: string;
  glyph: string;
  title: string;
  sub: string;
  band: string;
  topic: string;
  /** Id of the shipped deck that holds this lesson's words (`FlashcardDeck.prebuiltId`). */
  prebuiltId: string;
  /** Distinct words the lesson teaches, as they appear on card fronts. */
  words: string[];
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

/** First CJK ideograph in a string, falling back to the first character. */
function firstCJK(s: string): string {
  return Array.from(s).find((c) => /[㐀-鿿]/.test(c)) ?? firstChar(s);
}

/** Whole days since the epoch for the local calendar date, so "of the day" picks turn over at local midnight. */
function dayIndex(): number {
  const now = new Date();
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
}

/** Every word the app ships for the language: distinct items, as the Archive counts them. */
export function getVocabulary(language: Language): VocabularyItem[] {
  return language === 'chinese' ? chineseVocabulary : irodoriVocabulary;
}

/**
 * The lessons Today lists. Chinese: the current lesson first, then the ones before it (lesson
 * numbers have gaps, so this walks the shipped lessons rather than counting down). Japanese: the
 * Irodori levels.
 */
export function getLessons(language: Language, currentLesson: number): InkLesson[] {
  if (language === 'chinese') {
    return chineseLessons
      .filter((l) => l.lesson <= currentLesson)
      .sort((a, b) => b.lesson - a.lesson)
      .slice(0, LESSONS_SHOWN)
      .map((l) => {
        const words = [...new Set(l.vocabulary.map((v) => v.word))];
        return {
          id: `zh-l${l.lesson}`,
          glyph: firstChar(l.titleChinese || l.title),
          title: l.titleChinese || l.title,
          sub: l.title,
          band: `Lesson ${l.lesson}`,
          topic: `${words.length} words`,
          prebuiltId: `prebuilt-zh-lesson-${l.lesson}`,
          words,
        };
      });
  }
  return irodoriLevels.map((level, i) => {
    const levelWords = irodoriVocabulary.filter((v) => v.level === level);
    const words = [...new Set(levelWords.map((w) => w.word))];
    const topic = levelWords[0]?.topic?.replace(/^[①-⑨0-9]+/, '') || 'Vocabulary';
    return {
      id: `ja-${i}`,
      glyph: firstChar(
        levelWords.find((w) => /[一-龯]/.test(firstChar(w.word)))?.word ||
          levelWords[0]?.word ||
          '日',
      ),
      title: level,
      sub: topic,
      band: `Irodori`,
      topic: `${words.length} words`,
      prebuiltId: `prebuilt-ja-${level.toLowerCase().replace(/\s+/g, '-')}`,
      words,
    };
  });
}

/** Chinese draws from the course so far (lessons up to the current one); Japanese from all Irodori words. */
export function getWordOfDay(language: Language, currentLesson: number): InkWord {
  const words =
    language === 'chinese' ? getCourseVocabulary(currentLesson) : getVocabulary(language);
  const withExample = words.filter((v) => v.exampleSentence);
  const pool = withExample.length ? withExample : words;
  const v = pool[dayIndex() % pool.length];
  return {
    char: v.word,
    reading: v.reading,
    meaning: v.meaning,
    ex: v.exampleSentence,
    exEn: v.exampleTranslation,
  };
}

export function getHero(language: Language, currentLesson: number): InkHero {
  const top = getLessons(language, currentLesson)[0];
  if (language === 'japanese') {
    const wod = getWordOfDay(language, currentLesson);
    return {
      char: firstCJK(wod.char) || '今',
      ruby: `${wod.reading} · ${wod.meaning}`,
      title: `今日の一筆 —\n${top?.sub ?? 'Today'}`,
      desc: `New words drawn from ${top?.title ?? 'your studies'}. Pick up where you left off and keep the thread of memory intact.`,
      band: top?.band ?? 'Irodori',
      topic: top?.topic ?? '',
    };
  }
  // The hero belongs to the current lesson, so its character comes from that lesson's words.
  const lessonWords = getLessonVocabulary(currentLesson);
  const word = lessonWords[dayIndex() % lessonWords.length];
  return {
    char: firstChar(word?.word ?? '') || '今',
    ruby: word ? `${word.reading} · ${word.meaning}` : '',
    title: `今日一课 —\n${top?.sub ?? 'Today'}`,
    desc: `New words from ${top?.title ?? 'your studies'}. Pick up the thread and carry today's practice forward.`,
    band: top?.band ?? 'HSK',
    topic: top?.topic ?? '',
  };
}
