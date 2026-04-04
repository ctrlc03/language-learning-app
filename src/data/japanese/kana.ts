/**
 * Complete hiragana and katakana character sets for practice.
 */

export interface KanaChar {
  kana: string;
  romaji: string;
  group: string; // vowel row grouping
}

export interface KanaSet {
  name: 'hiragana' | 'katakana';
  label: string;
  characters: KanaChar[];
}

// --- Hiragana ---

const hiraganaBase: KanaChar[] = [
  // Vowels
  { kana: 'あ', romaji: 'a', group: 'vowels' },
  { kana: 'い', romaji: 'i', group: 'vowels' },
  { kana: 'う', romaji: 'u', group: 'vowels' },
  { kana: 'え', romaji: 'e', group: 'vowels' },
  { kana: 'お', romaji: 'o', group: 'vowels' },
  // K-row
  { kana: 'か', romaji: 'ka', group: 'k' },
  { kana: 'き', romaji: 'ki', group: 'k' },
  { kana: 'く', romaji: 'ku', group: 'k' },
  { kana: 'け', romaji: 'ke', group: 'k' },
  { kana: 'こ', romaji: 'ko', group: 'k' },
  // S-row
  { kana: 'さ', romaji: 'sa', group: 's' },
  { kana: 'し', romaji: 'shi', group: 's' },
  { kana: 'す', romaji: 'su', group: 's' },
  { kana: 'せ', romaji: 'se', group: 's' },
  { kana: 'そ', romaji: 'so', group: 's' },
  // T-row
  { kana: 'た', romaji: 'ta', group: 't' },
  { kana: 'ち', romaji: 'chi', group: 't' },
  { kana: 'つ', romaji: 'tsu', group: 't' },
  { kana: 'て', romaji: 'te', group: 't' },
  { kana: 'と', romaji: 'to', group: 't' },
  // N-row
  { kana: 'な', romaji: 'na', group: 'n' },
  { kana: 'に', romaji: 'ni', group: 'n' },
  { kana: 'ぬ', romaji: 'nu', group: 'n' },
  { kana: 'ね', romaji: 'ne', group: 'n' },
  { kana: 'の', romaji: 'no', group: 'n' },
  // H-row
  { kana: 'は', romaji: 'ha', group: 'h' },
  { kana: 'ひ', romaji: 'hi', group: 'h' },
  { kana: 'ふ', romaji: 'fu', group: 'h' },
  { kana: 'へ', romaji: 'he', group: 'h' },
  { kana: 'ほ', romaji: 'ho', group: 'h' },
  // M-row
  { kana: 'ま', romaji: 'ma', group: 'm' },
  { kana: 'み', romaji: 'mi', group: 'm' },
  { kana: 'む', romaji: 'mu', group: 'm' },
  { kana: 'め', romaji: 'me', group: 'm' },
  { kana: 'も', romaji: 'mo', group: 'm' },
  // Y-row
  { kana: 'や', romaji: 'ya', group: 'y' },
  { kana: 'ゆ', romaji: 'yu', group: 'y' },
  { kana: 'よ', romaji: 'yo', group: 'y' },
  // R-row
  { kana: 'ら', romaji: 'ra', group: 'r' },
  { kana: 'り', romaji: 'ri', group: 'r' },
  { kana: 'る', romaji: 'ru', group: 'r' },
  { kana: 'れ', romaji: 're', group: 'r' },
  { kana: 'ろ', romaji: 'ro', group: 'r' },
  // W-row + N
  { kana: 'わ', romaji: 'wa', group: 'w' },
  { kana: 'を', romaji: 'wo', group: 'w' },
  { kana: 'ん', romaji: 'n', group: 'w' },
];

const hiraganaDakuten: KanaChar[] = [
  // G-row (dakuten K)
  { kana: 'が', romaji: 'ga', group: 'g' },
  { kana: 'ぎ', romaji: 'gi', group: 'g' },
  { kana: 'ぐ', romaji: 'gu', group: 'g' },
  { kana: 'げ', romaji: 'ge', group: 'g' },
  { kana: 'ご', romaji: 'go', group: 'g' },
  // Z-row (dakuten S)
  { kana: 'ざ', romaji: 'za', group: 'z' },
  { kana: 'じ', romaji: 'ji', group: 'z' },
  { kana: 'ず', romaji: 'zu', group: 'z' },
  { kana: 'ぜ', romaji: 'ze', group: 'z' },
  { kana: 'ぞ', romaji: 'zo', group: 'z' },
  // D-row (dakuten T)
  { kana: 'だ', romaji: 'da', group: 'd' },
  { kana: 'ぢ', romaji: 'ji', group: 'd' },
  { kana: 'づ', romaji: 'zu', group: 'd' },
  { kana: 'で', romaji: 'de', group: 'd' },
  { kana: 'ど', romaji: 'do', group: 'd' },
  // B-row (dakuten H)
  { kana: 'ば', romaji: 'ba', group: 'b' },
  { kana: 'び', romaji: 'bi', group: 'b' },
  { kana: 'ぶ', romaji: 'bu', group: 'b' },
  { kana: 'べ', romaji: 'be', group: 'b' },
  { kana: 'ぼ', romaji: 'bo', group: 'b' },
  // P-row (handakuten H)
  { kana: 'ぱ', romaji: 'pa', group: 'p' },
  { kana: 'ぴ', romaji: 'pi', group: 'p' },
  { kana: 'ぷ', romaji: 'pu', group: 'p' },
  { kana: 'ぺ', romaji: 'pe', group: 'p' },
  { kana: 'ぽ', romaji: 'po', group: 'p' },
];

const hiraganaCombos: KanaChar[] = [
  // K-combos
  { kana: 'きゃ', romaji: 'kya', group: 'k-combo' },
  { kana: 'きゅ', romaji: 'kyu', group: 'k-combo' },
  { kana: 'きょ', romaji: 'kyo', group: 'k-combo' },
  // S-combos
  { kana: 'しゃ', romaji: 'sha', group: 's-combo' },
  { kana: 'しゅ', romaji: 'shu', group: 's-combo' },
  { kana: 'しょ', romaji: 'sho', group: 's-combo' },
  // T-combos
  { kana: 'ちゃ', romaji: 'cha', group: 't-combo' },
  { kana: 'ちゅ', romaji: 'chu', group: 't-combo' },
  { kana: 'ちょ', romaji: 'cho', group: 't-combo' },
  // N-combos
  { kana: 'にゃ', romaji: 'nya', group: 'n-combo' },
  { kana: 'にゅ', romaji: 'nyu', group: 'n-combo' },
  { kana: 'にょ', romaji: 'nyo', group: 'n-combo' },
  // H-combos
  { kana: 'ひゃ', romaji: 'hya', group: 'h-combo' },
  { kana: 'ひゅ', romaji: 'hyu', group: 'h-combo' },
  { kana: 'ひょ', romaji: 'hyo', group: 'h-combo' },
  // M-combos
  { kana: 'みゃ', romaji: 'mya', group: 'm-combo' },
  { kana: 'みゅ', romaji: 'myu', group: 'm-combo' },
  { kana: 'みょ', romaji: 'myo', group: 'm-combo' },
  // R-combos
  { kana: 'りゃ', romaji: 'rya', group: 'r-combo' },
  { kana: 'りゅ', romaji: 'ryu', group: 'r-combo' },
  { kana: 'りょ', romaji: 'ryo', group: 'r-combo' },
  // G-combos
  { kana: 'ぎゃ', romaji: 'gya', group: 'g-combo' },
  { kana: 'ぎゅ', romaji: 'gyu', group: 'g-combo' },
  { kana: 'ぎょ', romaji: 'gyo', group: 'g-combo' },
  // J-combos
  { kana: 'じゃ', romaji: 'ja', group: 'j-combo' },
  { kana: 'じゅ', romaji: 'ju', group: 'j-combo' },
  { kana: 'じょ', romaji: 'jo', group: 'j-combo' },
  // B-combos
  { kana: 'びゃ', romaji: 'bya', group: 'b-combo' },
  { kana: 'びゅ', romaji: 'byu', group: 'b-combo' },
  { kana: 'びょ', romaji: 'byo', group: 'b-combo' },
  // P-combos
  { kana: 'ぴゃ', romaji: 'pya', group: 'p-combo' },
  { kana: 'ぴゅ', romaji: 'pyu', group: 'p-combo' },
  { kana: 'ぴょ', romaji: 'pyo', group: 'p-combo' },
];

// --- Katakana ---

const katakanaBase: KanaChar[] = [
  // Vowels
  { kana: 'ア', romaji: 'a', group: 'vowels' },
  { kana: 'イ', romaji: 'i', group: 'vowels' },
  { kana: 'ウ', romaji: 'u', group: 'vowels' },
  { kana: 'エ', romaji: 'e', group: 'vowels' },
  { kana: 'オ', romaji: 'o', group: 'vowels' },
  // K-row
  { kana: 'カ', romaji: 'ka', group: 'k' },
  { kana: 'キ', romaji: 'ki', group: 'k' },
  { kana: 'ク', romaji: 'ku', group: 'k' },
  { kana: 'ケ', romaji: 'ke', group: 'k' },
  { kana: 'コ', romaji: 'ko', group: 'k' },
  // S-row
  { kana: 'サ', romaji: 'sa', group: 's' },
  { kana: 'シ', romaji: 'shi', group: 's' },
  { kana: 'ス', romaji: 'su', group: 's' },
  { kana: 'セ', romaji: 'se', group: 's' },
  { kana: 'ソ', romaji: 'so', group: 's' },
  // T-row
  { kana: 'タ', romaji: 'ta', group: 't' },
  { kana: 'チ', romaji: 'chi', group: 't' },
  { kana: 'ツ', romaji: 'tsu', group: 't' },
  { kana: 'テ', romaji: 'te', group: 't' },
  { kana: 'ト', romaji: 'to', group: 't' },
  // N-row
  { kana: 'ナ', romaji: 'na', group: 'n' },
  { kana: 'ニ', romaji: 'ni', group: 'n' },
  { kana: 'ヌ', romaji: 'nu', group: 'n' },
  { kana: 'ネ', romaji: 'ne', group: 'n' },
  { kana: 'ノ', romaji: 'no', group: 'n' },
  // H-row
  { kana: 'ハ', romaji: 'ha', group: 'h' },
  { kana: 'ヒ', romaji: 'hi', group: 'h' },
  { kana: 'フ', romaji: 'fu', group: 'h' },
  { kana: 'ヘ', romaji: 'he', group: 'h' },
  { kana: 'ホ', romaji: 'ho', group: 'h' },
  // M-row
  { kana: 'マ', romaji: 'ma', group: 'm' },
  { kana: 'ミ', romaji: 'mi', group: 'm' },
  { kana: 'ム', romaji: 'mu', group: 'm' },
  { kana: 'メ', romaji: 'me', group: 'm' },
  { kana: 'モ', romaji: 'mo', group: 'm' },
  // Y-row
  { kana: 'ヤ', romaji: 'ya', group: 'y' },
  { kana: 'ユ', romaji: 'yu', group: 'y' },
  { kana: 'ヨ', romaji: 'yo', group: 'y' },
  // R-row
  { kana: 'ラ', romaji: 'ra', group: 'r' },
  { kana: 'リ', romaji: 'ri', group: 'r' },
  { kana: 'ル', romaji: 'ru', group: 'r' },
  { kana: 'レ', romaji: 're', group: 'r' },
  { kana: 'ロ', romaji: 'ro', group: 'r' },
  // W-row + N
  { kana: 'ワ', romaji: 'wa', group: 'w' },
  { kana: 'ヲ', romaji: 'wo', group: 'w' },
  { kana: 'ン', romaji: 'n', group: 'w' },
];

const katakanaDakuten: KanaChar[] = [
  // G-row
  { kana: 'ガ', romaji: 'ga', group: 'g' },
  { kana: 'ギ', romaji: 'gi', group: 'g' },
  { kana: 'グ', romaji: 'gu', group: 'g' },
  { kana: 'ゲ', romaji: 'ge', group: 'g' },
  { kana: 'ゴ', romaji: 'go', group: 'g' },
  // Z-row
  { kana: 'ザ', romaji: 'za', group: 'z' },
  { kana: 'ジ', romaji: 'ji', group: 'z' },
  { kana: 'ズ', romaji: 'zu', group: 'z' },
  { kana: 'ゼ', romaji: 'ze', group: 'z' },
  { kana: 'ゾ', romaji: 'zo', group: 'z' },
  // D-row
  { kana: 'ダ', romaji: 'da', group: 'd' },
  { kana: 'ヂ', romaji: 'ji', group: 'd' },
  { kana: 'ヅ', romaji: 'zu', group: 'd' },
  { kana: 'デ', romaji: 'de', group: 'd' },
  { kana: 'ド', romaji: 'do', group: 'd' },
  // B-row
  { kana: 'バ', romaji: 'ba', group: 'b' },
  { kana: 'ビ', romaji: 'bi', group: 'b' },
  { kana: 'ブ', romaji: 'bu', group: 'b' },
  { kana: 'ベ', romaji: 'be', group: 'b' },
  { kana: 'ボ', romaji: 'bo', group: 'b' },
  // P-row
  { kana: 'パ', romaji: 'pa', group: 'p' },
  { kana: 'ピ', romaji: 'pi', group: 'p' },
  { kana: 'プ', romaji: 'pu', group: 'p' },
  { kana: 'ペ', romaji: 'pe', group: 'p' },
  { kana: 'ポ', romaji: 'po', group: 'p' },
];

const katakanaCombos: KanaChar[] = [
  { kana: 'キャ', romaji: 'kya', group: 'k-combo' },
  { kana: 'キュ', romaji: 'kyu', group: 'k-combo' },
  { kana: 'キョ', romaji: 'kyo', group: 'k-combo' },
  { kana: 'シャ', romaji: 'sha', group: 's-combo' },
  { kana: 'シュ', romaji: 'shu', group: 's-combo' },
  { kana: 'ショ', romaji: 'sho', group: 's-combo' },
  { kana: 'チャ', romaji: 'cha', group: 't-combo' },
  { kana: 'チュ', romaji: 'chu', group: 't-combo' },
  { kana: 'チョ', romaji: 'cho', group: 't-combo' },
  { kana: 'ニャ', romaji: 'nya', group: 'n-combo' },
  { kana: 'ニュ', romaji: 'nyu', group: 'n-combo' },
  { kana: 'ニョ', romaji: 'nyo', group: 'n-combo' },
  { kana: 'ヒャ', romaji: 'hya', group: 'h-combo' },
  { kana: 'ヒュ', romaji: 'hyu', group: 'h-combo' },
  { kana: 'ヒョ', romaji: 'hyo', group: 'h-combo' },
  { kana: 'ミャ', romaji: 'mya', group: 'm-combo' },
  { kana: 'ミュ', romaji: 'myu', group: 'm-combo' },
  { kana: 'ミョ', romaji: 'myo', group: 'm-combo' },
  { kana: 'リャ', romaji: 'rya', group: 'r-combo' },
  { kana: 'リュ', romaji: 'ryu', group: 'r-combo' },
  { kana: 'リョ', romaji: 'ryo', group: 'r-combo' },
  { kana: 'ギャ', romaji: 'gya', group: 'g-combo' },
  { kana: 'ギュ', romaji: 'gyu', group: 'g-combo' },
  { kana: 'ギョ', romaji: 'gyo', group: 'g-combo' },
  { kana: 'ジャ', romaji: 'ja', group: 'j-combo' },
  { kana: 'ジュ', romaji: 'ju', group: 'j-combo' },
  { kana: 'ジョ', romaji: 'jo', group: 'j-combo' },
  { kana: 'ビャ', romaji: 'bya', group: 'b-combo' },
  { kana: 'ビュ', romaji: 'byu', group: 'b-combo' },
  { kana: 'ビョ', romaji: 'byo', group: 'b-combo' },
  { kana: 'ピャ', romaji: 'pya', group: 'p-combo' },
  { kana: 'ピュ', romaji: 'pyu', group: 'p-combo' },
  { kana: 'ピョ', romaji: 'pyo', group: 'p-combo' },
];

export const hiragana: KanaSet = {
  name: 'hiragana',
  label: 'ひらがな',
  characters: [...hiraganaBase, ...hiraganaDakuten, ...hiraganaCombos],
};

export const katakana: KanaSet = {
  name: 'katakana',
  label: 'カタカナ',
  characters: [...katakanaBase, ...katakanaDakuten, ...katakanaCombos],
};

// Hiragana ↔ Katakana pairs (base + dakuten only, same index)
export const kanaPairs = hiraganaBase.map((h, i) => ({
  hiragana: h.kana,
  katakana: katakanaBase[i].kana,
  romaji: h.romaji,
  group: h.group,
}));

export const kanaGroupLabels: Record<string, string> = {
  vowels: 'Vowels (あ行)',
  k: 'K-row (か行)',
  s: 'S-row (さ行)',
  t: 'T-row (た行)',
  n: 'N-row (な行)',
  h: 'H-row (は行)',
  m: 'M-row (ま行)',
  y: 'Y-row (や行)',
  r: 'R-row (ら行)',
  w: 'W-row (わ行)',
  g: 'G-row (が行)',
  z: 'Z-row (ざ行)',
  d: 'D-row (だ行)',
  b: 'B-row (ば行)',
  p: 'P-row (ぱ行)',
  'k-combo': 'K-combos (きゃ)',
  's-combo': 'S-combos (しゃ)',
  't-combo': 'T-combos (ちゃ)',
  'n-combo': 'N-combos (にゃ)',
  'h-combo': 'H-combos (ひゃ)',
  'm-combo': 'M-combos (みゃ)',
  'r-combo': 'R-combos (りゃ)',
  'g-combo': 'G-combos (ぎゃ)',
  'j-combo': 'J-combos (じゃ)',
  'b-combo': 'B-combos (びゃ)',
  'p-combo': 'P-combos (ぴゃ)',
};
