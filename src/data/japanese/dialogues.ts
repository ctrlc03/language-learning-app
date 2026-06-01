/**
 * Hand-authored Japanese dialogues, aligned to Irodori Starter / Elementary
 * topics. Each dialogue powers two exercise types:
 *   - dialogue-reading: progressive tap-to-reveal reading practice
 *   - dialogue-comprehension: read the dialogue, answer a multiple-choice question
 *
 * `reading` holds the full hiragana reading of the line (furigana-style),
 * mapped onto DialogueLine.pinyin when building exercises so the existing
 * reading-toggle UI works unchanged.
 */

export interface JapaneseDialogueLine {
  speaker: string;
  text: string;       // Japanese (kanji + kana)
  reading: string;    // full hiragana reading
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
    id: 'ja-dlg-001',
    title: 'Self-introduction',
    titleJapanese: 'じこしょうかい',
    setting: 'Two people meet for the first time at a party.',
    level: 'Irodori Starter',
    lesson: 1,
    lines: [
      { speaker: 'A', text: 'はじめまして。マリアです。', reading: 'はじめまして。マリアです。', translation: "Nice to meet you. I'm Maria." },
      { speaker: 'B', text: 'はじめまして。田中です。どうぞよろしく。', reading: 'はじめまして。たなかです。どうぞよろしく。', translation: "Nice to meet you. I'm Tanaka. Pleased to meet you." },
      { speaker: 'A', text: '田中さんは、お仕事は何ですか。', reading: 'たなかさんは、おしごとはなんですか。', translation: 'Tanaka-san, what is your job?' },
      { speaker: 'B', text: '銀行員です。マリアさんは？', reading: 'ぎんこういんです。マリアさんは？', translation: "I'm a bank employee. And you, Maria?" },
      { speaker: 'A', text: 'わたしは学生です。', reading: 'わたしはがくせいです。', translation: 'I am a student.' },
    ],
    questions: [
      { question: "What is Tanaka's job?", options: ['Bank employee', 'Teacher', 'Student', 'Doctor'], correctIndex: 0, explanation: '銀行員（ぎんこういん）= bank employee.' },
      { question: 'What does Maria do?', options: ['She is a student', 'She is a bank employee', 'She is a nurse', 'She is a cook'], correctIndex: 0, explanation: 'わたしは学生です = I am a student.' },
    ],
  },
  {
    id: 'ja-dlg-002',
    title: 'Ordering at a café',
    titleJapanese: 'カフェでちゅうもん',
    setting: 'A customer orders at a café counter.',
    level: 'Irodori Elementary 1',
    lesson: 5,
    lines: [
      { speaker: 'A', text: 'すみません、メニューをください。', reading: 'すみません、メニューをください。', translation: 'Excuse me, may I have a menu?' },
      { speaker: 'B', text: 'はい、どうぞ。', reading: 'はい、どうぞ。', translation: 'Yes, here you are.' },
      { speaker: 'A', text: 'コーヒーとサンドイッチをお願いします。', reading: 'コーヒーとサンドイッチをおねがいします。', translation: 'A coffee and a sandwich, please.' },
      { speaker: 'B', text: 'かしこまりました。アイスコーヒーですか、ホットコーヒーですか。', reading: 'かしこまりました。アイスコーヒーですか、ホットコーヒーですか。', translation: 'Certainly. Iced coffee or hot coffee?' },
      { speaker: 'A', text: 'ホットでお願いします。', reading: 'ホットでおねがいします。', translation: 'Hot, please.' },
    ],
    questions: [
      { question: 'What does the customer order?', options: ['Coffee and a sandwich', 'Tea and cake', 'Juice and salad', 'Just water'], correctIndex: 0, explanation: 'コーヒーとサンドイッチ = coffee and a sandwich.' },
      { question: 'Which coffee does the customer choose?', options: ['Hot', 'Iced', 'With milk', 'Large'], correctIndex: 0, explanation: 'ホットでお願いします = hot, please.' },
    ],
  },
  {
    id: 'ja-dlg-003',
    title: 'Talking about family',
    titleJapanese: 'かぞくのはなし',
    setting: 'A friend looks at a family photo.',
    level: 'Irodori Starter',
    lesson: 7,
    lines: [
      { speaker: 'A', text: 'これはわたしの家族の写真です。', reading: 'これはわたしのかぞくのしゃしんです。', translation: 'This is a photo of my family.' },
      { speaker: 'B', text: 'わあ、にぎやかですね。何人家族ですか。', reading: 'わあ、にぎやかですね。なんにんかぞくですか。', translation: 'Wow, lively! How many people are in your family?' },
      { speaker: 'A', text: '五人家族です。父と母と兄と妹です。', reading: 'ごにんかぞくです。ちちとははとあにといもうとです。', translation: 'Five people. My father, mother, older brother, and younger sister.' },
      { speaker: 'B', text: '妹さんは学生ですか。', reading: 'いもうとさんはがくせいですか。', translation: 'Is your younger sister a student?' },
      { speaker: 'A', text: 'はい、高校生です。', reading: 'はい、こうこうせいです。', translation: 'Yes, she is a high school student.' },
    ],
    questions: [
      { question: 'How many people are in the family?', options: ['Five', 'Four', 'Three', 'Six'], correctIndex: 0, explanation: '五人家族（ごにんかぞく）= a family of five.' },
      { question: 'What is the younger sister?', options: ['A high school student', 'A teacher', 'A university student', 'A child'], correctIndex: 0, explanation: '高校生（こうこうせい）= high school student.' },
    ],
  },
  {
    id: 'ja-dlg-004',
    title: 'Shopping for a T-shirt',
    titleJapanese: 'かいもの',
    setting: 'A customer is buying clothes at a shop.',
    level: 'Irodori Elementary 1',
    lesson: 9,
    lines: [
      { speaker: 'A', text: 'すみません、このTシャツはいくらですか。', reading: 'すみません、このティーシャツはいくらですか。', translation: 'Excuse me, how much is this T-shirt?' },
      { speaker: 'B', text: '二千円です。', reading: 'にせんえんです。', translation: 'It is 2,000 yen.' },
      { speaker: 'A', text: 'もう少し安いのはありますか。', reading: 'もうすこしやすいのはありますか。', translation: 'Do you have a slightly cheaper one?' },
      { speaker: 'B', text: 'こちらは千五百円です。', reading: 'こちらはせんごひゃくえんです。', translation: 'This one is 1,500 yen.' },
      { speaker: 'A', text: 'じゃあ、それをください。', reading: 'じゃあ、それをください。', translation: "Then I'll take that one." },
    ],
    questions: [
      { question: 'How much is the first T-shirt?', options: ['2,000 yen', '1,500 yen', '2,500 yen', '1,000 yen'], correctIndex: 0, explanation: '二千円（にせんえん）= 2,000 yen.' },
      { question: 'Which one does the customer buy?', options: ['The 1,500 yen one', 'The 2,000 yen one', 'Neither', 'Both'], correctIndex: 0, explanation: 'They choose こちら (1,500 yen) — the cheaper one.' },
    ],
  },
  {
    id: 'ja-dlg-005',
    title: 'Asking for directions',
    titleJapanese: 'みちをきく',
    setting: 'A traveler asks a passerby how to reach the station.',
    level: 'Irodori Elementary 1',
    lesson: 11,
    lines: [
      { speaker: 'A', text: 'すみません、駅はどこですか。', reading: 'すみません、えきはどこですか。', translation: 'Excuse me, where is the station?' },
      { speaker: 'B', text: '駅ですか。まっすぐ行って、次の角を右に曲がってください。', reading: 'えきですか。まっすぐいって、つぎのかどをみぎにまがってください。', translation: 'The station? Go straight and turn right at the next corner.' },
      { speaker: 'A', text: 'どのくらいかかりますか。', reading: 'どのくらいかかりますか。', translation: 'How long does it take?' },
      { speaker: 'B', text: '歩いて五分ぐらいです。', reading: 'あるいてごふんぐらいです。', translation: 'About five minutes on foot.' },
      { speaker: 'A', text: 'ありがとうございます。', reading: 'ありがとうございます。', translation: 'Thank you very much.' },
    ],
    questions: [
      { question: 'Where does the traveler want to go?', options: ['The station', 'The post office', 'The hospital', 'The bank'], correctIndex: 0, explanation: '駅（えき）= station.' },
      { question: 'Where should they turn?', options: ['Right at the next corner', 'Left at the next corner', 'Right at the traffic light', 'Nowhere, go straight'], correctIndex: 0, explanation: '次の角を右に曲がって = turn right at the next corner.' },
      { question: 'How long does it take?', options: ['About 5 minutes on foot', 'About 15 minutes', 'About 1 hour', '10 minutes by bus'], correctIndex: 0, explanation: '歩いて五分ぐらい = about 5 minutes walking.' },
    ],
  },
  {
    id: 'ja-dlg-006',
    title: 'Weekend plans',
    titleJapanese: 'しゅうまつのよてい',
    setting: 'Two coworkers chat about their weekend plans.',
    level: 'Irodori Elementary 1',
    lesson: 12,
    lines: [
      { speaker: 'A', text: '週末、何をしますか。', reading: 'しゅうまつ、なにをしますか。', translation: 'What are you doing this weekend?' },
      { speaker: 'B', text: '友だちと映画を見に行きます。山田さんは？', reading: 'ともだちとえいがをみにいきます。やまださんは？', translation: "I'm going to see a movie with a friend. And you, Yamada?" },
      { speaker: 'A', text: 'わたしは家で本を読みます。それから料理をします。', reading: 'わたしはいえでほんをよみます。それからりょうりをします。', translation: "I'll read a book at home. After that I'll cook." },
      { speaker: 'B', text: 'いいですね。', reading: 'いいですね。', translation: 'That sounds nice.' },
    ],
    questions: [
      { question: 'What will B do this weekend?', options: ['See a movie with a friend', 'Read a book at home', 'Cook dinner', 'Go shopping'], correctIndex: 0, explanation: '友だちと映画を見に行きます = going to see a movie with a friend.' },
      { question: 'What will Yamada (A) do?', options: ['Read a book and cook', 'Watch a movie', 'Play sports', 'Sleep all day'], correctIndex: 0, explanation: '本を読みます… それから料理をします = read a book, then cook.' },
    ],
  },
  {
    id: 'ja-dlg-007',
    title: 'Daily schedule',
    titleJapanese: 'まいにちのせいかつ',
    setting: 'Asking a friend about their daily routine.',
    level: 'Irodori Starter',
    lesson: 8,
    lines: [
      { speaker: 'A', text: '毎日、何時に起きますか。', reading: 'まいにち、なんじにおきますか。', translation: 'What time do you get up every day?' },
      { speaker: 'B', text: '六時半に起きます。', reading: 'ろくじはんにおきます。', translation: 'I get up at 6:30.' },
      { speaker: 'A', text: '早いですね。何時に寝ますか。', reading: 'はやいですね。なんじにねますか。', translation: "That's early. What time do you go to bed?" },
      { speaker: 'B', text: '十一時に寝ます。', reading: 'じゅういちじにねます。', translation: 'I go to bed at 11:00.' },
    ],
    questions: [
      { question: 'What time does B get up?', options: ['6:30', '7:00', '6:00', '11:00'], correctIndex: 0, explanation: '六時半（ろくじはん）= half past six.' },
      { question: 'What time does B go to bed?', options: ['11:00', '10:30', '6:30', '9:00'], correctIndex: 0, explanation: '十一時（じゅういちじ）= 11 o\'clock.' },
    ],
  },
  {
    id: 'ja-dlg-008',
    title: 'Buying a train ticket',
    titleJapanese: 'えきできっぷをかう',
    setting: 'A passenger asks station staff about a ticket to Tokyo.',
    level: 'Irodori Elementary 1',
    lesson: 11,
    lines: [
      { speaker: 'A', text: 'すみません、東京までいくらですか。', reading: 'すみません、とうきょうまでいくらですか。', translation: 'Excuse me, how much is it to Tokyo?' },
      { speaker: 'B', text: '八百円です。', reading: 'はっぴゃくえんです。', translation: 'It is 800 yen.' },
      { speaker: 'A', text: '何番線ですか。', reading: 'なんばんせんですか。', translation: 'Which platform is it?' },
      { speaker: 'B', text: '三番線です。', reading: 'さんばんせんです。', translation: 'Platform 3.' },
      { speaker: 'A', text: 'ありがとうございます。', reading: 'ありがとうございます。', translation: 'Thank you very much.' },
    ],
    questions: [
      { question: 'How much is the ticket to Tokyo?', options: ['800 yen', '300 yen', '8,000 yen', '80 yen'], correctIndex: 0, explanation: '八百円（はっぴゃくえん）= 800 yen.' },
      { question: 'Which platform should the passenger use?', options: ['Platform 3', 'Platform 8', 'Platform 1', 'Platform 2'], correctIndex: 0, explanation: '三番線（さんばんせん）= platform 3.' },
    ],
  },
  {
    id: 'ja-dlg-009',
    title: 'Making plans for tomorrow',
    titleJapanese: 'あしたのやくそく',
    setting: 'Two friends decide to go to the park together.',
    level: 'Irodori Elementary 1',
    lesson: 10,
    lines: [
      { speaker: 'A', text: '明日は天気がいいですよ。', reading: 'あしたはてんきがいいですよ。', translation: 'The weather will be good tomorrow.' },
      { speaker: 'B', text: 'そうですか。じゃあ、公園に行きませんか。', reading: 'そうですか。じゃあ、こうえんにいきませんか。', translation: 'Really? Then shall we go to the park?' },
      { speaker: 'A', text: 'いいですね。何時に会いましょうか。', reading: 'いいですね。なんじにあいましょうか。', translation: 'Sounds good. What time shall we meet?' },
      { speaker: 'B', text: '十時に駅で会いましょう。', reading: 'じゅうじにえきであいましょう。', translation: "Let's meet at the station at 10:00." },
    ],
    questions: [
      { question: "What will tomorrow's weather be?", options: ['Good', 'Rainy', 'Snowy', 'Cloudy'], correctIndex: 0, explanation: '天気がいい = the weather is good.' },
      { question: 'Where will they meet?', options: ['At the station', 'At the park', 'At a café', 'At home'], correctIndex: 0, explanation: '駅で会いましょう = let\'s meet at the station.' },
      { question: 'What time will they meet?', options: ['10:00', '11:00', '9:00', '12:00'], correctIndex: 0, explanation: '十時（じゅうじ）= 10 o\'clock.' },
    ],
  },
  {
    id: 'ja-dlg-010',
    title: 'At the clinic',
    titleJapanese: 'びょういんで',
    setting: 'A doctor asks a patient about their symptoms.',
    level: 'Irodori Elementary 2',
    lesson: 14,
    lines: [
      { speaker: 'A', text: 'どうしましたか。', reading: 'どうしましたか。', translation: "What's the matter?" },
      { speaker: 'B', text: '昨日から頭が痛いです。', reading: 'きのうからあたまがいたいです。', translation: 'I have had a headache since yesterday.' },
      { speaker: 'A', text: '熱はありますか。', reading: 'ねつはありますか。', translation: 'Do you have a fever?' },
      { speaker: 'B', text: 'はい、少しあります。', reading: 'はい、すこしあります。', translation: 'Yes, a little.' },
      { speaker: 'A', text: 'じゃあ、この薬を飲んでください。お大事に。', reading: 'じゃあ、このくすりをのんでください。おだいじに。', translation: 'Then please take this medicine. Take care.' },
    ],
    questions: [
      { question: 'What is wrong with the patient?', options: ['A headache', 'A stomachache', 'A toothache', 'A backache'], correctIndex: 0, explanation: '頭が痛い（あたまがいたい）= headache.' },
      { question: 'Does the patient have a fever?', options: ['Yes, a little', 'No, none', 'Yes, a high one', 'They are not sure'], correctIndex: 0, explanation: '少しあります = there is a little (fever).' },
    ],
  },
];
