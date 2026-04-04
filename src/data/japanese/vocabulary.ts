import type { VocabularyItem } from '@/types';
import { irodoriVocabulary, irodoriLevels } from './irodori-vocab';

// Original JLPT-organized vocabulary
const baseVocabulary: VocabularyItem[] = [
  // JLPT N5
  { id: 'ja-001', language: 'japanese', word: 'こんにちは', reading: 'こんにちは', meaning: 'hello', partOfSpeech: 'interjection', level: 'JLPT N5', topic: 'greetings', exampleSentence: 'こんにちは、元気ですか？', exampleTranslation: 'Hello, how are you?' },
  { id: 'ja-002', language: 'japanese', word: 'ありがとう', reading: 'ありがとう', meaning: 'thank you', partOfSpeech: 'interjection', level: 'JLPT N5', topic: 'greetings', exampleSentence: 'ありがとうございます。', exampleTranslation: 'Thank you very much.' },
  { id: 'ja-003', language: 'japanese', word: 'さようなら', reading: 'さようなら', meaning: 'goodbye', partOfSpeech: 'interjection', level: 'JLPT N5', topic: 'greetings', exampleSentence: 'さようなら、また明日！', exampleTranslation: 'Goodbye, see you tomorrow!' },
  { id: 'ja-004', language: 'japanese', word: '私', reading: 'わたし', meaning: 'I, me', partOfSpeech: 'pronoun', level: 'JLPT N5', topic: 'pronouns', exampleSentence: '私は日本人です。', exampleTranslation: 'I am Japanese.' },
  { id: 'ja-005', language: 'japanese', word: '食べる', reading: 'たべる', meaning: 'to eat', partOfSpeech: 'verb', level: 'JLPT N5', topic: 'food', exampleSentence: '朝ごはんを食べます。', exampleTranslation: 'I eat breakfast.' },
  { id: 'ja-006', language: 'japanese', word: '飲む', reading: 'のむ', meaning: 'to drink', partOfSpeech: 'verb', level: 'JLPT N5', topic: 'food', exampleSentence: 'お茶を飲みます。', exampleTranslation: 'I drink tea.' },
  { id: 'ja-007', language: 'japanese', word: '水', reading: 'みず', meaning: 'water', partOfSpeech: 'noun', level: 'JLPT N5', topic: 'food', exampleSentence: '水をください。', exampleTranslation: 'Please give me water.' },
  { id: 'ja-008', language: 'japanese', word: '大きい', reading: 'おおきい', meaning: 'big', partOfSpeech: 'i-adjective', level: 'JLPT N5', topic: 'adjectives', exampleSentence: 'この部屋は大きいです。', exampleTranslation: 'This room is big.' },
  { id: 'ja-009', language: 'japanese', word: '小さい', reading: 'ちいさい', meaning: 'small', partOfSpeech: 'i-adjective', level: 'JLPT N5', topic: 'adjectives', exampleSentence: '小さい犬がいます。', exampleTranslation: 'There is a small dog.' },
  { id: 'ja-010', language: 'japanese', word: '一', reading: 'いち', meaning: 'one', partOfSpeech: 'number', level: 'JLPT N5', topic: 'numbers' },
  { id: 'ja-011', language: 'japanese', word: '二', reading: 'に', meaning: 'two', partOfSpeech: 'number', level: 'JLPT N5', topic: 'numbers' },
  { id: 'ja-012', language: 'japanese', word: '三', reading: 'さん', meaning: 'three', partOfSpeech: 'number', level: 'JLPT N5', topic: 'numbers' },
  { id: 'ja-013', language: 'japanese', word: '学生', reading: 'がくせい', meaning: 'student', partOfSpeech: 'noun', level: 'JLPT N5', topic: 'school', exampleSentence: '私は大学生です。', exampleTranslation: 'I am a university student.' },
  { id: 'ja-014', language: 'japanese', word: '先生', reading: 'せんせい', meaning: 'teacher', partOfSpeech: 'noun', level: 'JLPT N5', topic: 'school', exampleSentence: '田中先生はやさしいです。', exampleTranslation: 'Teacher Tanaka is kind.' },
  { id: 'ja-015', language: 'japanese', word: '行く', reading: 'いく', meaning: 'to go', partOfSpeech: 'verb', level: 'JLPT N5', topic: 'basic verbs', exampleSentence: '学校に行きます。', exampleTranslation: 'I go to school.' },
  { id: 'ja-016', language: 'japanese', word: '来る', reading: 'くる', meaning: 'to come', partOfSpeech: 'verb', level: 'JLPT N5', topic: 'basic verbs', exampleSentence: '友達が来ます。', exampleTranslation: 'A friend is coming.' },
  { id: 'ja-017', language: 'japanese', word: '見る', reading: 'みる', meaning: 'to see, watch', partOfSpeech: 'verb', level: 'JLPT N5', topic: 'basic verbs', exampleSentence: 'テレビを見ます。', exampleTranslation: 'I watch TV.' },
  { id: 'ja-018', language: 'japanese', word: '好き', reading: 'すき', meaning: 'like, fond of', partOfSpeech: 'na-adjective', level: 'JLPT N5', topic: 'adjectives', exampleSentence: '日本料理が好きです。', exampleTranslation: 'I like Japanese food.' },
  // JLPT N4
  { id: 'ja-019', language: 'japanese', word: '経験', reading: 'けいけん', meaning: 'experience', partOfSpeech: 'noun', level: 'JLPT N4', topic: 'work', exampleSentence: 'いい経験になりました。', exampleTranslation: 'It was a good experience.' },
  { id: 'ja-020', language: 'japanese', word: '文化', reading: 'ぶんか', meaning: 'culture', partOfSpeech: 'noun', level: 'JLPT N4', topic: 'culture', exampleSentence: '日本の文化に興味があります。', exampleTranslation: 'I am interested in Japanese culture.' },
  { id: 'ja-021', language: 'japanese', word: '環境', reading: 'かんきょう', meaning: 'environment', partOfSpeech: 'noun', level: 'JLPT N4', topic: 'society', exampleSentence: '環境を大切にしましょう。', exampleTranslation: "Let's take care of the environment." },
  { id: 'ja-022', language: 'japanese', word: '自分', reading: 'じぶん', meaning: 'oneself', partOfSpeech: 'pronoun', level: 'JLPT N4', topic: 'pronouns', exampleSentence: '自分で決めてください。', exampleTranslation: 'Please decide for yourself.' },
  { id: 'ja-023', language: 'japanese', word: '特別', reading: 'とくべつ', meaning: 'special', partOfSpeech: 'na-adjective', level: 'JLPT N4', topic: 'adjectives', exampleSentence: '今日は特別な日です。', exampleTranslation: 'Today is a special day.' },
  // JLPT N3
  { id: 'ja-024', language: 'japanese', word: '影響', reading: 'えいきょう', meaning: 'influence', partOfSpeech: 'noun', level: 'JLPT N3', topic: 'society', exampleSentence: '天気が影響を与えます。', exampleTranslation: 'The weather has an influence.' },
  { id: 'ja-025', language: 'japanese', word: '関係', reading: 'かんけい', meaning: 'relationship', partOfSpeech: 'noun', level: 'JLPT N3', topic: 'society', exampleSentence: '二人の関係は良好です。', exampleTranslation: 'The relationship between the two is good.' },
];

// Merge: base vocabulary + Irodori vocabulary (deduplicating by word)
function buildMergedVocabulary(): VocabularyItem[] {
  const existingWords = new Set(baseVocabulary.map(v => v.word));
  const merged = [...baseVocabulary];

  for (const item of irodoriVocabulary) {
    if (existingWords.has(item.word)) continue;
    existingWords.add(item.word);
    merged.push(item);
  }

  return merged;
}

export const japaneseVocabulary: VocabularyItem[] = buildMergedVocabulary();

// Re-export Irodori data for flashcard decks and filters
export { irodoriVocabulary, irodoriLevels } from './irodori-vocab';
export { irodoriGrammar } from './irodori-grammar';
export { irodoriKanji } from './irodori-kanji';

// Get all unique levels
export function getJapaneseLevels(): string[] {
  const levels = new Set(japaneseVocabulary.map(v => v.level).filter(Boolean));
  return Array.from(levels) as string[];
}
