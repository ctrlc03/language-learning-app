/**
 * Tips a learner can ask for, one at a time, during a Chinese translation: first the
 * word the exercise practises, then every word of the Chinese sentence with its pinyin
 * and meaning. Translating into Chinese, the words come in pinyin order, so the tip
 * gives the words but leaves the word order to the learner.
 */

import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { wordPinyin } from '@/lib/language/pinyin';
import { tokenizeChinese } from '@/lib/language/segment';
import type { TranslationData, VocabularyItem } from '@/types';

// A few words are taught twice with different readings (得 de / děi): the tip gives both.
const entriesByWord = new Map<string, VocabularyItem[]>();
for (const v of chineseVocabulary)
  entriesByWord.set(v.word, [...(entriesByWord.get(v.word) ?? []), v]);

export interface WordTip {
  word: string;
  reading: string;
  meaning?: string;
}

export interface Tip {
  title: string;
  words: WordTip[];
}

function wordTip(word: string): WordTip {
  const entries = entriesByWord.get(word) ?? [];
  const readings = [...new Set(entries.map((e) => e.reading).filter(Boolean))];
  const meanings = [...new Set(entries.map((e) => e.meaning).filter(Boolean))];
  return {
    word,
    reading: readings.length > 0 ? readings.join(' / ') : wordPinyin(word),
    meaning: meanings.length > 0 ? meanings.join('; ') : undefined,
  };
}

/**
 * The tips for a translation, in the order they are shown; none when neither side is Chinese.
 * @param sourceId the exercise's sourceId: the vocabulary id of the word it practises
 */
export function translationTips(data: TranslationData, sourceId?: string): Tip[] {
  const intoChinese = data.targetLanguage === 'chinese';
  const chinese = intoChinese
    ? data.sampleAnswer
    : data.sourceLanguage === 'chinese'
      ? data.sourceText
      : '';
  const words = [
    ...new Set(
      tokenizeChinese(chinese)
        .filter((t) => t.han)
        .map((t) => t.text),
    ),
  ].map(wordTip);
  if (words.length === 0) return [];

  const tips: Tip[] = [];
  const key = sourceId ? chineseVocabulary.find((v) => v.id === sourceId) : undefined;
  if (key && chinese.includes(key.word)) {
    tips.push({
      title: 'Key word',
      words: [
        { word: key.word, reading: key.reading || wordPinyin(key.word), meaning: key.meaning },
      ],
    });
  }
  tips.push(
    intoChinese
      ? {
          title: 'The words you need, in no particular order',
          words: words.sort((a, b) => a.reading.localeCompare(b.reading)),
        }
      : { title: 'Word by word', words },
  );
  return tips;
}
