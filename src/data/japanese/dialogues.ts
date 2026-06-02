/**
 * Japanese dialogues sourced from the official Irodori Starter course
 * (Japan Foundation), scraped from the lesson PDFs' 聴解スクリプト transcripts.
 * The Japanese is the real Irodori dialogue text; per-kanji furigana, English
 * translations, and comprehension questions are added by hand.
 *
 * Each dialogue powers two exercise types:
 *   - dialogue-reading: progressive tap-to-reveal reading practice
 *   - dialogue-comprehension: read the dialogue, answer a multiple-choice question
 *
 * `furigana` holds per-kanji ruby segments whose `t` values concatenate to
 * `text`; the line reading is derived from them (no separate `reading` field).
 */

import type { FuriSegment } from '@/types';

export interface JapaneseDialogueLine {
  speaker: string;
  text: string;            // real Irodori Japanese (kanji + kana)
  furigana: FuriSegment[]; // per-kanji ruby segments (concatenate to `text`)
  translation: string;
}

export interface JapaneseDialogueQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface JapaneseDialogue {
  id: string;
  title: string;
  titleJapanese: string;
  setting: string;
  level: string;
  lesson: number;
  lines: JapaneseDialogueLine[];
  questions: JapaneseDialogueQuestion[];
}

export const japaneseDialogues: JapaneseDialogue[] = [
  {
    id: 'ja-iro-s02',
    title: 'How do you say it in Japanese?',
    titleJapanese: 'これは日本語で何と言いますか？',
    setting: 'Someone asks how to say an English word in Japanese.',
    level: 'Irodori Starter',
    lesson: 2,
    lines: [
      { speaker: 'A', text: '「Mosquito」は、日本語で何ですか？', furigana: [{ t: '「Mosquito」は、' }, { t: '日本語', r: 'にほんご' }, { t: 'で' }, { t: '何', r: 'なに' }, { t: 'ですか？' }], translation: 'How do you say "Mosquito" in Japanese?' },
      { speaker: 'B', text: '蚊です。', furigana: [{ t: '蚊', r: 'か' }, { t: 'です。' }], translation: 'It\'s "ka" (蚊).' },
      { speaker: 'A', text: 'え？', furigana: [{ t: 'え？' }], translation: 'Huh?' },
      { speaker: 'B', text: '「か」です。', furigana: [{ t: '「か」です。' }], translation: 'It\'s "ka".' },
      { speaker: 'A', text: 'か？', furigana: [{ t: 'か？' }], translation: 'Ka?' },
      { speaker: 'B', text: 'そうそう。', furigana: [{ t: 'そうそう。' }], translation: 'Yes, that\'s right.' },
    ],
    questions: [
      { question: 'What word is A asking about?', options: ['Mosquito', 'Dog', 'Fish', 'Bird'], correctIndex: 0, explanation: 'A asks how to say "Mosquito" → 蚊（か）.' },
      { question: 'How do you say it in Japanese?', options: ['か (ka)', 'いぬ (inu)', 'さかな (sakana)', 'とり (tori)'], correctIndex: 0, explanation: '蚊 is read か.' },
    ],
  },
  {
    id: 'ja-iro-s04',
    title: "My pet John",
    titleJapanese: 'ペットのジョンです',
    setting: 'Two people talk about a pet dog.',
    level: 'Irodori Starter',
    lesson: 4,
    lines: [
      { speaker: 'A', text: 'あ、犬。かわいいですね。', furigana: [{ t: 'あ、' }, { t: '犬', r: 'いぬ' }, { t: '。かわいいですね。' }], translation: 'Oh, a dog. It\'s cute.' },
      { speaker: 'B', text: 'ありがとう。ペットのジョンです。', furigana: [{ t: 'ありがとう。ペットのジョンです。' }], translation: 'Thanks. This is my pet, John.' },
      { speaker: 'A', text: 'へー、何歳ですか？', furigana: [{ t: 'へー、' }, { t: '何', r: 'なん' }, { t: '歳', r: 'さい' }, { t: 'ですか？' }], translation: 'Oh, how old is it?' },
      { speaker: 'B', text: '16歳です。', furigana: [{ t: '16' }, { t: '歳', r: 'さい' }, { t: 'です。' }], translation: 'It\'s 16 years old.' },
      { speaker: 'A', text: '16歳……。', furigana: [{ t: '16' }, { t: '歳', r: 'さい' }, { t: '……。' }], translation: '16 years old...' },
      { speaker: 'B', text: 'おじいさんです。', furigana: [{ t: 'おじいさんです。' }], translation: 'He\'s an old man.' },
    ],
    questions: [
      { question: 'What kind of pet is it?', options: ['A dog', 'A cat', 'A bird', 'A rabbit'], correctIndex: 0, explanation: '犬（いぬ）= dog.' },
      { question: 'How old is the pet?', options: ['16', '6', '60', '10'], correctIndex: 0, explanation: '16歳（さい）= 16 years old.' },
    ],
  },
  {
    id: 'ja-iro-s05',
    title: 'Favorite Japanese food',
    titleJapanese: '何が好きですか？',
    setting: 'Talking about which Japanese foods you like.',
    level: 'Irodori Starter',
    lesson: 5,
    lines: [
      { speaker: 'A', text: '日本の食べ物、何が好きですか？', furigana: [{ t: '日本', r: 'にほん' }, { t: 'の' }, { t: '食', r: 'た' }, { t: 'べ' }, { t: '物', r: 'もの' }, { t: '、' }, { t: '何', r: 'なに' }, { t: 'が' }, { t: '好', r: 'す' }, { t: 'きですか？' }], translation: 'What Japanese food do you like?' },
      { speaker: 'B', text: '天ぷらが好きです。', furigana: [{ t: '天', r: 'てん' }, { t: 'ぷらが' }, { t: '好', r: 'す' }, { t: 'きです。' }], translation: 'I like tempura.' },
      { speaker: 'A', text: '刺身は？', furigana: [{ t: '刺', r: 'さ' }, { t: '身', r: 'み' }, { t: 'は？' }], translation: 'How about sashimi?' },
      { speaker: 'B', text: '刺身は、ちょっと…。', furigana: [{ t: '刺', r: 'さ' }, { t: '身', r: 'み' }, { t: 'は、ちょっと…。' }], translation: 'Sashimi is... (not really).' },
    ],
    questions: [
      { question: 'What food does B like?', options: ['Tempura', 'Sushi', 'Ramen', 'Udon'], correctIndex: 0, explanation: '天ぷらが好きです = I like tempura.' },
      { question: 'How does B feel about sashimi?', options: ['Not so keen', 'Loves it', 'Never tried it', 'Allergic to it'], correctIndex: 0, explanation: '刺身は、ちょっと… politely declines.' },
    ],
  },
  {
    id: 'ja-iro-s06',
    title: 'Ordering food and drink',
    titleJapanese: '何にしますか？',
    setting: 'Deciding what to order at a restaurant.',
    level: 'Irodori Starter',
    lesson: 6,
    lines: [
      { speaker: 'A', text: '何にしますか？', furigana: [{ t: '何', r: 'なに' }, { t: 'にしますか？' }], translation: 'What will you have?' },
      { speaker: 'B', text: '私は、カレーにします。', furigana: [{ t: '私', r: 'わたし' }, { t: 'は、カレーにします。' }], translation: 'I\'ll have curry.' },
      { speaker: 'A', text: '飲み物は？', furigana: [{ t: '飲', r: 'の' }, { t: 'み' }, { t: '物', r: 'もの' }, { t: 'は？' }], translation: 'And to drink?' },
      { speaker: 'B', text: 'アイスコーヒーにします。', furigana: [{ t: 'アイスコーヒーにします。' }], translation: 'I\'ll have iced coffee.' },
    ],
    questions: [
      { question: 'What food does B order?', options: ['Curry', 'Ramen', 'Pizza', 'Rice'], correctIndex: 0, explanation: 'カレーにします = I\'ll have curry.' },
      { question: 'What does B order to drink?', options: ['Iced coffee', 'Tea', 'Water', 'Juice'], correctIndex: 0, explanation: 'アイスコーヒーにします = iced coffee.' },
    ],
  },
  {
    id: 'ja-iro-s07',
    title: "It's a bit small",
    titleJapanese: 'ちょっとせまいです',
    setting: 'Asking where someone lives and what their place is like.',
    level: 'Irodori Starter',
    lesson: 7,
    lines: [
      { speaker: 'A', text: 'オートさんは、どこに住んでいますか？', furigana: [{ t: 'オートさんは、どこに' }, { t: '住', r: 'す' }, { t: 'んでいますか？' }], translation: 'Where do you live, Oto-san?' },
      { speaker: 'B', text: '長浜に住んでいます。', furigana: [{ t: '長', r: 'なが' }, { t: '浜', r: 'はま' }, { t: 'に' }, { t: '住', r: 'す' }, { t: 'んでいます。' }], translation: 'I live in Nagahama.' },
      { speaker: 'A', text: '家はどうですか？', furigana: [{ t: '家', r: 'いえ' }, { t: 'はどうですか？' }], translation: 'How is your place?' },
      { speaker: 'B', text: 'ちょっとせまいです。', furigana: [{ t: 'ちょっとせまいです。' }], translation: 'It\'s a bit small.' },
      { speaker: 'A', text: 'そうですか。', furigana: [{ t: 'そうですか。' }], translation: 'I see.' },
    ],
    questions: [
      { question: 'Where does Oto live?', options: ['Nagahama', 'Tokyo', 'Osaka', 'Kyoto'], correctIndex: 0, explanation: '長浜（ながはま）に住んでいます.' },
      { question: 'What is the place like?', options: ['A bit small', 'Very big', 'Brand new', 'Expensive'], correctIndex: 0, explanation: 'ちょっとせまいです = a bit cramped.' },
    ],
  },
  {
    id: 'ja-iro-s08',
    title: "It's under the desk",
    titleJapanese: '机の下にあります',
    setting: 'Looking for the trash can in the room.',
    level: 'Irodori Starter',
    lesson: 8,
    lines: [
      { speaker: 'A', text: 'えーと、ごみ箱は……。', furigana: [{ t: 'えーと、ごみ' }, { t: '箱', r: 'ばこ' }, { t: 'は……。' }], translation: 'Um, the trash can is...?' },
      { speaker: 'B', text: 'あ、そこそこ。', furigana: [{ t: 'あ、そこそこ。' }], translation: 'Oh, right there.' },
      { speaker: 'A', text: 'え？', furigana: [{ t: 'え？' }], translation: 'Huh?' },
      { speaker: 'B', text: '机の下。', furigana: [{ t: '机', r: 'つくえ' }, { t: 'の' }, { t: '下', r: 'した' }, { t: '。' }], translation: 'Under the desk.' },
      { speaker: 'A', text: 'あ、ありました。', furigana: [{ t: 'あ、ありました。' }], translation: 'Oh, there it is.' },
    ],
    questions: [
      { question: 'What is A looking for?', options: ['The trash can', 'A pen', 'The door', 'A chair'], correctIndex: 0, explanation: 'ごみ箱（ばこ）= trash can.' },
      { question: 'Where is it?', options: ['Under the desk', 'On the desk', 'Behind the door', 'In the bag'], correctIndex: 0, explanation: '机（つくえ）の下（した）= under the desk.' },
    ],
  },
  {
    id: 'ja-iro-s10',
    title: 'Come to the office at 2:30',
    titleJapanese: '14時半に来てください',
    setting: 'A phone call about when to come to the office.',
    level: 'Irodori Starter',
    lesson: 10,
    lines: [
      { speaker: 'A', text: 'もしもし、リンさん。', furigana: [{ t: 'もしもし、リンさん。' }], translation: 'Hello, Rin-san.' },
      { speaker: 'B', text: 'はい。', furigana: [{ t: 'はい。' }], translation: 'Yes.' },
      { speaker: 'A', text: 'あとで、14時半に事務室に来てください。', furigana: [{ t: 'あとで、14' }, { t: '時', r: 'じ' }, { t: '半', r: 'はん' }, { t: 'に' }, { t: '事', r: 'じ' }, { t: '務', r: 'む' }, { t: '室', r: 'しつ' }, { t: 'に' }, { t: '来', r: 'き' }, { t: 'てください。' }], translation: 'Please come to the office later at 2:30.' },
      { speaker: 'B', text: 'すみません。何時ですか？', furigana: [{ t: 'すみません。' }, { t: '何', r: 'なん' }, { t: '時', r: 'じ' }, { t: 'ですか？' }], translation: 'Sorry, what time?' },
      { speaker: 'A', text: '14時半。午後2時半です。', furigana: [{ t: '14' }, { t: '時', r: 'じ' }, { t: '半', r: 'はん' }, { t: '。' }, { t: '午', r: 'ご' }, { t: '後', r: 'ご' }, { t: '2' }, { t: '時', r: 'じ' }, { t: '半', r: 'はん' }, { t: 'です。' }], translation: '2:30. 2:30 in the afternoon.' },
      { speaker: 'B', text: 'わかりました。', furigana: [{ t: 'わかりました。' }], translation: 'Understood.' },
    ],
    questions: [
      { question: 'Where should B go?', options: ['The office', 'The station', 'The cafeteria', 'Home'], correctIndex: 0, explanation: '事務室（じむしつ）= office.' },
      { question: 'What time is the appointment?', options: ['2:30 PM', '4:30 PM', '2:00 PM', '12:30'], correctIndex: 0, explanation: '14時半 = 午後2時半 = 2:30 PM.' },
    ],
  },
  {
    id: 'ja-iro-s11',
    title: "What's your hobby?",
    titleJapanese: '趣味は何ですか？',
    setting: 'Asking about someone\'s hobbies.',
    level: 'Irodori Starter',
    lesson: 11,
    lines: [
      { speaker: 'A', text: '趣味は、何ですか？', furigana: [{ t: '趣', r: 'しゅ' }, { t: '味', r: 'み' }, { t: 'は、' }, { t: '何', r: 'なん' }, { t: 'ですか？' }], translation: 'What\'s your hobby?' },
      { speaker: 'B', text: '趣味は、読書と映画です。', furigana: [{ t: '趣', r: 'しゅ' }, { t: '味', r: 'み' }, { t: 'は、' }, { t: '読', r: 'どく' }, { t: '書', r: 'しょ' }, { t: 'と' }, { t: '映', r: 'えい' }, { t: '画', r: 'が' }, { t: 'です。' }], translation: 'My hobbies are reading and movies.' },
      { speaker: 'A', text: '読書と映画、いいですね。', furigana: [{ t: '読', r: 'どく' }, { t: '書', r: 'しょ' }, { t: 'と' }, { t: '映', r: 'えい' }, { t: '画', r: 'が' }, { t: '、いいですね。' }], translation: 'Reading and movies, that\'s nice.' },
    ],
    questions: [
      { question: "What are B's hobbies?", options: ['Reading and movies', 'Sports and music', 'Cooking', 'Travel'], correctIndex: 0, explanation: '読書（どくしょ）と映画（えいが）= reading and movies.' },
      { question: 'What does 趣味 mean?', options: ['Hobby', 'Job', 'Family', 'Food'], correctIndex: 0, explanation: '趣味（しゅみ）= hobby.' },
    ],
  },
  {
    id: 'ja-iro-s12',
    title: "Let's go together",
    titleJapanese: 'いっしょに行きましょう',
    setting: 'Inviting a colleague to a movie.',
    level: 'Irodori Starter',
    lesson: 12,
    lines: [
      { speaker: 'A', text: 'アニタさん、明日の夜、さくらプラザで映画があります。', furigana: [{ t: 'アニタさん、' }, { t: '明日', r: 'あした' }, { t: 'の' }, { t: '夜', r: 'よる' }, { t: '、さくらプラザで' }, { t: '映', r: 'えい' }, { t: '画', r: 'が' }, { t: 'があります。' }], translation: 'Anita-san, there\'s a movie tomorrow night at Sakura Plaza.' },
      { speaker: 'B', text: '明日ですか？', furigana: [{ t: '明日', r: 'あした' }, { t: 'ですか？' }], translation: 'Tomorrow?' },
      { speaker: 'A', text: '「男はつらいよ」です。', furigana: [{ t: '「' }, { t: '男', r: 'おとこ' }, { t: 'はつらいよ」です。' }], translation: 'It\'s "Otoko wa Tsurai yo".' },
      { speaker: 'B', text: 'ふーん。何時からですか？', furigana: [{ t: 'ふーん。' }, { t: '何', r: 'なん' }, { t: '時', r: 'じ' }, { t: 'からですか？' }], translation: 'Hmm. What time does it start?' },
      { speaker: 'A', text: '7時半からです。', furigana: [{ t: '7' }, { t: '時', r: 'じ' }, { t: '半', r: 'はん' }, { t: 'からです。' }], translation: 'It starts at 7:30.' },
      { speaker: 'B', text: '7時半、だいじょうぶです。', furigana: [{ t: '7' }, { t: '時', r: 'じ' }, { t: '半', r: 'はん' }, { t: '、だいじょうぶです。' }], translation: '7:30 is fine.' },
      { speaker: 'A', text: 'じゃあ、いっしょに行きましょう。', furigana: [{ t: 'じゃあ、いっしょに' }, { t: '行', r: 'い' }, { t: 'きましょう。' }], translation: 'Then let\'s go together.' },
    ],
    questions: [
      { question: 'When is the movie?', options: ['Tomorrow night', 'Tonight', 'Next week', 'This morning'], correctIndex: 0, explanation: '明日（あした）の夜（よる）= tomorrow night.' },
      { question: 'What time does it start?', options: ['7:30', '7:00', '8:30', '9:00'], correctIndex: 0, explanation: '7時半（しちじはん）からです.' },
    ],
  },
  {
    id: 'ja-iro-s13',
    title: 'This train does not stop there',
    titleJapanese: 'この電車は止まりません',
    setting: 'Checking whether a train stops at a station.',
    level: 'Irodori Starter',
    lesson: 13,
    lines: [
      { speaker: 'A', text: 'あのう、この電車は、東新宿に行きますか？', furigana: [{ t: 'あのう、この' }, { t: '電', r: 'でん' }, { t: '車', r: 'しゃ' }, { t: 'は、' }, { t: '東', r: 'ひがし' }, { t: '新', r: 'しん' }, { t: '宿', r: 'じゅく' }, { t: 'に' }, { t: '行', r: 'い' }, { t: 'きますか？' }], translation: 'Um, does this train go to Higashi-Shinjuku?' },
      { speaker: 'B', text: 'あ、これは東新宿には止まりません。快速ですから。', furigana: [{ t: 'あ、これは' }, { t: '東', r: 'ひがし' }, { t: '新', r: 'しん' }, { t: '宿', r: 'じゅく' }, { t: 'には' }, { t: '止', r: 'と' }, { t: 'まりません。' }, { t: '快', r: 'かい' }, { t: '速', r: 'そく' }, { t: 'ですから。' }], translation: 'Oh, this one doesn\'t stop at Higashi-Shinjuku. It\'s the rapid train.' },
      { speaker: 'A', text: '快速？', furigana: [{ t: '快', r: 'かい' }, { t: '速', r: 'そく' }, { t: '？' }], translation: 'Rapid?' },
      { speaker: 'B', text: '各駅停車です、次の電車。', furigana: [{ t: '各', r: 'かく' }, { t: '駅', r: 'えき' }, { t: '停', r: 'てい' }, { t: '車', r: 'しゃ' }, { t: 'です、' }, { t: '次', r: 'つぎ' }, { t: 'の' }, { t: '電', r: 'でん' }, { t: '車', r: 'しゃ' }, { t: '。' }], translation: 'The next train is the local one.' },
      { speaker: 'A', text: 'あ、はい。', furigana: [{ t: 'あ、はい。' }], translation: 'Oh, okay.' },
    ],
    questions: [
      { question: 'Where does A want to go?', options: ['Higashi-Shinjuku', 'Tokyo', 'Shibuya', 'Ueno'], correctIndex: 0, explanation: '東新宿（ひがししんじゅく）に行きますか.' },
      { question: 'Why can\'t A take this train?', options: ['It\'s the rapid and skips that stop', 'It is full', 'It is broken', 'It goes the wrong way'], correctIndex: 0, explanation: '快速（かいそく）= rapid; it doesn\'t stop there.' },
    ],
  },
  {
    id: 'ja-iro-s14',
    title: 'Where are you now?',
    titleJapanese: '今、どこですか？',
    setting: 'A phone call arranging where to meet.',
    level: 'Irodori Starter',
    lesson: 14,
    lines: [
      { speaker: 'A', text: 'もしもし。', furigana: [{ t: 'もしもし。' }], translation: 'Hello.' },
      { speaker: 'B', text: 'もしもし、リリアンさん？', furigana: [{ t: 'もしもし、リリアンさん？' }], translation: 'Hello, Lilian-san?' },
      { speaker: 'A', text: 'はい。', furigana: [{ t: 'はい。' }], translation: 'Yes.' },
      { speaker: 'B', text: '今、どこ？', furigana: [{ t: '今', r: 'いま' }, { t: '、どこ？' }], translation: 'Where are you now?' },
      { speaker: 'A', text: 'えー、今、インフォメーションの横です。', furigana: [{ t: 'えー、' }, { t: '今', r: 'いま' }, { t: '、インフォメーションの' }, { t: '横', r: 'よこ' }, { t: 'です。' }], translation: 'Um, I\'m next to the information desk now.' },
      { speaker: 'B', text: 'インフォメーションね。わかった。すぐ行く。', furigana: [{ t: 'インフォメーションね。わかった。すぐ' }, { t: '行', r: 'い' }, { t: 'く。' }], translation: 'The information desk, got it. I\'ll come right away.' },
    ],
    questions: [
      { question: 'Where is A waiting?', options: ['Next to the information desk', 'At the ticket gate', 'Outside the station', 'At a café'], correctIndex: 0, explanation: 'インフォメーションの横（よこ）= next to the information desk.' },
      { question: 'What will B do?', options: ['Come right away', 'Wait there', 'Call back later', 'Go home'], correctIndex: 0, explanation: 'すぐ行く = I\'ll come right away.' },
    ],
  },
  {
    id: 'ja-iro-s15',
    title: 'That shirt is cool!',
    titleJapanese: 'かっこいいですね',
    setting: 'Two friends comment on clothes while shopping.',
    level: 'Irodori Starter',
    lesson: 15,
    lines: [
      { speaker: 'A', text: 'この帽子、どう？', furigana: [{ t: 'この' }, { t: '帽', r: 'ぼう' }, { t: '子', r: 'し' }, { t: '、どう？' }], translation: 'How about this hat?' },
      { speaker: 'B', text: 'えー、ちょっと変ですね。', furigana: [{ t: 'えー、ちょっと' }, { t: '変', r: 'へん' }, { t: 'ですね。' }], translation: 'Hmm, it\'s a bit weird.' },
      { speaker: 'A', text: 'このシャツ、かっこいい！', furigana: [{ t: 'このシャツ、かっこいい！' }], translation: 'This shirt is cool!' },
      { speaker: 'B', text: '本当。それに、安いですね。', furigana: [{ t: '本', r: 'ほん' }, { t: '当', r: 'とう' }, { t: '。それに、' }, { t: '安', r: 'やす' }, { t: 'いですね。' }], translation: 'Really. And it\'s cheap too.' },
      { speaker: 'A', text: 'このワンピース、おしゃれ！', furigana: [{ t: 'このワンピース、おしゃれ！' }], translation: 'This dress is stylish!' },
      { speaker: 'B', text: 'ああ、いいですね。', furigana: [{ t: 'ああ、いいですね。' }], translation: 'Oh, that\'s nice.' },
    ],
    questions: [
      { question: 'What does B think of the hat?', options: ['A bit weird', 'Cute', 'Cheap', 'Cool'], correctIndex: 0, explanation: 'ちょっと変（へん）ですね = a bit weird.' },
      { question: 'What does B say about the shirt?', options: ['It\'s cheap', 'It\'s expensive', 'It\'s big', 'It\'s old'], correctIndex: 0, explanation: '安い（やすい）= cheap.' },
    ],
  },
  {
    id: 'ja-iro-s17',
    title: 'What did you do on the weekend?',
    titleJapanese: '週末は何をしましたか？',
    setting: 'Chatting about how the weekend was spent.',
    level: 'Irodori Starter',
    lesson: 17,
    lines: [
      { speaker: 'A', text: 'アンドレアさん、週末は、何をしましたか？', furigana: [{ t: 'アンドレアさん、' }, { t: '週', r: 'しゅう' }, { t: '末', r: 'まつ' }, { t: 'は、' }, { t: '何', r: 'なに' }, { t: 'をしましたか？' }], translation: 'Andrea-san, what did you do on the weekend?' },
      { speaker: 'B', text: '何もしませんでした。家でゆっくりしました。', furigana: [{ t: '何', r: 'なに' }, { t: 'もしませんでした。' }, { t: '家', r: 'いえ' }, { t: 'でゆっくりしました。' }], translation: 'I didn\'t do anything. I relaxed at home.' },
      { speaker: 'A', text: 'そうですか。', furigana: [{ t: 'そうですか。' }], translation: 'I see.' },
      { speaker: 'B', text: 'あ、ネットで、家族と話しました。', furigana: [{ t: 'あ、ネットで、' }, { t: '家', r: 'か' }, { t: '族', r: 'ぞく' }, { t: 'と' }, { t: '話', r: 'はな' }, { t: 'しました。' }], translation: 'Oh, I talked with my family online.' },
      { speaker: 'A', text: 'ああ、いいですね。', furigana: [{ t: 'ああ、いいですね。' }], translation: 'Oh, that\'s nice.' },
    ],
    questions: [
      { question: 'What did B do on the weekend?', options: ['Relaxed at home', 'Went shopping', 'Worked', 'Traveled'], correctIndex: 0, explanation: '家（いえ）でゆっくりしました = relaxed at home.' },
      { question: 'Who did B talk with online?', options: ['Family', 'Friends', 'Coworkers', 'A teacher'], correctIndex: 0, explanation: '家族（かぞく）と話しました = talked with family.' },
    ],
  },
  {
    id: 'ja-iro-s18',
    title: 'Summer vacation plans',
    titleJapanese: '夏休みの予定は？',
    setting: 'Talking about plans for the summer holidays.',
    level: 'Irodori Starter',
    lesson: 18,
    lines: [
      { speaker: 'A', text: 'もうすぐ夏休みですね。エジーニョさんはどうしますか？', furigana: [{ t: 'もうすぐ' }, { t: '夏', r: 'なつ' }, { t: '休', r: 'やす' }, { t: 'みですね。エジーニョさんはどうしますか？' }], translation: 'It\'s almost summer vacation. What are you going to do, Ejinho-san?' },
      { speaker: 'B', text: '友だちが広島に住んでいます。会いに行きたいです。', furigana: [{ t: '友', r: 'とも' }, { t: 'だちが' }, { t: '広', r: 'ひろ' }, { t: '島', r: 'しま' }, { t: 'に' }, { t: '住', r: 'す' }, { t: 'んでいます。' }, { t: '会', r: 'あ' }, { t: 'いに' }, { t: '行', r: 'い' }, { t: 'きたいです。' }], translation: 'A friend lives in Hiroshima. I want to go visit them.' },
      { speaker: 'A', text: 'へー、いいですね。', furigana: [{ t: 'へー、いいですね。' }], translation: 'Oh, that\'s nice.' },
    ],
    questions: [
      { question: "Where does B's friend live?", options: ['Hiroshima', 'Tokyo', 'Osaka', 'Nagoya'], correctIndex: 0, explanation: '広島（ひろしま）に住んでいます.' },
      { question: 'What does B want to do?', options: ['Visit the friend', 'Stay home', 'Work', 'Study'], correctIndex: 0, explanation: '会いに行きたいです = want to go and meet them.' },
    ],
  },

  // ===== Irodori Elementary 1 =====
  {
    id: 'ja-iro-e1-01',
    title: 'What do you do in Japan?',
    titleJapanese: '日本では何をしていますか？',
    setting: 'Asking a newcomer what they do in Japan.',
    level: 'Irodori Elementary 1',
    lesson: 1,
    lines: [
      { speaker: 'A', text: '日本では、何をしていますか？', furigana: [{ t: '日本', r: 'にほん' }, { t: 'では、' }, { t: '何', r: 'なに' }, { t: 'をしていますか？' }], translation: 'What do you do in Japan?' },
      { speaker: 'B', text: '学生です。専門学校に通っています。', furigana: [{ t: '学生', r: 'がくせい' }, { t: 'です。' }, { t: '専門', r: 'せんもん' }, { t: '学校', r: 'がっこう' }, { t: 'に' }, { t: '通', r: 'かよ' }, { t: 'っています。' }], translation: "I'm a student. I go to a vocational school." },
      { speaker: 'A', text: '何を勉強していますか？', furigana: [{ t: '何', r: 'なに' }, { t: 'を' }, { t: '勉強', r: 'べんきょう' }, { t: 'していますか？' }], translation: 'What are you studying?' },
      { speaker: 'B', text: 'プログラミングを勉強しています。', furigana: [{ t: 'プログラミングを' }, { t: '勉強', r: 'べんきょう' }, { t: 'しています。' }], translation: "I'm studying programming." },
    ],
    questions: [
      { question: 'What does B do in Japan?', options: ['Studies at a vocational school', 'Works at a bank', 'Teaches English', 'Runs a shop'], correctIndex: 0, explanation: '専門学校（せんもんがっこう）に通っています.' },
      { question: 'What is B studying?', options: ['Programming', 'Cooking', 'Medicine', 'Art'], correctIndex: 0, explanation: 'プログラミングを勉強しています.' },
    ],
  },
  {
    id: 'ja-iro-e1-02',
    title: 'What I like to do',
    titleJapanese: '好きなことは何ですか？',
    setting: 'Talking about what you like to do.',
    level: 'Irodori Elementary 1',
    lesson: 2,
    lines: [
      { speaker: 'A', text: '好きなことは何ですか？', furigana: [{ t: '好', r: 'す' }, { t: 'きなことは' }, { t: '何', r: 'なに' }, { t: 'ですか？' }], translation: 'What do you like to do?' },
      { speaker: 'B', text: '好きなことは、寝ることです。家でごろごろするのが好きです。', furigana: [{ t: '好', r: 'す' }, { t: 'きなことは、' }, { t: '寝', r: 'ね' }, { t: 'ることです。' }, { t: '家', r: 'いえ' }, { t: 'でごろごろするのが' }, { t: '好', r: 'す' }, { t: 'きです。' }], translation: 'What I like is sleeping. I like lazing around at home.' },
      { speaker: 'A', text: 'ああ……。', furigana: [{ t: 'ああ……。' }], translation: 'Oh...' },
    ],
    questions: [
      { question: 'What does B like to do?', options: ['Sleep and laze around at home', 'Play sports', 'Cook', 'Travel'], correctIndex: 0, explanation: '寝ること… 家でごろごろする = sleeping and lazing at home.' },
      { question: 'Where does B like to relax?', options: ['At home', 'At a park', 'At a café', 'At the office'], correctIndex: 0, explanation: '家（いえ）で = at home.' },
    ],
  },
  {
    id: 'ja-iro-e1-03',
    title: 'What seasons are there?',
    titleJapanese: 'どんな季節がありますか？',
    setting: "Asking about the seasons in someone's country.",
    level: 'Irodori Elementary 1',
    lesson: 3,
    lines: [
      { speaker: 'A', text: 'タムさんの国には、どんな季節がありますか？', furigana: [{ t: 'タムさんの' }, { t: '国', r: 'くに' }, { t: 'には、どんな' }, { t: '季節', r: 'きせつ' }, { t: 'がありますか？' }], translation: 'What seasons are there in your country, Tam-san?' },
      { speaker: 'B', text: '雨季と乾季があります。', furigana: [{ t: '雨季', r: 'うき' }, { t: 'と' }, { t: '乾季', r: 'かんき' }, { t: 'があります。' }], translation: "There's a rainy season and a dry season." },
      { speaker: 'A', text: '乾季はどうですか？', furigana: [{ t: '乾季', r: 'かんき' }, { t: 'はどうですか？' }], translation: 'What is the dry season like?' },
      { speaker: 'B', text: '乾季はとても暑いです。雨季は少しすずしいです。', furigana: [{ t: '乾季', r: 'かんき' }, { t: 'はとても' }, { t: '暑', r: 'あつ' }, { t: 'いです。' }, { t: '雨季', r: 'うき' }, { t: 'は' }, { t: '少', r: 'すこ' }, { t: 'しすずしいです。' }], translation: 'The dry season is very hot. The rainy season is a little cooler.' },
    ],
    questions: [
      { question: "What seasons does B's country have?", options: ['Rainy and dry', 'Four seasons', 'Spring and autumn', 'Winter only'], correctIndex: 0, explanation: '雨季（うき）と乾季（かんき）= rainy and dry seasons.' },
      { question: 'What is the dry season like?', options: ['Very hot', 'Cool', 'Snowy', 'Mild'], correctIndex: 0, explanation: '乾季はとても暑いです = the dry season is very hot.' },
    ],
  },
  {
    id: 'ja-iro-e1-04',
    title: "It's warm today",
    titleJapanese: '朝から暑いですね',
    setting: 'Small talk about the weather.',
    level: 'Irodori Elementary 1',
    lesson: 4,
    lines: [
      { speaker: 'A', text: '今日はいい天気ですね。', furigana: [{ t: '今日', r: 'きょう' }, { t: 'はいい' }, { t: '天気', r: 'てんき' }, { t: 'ですね。' }], translation: "It's nice weather today, isn't it?" },
      { speaker: 'B', text: 'そうですね。いい天気ですね。', furigana: [{ t: 'そうですね。いい' }, { t: '天気', r: 'てんき' }, { t: 'ですね。' }], translation: "Yes, it's nice weather." },
      { speaker: 'A', text: 'だいぶ暖かくなりましたね。', furigana: [{ t: 'だいぶ' }, { t: '暖', r: 'あたた' }, { t: 'かくなりましたね。' }], translation: "It's gotten quite warm." },
      { speaker: 'B', text: '本当ですね。', furigana: [{ t: '本当', r: 'ほんとう' }, { t: 'ですね。' }], translation: 'It really has.' },
    ],
    questions: [
      { question: 'What are they talking about?', options: ['The weather', 'Food', 'Work', 'A movie'], correctIndex: 0, explanation: 'いい天気（てんき）= nice weather.' },
      { question: 'How has the weather become?', options: ['Warmer', 'Colder', 'Rainier', 'Windier'], correctIndex: 0, explanation: '暖（あたた）かくなりました = it has become warm.' },
    ],
  },
  {
    id: 'ja-iro-e1-05',
    title: 'Recommending a place',
    titleJapanese: '不便だけどきれいですよ',
    setting: 'Asking for a recommendation for a day off.',
    level: 'Irodori Elementary 1',
    lesson: 5,
    lines: [
      { speaker: 'A', text: '休みの日にどこか行きたいんですが、いいところがありますか？', furigana: [{ t: '休', r: 'やす' }, { t: 'みの' }, { t: '日', r: 'ひ' }, { t: 'にどこか' }, { t: '行', r: 'い' }, { t: 'きたいんですが、いいところがありますか？' }], translation: 'I want to go somewhere on my day off — is there a good place?' },
      { speaker: 'B', text: 'たちばな公園はどうですか。ここから自転車で20分くらいです。', furigana: [{ t: 'たちばな' }, { t: '公園', r: 'こうえん' }, { t: 'はどうですか。ここから' }, { t: '自転車', r: 'じてんしゃ' }, { t: 'で20' }, { t: '分', r: 'ぷん' }, { t: 'くらいです。' }], translation: 'How about Tachibana Park? It\'s about 20 minutes by bike from here.' },
      { speaker: 'A', text: 'どんなところですか？', furigana: [{ t: 'どんなところですか？' }], translation: 'What kind of place is it?' },
      { speaker: 'B', text: '場所は不便だけど、きれいですよ。ぜひ行ってみてください。', furigana: [{ t: '場所', r: 'ばしょ' }, { t: 'は' }, { t: '不便', r: 'ふべん' }, { t: 'だけど、きれいですよ。ぜひ' }, { t: '行', r: 'い' }, { t: 'ってみてください。' }], translation: 'The location is inconvenient, but it\'s beautiful. Please do go.' },
    ],
    questions: [
      { question: 'What does B recommend?', options: ['Tachibana Park', 'A restaurant', 'A museum', 'The station'], correctIndex: 0, explanation: 'たちばな公園（こうえん）はどうですか.' },
      { question: 'What is the place like?', options: ['Inconvenient to reach but beautiful', 'Close and cheap', 'Big and noisy', 'Brand new'], correctIndex: 0, explanation: '場所は不便（ふべん）だけど、きれい.' },
    ],
  },
  {
    id: 'ja-iro-e1-06',
    title: 'How do I get to the post office?',
    titleJapanese: '郵便局はどう行ったらいいですか？',
    setting: 'Asking for directions to the post office.',
    level: 'Irodori Elementary 1',
    lesson: 6,
    lines: [
      { speaker: 'A', text: 'すみません。郵便局はどう行ったらいいですか？', furigana: [{ t: 'すみません。' }, { t: '郵便局', r: 'ゆうびんきょく' }, { t: 'はどう' }, { t: '行', r: 'い' }, { t: 'ったらいいですか？' }], translation: 'Excuse me. How do I get to the post office?' },
      { speaker: 'B', text: 'この道をまっすぐ行って、2つ目の信号を左に曲がってください。', furigana: [{ t: 'この' }, { t: '道', r: 'みち' }, { t: 'をまっすぐ' }, { t: '行', r: 'い' }, { t: 'って、2つ' }, { t: '目', r: 'め' }, { t: 'の' }, { t: '信号', r: 'しんごう' }, { t: 'を' }, { t: '左', r: 'ひだり' }, { t: 'に' }, { t: '曲', r: 'ま' }, { t: 'がってください。' }], translation: 'Go straight along this street and turn left at the second traffic light.' },
      { speaker: 'A', text: '1つ目の信号を左ですね。', furigana: [{ t: '1つ' }, { t: '目', r: 'め' }, { t: 'の' }, { t: '信号', r: 'しんごう' }, { t: 'を' }, { t: '左', r: 'ひだり' }, { t: 'ですね。' }], translation: 'Left at the first light, right?' },
      { speaker: 'B', text: 'いえ、1つ目じゃなくて、2つ目です。', furigana: [{ t: 'いえ、1つ' }, { t: '目', r: 'め' }, { t: 'じゃなくて、2つ' }, { t: '目', r: 'め' }, { t: 'です。' }], translation: 'No, not the first — the second.' },
    ],
    questions: [
      { question: 'Where does A want to go?', options: ['The post office', 'The station', 'The bank', 'The hospital'], correctIndex: 0, explanation: '郵便局（ゆうびんきょく）= post office.' },
      { question: 'Where should A turn left?', options: ['At the second traffic light', 'At the first light', 'At the third corner', 'No turn needed'], correctIndex: 0, explanation: '2つ目の信号（しんごう）を左（ひだり）.' },
    ],
  },
  {
    id: 'ja-iro-e1-07',
    title: 'What time is the event?',
    titleJapanese: 'イベントは何時からですか？',
    setting: 'Checking the start time of an event for staff.',
    level: 'Irodori Elementary 1',
    lesson: 7,
    lines: [
      { speaker: 'A', text: '10日のイベント、何時からですか？', furigana: [{ t: '10' }, { t: '日', r: 'か' }, { t: 'のイベント、' }, { t: '何', r: 'なん' }, { t: '時', r: 'じ' }, { t: 'からですか？' }], translation: "What time does the event on the 10th start?" },
      { speaker: 'B', text: '17時に始まりますが、スタッフは30分前に来てください。', furigana: [{ t: '17' }, { t: '時', r: 'じ' }, { t: 'に' }, { t: '始', r: 'はじ' }, { t: 'まりますが、スタッフは30' }, { t: '分', r: 'ぷん' }, { t: '前', r: 'まえ' }, { t: 'に' }, { t: '来', r: 'き' }, { t: 'てください。' }], translation: 'It starts at 5 PM, but staff should come 30 minutes earlier.' },
      { speaker: 'A', text: 'じゃあ、4時半ですね。わかりました。', furigana: [{ t: 'じゃあ、4' }, { t: '時', r: 'じ' }, { t: '半', r: 'はん' }, { t: 'ですね。わかりました。' }], translation: "Then 4:30, right? Understood." },
    ],
    questions: [
      { question: 'What time does the event start?', options: ['5:00 PM', '4:30 PM', '5:30 PM', '4:00 PM'], correctIndex: 0, explanation: '17時（じ）= 5 PM.' },
      { question: 'When should staff arrive?', options: ['30 minutes before', 'Right on time', 'One hour before', 'After it starts'], correctIndex: 0, explanation: '30分（ぷん）前（まえ）= 30 minutes before.' },
    ],
  },
  {
    id: 'ja-iro-e1-08',
    title: 'Have you been there yet?',
    titleJapanese: 'もう行きましたか？',
    setting: 'Talking about local sightseeing spots.',
    level: 'Irodori Elementary 1',
    lesson: 8,
    lines: [
      { speaker: 'A', text: 'もう、この町のいろいろなところに行きましたか？', furigana: [{ t: 'もう、この' }, { t: '町', r: 'まち' }, { t: 'のいろいろなところに' }, { t: '行', r: 'い' }, { t: 'きましたか？' }], translation: 'Have you been to various places in this town yet?' },
      { speaker: 'B', text: '博物館とお城には行きました。', furigana: [{ t: '博物館', r: 'はくぶつかん' }, { t: 'とお' }, { t: '城', r: 'しろ' }, { t: 'には' }, { t: '行', r: 'い' }, { t: 'きました。' }], translation: "I've been to the museum and the castle." },
      { speaker: 'A', text: '動物園は？', furigana: [{ t: '動物園', r: 'どうぶつえん' }, { t: 'は？' }], translation: 'How about the zoo?' },
      { speaker: 'B', text: 'まだです。今度いっしょに行きましょう。', furigana: [{ t: 'まだです。' }, { t: '今度', r: 'こんど' }, { t: 'いっしょに' }, { t: '行', r: 'い' }, { t: 'きましょう。' }], translation: "Not yet. Let's go together sometime." },
    ],
    questions: [
      { question: 'Where has B already been?', options: ['The museum and castle', 'The zoo', 'The park', 'The aquarium'], correctIndex: 0, explanation: '博物館（はくぶつかん）とお城（しろ）.' },
      { question: 'Where has B not been yet?', options: ['The zoo', 'The castle', 'The museum', 'The station'], correctIndex: 0, explanation: '動物園（どうぶつえん）はまだです.' },
    ],
  },
  {
    id: 'ja-iro-e1-09',
    title: 'Studying Japanese is hard',
    titleJapanese: '日本語の勉強はどうですか？',
    setting: 'Talking about learning Japanese.',
    level: 'Irodori Elementary 1',
    lesson: 9,
    lines: [
      { speaker: 'A', text: '日本語の勉強はどうですか？', furigana: [{ t: '日本語', r: 'にほんご' }, { t: 'の' }, { t: '勉強', r: 'べんきょう' }, { t: 'はどうですか？' }], translation: "How is your Japanese study going?" },
      { speaker: 'B', text: '大変です。日本語は文字が難しいです。', furigana: [{ t: '大変', r: 'たいへん' }, { t: 'です。' }, { t: '日本語', r: 'にほんご' }, { t: 'は' }, { t: '文字', r: 'もじ' }, { t: 'が' }, { t: '難', r: 'むずか' }, { t: 'しいです。' }], translation: "It's tough. The characters in Japanese are difficult." },
      { speaker: 'A', text: 'そうですか。', furigana: [{ t: 'そうですか。' }], translation: 'I see.' },
      { speaker: 'B', text: 'でも、ひらがなは好きです。かわいいですから。', furigana: [{ t: 'でも、ひらがなは' }, { t: '好', r: 'す' }, { t: 'きです。かわいいですから。' }], translation: 'But I like hiragana, because it\'s cute.' },
    ],
    questions: [
      { question: 'What does B find difficult?', options: ['The written characters', 'Grammar', 'Speaking', 'Listening'], correctIndex: 0, explanation: '文字（もじ）が難（むずか）しい = the characters are hard.' },
      { question: 'What does B like?', options: ['Hiragana', 'Kanji', 'Katakana', 'Numbers'], correctIndex: 0, explanation: 'ひらがなは好（す）きです.' },
    ],
  },
  {
    id: 'ja-iro-e1-10',
    title: 'A calligraphy trial class',
    titleJapanese: '体験教室はいつありますか？',
    setting: 'Asking about a calligraphy trial lesson.',
    level: 'Irodori Elementary 1',
    lesson: 10,
    lines: [
      { speaker: 'A', text: '書道に興味があります。体験教室はいつありますか？', furigana: [{ t: '書道', r: 'しょどう' }, { t: 'に' }, { t: '興味', r: 'きょうみ' }, { t: 'があります。' }, { t: '体験', r: 'たいけん' }, { t: '教室', r: 'きょうしつ' }, { t: 'はいつありますか？' }], translation: "I'm interested in calligraphy. When is the trial class?" },
      { speaker: 'B', text: '次は5月14日の日曜日です。', furigana: [{ t: '次', r: 'つぎ' }, { t: 'は5' }, { t: '月', r: 'がつ' }, { t: '14' }, { t: '日', r: 'にち' }, { t: 'の' }, { t: '日曜日', r: 'にちようび' }, { t: 'です。' }], translation: 'The next one is Sunday, May 14th.' },
      { speaker: 'A', text: '道具は必要ですか？', furigana: [{ t: '道具', r: 'どうぐ' }, { t: 'は' }, { t: '必要', r: 'ひつよう' }, { t: 'ですか？' }], translation: 'Do I need to bring tools?' },
      { speaker: 'B', text: '全部こちらで用意しますから、だいじょうぶですよ。', furigana: [{ t: '全部', r: 'ぜんぶ' }, { t: 'こちらで' }, { t: '用意', r: 'ようい' }, { t: 'しますから、だいじょうぶですよ。' }], translation: "We'll prepare everything here, so it's fine." },
    ],
    questions: [
      { question: 'What is A interested in?', options: ['Calligraphy', 'Aikido', 'Cooking', 'Tea ceremony'], correctIndex: 0, explanation: '書道（しょどう）= calligraphy.' },
      { question: 'Does A need to bring tools?', options: ['No, they are provided', 'Yes, all of them', 'Only a brush', 'Yes, paper'], correctIndex: 0, explanation: '全部こちらで用意（ようい）します.' },
    ],
  },
  {
    id: 'ja-iro-e1-11',
    title: 'Does this have shrimp?',
    titleJapanese: 'この料理、エビを使ってますか？',
    setting: 'Checking ingredients because of an allergy.',
    level: 'Irodori Elementary 1',
    lesson: 11,
    lines: [
      { speaker: 'A', text: 'よかったら、ピザ、どう？', furigana: [{ t: 'よかったら、ピザ、どう？' }], translation: 'If you like, how about some pizza?' },
      { speaker: 'B', text: 'このピザ、エビが入ってますか？', furigana: [{ t: 'このピザ、エビが' }, { t: '入', r: 'はい' }, { t: 'ってますか？' }], translation: 'Does this pizza have shrimp in it?' },
      { speaker: 'A', text: 'エビ、入ってるよ。', furigana: [{ t: 'エビ、' }, { t: '入', r: 'はい' }, { t: 'ってるよ。' }], translation: 'Yes, it has shrimp.' },
      { speaker: 'B', text: 'じゃあ、私はだめです。エビのアレルギーですから。', furigana: [{ t: 'じゃあ、' }, { t: '私', r: 'わたし' }, { t: 'はだめです。エビのアレルギーですから。' }], translation: "Then I can't. I'm allergic to shrimp." },
    ],
    questions: [
      { question: 'What is B concerned about?', options: ['A shrimp allergy', 'An egg allergy', 'It being too spicy', 'The price'], correctIndex: 0, explanation: 'エビのアレルギー = shrimp allergy.' },
      { question: 'Can B eat the pizza?', options: ['No — it has shrimp', 'Yes', 'Only a little', 'Without cheese'], correctIndex: 0, explanation: 'エビが入（はい）っているので食べられない.' },
    ],
  },
  {
    id: 'ja-iro-e1-12',
    title: 'Trying umeboshi',
    titleJapanese: 'すっぱくて、ちょっと苦手です',
    setting: 'Trying a pickled plum for the first time.',
    level: 'Irodori Elementary 1',
    lesson: 12,
    lines: [
      { speaker: 'A', text: 'それ、何ですか？', furigana: [{ t: 'それ、' }, { t: '何', r: 'なん' }, { t: 'ですか？' }], translation: "What's that?" },
      { speaker: 'B', text: 'これ？梅干し。食べてみる？', furigana: [{ t: 'これ？' }, { t: '梅干', r: 'うめぼ' }, { t: 'し。' }, { t: '食', r: 'た' }, { t: 'べてみる？' }], translation: 'This? A pickled plum. Want to try it?' },
      { speaker: 'A', text: 'はい。……すみません。すっぱくて、ちょっと苦手です。', furigana: [{ t: 'はい。……すみません。すっぱくて、ちょっと' }, { t: '苦手', r: 'にがて' }, { t: 'です。' }], translation: "Yes. ...Sorry. It's sour, I'm not really fond of it." },
      { speaker: 'B', text: 'あ、そう。', furigana: [{ t: 'あ、そう。' }], translation: 'Oh, okay.' },
    ],
    questions: [
      { question: 'What is the food?', options: ['Umeboshi (pickled plum)', 'Candy', 'Rice', 'Tempura'], correctIndex: 0, explanation: '梅干（うめぼ）し = pickled plum.' },
      { question: 'What does A think of it?', options: ["It's too sour", 'Delicious', 'Too sweet', 'Too salty'], correctIndex: 0, explanation: 'すっぱくて、苦手（にがて）= sour, not fond of it.' },
    ],
  },
  {
    id: 'ja-iro-e1-13',
    title: "I don't understand how to do this",
    titleJapanese: 'このやり方がわかりません',
    setting: 'Asking for help with a task at work.',
    level: 'Irodori Elementary 1',
    lesson: 13,
    lines: [
      { speaker: 'A', text: 'どうですか？', furigana: [{ t: 'どうですか？' }], translation: 'How is it going?' },
      { speaker: 'B', text: 'すみません。このやり方がよくわからないんですが……。', furigana: [{ t: 'すみません。このやり' }, { t: '方', r: 'かた' }, { t: 'がよくわからないんですが……。' }], translation: "Sorry, I don't really understand how to do this..." },
      { speaker: 'A', text: 'ああ、これはですね……。', furigana: [{ t: 'ああ、これはですね……。' }], translation: 'Ah, this is, you see...' },
    ],
    questions: [
      { question: "What is B's problem?", options: ['They don\'t understand how to do it', 'They are tired', 'They lost something', 'They are hungry'], correctIndex: 0, explanation: 'やり方（かた）がわからない = doesn\'t understand the method.' },
      { question: 'What does A start to do?', options: ['Explain it', 'Leave', 'Refuse', 'Laugh'], correctIndex: 0, explanation: 'これはですね… A begins to explain.' },
    ],
  },
  {
    id: 'ja-iro-e1-14',
    title: 'May I go buy a drink?',
    titleJapanese: '買って来てもいいですか？',
    setting: 'Asking permission for a short break.',
    level: 'Irodori Elementary 1',
    lesson: 14,
    lines: [
      { speaker: 'A', text: 'あのう、ちょっと飲み物を買って来てもいいですか？', furigana: [{ t: 'あのう、ちょっと' }, { t: '飲', r: 'の' }, { t: 'み' }, { t: '物', r: 'もの' }, { t: 'を' }, { t: '買', r: 'か' }, { t: 'って' }, { t: '来', r: 'き' }, { t: 'てもいいですか？' }], translation: 'Um, may I go and buy a drink?' },
      { speaker: 'B', text: 'ああ、いいよ。今から休憩にしましょう。', furigana: [{ t: 'ああ、いいよ。' }, { t: '今', r: 'いま' }, { t: 'から' }, { t: '休憩', r: 'きゅうけい' }, { t: 'にしましょう。' }], translation: "Sure, that's fine. Let's take a break now." },
      { speaker: 'A', text: 'ありがとうございます。', furigana: [{ t: 'ありがとうございます。' }], translation: 'Thank you.' },
    ],
    questions: [
      { question: 'What does A want to do?', options: ['Go buy a drink', 'Go home', 'Make a phone call', 'Take a nap'], correctIndex: 0, explanation: '飲み物を買（か）って来（き）てもいいですか.' },
      { question: 'What does B suggest?', options: ['Taking a break now', 'Working more', 'Waiting', 'Leaving early'], correctIndex: 0, explanation: '今（いま）から休憩（きゅうけい）にしましょう.' },
    ],
  },
  {
    id: 'ja-iro-e1-15',
    title: 'Medicine for a cough',
    titleJapanese: 'せきを抑える薬です',
    setting: 'A pharmacist explains how to take medicine.',
    level: 'Irodori Elementary 1',
    lesson: 15,
    lines: [
      { speaker: 'A', text: 'こちらは、せきを抑える薬です。1日3回、食後に飲んでください。', furigana: [{ t: 'こちらは、せきを' }, { t: '抑', r: 'おさ' }, { t: 'える' }, { t: '薬', r: 'くすり' }, { t: 'です。1' }, { t: '日', r: 'にち' }, { t: '3' }, { t: '回', r: 'かい' }, { t: '、' }, { t: '食後', r: 'しょくご' }, { t: 'に' }, { t: '飲', r: 'の' }, { t: 'んでください。' }], translation: 'This is medicine to suppress a cough. Take it three times a day, after meals.' },
      { speaker: 'B', text: '食後？', furigana: [{ t: '食後', r: 'しょくご' }, { t: '？' }], translation: 'After meals?' },
      { speaker: 'A', text: 'ご飯を食べたあとです。飲むと眠くなるので、運転しないでください。', furigana: [{ t: 'ご' }, { t: '飯', r: 'はん' }, { t: 'を' }, { t: '食', r: 'た' }, { t: 'べたあとです。' }, { t: '飲', r: 'の' }, { t: 'むと' }, { t: '眠', r: 'ねむ' }, { t: 'くなるので、' }, { t: '運転', r: 'うんてん' }, { t: 'しないでください。' }], translation: "It means after you've eaten. It makes you sleepy, so please don't drive." },
    ],
    questions: [
      { question: 'What is the medicine for?', options: ['Suppressing a cough', 'A fever', 'A headache', 'A stomach ache'], correctIndex: 0, explanation: 'せきを抑（おさ）える薬（くすり）= cough medicine.' },
      { question: 'When should it be taken?', options: ['After meals', 'Before meals', 'Only at night', 'Anytime'], correctIndex: 0, explanation: '食後（しょくご）= after meals.' },
    ],
  },
  {
    id: 'ja-iro-e1-16',
    title: 'Yoga before bed',
    titleJapanese: '寝る前にヨガをします',
    setting: 'Talking about exercise habits.',
    level: 'Irodori Elementary 1',
    lesson: 16,
    lines: [
      { speaker: 'A', text: '最近、何か運動してますか？', furigana: [{ t: '最近', r: 'さいきん' }, { t: '、' }, { t: '何', r: 'なに' }, { t: 'か' }, { t: '運動', r: 'うんどう' }, { t: 'してますか？' }], translation: 'Have you been doing any exercise lately?' },
      { speaker: 'B', text: 'ジョギングしたり、家でヨガをしたりしてます。', furigana: [{ t: 'ジョギングしたり、' }, { t: '家', r: 'いえ' }, { t: 'でヨガをしたりしてます。' }], translation: 'I go jogging, and sometimes do yoga at home.' },
      { speaker: 'A', text: 'へー、ヨガ。', furigana: [{ t: 'へー、ヨガ。' }], translation: 'Oh, yoga.' },
      { speaker: 'B', text: '寝る前にヨガをすると、よく眠れますよ。', furigana: [{ t: '寝', r: 'ね' }, { t: 'る' }, { t: '前', r: 'まえ' }, { t: 'にヨガをすると、よく' }, { t: '眠', r: 'ねむ' }, { t: 'れますよ。' }], translation: 'If you do yoga before bed, you sleep well.' },
    ],
    questions: [
      { question: 'What exercise does B do?', options: ['Jogging and yoga', 'Swimming', 'Soccer', 'Tennis'], correctIndex: 0, explanation: 'ジョギング… ヨガ.' },
      { question: 'When does B do yoga?', options: ['Before going to bed', 'In the morning', 'After meals', 'At work'], correctIndex: 0, explanation: '寝（ね）る前（まえ）= before sleeping.' },
    ],
  },
  {
    id: 'ja-iro-e1-17',
    title: 'A souvenir from Thailand',
    titleJapanese: 'これ、お土産です',
    setting: 'Giving a food souvenir and explaining it.',
    level: 'Irodori Elementary 1',
    lesson: 17,
    lines: [
      { speaker: 'A', text: 'あのう、これ、どうぞ。', furigana: [{ t: 'あのう、これ、どうぞ。' }], translation: 'Um, here, please take this.' },
      { speaker: 'B', text: 'あ、どうも。これ、何？', furigana: [{ t: 'あ、どうも。これ、' }, { t: '何', r: 'なに' }, { t: '？' }], translation: 'Oh, thanks. What is it?' },
      { speaker: 'A', text: 'ナンプラーです。タイ料理に使う調味料です。魚から作ります。', furigana: [{ t: 'ナンプラーです。タイ' }, { t: '料理', r: 'りょうり' }, { t: 'に' }, { t: '使', r: 'つか' }, { t: 'う' }, { t: '調味料', r: 'ちょうみりょう' }, { t: 'です。' }, { t: '魚', r: 'さかな' }, { t: 'から' }, { t: '作', r: 'つく' }, { t: 'ります。' }], translation: "It's nam pla. It's a seasoning used in Thai cooking. It's made from fish." },
      { speaker: 'B', text: 'へー。今度、使ってみるね。', furigana: [{ t: 'へー。' }, { t: '今度', r: 'こんど' }, { t: '、' }, { t: '使', r: 'つか' }, { t: 'ってみるね。' }], translation: "Oh. I'll try using it sometime." },
    ],
    questions: [
      { question: 'What is the gift?', options: ['Nam pla (fish sauce)', 'Tea', 'Candy', 'A book'], correctIndex: 0, explanation: 'ナンプラー = a Thai fish-sauce seasoning.' },
      { question: 'What is it made from?', options: ['Fish', 'Beans', 'Rice', 'Fruit'], correctIndex: 0, explanation: '魚（さかな）から作（つく）ります = made from fish.' },
    ],
  },
  {
    id: 'ja-iro-e1-18',
    title: 'Congratulations!',
    titleJapanese: 'おめでとうございます',
    setting: 'Congratulating a colleague and planning a gift.',
    level: 'Irodori Elementary 1',
    lesson: 18,
    lines: [
      { speaker: 'A', text: '来月、結婚するそうですね。おめでとうございます。', furigana: [{ t: '来月', r: 'らいげつ' }, { t: '、' }, { t: '結婚', r: 'けっこん' }, { t: 'するそうですね。おめでとうございます。' }], translation: "I hear you're getting married next month. Congratulations!" },
      { speaker: 'B', text: 'ありがとうございます。', furigana: [{ t: 'ありがとうございます。' }], translation: 'Thank you.' },
      { speaker: 'A', text: '明日は、トアンさんの誕生日ですね。みんなで何かあげませんか？', furigana: [{ t: '明日', r: 'あした' }, { t: 'は、トアンさんの' }, { t: '誕生日', r: 'たんじょうび' }, { t: 'ですね。みんなで' }, { t: '何', r: 'なに' }, { t: 'かあげませんか？' }], translation: "Tomorrow is Toan's birthday, isn't it? Shall we all give something?" },
      { speaker: 'B', text: 'いいですね。ケーキと花をあげましょう。', furigana: [{ t: 'いいですね。ケーキと' }, { t: '花', r: 'はな' }, { t: 'をあげましょう。' }], translation: "Good idea. Let's give a cake and flowers." },
    ],
    questions: [
      { question: "What is B's news?", options: ['Getting married next month', 'A new job', 'Moving house', 'Graduating'], correctIndex: 0, explanation: '来月（らいげつ）結婚（けっこん）する.' },
      { question: 'What will they give Toan?', options: ['A cake and flowers', 'A book', 'Money', 'Nothing'], correctIndex: 0, explanation: 'ケーキと花（はな）をあげましょう.' },
    ],
  },

  // ===== Irodori Elementary 2 =====
  {
    id: 'ja-iro-e2-01',
    title: 'Where are you from?',
    titleJapanese: '出身はどこですか？',
    setting: 'Talking about a hometown abroad.',
    level: 'Irodori Elementary 2',
    lesson: 1,
    lines: [
      { speaker: 'A', text: 'ボルドさん、出身は？', furigana: [{ t: 'ボルドさん、' }, { t: '出身', r: 'しゅっしん' }, { t: 'は？' }], translation: 'Bold-san, where are you from?' },
      { speaker: 'B', text: 'モンゴルのウランバートルです。', furigana: [{ t: 'モンゴルのウランバートルです。' }], translation: 'Ulaanbaatar, in Mongolia.' },
      { speaker: 'A', text: '写真でよく見る、白くて丸いテントに住んでるの？', furigana: [{ t: '写真', r: 'しゃしん' }, { t: 'でよく' }, { t: '見', r: 'み' }, { t: 'る、' }, { t: '白', r: 'しろ' }, { t: 'くて' }, { t: '丸', r: 'まる' }, { t: 'いテントに' }, { t: '住', r: 'す' }, { t: 'んでるの？' }], translation: 'Do you live in one of those white round tents you see in photos?' },
      { speaker: 'B', text: '違います。ウランバートルは首都だから、都会ですよ。高いビルも多いです。', furigana: [{ t: '違', r: 'ちが' }, { t: 'います。ウランバートルは' }, { t: '首都', r: 'しゅと' }, { t: 'だから、' }, { t: '都会', r: 'とかい' }, { t: 'ですよ。' }, { t: '高', r: 'たか' }, { t: 'いビルも' }, { t: '多', r: 'おお' }, { t: 'いです。' }], translation: "No. Ulaanbaatar is the capital, so it's a city. There are lots of tall buildings too." },
    ],
    questions: [
      { question: 'Where is B from?', options: ['Ulaanbaatar, Mongolia', 'Tokyo, Japan', 'Beijing, China', 'Seoul, Korea'], correctIndex: 0, explanation: 'モンゴルのウランバートル.' },
      { question: 'What is the city like?', options: ['A city with tall buildings', 'A small village', 'A desert with tents', 'A beach town'], correctIndex: 0, explanation: '首都（しゅと）で都会（とかい）、高いビルも多い.' },
    ],
  },
  {
    id: 'ja-iro-e2-02',
    title: 'Which person is it?',
    titleJapanese: 'どの人ですか？',
    setting: 'Identifying people at a party.',
    level: 'Irodori Elementary 2',
    lesson: 2,
    lines: [
      { speaker: 'A', text: '江口さんはどの人ですか？', furigana: [{ t: '江口', r: 'えぐち' }, { t: 'さんはどの' }, { t: '人', r: 'ひと' }, { t: 'ですか？' }], translation: 'Which person is Eguchi-san?' },
      { speaker: 'B', text: 'あの髪が短くて、ひげをはやしてる人ですよ。', furigana: [{ t: 'あの' }, { t: '髪', r: 'かみ' }, { t: 'が' }, { t: '短', r: 'みじか' }, { t: 'くて、ひげをはやしてる' }, { t: '人', r: 'ひと' }, { t: 'ですよ。' }], translation: "The one with short hair and a beard." },
      { speaker: 'A', text: '田中さんは、どの人ですか。', furigana: [{ t: '田中', r: 'たなか' }, { t: 'さんは、どの' }, { t: '人', r: 'ひと' }, { t: 'ですか。' }], translation: 'And which one is Tanaka-san?' },
      { speaker: 'B', text: 'あそこに座ってる人ですよ。', furigana: [{ t: 'あそこに' }, { t: '座', r: 'すわ' }, { t: 'ってる' }, { t: '人', r: 'ひと' }, { t: 'ですよ。' }], translation: "The one sitting over there." },
    ],
    questions: [
      { question: 'What does Eguchi look like?', options: ['Short hair and a beard', 'Tall with glasses', 'Long hair', 'Bald'], correctIndex: 0, explanation: '髪（かみ）が短（みじか）くて、ひげをはやしてる.' },
      { question: 'Where is Tanaka?', options: ['Sitting over there', 'Standing by the door', 'Outside', 'Not here'], correctIndex: 0, explanation: 'あそこに座（すわ）ってる.' },
    ],
  },
  {
    id: 'ja-iro-e2-03',
    title: "I can't drink today",
    titleJapanese: '飲めないんです',
    setting: 'Ordering drinks at an izakaya.',
    level: 'Irodori Elementary 2',
    lesson: 3,
    lines: [
      { speaker: 'A', text: '先に飲み物、注文しましょう。ビールでいいですか？', furigana: [{ t: '先', r: 'さき' }, { t: 'に' }, { t: '飲', r: 'の' }, { t: 'み' }, { t: '物', r: 'もの' }, { t: '、' }, { t: '注文', r: 'ちゅうもん' }, { t: 'しましょう。ビールでいいですか？' }], translation: "Let's order drinks first. Is beer okay?" },
      { speaker: 'B', text: '今日は自転車で来たので、飲めないんです。', furigana: [{ t: '今日', r: 'きょう' }, { t: 'は' }, { t: '自転車', r: 'じてんしゃ' }, { t: 'で' }, { t: '来', r: 'き' }, { t: 'たので、' }, { t: '飲', r: 'の' }, { t: 'めないんです。' }], translation: "I came by bicycle today, so I can't drink." },
      { speaker: 'A', text: 'じゃあ、ソフトドリンクはどうですか？', furigana: [{ t: 'じゃあ、ソフトドリンクはどうですか？' }], translation: 'Then how about a soft drink?' },
      { speaker: 'B', text: 'じゃあ、ウーロン茶、お願いします。', furigana: [{ t: 'じゃあ、ウーロン' }, { t: '茶', r: 'ちゃ' }, { t: '、お' }, { t: '願', r: 'ねが' }, { t: 'いします。' }], translation: "Then oolong tea, please." },
    ],
    questions: [
      { question: "Why can't B drink beer?", options: ['Came by bicycle', "Doesn't like it", 'Allergic', 'On medication'], correctIndex: 0, explanation: '自転車（じてんしゃ）で来たので飲めない.' },
      { question: 'What does B order?', options: ['Oolong tea', 'Beer', 'Water', 'Juice'], correctIndex: 0, explanation: 'ウーロン茶（ちゃ）.' },
    ],
  },
  {
    id: 'ja-iro-e2-04',
    title: 'Recommending a ramen shop',
    titleJapanese: 'どこかいい店、ありませんか？',
    setting: 'Asking for a good ramen shop.',
    level: 'Irodori Elementary 2',
    lesson: 4,
    lines: [
      { speaker: 'A', text: 'おいしいラーメンが食べたいんですけど、どこがいいですか？', furigana: [{ t: 'おいしいラーメンが' }, { t: '食', r: 'た' }, { t: 'べたいんですけど、どこがいいですか？' }], translation: 'I want to eat good ramen — where is good?' },
      { speaker: 'B', text: 'おれのおすすめは「千歩」かなあ。', furigana: [{ t: 'おれのおすすめは「' }, { t: '千歩', r: 'せんぽ' }, { t: '」かなあ。' }], translation: 'My recommendation would be "Senpo", I guess.' },
      { speaker: 'A', text: 'あの商店街にある赤い看板のお店ですか？', furigana: [{ t: 'あの' }, { t: '商店街', r: 'しょうてんがい' }, { t: 'にある' }, { t: '赤', r: 'あか' }, { t: 'い' }, { t: '看板', r: 'かんばん' }, { t: 'のお' }, { t: '店', r: 'みせ' }, { t: 'ですか？' }], translation: 'The one with the red sign in that shopping street?' },
      { speaker: 'B', text: 'そうそう。ラーメンなら、あそこがいちばんおいしいよ。', furigana: [{ t: 'そうそう。ラーメンなら、あそこがいちばんおいしいよ。' }], translation: "Yes. For ramen, that place is the best." },
    ],
    questions: [
      { question: 'What does A want to eat?', options: ['Ramen', 'Sushi', 'Curry', 'Pizza'], correctIndex: 0, explanation: 'おいしいラーメンが食べたい.' },
      { question: 'How can the shop be recognized?', options: ['Red sign in the shopping street', 'Near the station', 'By the river', 'Next to a school'], correctIndex: 0, explanation: '商店街（しょうてんがい）の赤（あか）い看板（かんばん）.' },
    ],
  },
  {
    id: 'ja-iro-e2-05',
    title: 'I want to go someday',
    titleJapanese: 'いつか行ってみたいです',
    setting: 'Talking about a TV programme on Hokkaido.',
    level: 'Irodori Elementary 2',
    lesson: 5,
    lines: [
      { speaker: 'A', text: '昨日、テレビで北海道の番組を見ました。きれいなところですね。', furigana: [{ t: '昨日', r: 'きのう' }, { t: '、テレビで' }, { t: '北海道', r: 'ほっかいどう' }, { t: 'の' }, { t: '番組', r: 'ばんぐみ' }, { t: 'を' }, { t: '見', r: 'み' }, { t: 'ました。きれいなところですね。' }], translation: 'Yesterday I watched a TV programme about Hokkaido. It looks beautiful.' },
      { speaker: 'B', text: 'ええ。自然も豊かだし、食べ物もおいしいですよ。', furigana: [{ t: 'ええ。' }, { t: '自然', r: 'しぜん' }, { t: 'も' }, { t: '豊', r: 'ゆた' }, { t: 'かだし、' }, { t: '食', r: 'た' }, { t: 'べ' }, { t: '物', r: 'もの' }, { t: 'もおいしいですよ。' }], translation: 'Yes. The nature is rich and the food is delicious.' },
      { speaker: 'A', text: 'へー。', furigana: [{ t: 'へー。' }], translation: 'Oh.' },
      { speaker: 'B', text: '特に魚がおいしくて、新鮮なカニとかウニが食べられますよ。', furigana: [{ t: '特', r: 'とく' }, { t: 'に' }, { t: '魚', r: 'さかな' }, { t: 'がおいしくて、' }, { t: '新鮮', r: 'しんせん' }, { t: 'なカニとかウニが' }, { t: '食', r: 'た' }, { t: 'べられますよ。' }], translation: 'The fish is especially good — you can eat fresh crab and sea urchin.' },
    ],
    questions: [
      { question: 'Which place are they talking about?', options: ['Hokkaido', 'Okinawa', 'Kyoto', 'Tokyo'], correctIndex: 0, explanation: '北海道（ほっかいどう）の番組.' },
      { question: 'What is especially good there?', options: ['Fresh seafood', 'Hot springs', 'Temples', 'Shopping'], correctIndex: 0, explanation: '特（とく）に魚（さかな）… 新鮮（しんせん）なカニ・ウニ.' },
    ],
  },
  {
    id: 'ja-iro-e2-06',
    title: 'A trip to the beach',
    titleJapanese: '週末は何をしてたの？',
    setting: 'Talking about a weekend at the beach.',
    level: 'Irodori Elementary 2',
    lesson: 6,
    lines: [
      { speaker: 'A', text: '週末は何をしてたの？', furigana: [{ t: '週末', r: 'しゅうまつ' }, { t: 'は' }, { t: '何', r: 'なに' }, { t: 'をしてたの？' }], translation: 'What did you do at the weekend?' },
      { speaker: 'B', text: '友だちと浄土ヶ浜に行って来ました。海も空もすごくきれいでした。', furigana: [{ t: '友', r: 'とも' }, { t: 'だちと' }, { t: '浄土ヶ浜', r: 'じょうどがはま' }, { t: 'に' }, { t: '行', r: 'い' }, { t: 'って' }, { t: '来', r: 'き' }, { t: 'ました。' }, { t: '海', r: 'うみ' }, { t: 'も' }, { t: '空', r: 'そら' }, { t: 'もすごくきれいでした。' }], translation: 'I went to Jodogahama with a friend. The sea and sky were really beautiful.' },
      { speaker: 'A', text: 'よかったね。', furigana: [{ t: 'よかったね。' }], translation: 'That sounds nice.' },
      { speaker: 'B', text: '海で泳げたし、船にも乗れて、楽しかったです。', furigana: [{ t: '海', r: 'うみ' }, { t: 'で' }, { t: '泳', r: 'およ' }, { t: 'げたし、' }, { t: '船', r: 'ふね' }, { t: 'にも' }, { t: '乗', r: 'の' }, { t: 'れて、' }, { t: '楽', r: 'たの' }, { t: 'しかったです。' }], translation: 'I could swim in the sea and ride a boat — it was fun.' },
    ],
    questions: [
      { question: 'Where did B go?', options: ['Jodogahama (a beach)', 'The mountains', 'A city', 'A museum'], correctIndex: 0, explanation: '浄土ヶ浜（じょうどがはま）= a famous beach.' },
      { question: 'What did B do there?', options: ['Swam and rode a boat', 'Went hiking', 'Went shopping', 'Visited temples'], correctIndex: 0, explanation: '海で泳（およ）げたし、船（ふね）にも乗（の）れた.' },
    ],
  },
  {
    id: 'ja-iro-e2-07',
    title: 'The flea market',
    titleJapanese: 'フリーマーケットがあるそうですね',
    setting: 'Asking about a local flea market.',
    level: 'Irodori Elementary 2',
    lesson: 7,
    lines: [
      { speaker: 'A', text: '市役所でフリーマーケットがあるそうですね。', furigana: [{ t: '市役所', r: 'しやくしょ' }, { t: 'でフリーマーケットがあるそうですね。' }], translation: 'I hear there\'s a flea market at the city hall.' },
      { speaker: 'B', text: 'ええ。毎月、第2土曜日に、市役所の広場でやってますよ。', furigana: [{ t: 'ええ。' }, { t: '毎月', r: 'まいつき' }, { t: '、' }, { t: '第', r: 'だい' }, { t: '2' }, { t: '土曜日', r: 'どようび' }, { t: 'に、' }, { t: '市役所', r: 'しやくしょ' }, { t: 'の' }, { t: '広場', r: 'ひろば' }, { t: 'でやってますよ。' }], translation: "Yes. It's held every month on the second Saturday, in the city hall plaza." },
      { speaker: 'A', text: '天気が悪かったら、どうなりますか？', furigana: [{ t: '天気', r: 'てんき' }, { t: 'が' }, { t: '悪', r: 'わる' }, { t: 'かったら、どうなりますか？' }], translation: 'What happens if the weather is bad?' },
      { speaker: 'B', text: '雨が降ったら、中のホールでやります。', furigana: [{ t: '雨', r: 'あめ' }, { t: 'が' }, { t: '降', r: 'ふ' }, { t: 'ったら、' }, { t: '中', r: 'なか' }, { t: 'のホールでやります。' }], translation: "If it rains, it's held in the indoor hall." },
    ],
    questions: [
      { question: 'When is the flea market held?', options: ['The second Saturday of each month', 'Every Sunday', 'The first Monday', 'Twice a week'], correctIndex: 0, explanation: '毎月（まいつき）第2土曜日（どようび）.' },
      { question: 'What happens if it rains?', options: ['It moves to the indoor hall', "It's cancelled", "It's postponed", 'Nothing changes'], correctIndex: 0, explanation: '雨（あめ）が降（ふ）ったら中（なか）のホール.' },
    ],
  },
  {
    id: 'ja-iro-e2-08',
    title: 'Has it started yet?',
    titleJapanese: 'もう始まりましたか？',
    setting: 'Asking whether a speech contest has begun.',
    level: 'Irodori Elementary 2',
    lesson: 8,
    lines: [
      { speaker: 'A', text: 'スピーチコンテストは、もう始まりましたか？', furigana: [{ t: 'スピーチコンテストは、もう' }, { t: '始', r: 'はじ' }, { t: 'まりましたか？' }], translation: 'Has the speech contest started yet?' },
      { speaker: 'B', text: 'まだ始まってません。', furigana: [{ t: 'まだ' }, { t: '始', r: 'はじ' }, { t: 'まってません。' }], translation: "It hasn't started yet." },
      { speaker: 'A', text: '何時に始まりますか？', furigana: [{ t: '何', r: 'なん' }, { t: '時', r: 'じ' }, { t: 'に' }, { t: '始', r: 'はじ' }, { t: 'まりますか？' }], translation: 'What time does it start?' },
      { speaker: 'B', text: '2時からです。あと30分です。', furigana: [{ t: '2' }, { t: '時', r: 'じ' }, { t: 'からです。あと30' }, { t: '分', r: 'ぷん' }, { t: 'です。' }], translation: 'At 2:00. 30 minutes from now.' },
    ],
    questions: [
      { question: 'Has the contest started?', options: ['Not yet', 'Yes, just now', 'It finished', 'It was cancelled'], correctIndex: 0, explanation: 'まだ始（はじ）まってません.' },
      { question: 'When does it start?', options: ['At 2:00 (in 30 min)', 'At 3:00', 'Right now', 'At noon'], correctIndex: 0, explanation: '2時（じ）から、あと30分（ぷん）.' },
    ],
  },
  {
    id: 'ja-iro-e2-11',
    title: 'A sudden stomach ache',
    titleJapanese: '救急車を呼んでください',
    setting: 'A customer suddenly feels ill.',
    level: 'Irodori Elementary 2',
    lesson: 11,
    lines: [
      { speaker: 'A', text: 'お客様、どうなさいましたか？', furigana: [{ t: 'お' }, { t: '客様', r: 'きゃくさま' }, { t: '、どうなさいましたか？' }], translation: 'Sir/Madam, what seems to be the matter?' },
      { speaker: 'B', text: '急にお腹が痛くなって……。', furigana: [{ t: '急', r: 'きゅう' }, { t: 'にお' }, { t: '腹', r: 'なか' }, { t: 'が' }, { t: '痛', r: 'いた' }, { t: 'くなって……。' }], translation: 'My stomach suddenly started hurting...' },
      { speaker: 'A', text: 'だいじょうぶですか？', furigana: [{ t: 'だいじょうぶですか？' }], translation: 'Are you all right?' },
      { speaker: 'B', text: 'すみません……救急車を呼んでください。', furigana: [{ t: 'すみません……' }, { t: '救急車', r: 'きゅうきゅうしゃ' }, { t: 'を' }, { t: '呼', r: 'よ' }, { t: 'んでください。' }], translation: 'Sorry... please call an ambulance.' },
    ],
    questions: [
      { question: "What's wrong with B?", options: ['A sudden stomach ache', 'A headache', 'A cold', 'An injured leg'], correctIndex: 0, explanation: '急（きゅう）にお腹（なか）が痛（いた）い.' },
      { question: 'What does B ask for?', options: ['An ambulance', 'A taxi', 'Some water', 'Medicine'], correctIndex: 0, explanation: '救急車（きゅうきゅうしゃ）を呼（よ）んでください.' },
    ],
  },
  {
    id: 'ja-iro-e2-12',
    title: 'Selling an old fan',
    titleJapanese: 'ネットで売ったらどうですか？',
    setting: 'Talking about getting rid of an old electric fan.',
    level: 'Irodori Elementary 2',
    lesson: 12,
    lines: [
      { speaker: 'A', text: 'エニさん、扇風機、持ってますか？', furigana: [{ t: 'エニさん、' }, { t: '扇風機', r: 'せんぷうき' }, { t: '、' }, { t: '持', r: 'も' }, { t: 'ってますか？' }], translation: 'Eni-san, do you have an electric fan?' },
      { speaker: 'B', text: '扇風機？', furigana: [{ t: '扇風機', r: 'せんぷうき' }, { t: '？' }], translation: 'A fan?' },
      { speaker: 'A', text: '新しいのを買ったから、古いのをだれかにあげたいと思って……。', furigana: [{ t: '新', r: 'あたら' }, { t: 'しいのを' }, { t: '買', r: 'か' }, { t: 'ったから、' }, { t: '古', r: 'ふる' }, { t: 'いのをだれかにあげたいと' }, { t: '思', r: 'おも' }, { t: 'って……。' }], translation: 'I bought a new one, so I want to give the old one to someone...' },
      { speaker: 'B', text: 'だったら、ネットで売ったらどうですか？', furigana: [{ t: 'だったら、ネットで' }, { t: '売', r: 'う' }, { t: 'ったらどうですか？' }], translation: 'In that case, why not sell it online?' },
    ],
    questions: [
      { question: 'What does A want to do with the old fan?', options: ['Give it away', 'Repair it', 'Throw it out', 'Keep it'], correctIndex: 0, explanation: '古（ふる）いのをだれかにあげたい.' },
      { question: 'What does B suggest?', options: ['Selling it online', 'Donating it', 'Recycling it', 'Storing it'], correctIndex: 0, explanation: 'ネットで売（う）ったらどうですか.' },
    ],
  },
  {
    id: 'ja-iro-e2-13',
    title: 'At the public bath',
    titleJapanese: 'はじめて利用するんですが…',
    setting: 'Using a public bath for the first time.',
    level: 'Irodori Elementary 2',
    lesson: 13,
    lines: [
      { speaker: 'A', text: 'すみません、お風呂に入りたいんですが……。', furigana: [{ t: 'すみません、お' }, { t: '風呂', r: 'ふろ' }, { t: 'に' }, { t: '入', r: 'はい' }, { t: 'りたいんですが……。' }], translation: 'Excuse me, I\'d like to take a bath...' },
      { speaker: 'B', text: 'そちらの券売機でチケットを買ってください。お1人400円です。', furigana: [{ t: 'そちらの' }, { t: '券売機', r: 'けんばいき' }, { t: 'でチケットを' }, { t: '買', r: 'か' }, { t: 'ってください。お' }, { t: '1人', r: 'ひとり' }, { t: '400' }, { t: '円', r: 'えん' }, { t: 'です。' }], translation: 'Please buy a ticket from that machine. It\'s 400 yen per person.' },
      { speaker: 'A', text: 'タオルは、ついていますか？', furigana: [{ t: 'タオルは、ついていますか？' }], translation: 'Is a towel included?' },
      { speaker: 'B', text: 'タオルは、こちらで1枚150円です。', furigana: [{ t: 'タオルは、こちらで' }, { t: '1枚', r: 'いちまい' }, { t: '150' }, { t: '円', r: 'えん' }, { t: 'です。' }], translation: 'Towels are 150 yen each here.' },
    ],
    questions: [
      { question: 'What does A want to do?', options: ['Take a bath', 'Buy food', 'Rent a room', 'Use the wifi'], correctIndex: 0, explanation: 'お風呂（ふろ）に入（はい）りたい.' },
      { question: 'How much is the entry?', options: ['400 yen per person', '150 yen', '1000 yen', 'Free'], correctIndex: 0, explanation: 'お1人（ひとり）400円（えん）.' },
    ],
  },
  {
    id: 'ja-iro-e2-15',
    title: 'You left the window open',
    titleJapanese: '窓が開いたままでしたよ',
    setting: 'Pointing out a window was left open.',
    level: 'Irodori Elementary 2',
    lesson: 15,
    lines: [
      { speaker: 'A', text: '窓が開いたままでしたよ。', furigana: [{ t: '窓', r: 'まど' }, { t: 'が' }, { t: '開', r: 'あ' }, { t: 'いたままでしたよ。' }], translation: 'The window was left open.' },
      { speaker: 'B', text: 'あ、すみません。忘れてました。', furigana: [{ t: 'あ、すみません。' }, { t: '忘', r: 'わす' }, { t: 'れてました。' }], translation: 'Oh, sorry. I forgot.' },
      { speaker: 'A', text: 'テーブルの上、片付けましょうか？', furigana: [{ t: 'テーブルの' }, { t: '上', r: 'うえ' }, { t: '、' }, { t: '片付', r: 'かたづ' }, { t: 'けましょうか？' }], translation: 'Shall I clear the table?' },
      { speaker: 'B', text: 'あ、そのままでいいです。', furigana: [{ t: 'あ、そのままでいいです。' }], translation: "Oh, it's fine to leave it." },
    ],
    questions: [
      { question: 'What did B forget?', options: ['To close the window', 'To lock the door', 'To turn off the light', 'To clean up'], correctIndex: 0, explanation: '窓（まど）が開（あ）いたまま、忘（わす）れてた.' },
      { question: 'Should A clear the table?', options: ['No, leave it as it is', 'Yes, please', 'Later', 'Throw it all away'], correctIndex: 0, explanation: 'そのままでいいです = leave it as is.' },
    ],
  },
  {
    id: 'ja-iro-e2-16',
    title: 'The water is still out',
    titleJapanese: '給水車が来ます',
    setting: 'Neighbours coping with a water outage after a disaster.',
    level: 'Irodori Elementary 2',
    lesson: 16,
    lines: [
      { speaker: 'A', text: 'まだ、水、出ませんか？', furigana: [{ t: 'まだ、' }, { t: '水', r: 'みず' }, { t: '、' }, { t: '出', r: 'で' }, { t: 'ませんか？' }], translation: 'Is the water still not running?' },
      { speaker: 'B', text: 'あと少ししかないです。どうしたらいいですか？', furigana: [{ t: 'あと' }, { t: '少', r: 'すこ' }, { t: 'ししかないです。どうしたらいいですか？' }], translation: 'I only have a little left. What should I do?' },
      { speaker: 'A', text: '明日の8時に、公民館の前に給水車が来るって。', furigana: [{ t: '明日', r: 'あした' }, { t: 'の8' }, { t: '時', r: 'じ' }, { t: 'に、' }, { t: '公民館', r: 'こうみんかん' }, { t: 'の' }, { t: '前', r: 'まえ' }, { t: 'に' }, { t: '給水車', r: 'きゅうすいしゃ' }, { t: 'が' }, { t: '来', r: 'く' }, { t: 'るって。' }], translation: "They say a water truck comes to the community hall at 8 tomorrow." },
      { speaker: 'B', text: 'そうなんですか。助かります。', furigana: [{ t: 'そうなんですか。' }, { t: '助', r: 'たす' }, { t: 'かります。' }], translation: 'Really? That helps a lot.' },
    ],
    questions: [
      { question: 'What is the problem?', options: ['No running water', 'No electricity', 'No food', 'No gas'], correctIndex: 0, explanation: '水（みず）が出（で）ません.' },
      { question: 'What is coming at 8 tomorrow?', options: ['A water-supply truck', 'A delivery van', 'A bus', 'A doctor'], correctIndex: 0, explanation: '給水車（きゅうすいしゃ）が来（く）る.' },
    ],
  },
  {
    id: 'ja-iro-e2-17',
    title: 'Have you got used to Japan?',
    titleJapanese: '日本の生活には慣れましたか？',
    setting: 'Chatting about adjusting to life in Japan.',
    level: 'Irodori Elementary 2',
    lesson: 17,
    lines: [
      { speaker: 'A', text: '日本に来てからもうすぐ1年ですね。日本には、慣れましたか？', furigana: [{ t: '日本', r: 'にほん' }, { t: 'に' }, { t: '来', r: 'き' }, { t: 'てからもうすぐ' }, { t: '1年', r: 'いちねん' }, { t: 'ですね。' }, { t: '日本', r: 'にほん' }, { t: 'には、' }, { t: '慣', r: 'な' }, { t: 'れましたか？' }], translation: "It's almost a year since you came to Japan. Have you got used to it?" },
      { speaker: 'B', text: 'うーん、まあまあです。', furigana: [{ t: 'うーん、まあまあです。' }], translation: 'Hmm, more or less.' },
      { speaker: 'A', text: 'でも、日本語、うまくなりましたよね。どうやって勉強してるんですか？', furigana: [{ t: 'でも、' }, { t: '日本語', r: 'にほんご' }, { t: '、うまくなりましたよね。どうやって' }, { t: '勉強', r: 'べんきょう' }, { t: 'してるんですか？' }], translation: "But your Japanese has got better, hasn't it? How do you study?" },
      { speaker: 'B', text: 'ドラマが大好きで、毎日見てます。好きなセリフをまねして覚えます。', furigana: [{ t: 'ドラマが' }, { t: '大好', r: 'だいす' }, { t: 'きで、' }, { t: '毎日', r: 'まいにち' }, { t: '見', r: 'み' }, { t: 'てます。' }, { t: '好', r: 'す' }, { t: 'きなセリフをまねして' }, { t: '覚', r: 'おぼ' }, { t: 'えます。' }], translation: 'I love TV dramas and watch them every day. I copy my favourite lines and memorise them.' },
    ],
    questions: [
      { question: 'How long has B been in Japan?', options: ['Almost a year', 'A month', 'Five years', 'Ten years'], correctIndex: 0, explanation: '来（き）てからもうすぐ1年（いちねん）.' },
      { question: 'How does B study Japanese?', options: ['Watching dramas daily', 'Reading books', 'In a class', 'With an app'], correctIndex: 0, explanation: 'ドラマを毎日（まいにち）見（み）て、セリフを覚（おぼ）える.' },
    ],
  },
];
