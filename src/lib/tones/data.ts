/**
 * Mandarin tone reference data + curated minimal-pair groups.
 *
 * Tones are the #1 beginner plateau: the app previously only *displayed* tone
 * marks, which trains reading but not hearing or producing them. This data
 * powers dedicated tone-discrimination drills.
 */

export type ToneNumber = 1 | 2 | 3 | 4 | 5; // 5 = neutral (轻声)

export interface ToneInfo {
  number: ToneNumber;
  name: string;
  mark: string; // combining-free display mark
  contour: string; // plain-language shape
  color: string; // hex, standard pinyin tone-colour scheme
  example: string; // syllable illustrating the tone
}

// Widely-used pinyin tone-colour scheme (Dummitt / Dong Chinese style).
export const TONES: Record<ToneNumber, ToneInfo> = {
  1: {
    number: 1,
    name: 'First',
    mark: 'ˉ',
    contour: 'high & flat',
    color: '#d81e06',
    example: 'mā 妈',
  },
  2: {
    number: 2,
    name: 'Second',
    mark: 'ˊ',
    contour: 'rising',
    color: '#f59e0b',
    example: 'má 麻',
  },
  3: {
    number: 3,
    name: 'Third',
    mark: 'ˇ',
    contour: 'dipping',
    color: '#16a34a',
    example: 'mǎ 马',
  },
  4: {
    number: 4,
    name: 'Fourth',
    mark: 'ˋ',
    contour: 'sharp falling',
    color: '#2563eb',
    example: 'mà 骂',
  },
  5: {
    number: 5,
    name: 'Neutral',
    mark: '·',
    contour: 'light & short',
    color: '#9ca3af',
    example: 'ma 吗',
  },
};

export interface MinimalPairMember {
  tone: ToneNumber;
  hanzi: string;
  pinyin: string;
  meaning: string;
}

export interface MinimalPairGroup {
  syllable: string; // toneless base, e.g. "ma"
  members: MinimalPairMember[];
}

/**
 * Curated same-syllable groups that differ ONLY in tone. Selecting the right
 * member from audio is pure tone discrimination — the highest-value beginner
 * drill. All entries are common HSK 1–3 characters so TTS pronounces them well.
 */
export const MINIMAL_PAIRS: MinimalPairGroup[] = [
  {
    syllable: 'ma',
    members: [
      { tone: 1, hanzi: '妈', pinyin: 'mā', meaning: 'mother' },
      { tone: 2, hanzi: '麻', pinyin: 'má', meaning: 'hemp / numb' },
      { tone: 3, hanzi: '马', pinyin: 'mǎ', meaning: 'horse' },
      { tone: 4, hanzi: '骂', pinyin: 'mà', meaning: 'to scold' },
    ],
  },
  {
    syllable: 'mai',
    members: [
      { tone: 3, hanzi: '买', pinyin: 'mǎi', meaning: 'to buy' },
      { tone: 4, hanzi: '卖', pinyin: 'mài', meaning: 'to sell' },
    ],
  },
  {
    syllable: 'tang',
    members: [
      { tone: 1, hanzi: '汤', pinyin: 'tāng', meaning: 'soup' },
      { tone: 2, hanzi: '糖', pinyin: 'táng', meaning: 'sugar' },
      { tone: 3, hanzi: '躺', pinyin: 'tǎng', meaning: 'to lie down' },
      { tone: 4, hanzi: '烫', pinyin: 'tàng', meaning: 'scalding hot' },
    ],
  },
  {
    syllable: 'shui',
    members: [
      { tone: 3, hanzi: '水', pinyin: 'shuǐ', meaning: 'water' },
      { tone: 4, hanzi: '睡', pinyin: 'shuì', meaning: 'to sleep' },
    ],
  },
  {
    syllable: 'wen',
    members: [
      { tone: 2, hanzi: '闻', pinyin: 'wén', meaning: 'to smell' },
      { tone: 4, hanzi: '问', pinyin: 'wèn', meaning: 'to ask' },
    ],
  },
  {
    syllable: 'yan',
    members: [
      { tone: 1, hanzi: '烟', pinyin: 'yān', meaning: 'smoke / cigarette' },
      { tone: 2, hanzi: '盐', pinyin: 'yán', meaning: 'salt' },
      { tone: 3, hanzi: '眼', pinyin: 'yǎn', meaning: 'eye' },
      { tone: 4, hanzi: '燕', pinyin: 'yàn', meaning: 'swallow (bird)' },
    ],
  },
  {
    syllable: 'gou',
    members: [
      { tone: 3, hanzi: '狗', pinyin: 'gǒu', meaning: 'dog' },
      { tone: 4, hanzi: '够', pinyin: 'gòu', meaning: 'enough' },
    ],
  },
  {
    syllable: 'cha',
    members: [
      { tone: 2, hanzi: '茶', pinyin: 'chá', meaning: 'tea' },
      { tone: 4, hanzi: '差', pinyin: 'chà', meaning: 'poor / lacking' },
    ],
  },
  {
    syllable: 'hao',
    members: [
      { tone: 3, hanzi: '好', pinyin: 'hǎo', meaning: 'good' },
      { tone: 4, hanzi: '号', pinyin: 'hào', meaning: 'number / date' },
    ],
  },
  {
    syllable: 'bai',
    members: [
      { tone: 2, hanzi: '白', pinyin: 'bái', meaning: 'white' },
      { tone: 3, hanzi: '百', pinyin: 'bǎi', meaning: 'hundred' },
      { tone: 4, hanzi: '拜', pinyin: 'bài', meaning: 'to pay respect' },
    ],
  },
  {
    syllable: 'shu',
    members: [
      { tone: 1, hanzi: '书', pinyin: 'shū', meaning: 'book' },
      { tone: 3, hanzi: '鼠', pinyin: 'shǔ', meaning: 'rat / mouse' },
      { tone: 4, hanzi: '树', pinyin: 'shù', meaning: 'tree' },
    ],
  },
  {
    syllable: 'xi',
    members: [
      { tone: 1, hanzi: '西', pinyin: 'xī', meaning: 'west' },
      { tone: 3, hanzi: '洗', pinyin: 'xǐ', meaning: 'to wash' },
      { tone: 4, hanzi: '系', pinyin: 'xì', meaning: 'system / dept.' },
    ],
  },
  {
    syllable: 'tian',
    members: [
      { tone: 1, hanzi: '天', pinyin: 'tiān', meaning: 'sky / day' },
      { tone: 2, hanzi: '田', pinyin: 'tián', meaning: 'field' },
      { tone: 3, hanzi: '舔', pinyin: 'tiǎn', meaning: 'to lick' },
    ],
  },
  {
    syllable: 'wan',
    members: [
      { tone: 2, hanzi: '完', pinyin: 'wán', meaning: 'to finish' },
      { tone: 3, hanzi: '碗', pinyin: 'wǎn', meaning: 'bowl' },
      { tone: 4, hanzi: '万', pinyin: 'wàn', meaning: 'ten thousand' },
    ],
  },
];
