/**
 * Mandarin measure words (classifiers). Chinese requires a classifier between a
 * number/demonstrative and a noun (一 **张** 桌子) — a category with no English
 * analog and a classic beginner gap. This data powers a dedicated drill.
 */

export interface MeasureWord {
  hanzi: string;
  pinyin: string;
  gloss: string; // what kind of noun it counts
}

// Pool of common classifiers, keyed by character (also the distractor pool).
export const MEASURE_WORDS: Record<string, MeasureWord> = {
  个: { hanzi: '个', pinyin: 'gè', gloss: 'general / people & objects' },
  张: { hanzi: '张', pinyin: 'zhāng', gloss: 'flat things' },
  条: { hanzi: '条', pinyin: 'tiáo', gloss: 'long, thin things' },
  只: { hanzi: '只', pinyin: 'zhī', gloss: 'animals' },
  本: { hanzi: '本', pinyin: 'běn', gloss: 'bound volumes' },
  杯: { hanzi: '杯', pinyin: 'bēi', gloss: 'cups of' },
  瓶: { hanzi: '瓶', pinyin: 'píng', gloss: 'bottles of' },
  件: { hanzi: '件', pinyin: 'jiàn', gloss: 'clothing / matters' },
  支: { hanzi: '支', pinyin: 'zhī', gloss: 'pens & stick-like things' },
  辆: { hanzi: '辆', pinyin: 'liàng', gloss: 'vehicles' },
  双: { hanzi: '双', pinyin: 'shuāng', gloss: 'pairs' },
  把: { hanzi: '把', pinyin: 'bǎ', gloss: 'things with a handle' },
  家: { hanzi: '家', pinyin: 'jiā', gloss: 'businesses & establishments' },
  位: { hanzi: '位', pinyin: 'wèi', gloss: 'people (polite)' },
  名: { hanzi: '名', pinyin: 'míng', gloss: 'people (jobs & roles)' },
  座: { hanzi: '座', pinyin: 'zuò', gloss: 'large structures' },
  块: { hanzi: '块', pinyin: 'kuài', gloss: 'chunks / pieces' },
  碗: { hanzi: '碗', pinyin: 'wǎn', gloss: 'bowls of' },
  头: { hanzi: '头', pinyin: 'tóu', gloss: 'large livestock' },
};

export interface Noun {
  hanzi: string;
  pinyin: string;
  meaning: string;
}

export interface MwItem {
  noun: Noun;
  /**
   * Every classifier (key into MEASURE_WORDS) that is correct for this noun,
   * the one to teach first leading. The drill accepts any of them.
   */
  classifiers: string[];
}

/**
 * Containers can usually swap for one another (一杯水, 一瓶水, 一碗水), so for a
 * noun counted by one of them the others are never offered as wrong answers.
 */
const CONTAINERS = ['杯', '瓶', '碗'];

/**
 * 个 stands in for many classifiers in everyday speech (一个狗, 一个车), so it
 * is only a distractor where it is plainly wrong. See `geIsWrong`.
 */
export const GENERAL = '个';

/** Taught classifiers whose nouns never take 个: pairs, containers, books, flat things, money. */
const GE_WRONG_AFTER = new Set(['双', '杯', '瓶', '碗', '本', '张', '块']);

/** True when 个 is clearly wrong for this noun, so it may be offered as a distractor. */
export function geIsWrong(item: MwItem): boolean {
  return GE_WRONG_AFTER.has(item.classifiers[0]) && !item.classifiers.includes(GENERAL);
}

/** Classifiers that are certainly wrong for this noun, so safe as distractors (never 个). */
export function distractorPool(item: MwItem): string[] {
  const blocked = new Set([...item.classifiers, GENERAL]);
  if (item.classifiers.some((c) => CONTAINERS.includes(c))) {
    for (const c of CONTAINERS) blocked.add(c);
  }
  return Object.keys(MEASURE_WORDS).filter((k) => !blocked.has(k));
}

export const MW_ITEMS: MwItem[] = [
  { noun: { hanzi: '人', pinyin: 'rén', meaning: 'person' }, classifiers: ['个'] },
  { noun: { hanzi: '苹果', pinyin: 'píngguǒ', meaning: 'apple' }, classifiers: ['个'] },
  { noun: { hanzi: '问题', pinyin: 'wèntí', meaning: 'question' }, classifiers: ['个'] },
  { noun: { hanzi: '桌子', pinyin: 'zhuōzi', meaning: 'table' }, classifiers: ['张'] },
  { noun: { hanzi: '纸', pinyin: 'zhǐ', meaning: 'paper' }, classifiers: ['张'] },
  { noun: { hanzi: '票', pinyin: 'piào', meaning: 'ticket' }, classifiers: ['张'] },
  { noun: { hanzi: '床', pinyin: 'chuáng', meaning: 'bed' }, classifiers: ['张'] },
  { noun: { hanzi: '照片', pinyin: 'zhàopiàn', meaning: 'photo' }, classifiers: ['张'] },
  { noun: { hanzi: '河', pinyin: 'hé', meaning: 'river' }, classifiers: ['条'] },
  { noun: { hanzi: '路', pinyin: 'lù', meaning: 'road' }, classifiers: ['条'] },
  { noun: { hanzi: '鱼', pinyin: 'yú', meaning: 'fish' }, classifiers: ['条'] },
  { noun: { hanzi: '狗', pinyin: 'gǒu', meaning: 'dog' }, classifiers: ['只', '条'] },
  { noun: { hanzi: '裤子', pinyin: 'kùzi', meaning: 'trousers' }, classifiers: ['条'] },
  { noun: { hanzi: '猫', pinyin: 'māo', meaning: 'cat' }, classifiers: ['只'] },
  { noun: { hanzi: '鸟', pinyin: 'niǎo', meaning: 'bird' }, classifiers: ['只'] },
  { noun: { hanzi: '书', pinyin: 'shū', meaning: 'book' }, classifiers: ['本'] },
  { noun: { hanzi: '杂志', pinyin: 'zázhì', meaning: 'magazine' }, classifiers: ['本'] },
  { noun: { hanzi: '水', pinyin: 'shuǐ', meaning: 'water' }, classifiers: ['杯', '瓶', '碗'] },
  { noun: { hanzi: '茶', pinyin: 'chá', meaning: 'tea' }, classifiers: ['杯', '瓶'] },
  { noun: { hanzi: '咖啡', pinyin: 'kāfēi', meaning: 'coffee' }, classifiers: ['杯', '瓶', '个'] },
  { noun: { hanzi: '啤酒', pinyin: 'píjiǔ', meaning: 'beer' }, classifiers: ['瓶', '杯'] },
  { noun: { hanzi: '衣服', pinyin: 'yīfu', meaning: 'clothes' }, classifiers: ['件'] },
  { noun: { hanzi: '事', pinyin: 'shì', meaning: 'matter / affair' }, classifiers: ['件'] },
  { noun: { hanzi: '笔', pinyin: 'bǐ', meaning: 'pen' }, classifiers: ['支'] },
  { noun: { hanzi: '车', pinyin: 'chē', meaning: 'car' }, classifiers: ['辆'] },
  { noun: { hanzi: '自行车', pinyin: 'zìxíngchē', meaning: 'bicycle' }, classifiers: ['辆'] },
  { noun: { hanzi: '鞋', pinyin: 'xié', meaning: 'shoes' }, classifiers: ['双', '只'] },
  { noun: { hanzi: '筷子', pinyin: 'kuàizi', meaning: 'chopsticks' }, classifiers: ['双'] },
  { noun: { hanzi: '伞', pinyin: 'sǎn', meaning: 'umbrella' }, classifiers: ['把'] },
  { noun: { hanzi: '椅子', pinyin: 'yǐzi', meaning: 'chair' }, classifiers: ['把'] },
  { noun: { hanzi: '刀', pinyin: 'dāo', meaning: 'knife' }, classifiers: ['把'] },
  { noun: { hanzi: '公司', pinyin: 'gōngsī', meaning: 'company' }, classifiers: ['家', '个'] },
  { noun: { hanzi: '商店', pinyin: 'shāngdiàn', meaning: 'shop' }, classifiers: ['家', '个'] },
  { noun: { hanzi: '饭馆', pinyin: 'fànguǎn', meaning: 'restaurant' }, classifiers: ['家', '个'] },
  {
    noun: { hanzi: '老师', pinyin: 'lǎoshī', meaning: 'teacher' },
    classifiers: ['位', '名', '个'],
  },
  { noun: { hanzi: '山', pinyin: 'shān', meaning: 'mountain' }, classifiers: ['座'] },
  { noun: { hanzi: '桥', pinyin: 'qiáo', meaning: 'bridge' }, classifiers: ['座', '条'] },
  { noun: { hanzi: '牛', pinyin: 'niú', meaning: 'cow / ox' }, classifiers: ['头'] },
  { noun: { hanzi: '饭', pinyin: 'fàn', meaning: 'rice / meal' }, classifiers: ['碗'] },
  { noun: { hanzi: '蛋糕', pinyin: 'dàngāo', meaning: 'cake' }, classifiers: ['块', '个'] },
];
