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
  classifier: string; // key into MEASURE_WORDS
}

export const MW_ITEMS: MwItem[] = [
  { noun: { hanzi: '人', pinyin: 'rén', meaning: 'person' }, classifier: '个' },
  { noun: { hanzi: '苹果', pinyin: 'píngguǒ', meaning: 'apple' }, classifier: '个' },
  { noun: { hanzi: '问题', pinyin: 'wèntí', meaning: 'question' }, classifier: '个' },
  { noun: { hanzi: '桌子', pinyin: 'zhuōzi', meaning: 'table' }, classifier: '张' },
  { noun: { hanzi: '纸', pinyin: 'zhǐ', meaning: 'paper' }, classifier: '张' },
  { noun: { hanzi: '票', pinyin: 'piào', meaning: 'ticket' }, classifier: '张' },
  { noun: { hanzi: '床', pinyin: 'chuáng', meaning: 'bed' }, classifier: '张' },
  { noun: { hanzi: '照片', pinyin: 'zhàopiàn', meaning: 'photo' }, classifier: '张' },
  { noun: { hanzi: '河', pinyin: 'hé', meaning: 'river' }, classifier: '条' },
  { noun: { hanzi: '路', pinyin: 'lù', meaning: 'road' }, classifier: '条' },
  { noun: { hanzi: '鱼', pinyin: 'yú', meaning: 'fish' }, classifier: '条' },
  { noun: { hanzi: '狗', pinyin: 'gǒu', meaning: 'dog' }, classifier: '条' },
  { noun: { hanzi: '裤子', pinyin: 'kùzi', meaning: 'trousers' }, classifier: '条' },
  { noun: { hanzi: '猫', pinyin: 'māo', meaning: 'cat' }, classifier: '只' },
  { noun: { hanzi: '鸟', pinyin: 'niǎo', meaning: 'bird' }, classifier: '只' },
  { noun: { hanzi: '书', pinyin: 'shū', meaning: 'book' }, classifier: '本' },
  { noun: { hanzi: '杂志', pinyin: 'zázhì', meaning: 'magazine' }, classifier: '本' },
  { noun: { hanzi: '水', pinyin: 'shuǐ', meaning: 'water' }, classifier: '杯' },
  { noun: { hanzi: '茶', pinyin: 'chá', meaning: 'tea' }, classifier: '杯' },
  { noun: { hanzi: '咖啡', pinyin: 'kāfēi', meaning: 'coffee' }, classifier: '杯' },
  { noun: { hanzi: '啤酒', pinyin: 'píjiǔ', meaning: 'beer' }, classifier: '瓶' },
  { noun: { hanzi: '衣服', pinyin: 'yīfu', meaning: 'clothes' }, classifier: '件' },
  { noun: { hanzi: '事', pinyin: 'shì', meaning: 'matter / affair' }, classifier: '件' },
  { noun: { hanzi: '笔', pinyin: 'bǐ', meaning: 'pen' }, classifier: '支' },
  { noun: { hanzi: '车', pinyin: 'chē', meaning: 'car' }, classifier: '辆' },
  { noun: { hanzi: '自行车', pinyin: 'zìxíngchē', meaning: 'bicycle' }, classifier: '辆' },
  { noun: { hanzi: '鞋', pinyin: 'xié', meaning: 'shoes' }, classifier: '双' },
  { noun: { hanzi: '筷子', pinyin: 'kuàizi', meaning: 'chopsticks' }, classifier: '双' },
  { noun: { hanzi: '伞', pinyin: 'sǎn', meaning: 'umbrella' }, classifier: '把' },
  { noun: { hanzi: '椅子', pinyin: 'yǐzi', meaning: 'chair' }, classifier: '把' },
  { noun: { hanzi: '刀', pinyin: 'dāo', meaning: 'knife' }, classifier: '把' },
  { noun: { hanzi: '公司', pinyin: 'gōngsī', meaning: 'company' }, classifier: '家' },
  { noun: { hanzi: '商店', pinyin: 'shāngdiàn', meaning: 'shop' }, classifier: '家' },
  { noun: { hanzi: '饭馆', pinyin: 'fànguǎn', meaning: 'restaurant' }, classifier: '家' },
  { noun: { hanzi: '老师', pinyin: 'lǎoshī', meaning: 'teacher' }, classifier: '位' },
  { noun: { hanzi: '山', pinyin: 'shān', meaning: 'mountain' }, classifier: '座' },
  { noun: { hanzi: '桥', pinyin: 'qiáo', meaning: 'bridge' }, classifier: '座' },
  { noun: { hanzi: '牛', pinyin: 'niú', meaning: 'cow / ox' }, classifier: '头' },
  { noun: { hanzi: '饭', pinyin: 'fàn', meaning: 'rice / meal' }, classifier: '碗' },
  { noun: { hanzi: '蛋糕', pinyin: 'dàngāo', meaning: 'cake' }, classifier: '块' },
];
