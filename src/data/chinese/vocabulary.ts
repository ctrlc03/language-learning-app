import type { VocabularyItem } from '@/types';
import lessonsData from './lessons.json';

// Original HSK-organized vocabulary
const baseVocabulary: VocabularyItem[] = [
  // HSK 1
  { id: 'zh-001', language: 'chinese', word: '你好', reading: 'nǐ hǎo', meaning: 'hello', partOfSpeech: 'interjection', level: 'HSK 1', topic: 'greetings', exampleSentence: '你好，我叫小明。', exampleTranslation: 'Hello, my name is Xiao Ming.' },
  { id: 'zh-002', language: 'chinese', word: '谢谢', reading: 'xiè xie', meaning: 'thank you', partOfSpeech: 'interjection', level: 'HSK 1', topic: 'greetings', exampleSentence: '谢谢你的帮助。', exampleTranslation: 'Thank you for your help.' },
  { id: 'zh-003', language: 'chinese', word: '再见', reading: 'zài jiàn', meaning: 'goodbye', partOfSpeech: 'interjection', level: 'HSK 1', topic: 'greetings', exampleSentence: '再见，明天见！', exampleTranslation: 'Goodbye, see you tomorrow!' },
  { id: 'zh-004', language: 'chinese', word: '我', reading: 'wǒ', meaning: 'I, me', partOfSpeech: 'pronoun', level: 'HSK 1', topic: 'pronouns', exampleSentence: '我是中国人。', exampleTranslation: 'I am Chinese.' },
  { id: 'zh-005', language: 'chinese', word: '你', reading: 'nǐ', meaning: 'you', partOfSpeech: 'pronoun', level: 'HSK 1', topic: 'pronouns', exampleSentence: '你是哪里人？', exampleTranslation: 'Where are you from?' },
  { id: 'zh-006', language: 'chinese', word: '他', reading: 'tā', meaning: 'he, him', partOfSpeech: 'pronoun', level: 'HSK 1', topic: 'pronouns', exampleSentence: '他是我的朋友。', exampleTranslation: 'He is my friend.' },
  { id: 'zh-007', language: 'chinese', word: '她', reading: 'tā', meaning: 'she, her', partOfSpeech: 'pronoun', level: 'HSK 1', topic: 'pronouns', exampleSentence: '她很漂亮。', exampleTranslation: 'She is very pretty.' },
  { id: 'zh-008', language: 'chinese', word: '是', reading: 'shì', meaning: 'to be', partOfSpeech: 'verb', level: 'HSK 1', topic: 'basic verbs', exampleSentence: '这是我的书。', exampleTranslation: 'This is my book.' },
  { id: 'zh-009', language: 'chinese', word: '有', reading: 'yǒu', meaning: 'to have', partOfSpeech: 'verb', level: 'HSK 1', topic: 'basic verbs', exampleSentence: '我有一只猫。', exampleTranslation: 'I have a cat.' },
  { id: 'zh-010', language: 'chinese', word: '吃', reading: 'chī', meaning: 'to eat', partOfSpeech: 'verb', level: 'HSK 1', topic: 'food', exampleSentence: '我们吃午饭吧。', exampleTranslation: "Let's eat lunch." },
  { id: 'zh-011', language: 'chinese', word: '喝', reading: 'hē', meaning: 'to drink', partOfSpeech: 'verb', level: 'HSK 1', topic: 'food', exampleSentence: '你想喝什么？', exampleTranslation: 'What would you like to drink?' },
  { id: 'zh-012', language: 'chinese', word: '水', reading: 'shuǐ', meaning: 'water', partOfSpeech: 'noun', level: 'HSK 1', topic: 'food', exampleSentence: '请给我一杯水。', exampleTranslation: 'Please give me a glass of water.' },
  { id: 'zh-013', language: 'chinese', word: '大', reading: 'dà', meaning: 'big', partOfSpeech: 'adjective', level: 'HSK 1', topic: 'adjectives', exampleSentence: '这个房间很大。', exampleTranslation: 'This room is very big.' },
  { id: 'zh-014', language: 'chinese', word: '小', reading: 'xiǎo', meaning: 'small', partOfSpeech: 'adjective', level: 'HSK 1', topic: 'adjectives', exampleSentence: '我有一条小狗。', exampleTranslation: 'I have a small dog.' },
  { id: 'zh-015', language: 'chinese', word: '好', reading: 'hǎo', meaning: 'good', partOfSpeech: 'adjective', level: 'HSK 1', topic: 'adjectives', exampleSentence: '今天天气很好。', exampleTranslation: 'The weather is very good today.' },
  { id: 'zh-016', language: 'chinese', word: '一', reading: 'yī', meaning: 'one', partOfSpeech: 'number', level: 'HSK 1', topic: 'numbers' },
  { id: 'zh-017', language: 'chinese', word: '二', reading: 'èr', meaning: 'two', partOfSpeech: 'number', level: 'HSK 1', topic: 'numbers' },
  { id: 'zh-018', language: 'chinese', word: '三', reading: 'sān', meaning: 'three', partOfSpeech: 'number', level: 'HSK 1', topic: 'numbers' },
  { id: 'zh-019', language: 'chinese', word: '学生', reading: 'xué shēng', meaning: 'student', partOfSpeech: 'noun', level: 'HSK 1', topic: 'school', exampleSentence: '我是大学生。', exampleTranslation: 'I am a university student.' },
  { id: 'zh-020', language: 'chinese', word: '老师', reading: 'lǎo shī', meaning: 'teacher', partOfSpeech: 'noun', level: 'HSK 1', topic: 'school', exampleSentence: '王老师很好。', exampleTranslation: 'Teacher Wang is very nice.' },
  // HSK 2
  { id: 'zh-021', language: 'chinese', word: '因为', reading: 'yīn wèi', meaning: 'because', partOfSpeech: 'conjunction', level: 'HSK 2', topic: 'grammar', exampleSentence: '因为下雨了，所以我没去。', exampleTranslation: "Because it rained, I didn't go." },
  { id: 'zh-022', language: 'chinese', word: '所以', reading: 'suǒ yǐ', meaning: 'therefore', partOfSpeech: 'conjunction', level: 'HSK 2', topic: 'grammar', exampleSentence: '我很累，所以想睡觉。', exampleTranslation: 'I am very tired, so I want to sleep.' },
  { id: 'zh-023', language: 'chinese', word: '可以', reading: 'kě yǐ', meaning: 'can, may', partOfSpeech: 'verb', level: 'HSK 2', topic: 'grammar', exampleSentence: '我可以帮你吗？', exampleTranslation: 'Can I help you?' },
  { id: 'zh-024', language: 'chinese', word: '已经', reading: 'yǐ jīng', meaning: 'already', partOfSpeech: 'adverb', level: 'HSK 2', topic: 'grammar', exampleSentence: '我已经吃过了。', exampleTranslation: 'I have already eaten.' },
  { id: 'zh-025', language: 'chinese', word: '手机', reading: 'shǒu jī', meaning: 'cell phone', partOfSpeech: 'noun', level: 'HSK 2', topic: 'technology', exampleSentence: '我的手机在桌子上。', exampleTranslation: 'My phone is on the table.' },
  // HSK 3
  { id: 'zh-026', language: 'chinese', word: '环境', reading: 'huán jìng', meaning: 'environment', partOfSpeech: 'noun', level: 'HSK 3', topic: 'society', exampleSentence: '我们应该保护环境。', exampleTranslation: 'We should protect the environment.' },
  { id: 'zh-027', language: 'chinese', word: '经验', reading: 'jīng yàn', meaning: 'experience', partOfSpeech: 'noun', level: 'HSK 3', topic: 'work', exampleSentence: '你有工作经验吗？', exampleTranslation: 'Do you have work experience?' },
  { id: 'zh-028', language: 'chinese', word: '虽然', reading: 'suī rán', meaning: 'although', partOfSpeech: 'conjunction', level: 'HSK 3', topic: 'grammar', exampleSentence: '虽然很难，但是很有趣。', exampleTranslation: 'Although it is difficult, it is very interesting.' },
  { id: 'zh-029', language: 'chinese', word: '但是', reading: 'dàn shì', meaning: 'but, however', partOfSpeech: 'conjunction', level: 'HSK 3', topic: 'grammar', exampleSentence: '我很想去，但是没有时间。', exampleTranslation: "I really want to go, but I don't have time." },
  { id: 'zh-030', language: 'chinese', word: '文化', reading: 'wén huà', meaning: 'culture', partOfSpeech: 'noun', level: 'HSK 3', topic: 'culture', exampleSentence: '中国文化很丰富。', exampleTranslation: 'Chinese culture is very rich.' },
];

// Build vocabulary from lesson slides
function buildLessonVocabulary(): VocabularyItem[] {
  const existingWords = new Set(baseVocabulary.map(v => v.word));
  const items: VocabularyItem[] = [];
  let counter = 100;

  for (const lesson of lessonsData.lessons) {
    for (const entry of lesson.vocabulary) {
      if (existingWords.has(entry.word)) continue;
      existingWords.add(entry.word);

      items.push({
        id: `zh-l${lesson.lesson}-${String(counter++).padStart(3, '0')}`,
        language: 'chinese',
        word: entry.word,
        reading: entry.reading,
        meaning: entry.meaning,
        partOfSpeech: entry.partOfSpeech,
        level: lesson.title,
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

// Combined vocabulary: base HSK items + lesson-extracted items
export const chineseVocabulary: VocabularyItem[] = [
  ...baseVocabulary,
  ...lessonVocabulary,
];

// Export lesson data for flashcard decks
export const chineseLessons = lessonsData.lessons;

// Get all unique levels
export function getChineseLevels(): string[] {
  const levels = new Set(chineseVocabulary.map(v => v.level).filter(Boolean));
  return Array.from(levels) as string[];
}
