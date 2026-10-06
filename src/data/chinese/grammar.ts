export interface GrammarRule {
  id: string;
  /**
   * Lesson numbers (matching lessons.json) where this pattern is taught or
   * revisited. A rule can belong to several — 了 is introduced in L25 and
   * extended in L26 — which is what lets the Learn page and the daily session
   * scope practice to a lesson.
   */
  lessons: number[];
  title: string;
  titleChinese: string;
  pattern: string;
  explanation: string;
  examples: { chinese: string; pinyin: string; english: string; note?: string }[];
}

export const chineseGrammarRules: GrammarRule[] = [
  // ── Sentence Structure ──
  {
    id: 'gr-01',
    lessons: [3],
    title: 'Basic Sentence Order',
    titleChinese: '基本句型',
    pattern: 'Subject + Verb + Object',
    explanation:
      'Chinese follows SVO order, same as English. No verb conjugation — the verb stays the same regardless of tense or subject.',
    examples: [
      { chinese: '我吃米饭。', pinyin: 'Wǒ chī mǐfàn.', english: 'I eat rice.' },
      { chinese: '他喝咖啡。', pinyin: 'Tā hē kāfēi.', english: 'He drinks coffee.' },
      { chinese: '我们学中文。', pinyin: 'Wǒmen xué zhōngwén.', english: 'We study Chinese.' },
    ],
  },
  {
    id: 'gr-02',
    lessons: [3, 27, 28],
    title: 'Negation with 不',
    titleChinese: '用不否定',
    pattern: 'Subject + 不 + Verb/Adj',
    explanation:
      '不 bù negates verbs and adjectives in the present/future. It changes to bú before a 4th tone word.',
    examples: [
      { chinese: '我不吃肉。', pinyin: 'Wǒ bù chī ròu.', english: "I don't eat meat." },
      { chinese: '他不高。', pinyin: 'Tā bù gāo.', english: 'He is not tall.' },
      {
        chinese: '我不是学生。',
        pinyin: 'Wǒ bú shì xuéshēng.',
        english: "I'm not a student.",
        note: '不 → bú before 4th tone 是',
      },
    ],
  },
  {
    id: 'gr-03',
    lessons: [3, 25, 27],
    title: 'Negation with 没(有)',
    titleChinese: '用没有否定',
    pattern: 'Subject + 没(有) + Verb',
    explanation:
      '没有 méiyǒu negates past actions or possession. 有 can be omitted after 没 for verbs.',
    examples: [
      { chinese: '我没有猫。', pinyin: 'Wǒ méiyǒu māo.', english: "I don't have a cat." },
      { chinese: '他没去。', pinyin: 'Tā méi qù.', english: "He didn't go." },
      { chinese: '我没吃早饭。', pinyin: 'Wǒ méi chī zǎofàn.', english: "I didn't eat breakfast." },
    ],
  },

  // ── Questions ──
  {
    id: 'gr-04',
    lessons: [13, 25, 27],
    title: 'Yes/No Questions with 吗',
    titleChinese: '吗字问句',
    pattern: 'Statement + 吗？',
    explanation:
      'Add 吗 to the end of any statement to turn it into a yes/no question. No word order change needed.',
    examples: [
      { chinese: '你是学生吗？', pinyin: 'Nǐ shì xuéshēng ma?', english: 'Are you a student?' },
      { chinese: '他忙吗？', pinyin: 'Tā máng ma?', english: 'Is he busy?' },
      { chinese: '你吃米饭吗？', pinyin: 'Nǐ chī mǐfàn ma?', english: 'Do you eat rice?' },
    ],
  },
  {
    id: 'gr-05',
    lessons: [13, 25, 27],
    title: 'Affirmative-Negative Questions',
    titleChinese: '正反疑问句',
    pattern: 'Verb/Adj + 不 + Verb/Adj？',
    explanation:
      'Instead of 吗, repeat the verb or adjective with 不 in between. Both forms mean the same thing — this form sounds more natural in spoken Chinese.',
    examples: [
      { chinese: '他忙不忙？', pinyin: 'Tā máng bù máng?', english: 'Is he busy (or not)?' },
      {
        chinese: '你吃不吃米饭？',
        pinyin: 'Nǐ chī bù chī mǐfàn?',
        english: 'Do you eat rice (or not)?',
      },
      {
        chinese: '你想不想吃饺子？',
        pinyin: 'Nǐ xiǎng bù xiǎng chī jiǎozi?',
        english: 'Do you want dumplings (or not)?',
      },
      {
        chinese: '你有没有男朋友？',
        pinyin: 'Nǐ yǒu méiyǒu nánpéngyou?',
        english: 'Do you have a boyfriend?',
        note: '有 uses 没 instead of 不',
      },
    ],
  },
  {
    id: 'gr-06',
    lessons: [13, 25, 26, 27, 32],
    title: 'Question Words',
    titleChinese: '疑问词',
    pattern: 'Question word stays in place of the answer',
    explanation:
      'Unlike English, question words stay where the answer would go. No word order change.',
    examples: [
      { chinese: '你是哪里人？', pinyin: 'Nǐ shì nǎlǐ rén?', english: 'Where are you from?' },
      {
        chinese: '你叫什么名字？',
        pinyin: 'Nǐ jiào shénme míngzi?',
        english: 'What is your name?',
      },
      { chinese: '你怎么走？', pinyin: 'Nǐ zěnme zǒu?', english: 'How do you get there?' },
      { chinese: '你住几层？', pinyin: 'Nǐ zhù jǐ céng?', english: 'Which floor do you live on?' },
    ],
  },
  {
    id: 'gr-07',
    lessons: [13, 25, 26, 27, 28, 29, 31, 32],
    title: 'How Is...? with 怎么样',
    titleChinese: '怎么样',
    pattern: 'Subject/Verb + 怎么样？',
    explanation:
      "Ask someone's opinion or make a suggestion. Can also be prefixed with 你觉得 (what do you think).",
    examples: [
      {
        chinese: '这件衣服怎么样？',
        pinyin: 'Zhè jiàn yīfu zěnmeyàng?',
        english: 'How is this piece of clothing?',
      },
      {
        chinese: '晚上吃意大利面怎么样？',
        pinyin: 'Wǎnshàng chī yìdàlì miàn zěnmeyàng?',
        english: 'How about eating pasta tonight?',
      },
      { chinese: '你身体怎么样？', pinyin: 'Nǐ shēntǐ zěnmeyàng?', english: 'How is your health?' },
    ],
  },

  // ── Intensifiers ──
  {
    id: 'gr-08',
    lessons: [3, 27, 32],
    title: '很 vs 真 vs 太 — Degree Words',
    titleChinese: '很、真、太',
    pattern: 'Subject + 很/真/太 + Adj (+ 了)',
    explanation:
      '很 hěn = neutral "very" (stating a fact). 真 zhēn = "really/so" (personal feeling, praise, surprise). 太 tài = "too/so" (extreme, needs 了 at the end).',
    examples: [
      { chinese: '他很高。', pinyin: 'Tā hěn gāo.', english: 'He is tall.', note: 'Neutral fact' },
      {
        chinese: '你真好！',
        pinyin: 'Nǐ zhēn hǎo!',
        english: "You're so kind!",
        note: 'Personal praise',
      },
      {
        chinese: '太好了！',
        pinyin: 'Tài hǎo le!',
        english: "That's great!",
        note: 'Strong feeling, needs 了',
      },
      {
        chinese: '太贵了。',
        pinyin: 'Tài guì le.',
        english: 'Too expensive.',
        note: 'Negative extreme',
      },
    ],
  },
  {
    id: 'gr-09',
    lessons: [3, 32],
    title: 'Most / Superlative with 最',
    titleChinese: '用最表示最高级',
    pattern: 'Subject + 最 + Adj/Verb',
    explanation: '最 zuì = "most". Place before an adjective or verb to form the superlative.',
    examples: [
      {
        chinese: '你最喜欢吃什么肉？',
        pinyin: 'Nǐ zuì xǐhuān chī shénme ròu?',
        english: 'What meat do you like most?',
      },
      {
        chinese: '这个最贵。',
        pinyin: 'Zhège zuì guì.',
        english: 'This one is the most expensive.',
      },
    ],
  },

  // ── Commands & Requests ──
  {
    id: 'gr-10',
    lessons: [19, 27, 29, 30, 31, 33],
    title: "Don't with 别",
    titleChinese: '别字祈使句',
    pattern: '别 + Verb',
    explanation: '别 bié + verb = "don\'t do something". A soft command or advice.',
    examples: [
      { chinese: '别担心。', pinyin: 'Bié dānxīn.', english: "Don't worry." },
      { chinese: '别走。', pinyin: 'Bié zǒu.', english: "Don't leave." },
      { chinese: '别害怕。', pinyin: 'Bié hàipà.', english: "Don't be afraid." },
      { chinese: '别说谎。', pinyin: 'Bié shuōhuǎng.', english: "Don't lie." },
      { chinese: '别放弃。', pinyin: 'Bié fàngqì.', english: "Don't give up." },
    ],
  },
  {
    id: 'gr-11',
    lessons: [10, 26, 31],
    title: 'Can You...? with 能',
    titleChinese: '能字请求句',
    pattern: '你能 + Verb + 吗？',
    explanation: '能 néng = "can/able to". Used for polite requests or asking about ability.',
    examples: [
      {
        chinese: '你能帮我拍张照片吗？',
        pinyin: 'Nǐ néng bāng wǒ pāi zhāng zhàopiàn ma?',
        english: 'Can you take a photo for me?',
      },
      {
        chinese: '你能告诉我怎么走吗？',
        pinyin: 'Nǐ néng gàosu wǒ zěnme zǒu ma?',
        english: 'Can you tell me how to get there?',
      },
      {
        chinese: '你能往左走几步吗？',
        pinyin: 'Nǐ néng wǎng zuǒ zǒu jǐ bù ma?',
        english: 'Can you walk a few steps to the left?',
      },
    ],
  },

  // ── Location & Direction ──
  {
    id: 'gr-12',
    lessons: [10, 27, 28, 31],
    title: 'Location with 在',
    titleChinese: '在字表示位置',
    pattern: 'Subject + 在 + Place',
    explanation: '在 zài indicates where something or someone is located.',
    examples: [
      { chinese: '他在那里。', pinyin: 'Tā zài nàlǐ.', english: 'He is over there.' },
      {
        chinese: '洗手间在那边。',
        pinyin: 'Xǐshǒujiān zài nàbiān.',
        english: 'The restroom is over there.',
      },
      {
        chinese: '沙发在房间中间。',
        pinyin: 'Shāfā zài fángjiān zhōngjiān.',
        english: 'The sofa is in the middle of the room.',
      },
    ],
  },
  {
    id: 'gr-13',
    lessons: [10],
    title: 'Direction with 往',
    titleChinese: '往字表示方向',
    pattern: '往 + Direction + Verb',
    explanation: '往 wǎng = "towards". Used with direction words to indicate movement.',
    examples: [
      { chinese: '往前走。', pinyin: 'Wǎng qián zǒu.', english: 'Walk forward.' },
      { chinese: '往左拐。', pinyin: 'Wǎng zuǒ guǎi.', english: 'Turn left.' },
      {
        chinese: '那个人往左走了3米。',
        pinyin: 'Nàge rén wǎng zuǒ zǒu le sān mǐ.',
        english: 'That person walked 3 metres to the left.',
      },
    ],
  },
  {
    id: 'gr-14',
    lessons: [10],
    title: 'From with 从...来',
    titleChinese: '从...来',
    pattern: '从 + Place + 来',
    explanation: '从 cóng = "from". Used with 来 lái (come) to express origin.',
    examples: [
      { chinese: '我从北京来。', pinyin: 'Wǒ cóng Běijīng lái.', english: 'I come from Beijing.' },
      {
        chinese: '从这儿往前走。',
        pinyin: 'Cóng zhèr wǎng qián zǒu.',
        english: 'Go straight from here.',
      },
    ],
  },

  // ── Result Complements ──
  {
    id: 'gr-15',
    lessons: [20, 26, 33],
    title: 'Result Complement with 见/到',
    titleChinese: '结果补语：见/到',
    pattern: 'Verb + 见 / Verb + 到',
    explanation:
      'Adding 见 jiàn or 到 dào after a perception verb shows the action was completed/successful. 看 = looking / 看见 = actually saw it.',
    examples: [
      {
        chinese: '看见熊猫我们非常高兴。',
        pinyin: 'Kànjiàn xióngmāo wǒmen fēicháng gāoxìng.',
        english: 'Seeing the pandas we were extremely happy.',
      },
      { chinese: '你听见了吗？', pinyin: 'Nǐ tīngjiàn le ma?', english: 'Did you hear it?' },
      { chinese: '我看见了熊猫。', pinyin: 'Wǒ kànjiàn le xióngmāo.', english: 'I saw a panda.' },
    ],
  },

  // ── Duration & Time ──
  {
    id: 'gr-16',
    lessons: [17],
    title: 'How Long with 多久/多长时间',
    titleChinese: '多久/多长时间',
    pattern: 'Verb + 多久/多长时间？',
    explanation: '多久 duō jiǔ and 多长时间 duō cháng shíjiān both ask "how long".',
    examples: [
      {
        chinese: '你住这里多久了？',
        pinyin: 'Nǐ zhù zhèlǐ duō jiǔ le?',
        english: 'How long have you lived here?',
      },
      {
        chinese: '走路要多久？',
        pinyin: 'Zǒulù yào duō jiǔ?',
        english: 'How long does it take to walk?',
      },
      { chinese: '多长时间？', pinyin: 'Duō cháng shíjiān?', english: 'How long will it take?' },
    ],
  },
  {
    id: 'gr-17',
    lessons: [25],
    title: 'Just/Recently with 刚',
    titleChinese: '刚字表示最近',
    pattern: 'Subject + 刚 + Verb',
    explanation: '刚 gāng = "just" — indicates something happened very recently.',
    examples: [
      {
        chinese: '我上周刚搬来。',
        pinyin: 'Wǒ shàng zhōu gāng bān lái.',
        english: 'I just moved in last week.',
      },
      { chinese: '我刚吃完。', pinyin: 'Wǒ gāng chī wán.', english: 'I just finished eating.' },
    ],
  },

  // ── Comparisons & Descriptions ──
  {
    id: 'gr-18',
    lessons: [21, 32],
    title: 'Both...and... with 又...又...',
    titleChinese: '又...又...',
    pattern: 'Subject + 又 + Adj1 + 又 + Adj2',
    explanation: 'Describes something with two qualities at the same time.',
    examples: [
      {
        chinese: '他又高又壮。',
        pinyin: 'Tā yòu gāo yòu zhuàng.',
        english: 'He is both tall and strong.',
      },
      {
        chinese: '那个蓝色的又大又便宜。',
        pinyin: 'Nà ge lánsè de yòu dà yòu piányi.',
        english: 'That blue one is both big and cheap.',
      },
    ],
  },
  {
    id: 'gr-19',
    lessons: [25, 27],
    title: 'Completed Action with 了',
    titleChinese: '了字表示完成',
    pattern: 'Verb + 了',
    explanation:
      '了 le after a verb indicates the action is completed. It is NOT the same as past tense — it marks completion.',
    examples: [
      {
        chinese: '我住了两年了。',
        pinyin: 'Wǒ zhù le liǎng nián le.',
        english: "I've lived here two years.",
      },
      { chinese: '他走了。', pinyin: 'Tā zǒu le.', english: 'He left.' },
      { chinese: '我吃了早饭。', pinyin: 'Wǒ chī le zǎofàn.', english: 'I ate breakfast.' },
    ],
  },
  {
    id: 'gr-21',
    lessons: [7],
    title: 'Chinese Discounts with 折',
    titleChinese: '打折',
    pattern: 'Number + 折 = "you pay X0%"',
    explanation:
      'Chinese discounts work opposite to English! The number refers to how much you PAY, not how much you save. 8折 = you pay 80% = 20% off. Use 打X折 dǎ X zhé as the verb.',
    examples: [
      {
        chinese: '今天打8折。',
        pinyin: 'Jīntiān dǎ bā zhé.',
        english: "Today it's 20% off.",
        note: '8折 = pay 80%',
      },
      {
        chinese: '这件衣服9折。',
        pinyin: 'Zhè jiàn yīfu jiǔ zhé.',
        english: '10% off this piece of clothing.',
        note: '9折 = pay 90%',
      },
      { chinese: '5折！', pinyin: 'Wǔ zhé!', english: 'Half price!', note: '5折 = pay 50%' },
      {
        chinese: '你能给我个折扣吗？',
        pinyin: 'Nǐ néng gěi wǒ ge zhékòu ma?',
        english: 'Can you give me a discount?',
      },
    ],
  },
  {
    id: 'gr-22',
    lessons: [7],
    title: 'Bargaining with 行',
    titleChinese: '行字议价',
    pattern: '行 / 不行 / 行吗？',
    explanation:
      '行 xíng = "okay / that works / fine". Used frequently in bargaining and everyday agreement. 不行 = not okay.',
    examples: [
      { chinese: '10块行吗？', pinyin: 'Shí kuài xíng ma?', english: 'Is 10 kuai okay?' },
      { chinese: '行！', pinyin: 'Xíng!', english: 'Okay!' },
      {
        chinese: '不行，太贵了。',
        pinyin: 'Bù xíng, tài guì le.',
        english: 'No way, too expensive.',
      },
      { chinese: '行，没问题！', pinyin: 'Xíng, méi wèntí!', english: 'Sure, no problem!' },
    ],
  },
  {
    id: 'gr-20',
    lessons: [7, 26, 27, 30],
    title: 'Measure Words',
    titleChinese: '量词',
    pattern: 'Number + Measure Word + Noun',
    explanation:
      'Chinese requires a measure word between a number and a noun. 个 gè is the most common/default one.',
    examples: [
      { chinese: '一个人', pinyin: 'yī gè rén', english: 'one person' },
      { chinese: '一只猫', pinyin: 'yī zhī māo', english: 'one cat', note: '只 for animals' },
      {
        chinese: '一件衣服',
        pinyin: 'yī jiàn yīfu',
        english: 'one piece of clothing',
        note: '件 for clothing/items',
      },
      {
        chinese: '一张照片',
        pinyin: 'yī zhāng zhàopiàn',
        english: 'one photo',
        note: '张 for flat objects',
      },
      { chinese: '三层', pinyin: 'sān céng', english: '3rd floor', note: '层 for floors/levels' },
    ],
  },
  {
    id: 'gr-23',
    lessons: [17],
    title: 'Taking Transport with 坐',
    titleChinese: '坐交通',
    pattern: '坐 + Transport',
    explanation:
      '坐 zuò (to sit) is used to mean "to take" a form of transport. It works for subway, bus, taxi, and more. Pair it with 多少路 to ask which bus line.',
    examples: [
      {
        chinese: '坐地铁二十分钟。',
        pinyin: 'Zuò dìtiě èrshí fēnzhōng.',
        english: '20 minutes by subway.',
      },
      {
        chinese: '坐出租车多少钱？',
        pinyin: 'Zuò chūzūchē duōshao qián?',
        english: 'How much is a taxi?',
      },
      {
        chinese: '我应该坐多少路车？',
        pinyin: 'Wǒ yīnggāi zuò duōshao lù chē?',
        english: 'Which bus line should I take?',
      },
      {
        chinese: '去长城坐多少路车？',
        pinyin: 'Qù Chángchéng zuò duōshao lù chē?',
        english: 'Which bus goes to the Great Wall?',
      },
    ],
  },
  {
    id: 'gr-24',
    lessons: [7],
    title: 'Half with 一半',
    titleChinese: '一半',
    pattern: '一半 / 一半的 + Noun',
    explanation:
      '一半 yī bàn means "half". Use it before a noun (with 的) to mean "half of something". 半价 bànjià = half price.',
    examples: [
      {
        chinese: '一半的人不吃辣。',
        pinyin: 'Yī bàn de rén bù chī là.',
        english: "Half of the people don't eat spicy food.",
      },
      {
        chinese: '学生半价。',
        pinyin: 'Xuésheng bànjià.',
        english: 'Students pay half price.',
        note: '半价 = half price',
      },
      {
        chinese: '5折是一半的价格。',
        pinyin: 'Wǔ zhé shì yī bàn de jiàgé.',
        english: '5折 is half the price.',
        note: '5折 = 50% off',
      },
    ],
  },
  {
    id: 'gr-25',
    lessons: [25],
    title: 'Stopped Doing with 不 + V + 了',
    titleChinese: '不…了',
    pattern: 'Subject + 不 + Verb + 了',
    explanation:
      '不…了 signals that someone has stopped or is no longer doing something, or that a situation has changed. Different from simple negation — it implies a change from before.',
    examples: [
      {
        chinese: '我不吃了。',
        pinyin: 'Wǒ bù chī le.',
        english: "I'm done eating / I won't eat anymore.",
      },
      { chinese: '他不来了。', pinyin: 'Tā bù lái le.', english: "He's not coming anymore." },
      { chinese: '我不等了。', pinyin: 'Wǒ bù děng le.', english: "I'm not waiting anymore." },
      {
        chinese: '不下雨了。',
        pinyin: 'Bù xià yǔ le.',
        english: "It's not raining anymore.",
        note: 'Change of situation',
      },
    ],
  },

  // ── Hobbies & Abilities (Lesson 21) ──
  {
    id: 'gr-26',
    lessons: [21, 26, 27],
    title: 'Ability with 会',
    titleChinese: '能愿动词会',
    pattern: 'Subject + 会 + Verb (+ Object)',
    explanation:
      '会 huì expresses a learned ability or skill — "can / know how to". Negate with 不会. Ask with 会不会 (A-not-A) or 会…吗.',
    examples: [
      { chinese: '我会说汉语。', pinyin: 'Wǒ huì shuō Hànyǔ.', english: 'I can speak Chinese.' },
      { chinese: '他不会游泳。', pinyin: 'Tā bú huì yóuyǒng.', english: "He can't swim." },
      {
        chinese: '你会不会打网球？',
        pinyin: 'Nǐ huì bú huì dǎ wǎngqiú?',
        english: 'Can you play tennis?',
        note: '会不会 = A-not-A question',
      },
    ],
  },
  {
    id: 'gr-27',
    lessons: [21, 27, 31, 32],
    title: 'Degree Complement with 得',
    titleChinese: '程度补语',
    pattern: 'Subject + (Object) + Verb + 得 + Adverb + Adjective',
    explanation:
      '得 de links a verb to a complement describing how well or to what degree the action is done. When there is an object, repeat the verb before 得 (他唱歌唱得很好). Negate with 不/不太.',
    examples: [
      { chinese: '他唱得很好。', pinyin: 'Tā chàng de hěn hǎo.', english: 'He sings very well.' },
      { chinese: '他跑得很快。', pinyin: 'Tā pǎo de hěn kuài.', english: 'He runs very fast.' },
      {
        chinese: '他说汉语说得不太好。',
        pinyin: 'Tā shuō Hànyǔ shuō de bú tài hǎo.',
        english: "He doesn't speak Chinese very well.",
        note: 'Object → repeat the verb before 得',
      },
    ],
  },
  {
    id: 'gr-28',
    lessons: [21, 27, 30, 31],
    title: 'Besides … also … with 除了…还…',
    titleChinese: '除了…还…',
    pattern: '除了 + A，Subject + 还 + B',
    explanation:
      '除了 chúle … 还 hái … means "besides A, also B" — A is included and something more is added. With 都 instead of 还 (除了…都…) it means "except".',
    examples: [
      {
        chinese: '除了打网球，我还喜欢游泳。',
        pinyin: 'Chúle dǎ wǎngqiú, wǒ hái xǐhuan yóuyǒng.',
        english: 'Besides tennis, I also like swimming.',
      },
      {
        chinese: '除了中文，他还会说英文。',
        pinyin: 'Chúle zhōngwén, tā hái huì shuō Yīngwén.',
        english: 'Besides Chinese, he can also speak English.',
      },
      {
        chinese: '除了我，大家都去了。',
        pinyin: 'Chúle wǒ, dàjiā dōu qù le.',
        english: 'Everyone went except me.',
        note: '除了…都… = except',
      },
    ],
  },

  // ── Experiences & Aspect ──
  {
    id: 'gr-29',
    lessons: [24, 25, 26, 27, 32],
    title: 'Experiential Aspect with 过',
    titleChinese: '动态助词「过」',
    pattern: 'Subject + Verb + 过 + (Object)',
    explanation:
      '过 guò after a verb marks that an action has been experienced at least once in the past ("have ever done"). Negate with 没(有) + V + 过 (the action never happened). Form a question with V + 过 + 没有 or V + 没 + V + 过.',
    examples: [
      {
        chinese: '我去过上海。',
        pinyin: 'Wǒ qù guo Shànghǎi.',
        english: 'I have been to Shanghai.',
      },
      {
        chinese: '他没吃过中国菜。',
        pinyin: 'Tā méi chī guo Zhōngguó cài.',
        english: 'He has never eaten Chinese food.',
        note: '没 + V + 过 = never happened',
      },
      {
        chinese: '你去过北京没有？',
        pinyin: 'Nǐ qù guo Běijīng méiyǒu?',
        english: 'Have you ever been to Beijing?',
        note: 'V + 过 + 没有 = yes/no question',
      },
    ],
  },
  {
    id: 'gr-30',
    lessons: [24, 25, 27, 32],
    title: 'Not Yet with 还没…呢',
    titleChinese: '还没…呢',
    pattern: 'Subject + 还没(有) + Verb + (呢)',
    explanation:
      '还没…呢 hái méi … ne means an expected action has "not happened yet" but still might. 还 = still, 没 negates the past action, and the optional 呢 softens it to "not yet."',
    examples: [
      {
        chinese: '我还没吃饭呢。',
        pinyin: 'Wǒ hái méi chī fàn ne.',
        english: "I haven't eaten yet.",
      },
      { chinese: '他还没来呢。', pinyin: 'Tā hái méi lái ne.', english: "He hasn't come yet." },
      {
        chinese: '我还没去过西餐厅呢。',
        pinyin: 'Wǒ hái méi qù guo xīcāntīng ne.',
        english: "I haven't been to a Western restaurant yet.",
        note: 'Combines with 过',
      },
    ],
  },
  {
    id: 'gr-31',
    lessons: [12, 25, 26, 29],
    title: 'Verb Reduplication',
    titleChinese: '动词重叠',
    pattern: 'VV / V一V (single) · ABAB (two-syllable)',
    explanation:
      'Reduplicating a verb makes the action short, casual, or tentative ("give it a try"). One-syllable verbs become VV or V一V (看看 / 看一看); two-syllable verbs become ABAB (休息休息). Only concrete, doable verbs reduplicate — not verbs like 是 or 爱.',
    examples: [
      {
        chinese: '你看看这个菜单。',
        pinyin: 'Nǐ kànkan zhège càidān.',
        english: 'Take a look at this menu.',
      },
      {
        chinese: '我们休息休息吧。',
        pinyin: 'Wǒmen xiūxi xiūxi ba.',
        english: "Let's rest for a bit.",
      },
      {
        chinese: '你尝一尝这个味道。',
        pinyin: 'Nǐ cháng yi cháng zhège wèidào.',
        english: 'Have a taste of this flavor.',
        note: 'V一V form',
      },
    ],
  },
  {
    id: 'gr-32',
    lessons: [6, 27, 30],
    title: 'Attributive Particle 的',
    titleChinese: '结构助词「的」',
    pattern: 'Modifier + 的 + Noun',
    explanation:
      '的 de links a modifier to the noun it describes: possession (我的书), a two-syllable adjective (漂亮的衣服), or a whole verb clause acting like a relative clause (妈妈做的菜 = "the dishes that Mom cooked"). 的 is dropped for monosyllabic adjectives (好人) and for fixed region/identity/material/purpose pairs (中国人, 学生证, 木头桌子).',
    examples: [
      {
        chinese: '妈妈做的菜很好吃。',
        pinyin: 'Māma zuò de cài hěn hǎochī.',
        english: 'The dishes that Mom cooked are delicious.',
        note: 'Verb clause + 的 + noun',
      },
      {
        chinese: '在教室唱歌的女孩是我妹妹。',
        pinyin: 'Zài jiàoshì chànggē de nǚhái shì wǒ mèimei.',
        english: 'The girl singing in the classroom is my younger sister.',
      },
      {
        chinese: '他是中国人。',
        pinyin: 'Tā shì Zhōngguó rén.',
        english: 'He is Chinese.',
        note: 'No 的: identity/region + noun',
      },
    ],
  },

  // ── Aspect, Completion & Multi-Verb Sentences ──
  {
    id: 'gr-33',
    lessons: [25, 31],
    title: 'Progressive Aspect with 在',
    titleChinese: '进行时「在」',
    pattern: 'Subject + 在 + Verb + (Object) + (呢)',
    explanation:
      '在 zài before a verb marks an action in progress ("-ing"), happening right now. Strengthen it with 正在 zhèngzài ("in the middle of…") and soften the end with 呢 ne. Contrast with 了 (completed) and 过 (experienced).',
    examples: [
      { chinese: '我在学习。', pinyin: 'Wǒ zài xuéxí.', english: "I'm studying." },
      {
        chinese: '妈妈在做饭呢。',
        pinyin: 'Māma zài zuò fàn ne.',
        english: 'Mom is cooking.',
        note: '呢 softens the end',
      },
      {
        chinese: '他正在打电话。',
        pinyin: 'Tā zhèngzài dǎ diànhuà.',
        english: 'He is in the middle of a phone call.',
        note: '正在 = right in the middle of',
      },
    ],
  },
  {
    id: 'gr-34',
    lessons: [25, 26, 27, 29, 30, 32],
    title: 'Completed Action & New Situation with 了',
    titleChinese: '动态助词「了」',
    pattern: 'V + 了 + Object (completed) · Subject + … + 了 (change)',
    explanation:
      '了 le has two core jobs. After a verb it marks a completed action (我吃了饭). At the end of a sentence it marks a new situation or change of state (他病了 = "he\'s sick now"). For yes/no questions add 吗 (你吃饭了吗？).',
    examples: [
      {
        chinese: '我吃了饭。',
        pinyin: 'Wǒ chī le fàn.',
        english: 'I ate.',
        note: 'Completed action',
      },
      {
        chinese: '我饿了。',
        pinyin: 'Wǒ è le.',
        english: "I'm hungry now.",
        note: 'New situation / change of state',
      },
      {
        chinese: '你吃饭了吗？',
        pinyin: 'Nǐ chī fàn le ma?',
        english: 'Have you eaten?',
        note: 'Yes/no question with 了 + 吗',
      },
    ],
  },
  {
    id: 'gr-35',
    lessons: [25, 30],
    title: 'Negating 了 with 没',
    titleChinese: '「没」否定完成',
    pattern: 'Subject + 没(有) + Verb (drop 了)',
    explanation:
      'To negate a completed action, use 没(有) and DROP the 了 — say 我没吃饭, never 我没吃了饭. A-not-A questions have two forms: V + 没 + V + others (你吃没吃饭？) or V + others + 了没有 (你吃饭了没有？). One exception: after a time span, a sentence-final 了 means "up to now" — 我好久没见他了 ("I haven\'t seen him for ages").',
    examples: [
      {
        chinese: '我没吃饭。',
        pinyin: 'Wǒ méi chī fàn.',
        english: "I didn't eat / I haven't eaten.",
        note: 'No 了 after 没',
      },
      {
        chinese: '你吃没吃饭？',
        pinyin: 'Nǐ chī méi chī fàn?',
        english: 'Did you eat?',
        note: 'A-not-A: V + 没 + V',
      },
      {
        chinese: '你吃饭了没有？',
        pinyin: 'Nǐ chī fàn le méiyǒu?',
        english: 'Have you eaten (or not)?',
        note: 'A-not-A: V + others + 了没有',
      },
    ],
  },
  {
    id: 'gr-36',
    lessons: [25, 27, 30, 31],
    title: 'Serial Verb Sentences 连动句',
    titleChinese: '连动句',
    pattern: 'Subject + V1 + (Obj) + V2 + (Obj)',
    explanation:
      'One subject performs two or more actions in sequence. V1 can express the manner of V2 (我坐公交车去学校 = "I take the bus to go to school"), or one verb expresses the purpose of the other (我去商店买东西 = "I go to the store to buy things"). Key rule: all actions share ONE subject.',
    examples: [
      {
        chinese: '我坐公交车去学校。',
        pinyin: 'Wǒ zuò gōngjiāochē qù xuéxiào.',
        english: 'I take the bus to school.',
        note: 'V1 = manner of V2',
      },
      {
        chinese: '我去商店买东西。',
        pinyin: 'Wǒ qù shāngdiàn mǎi dōngxi.',
        english: 'I go to the store to buy things.',
        note: 'V2 = purpose',
      },
      {
        chinese: '她来我家吃饭。',
        pinyin: 'Tā lái wǒ jiā chī fàn.',
        english: 'She comes to my house to eat.',
      },
    ],
  },
  {
    id: 'gr-37',
    lessons: [25, 30],
    title: 'Pivotal Sentences 兼语句',
    titleChinese: '兼语句',
    pattern: 'Subject + V1 (让/请/叫/要求) + Object + V2 + others',
    explanation:
      'Two subjects, two actions: the object of V1 becomes the subject of V2, "pivoting" between the clauses. Common V1 verbs: 让 ràng (let/make), 请 qǐng (invite/please), 叫 jiào (tell/have), 要求 yāoqiú (demand/require).',
    examples: [
      {
        chinese: '妈妈让我做作业。',
        pinyin: 'Māma ràng wǒ zuò zuòyè.',
        english: 'Mom makes me do homework.',
        note: '我 is object of 让, subject of 做',
      },
      {
        chinese: '老师请我们说话。',
        pinyin: 'Lǎoshī qǐng wǒmen shuōhuà.',
        english: 'The teacher asks us to speak.',
      },
      {
        chinese: '他叫我等一下。',
        pinyin: 'Tā jiào wǒ děng yíxià.',
        english: 'He asked me to wait.',
      },
    ],
  },
  {
    id: 'gr-44',
    lessons: [25, 29],
    title: "…就行 — That's Enough",
    titleChinese: '……就行',
    pattern: 'Condition / action + 就行',
    explanation:
      '就行 jiù xíng after an action or condition means "that is enough, nothing more is needed". The tone is relaxed: meeting one simple condition is sufficient. Used for requirements (我们说中文就行) and reassurance (认真准备就行).',
    examples: [
      {
        chinese: '我们说中文就行。',
        pinyin: 'Wǒmen shuō Zhōngwén jiù xíng.',
        english: 'Speaking Chinese will do.',
      },
      {
        chinese: '中午吃米饭就行。',
        pinyin: 'Zhōngwǔ chī mǐfàn jiù xíng.',
        english: 'Rice at noon is fine with me.',
      },
      {
        chinese: '今天跑一百米就行。',
        pinyin: 'Jīntiān pǎo yì bǎi mǐ jiù xíng.',
        english: 'Just running 100 meters today is enough.',
      },
      {
        chinese: '买一斤苹果就行。',
        pinyin: 'Mǎi yì jīn píngguǒ jiù xíng.',
        english: 'Just buying one jin of apples is enough.',
      },
      {
        chinese: '不太难，认真准备就行。',
        pinyin: 'Bú tài nán, rènzhēn zhǔnbèi jiù xíng.',
        english: 'Not too hard — preparing carefully is enough.',
        note: 'Answer to 这次考试难吗？',
      },
    ],
  },
  {
    id: 'gr-45',
    lessons: [25, 27],
    title: '想 — Want To vs. Think/Miss',
    titleChinese: '想',
    pattern: 'Subject + 想 + Verb (want to) · Subject + 想 + Person/Thing (miss, think about)',
    explanation:
      '想 xiǎng before a verb is a modal verb: "want to / would like to" (negative 不想). As an ordinary verb it means "to think about" (在想 = is thinking about; 想想 / 想一想 = think it over) or, with a person, "to miss".',
    examples: [
      {
        chinese: '我想吃米饭。',
        pinyin: 'Wǒ xiǎng chī mǐfàn.',
        english: 'I want to eat rice.',
        note: 'Modal verb: want to',
      },
      {
        chinese: '他今天不想去上班。',
        pinyin: 'Tā jīntiān bù xiǎng qù shàngbān.',
        english: "He doesn't want to go to work today.",
        note: 'Negative: 不想',
      },
      {
        chinese: '我想爸爸妈妈了。',
        pinyin: 'Wǒ xiǎng bàba māma le.',
        english: 'I miss Mom and Dad.',
        note: 'Ordinary verb: miss',
      },
      {
        chinese: '我还没想好呢。',
        pinyin: 'Wǒ hái méi xiǎng hǎo ne.',
        english: "I haven't made up my mind yet.",
        note: 'Ordinary verb: think',
      },
      {
        chinese: '我要想一想。',
        pinyin: 'Wǒ yào xiǎng yi xiǎng.',
        english: 'I need to think it over.',
        note: '一想 = brief, casual',
      },
    ],
  },
  {
    id: 'gr-46',
    lessons: [25],
    title: '几 — How Many vs. Several',
    titleChinese: '几',
    pattern: '几 + Measure Word + Noun (question) · 几 + Measure Word + Noun (statement) · 十几',
    explanation:
      '几 jǐ in a question asks "how many / which number" for small numbers: dates, weekdays, ages of children, family members. In a statement it means "a few, several", and 十几 means "more than ten" (eleven to nineteen).',
    examples: [
      {
        chinese: '今天星期几？',
        pinyin: 'Jīntiān xīngqī jǐ?',
        english: 'What day of the week is it today?',
        note: 'Question: which number',
      },
      {
        chinese: '你家有几口人？',
        pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?',
        english: 'How many people are in your family?',
        note: 'Question: how many',
      },
      {
        chinese: '我有几个中国朋友。',
        pinyin: 'Wǒ yǒu jǐ ge Zhōngguó péngyou.',
        english: 'I have a few Chinese friends.',
        note: 'Statement: a few',
      },
      {
        chinese: '我十几年没见他了。',
        pinyin: 'Wǒ shíjǐ nián méi jiàn tā le.',
        english: "I haven't seen him for more than ten years.",
        note: '十几 = more than ten',
      },
      {
        chinese: '我十几岁的时候很瘦。',
        pinyin: 'Wǒ shíjǐ suì de shíhou hěn shòu.',
        english: 'I was very thin when I was in my teens.',
      },
    ],
  },

  // ── Illness & Advice ──
  {
    id: 'gr-38',
    lessons: [26, 29, 32],
    title: 'A Bit Too… with 有点儿',
    titleChinese: '有点儿 + 形容词',
    pattern: '有点儿 + Adjective',
    explanation:
      '有点儿 yǒudiǎnr goes BEFORE an adjective and carries a note of complaint — something is a bit too much for comfort. Compare with Adjective + 一点儿, which asks for a small change (便宜一点儿 = "a bit cheaper"), and Verb + 一点儿 + Noun for a small quantity (加一点儿糖).',
    examples: [
      {
        chinese: '我有点儿不舒服。',
        pinyin: 'Wǒ yǒudiǎnr bù shūfu.',
        english: 'I feel a bit off.',
      },
      { chinese: '我有点儿冷。', pinyin: 'Wǒ yǒudiǎnr lěng.', english: "I'm a bit cold." },
      {
        chinese: '这个咖啡有点儿苦。',
        pinyin: 'Zhège kāfēi yǒudiǎnr kǔ.',
        english: 'This coffee is a bit bitter.',
      },
      {
        chinese: '便宜一点儿吧。',
        pinyin: 'Piányi yìdiǎnr ba.',
        english: 'Make it a bit cheaper.',
        note: 'Adj + 一点儿 = request, not complaint',
      },
    ],
  },
  {
    id: 'gr-39',
    lessons: [26, 29, 31],
    title: 'The Three "Cans" — 会 / 能 / 可以',
    titleChinese: '会、能、可以的区别',
    pattern: 'Subject + 会/能/可以 + Verb',
    explanation:
      '会 huì = a learned skill. 能 néng = physical ability or whether circumstances allow. 可以 kěyǐ = permission / it being OK. Negate all three with 不.',
    examples: [
      {
        chinese: '我会说汉语。',
        pinyin: 'Wǒ huì shuō Hànyǔ.',
        english: 'I can speak Chinese.',
        note: '会 = learned skill',
      },
      {
        chinese: '我今天生病了，不能上班。',
        pinyin: 'Wǒ jīntiān shēngbìng le, bù néng shàngbān.',
        english: "I'm ill today, so I can't go to work.",
        note: '能 = circumstances',
      },
      {
        chinese: '我可以走了吗？',
        pinyin: 'Wǒ kěyǐ zǒu le ma?',
        english: 'May I go now?',
        note: '可以 = permission',
      },
      {
        chinese: '你能帮我请假吗？',
        pinyin: 'Nǐ néng bāng wǒ qǐngjià ma?',
        english: 'Can you ask for leave for me?',
      },
    ],
  },
  {
    id: 'gr-40',
    lessons: [26, 27],
    title: 'Might As Well with 还是…吧',
    titleChinese: '还是…吧',
    pattern: 'Subject + 还是 + Verb Phrase + 吧',
    explanation:
      '还是 háishi has two jobs. In a question it means "or" (你要茶还是咖啡？). In a statement with 吧 it announces a decision reached after weighing options — "you\'d better…" / "let\'s just…". The 吧 keeps the suggestion soft.',
    examples: [
      {
        chinese: '你还是去医院吧。',
        pinyin: 'Nǐ háishi qù yīyuàn ba.',
        english: "You'd better go to the hospital.",
      },
      {
        chinese: '你还是多喝水吧。',
        pinyin: 'Nǐ háishi duō hē shuǐ ba.',
        english: 'You should drink more water.',
      },
      {
        chinese: '我们还是回家吧。',
        pinyin: 'Wǒmen háishi huí jiā ba.',
        english: "Let's just go home.",
      },
      {
        chinese: '你要茶还是咖啡？',
        pinyin: 'Nǐ yào chá háishi kāfēi?',
        english: 'Do you want tea or coffee?',
        note: '还是 = "or" in choice questions',
      },
    ],
  },
  {
    id: 'gr-41',
    lessons: [26],
    title: 'Saying What Hurts — Body Part + 疼',
    titleChinese: '身体部位 + 疼',
    pattern: 'Subject + Body Part + 疼 · 你哪儿不舒服？',
    explanation:
      'Chinese states symptoms as "topic + comment": the person comes first, then the body part, then 疼 téng. No verb "to have" and no possessive 的 needed — 我头疼, not 我的头疼了. Ask 你哪儿不舒服？ ("Where are you unwell?") or 你怎么了？("What happened?").',
    examples: [
      { chinese: '我头疼。', pinyin: 'Wǒ tóu téng.', english: 'I have a headache.' },
      { chinese: '我嗓子疼。', pinyin: 'Wǒ sǎngzi téng.', english: 'I have a sore throat.' },
      {
        chinese: '他肚子有点儿疼。',
        pinyin: 'Tā dùzi yǒudiǎnr téng.',
        english: 'His stomach hurts a little.',
      },
      {
        chinese: '你哪儿不舒服？',
        pinyin: 'Nǐ nǎr bù shūfu?',
        english: 'Where are you feeling unwell?',
      },
    ],
  },
  {
    id: 'gr-42',
    lessons: [26],
    title: 'Counting Actions with 次 and 第',
    titleChinese: '次和第',
    pattern: 'Verb + Number + 次 · 第 + Number (+ Measure Word)',
    explanation:
      '次 cì counts how many times an action happens and follows the verb: 吃三次 = "take (it) three times". 第 dì turns a number into an ordinal: 第一次 = "the first time", 第二天 = "the second day". Dosage instructions stack both patterns: 一天吃三次，一次两片。',
    examples: [
      {
        chinese: '一天吃三次，一次两片。',
        pinyin: 'Yì tiān chī sān cì, yí cì liǎng piàn.',
        english: 'Three times a day, two tablets each time.',
      },
      {
        chinese: '我去过一次中国。',
        pinyin: 'Wǒ qùguo yí cì Zhōngguó.',
        english: "I've been to China once.",
      },
      {
        chinese: '这是我第一次看医生。',
        pinyin: 'Zhè shì wǒ dì-yī cì kàn yīshēng.',
        english: 'This is my first time seeing a doctor.',
        note: '一次 = once · 第一次 = the first time',
      },
    ],
  },
  {
    id: 'gr-43',
    lessons: [26],
    title: 'Softening with Verb + 一下',
    titleChinese: '动词 + 一下',
    pattern: 'Verb + 一下 (+ Object)',
    explanation:
      '一下 yíxià after a verb makes the action brief and casual — "just have a quick…". It works like verb reduplication (看看, 量量) and is common in requests and doctor-patient talk.',
    examples: [
      {
        chinese: '让我量一下体温。',
        pinyin: 'Ràng wǒ liáng yíxià tǐwēn.',
        english: 'Let me take your temperature.',
      },
      { chinese: '等一下。', pinyin: 'Děng yíxià.', english: 'Wait a moment.' },
      {
        chinese: '你休息一下吧。',
        pinyin: 'Nǐ xiūxi yíxià ba.',
        english: 'Have a bit of a rest.',
      },
      {
        chinese: '医生看看我的嗓子。',
        pinyin: 'Yīshēng kànkan wǒ de sǎngzi.',
        english: 'The doctor has a quick look at my throat.',
        note: 'Reduplication = same brief, casual feel',
      },
    ],
  },
  {
    id: 'gr-47',
    lessons: [26],
    title: 'Whole Runs and Trips with 遍 and 趟',
    titleChinese: '动量词：遍、趟',
    pattern: 'Verb + Number + 遍 (+ Object) · Verb + Number + 趟 (+ Place)',
    explanation:
      'Like 次, the action counters 遍 biàn and 趟 tàng come after the verb. 遍 means doing something once through from start to finish (读一遍 = read it all the way through), while 趟 is only for trips with movement there and back (去一趟 = make one trip). 回 is an informal stand-in for 次, and 一下 / 几下 count quick, light actions (敲三下门).',
    examples: [
      {
        chinese: '这本书他看了三遍了。',
        pinyin: 'Zhè běn shū tā kàn le sān biàn le.',
        english: 'He has read this book through three times already.',
        note: '遍 = from start to finish',
      },
      {
        chinese: '这个汉字他写了很多遍。',
        pinyin: 'Zhège Hànzì tā xiě le hěn duō biàn.',
        english: 'He has written this character many times.',
      },
      {
        chinese: '你去趟超市买点儿蛋糕吧。',
        pinyin: 'Nǐ qù tàng chāoshì mǎi diǎnr dàngāo ba.',
        english: 'Make a trip to the supermarket and pick up some cake.',
        note: '趟 = a trip; the 一 is often dropped (去趟)',
      },
      {
        chinese: '明天我要回一趟妈妈家。',
        pinyin: 'Míngtiān wǒ yào huí yí tàng māma jiā.',
        english: "Tomorrow I have to make a trip back to my mom's place.",
        note: '回一趟 + place',
      },
      {
        chinese: '他敲了三下门。',
        pinyin: 'Tā qiāo le sān xià mén.',
        english: 'He knocked on the door three times.',
        note: '下 = brief, light action',
      },
    ],
  },
  {
    id: 'gr-48',
    lessons: [26, 31],
    title: 'Asking Why with 怎么',
    titleChinese: '怎么 + 动词（为什么）',
    pattern: 'Subject + 怎么 + (还)不 / 没 + Verb？',
    explanation:
      'Before a verb, 怎么 zěnme asks "why" or "how come", usually when you have noticed something unexpected, so it is most often followed by 不, 没 or 还不. Compared with the neutral 为什么, it carries a note of surprise or mild complaint. Don\'t confuse it with 怎么了 ("what happened?") and 怎么样 ("how is it?"), which come at the end of the sentence.',
    examples: [
      {
        chinese: '你怎么不说话？',
        pinyin: 'Nǐ zěnme bù shuōhuà?',
        english: "Why aren't you talking?",
        note: '怎么 + 不 + verb = why not, with some surprise',
      },
      {
        chinese: '他们怎么不来上班？',
        pinyin: 'Tāmen zěnme bù lái shàngbān?',
        english: "Why aren't they coming to work?",
      },
      {
        chinese: '你怎么还不起床？',
        pinyin: 'Nǐ zěnme hái bù qǐchuáng?',
        english: "Why aren't you up yet?",
        note: '还不 = still not (yet)',
      },
      {
        chinese: '你怎么还不上班？',
        pinyin: 'Nǐ zěnme hái bú shàngbān?',
        english: "Why haven't you gone to work yet?",
      },
      {
        chinese: '这台电脑怎么了？',
        pinyin: 'Zhè tái diànnǎo zěnme le?',
        english: "What's wrong with this computer?",
        note: '怎么了 at the end asks what happened',
      },
    ],
  },
  {
    id: 'gr-49',
    lessons: [26],
    title: 'Still with 还是',
    titleChinese: '还是（仍然）',
    pattern: 'Subject + 还是 + Verb / Adjective',
    explanation:
      '还是 háishi has a third job besides "or" and "had better": it means "still" — the situation has not changed, or someone carries on in spite of the circumstances. It appears in a plain statement, with no second option and no 吧. To tell the meanings apart, check the sentence type: a choice question means "or", a suggestion with 吧 means "might as well", and a plain statement means "still".',
    examples: [
      {
        chinese: '我还是爱你的。',
        pinyin: 'Wǒ háishi ài nǐ de.',
        english: 'I still love you.',
        note: '还是 = still',
      },
      {
        chinese: '妈妈还是老样子，最喜欢聊天。',
        pinyin: 'Māma háishi lǎo yàngzi, zuì xǐhuan liáotiān.',
        english: 'Mom is just the same as ever — she loves chatting most.',
      },
      {
        chinese: '他生病了，但还是去上班了。',
        pinyin: 'Tā shēngbìng le, dàn háishi qù shàngbān le.',
        english: 'He was ill, but he still went to work.',
      },
      {
        chinese: '你喜欢西瓜还是苹果？',
        pinyin: 'Nǐ xǐhuan xīguā háishi píngguǒ?',
        english: 'Do you like watermelon or apples?',
        note: '还是 in a choice question = or',
      },
      {
        chinese: '我们还是走吧，这儿太冷了。',
        pinyin: 'Wǒmen háishi zǒu ba, zhèr tài lěng le.',
        english: "Let's just go — it's too cold here.",
        note: '还是…吧 = might as well',
      },
    ],
  },

  // ── HSKK Practice Tests (Lesson 27) ──
  {
    id: 'gr-50',
    lessons: [27],
    title: 'Also / Either with 也',
    titleChinese: '副词「也」',
    pattern: 'Subject + 也 + (不/没) + Verb/Adjective',
    explanation:
      '也 yě means "also" in a positive sentence and "either" in a negative one. It is an adverb, so it goes after the subject and before the verb, and it also stands in front of 不, 没 and modal verbs such as 会 and 想 (也不, 也没, 也会, 也想) — never at the end of the sentence the way English "too" does. When the second clause has the same subject, the subject can be dropped (我喜欢唱歌，也喜欢看电影). If 都 is in the sentence too, 也 comes first: 我们也都去。',
    examples: [
      {
        chinese: '我喜欢唱歌，也喜欢看电影。',
        pinyin: 'Wǒ xǐhuan chànggē, yě xǐhuan kàn diànyǐng.',
        english: 'I like singing, and I also like watching films.',
        note: 'Same subject: the second 我 is dropped and 也 sits before the verb',
      },
      {
        chinese: '他也会做中国菜。',
        pinyin: 'Tā yě huì zuò Zhōngguó cài.',
        english: 'He can cook Chinese food too.',
        note: '也 comes before the modal verb 会',
      },
      {
        chinese: '你周末也不休息吗？',
        pinyin: 'Nǐ zhōumò yě bù xiūxi ma?',
        english: "Don't you rest on weekends either?",
        note: '也不 = "not … either"',
      },
      {
        chinese: '我也没去过上海。',
        pinyin: 'Wǒ yě méi qù guo Shànghǎi.',
        english: "I haven't been to Shanghai either.",
        note: '也没 + verb + 过: 也 goes before 没',
      },
      {
        chinese: '我也想去。',
        pinyin: 'Wǒ yě xiǎng qù.',
        english: "I'd like to go too.",
        note: 'A short reply of agreement — 也 still sits before the verb, never at the end',
      },
    ],
  },

  // ── Characters: One Person to Many (Lesson 28) ──
  {
    id: 'gr-51',
    lessons: [27, 28],
    title: 'From … to … with 从…到…',
    titleChinese: '从…到…',
    pattern: '从 + Start + 到 + End',
    explanation:
      '从 cóng marks where something starts and 到 dào marks where it ends, giving "from … to …". The start and end can be places (从这里到那里), times (从昨天到今天) or the two ends of any range (从头到脚, "from head to toe"). Fixed pairs such as 从早到晚 ("from morning till night") mean the whole stretch in between. Compare 从…来 (我从北京来), which names only the place something comes from.',
    examples: [
      {
        chinese: '从这里到那里不远。',
        pinyin: 'Cóng zhèlǐ dào nàlǐ bù yuǎn.',
        english: "It's not far from here to there.",
        note: 'place → place',
      },
      {
        chinese: '我从昨天到今天都不舒服。',
        pinyin: 'Wǒ cóng zuótiān dào jīntiān dōu bù shūfu.',
        english: "I haven't felt well from yesterday until today.",
        note: 'time → time',
      },
      {
        chinese: '我从头到脚都疼。',
        pinyin: 'Wǒ cóng tóu dào jiǎo dōu téng.',
        english: 'I ache from head to toe.',
        note: 'one end of a range → the other',
      },
      {
        chinese: '他从早到晚都在学习。',
        pinyin: 'Tā cóng zǎo dào wǎn dōu zài xuéxí.',
        english: 'He studies from morning till night.',
        note: 'fixed pair 从早到晚',
      },
    ],
  },

  // ── Allergies & Health Advice (Lesson 29) ──
  {
    id: 'gr-52',
    lessons: [29],
    title: 'Do More / Do Less with 多 and 少 + Verb',
    titleChinese: '多 / 少 + 动词',
    pattern: '多 + Verb + (点) + Object · 少 + Verb + (点) + Object',
    explanation:
      'Put 多 duō in front of a verb to say "do more of it" and 少 shǎo to say "do less of it". This is the standard way to give health and lifestyle advice, and adding 点 (short for 一点儿) after the verb makes the advice softer. The two halves are often paired: 多 with the good habit and 少 with the bad one. Do not mix this up with 很多 or 不少, which describe how many things there are rather than how much you do something.',
    examples: [
      {
        chinese: '多吃点蔬菜，对身体好。',
        pinyin: 'Duō chī diǎn shūcài, duì shēntǐ hǎo.',
        english: "Eat more vegetables — it's good for your health.",
        note: '多 + verb + 点 + object',
      },
      {
        chinese: '少吃点糖。',
        pinyin: 'Shǎo chī diǎn táng.',
        english: 'Eat less sugar.',
        note: '少 = do less',
      },
      {
        chinese: '多读书，少看手机。',
        pinyin: 'Duō dúshū, shǎo kàn shǒujī.',
        english: 'Read more, and look at your phone less.',
        note: 'good habit with 多, bad habit with 少',
      },
      {
        chinese: '多运动，少呆在家里。',
        pinyin: 'Duō yùndòng, shǎo dāi zài jiāli.',
        english: 'Exercise more, and stay at home less.',
      },
      {
        chinese: '多喝水，多休息，少吃辣的菜。',
        pinyin: 'Duō hē shuǐ, duō xiūxi, shǎo chī là de cài.',
        english: 'Drink more water, rest more and eat less spicy food.',
        note: "the same pattern in a doctor's advice",
      },
    ],
  },
  {
    id: 'gr-53',
    lessons: [29],
    title: 'Allergic To… and Good For… with 对',
    titleChinese: '对…过敏 / 对…好',
    pattern: 'Subject + 对 + Noun + 过敏 · Subject / Verb Phrase + 对 + Noun + 好',
    explanation:
      '对 duì introduces the person or thing that a state is aimed at: 对 + thing + 过敏 means "allergic to it" and 对 + thing + 好 means "good for it". The 对 phrase must come BEFORE 过敏 or 好, and a degree word such as 有点儿, 很 or 不太 goes right in front of 过敏 or 好. To ask what someone is allergic to, put the question word where the thing would go: 你对什么过敏？',
    examples: [
      {
        chinese: '我对花生过敏。',
        pinyin: 'Wǒ duì huāshēng guòmǐn.',
        english: "I'm allergic to peanuts.",
      },
      {
        chinese: '我对花生有点儿过敏。',
        pinyin: 'Wǒ duì huāshēng yǒudiǎnr guòmǐn.',
        english: "I'm a bit allergic to peanuts.",
        note: '有点儿 goes right before 过敏',
      },
      {
        chinese: '你对什么过敏？',
        pinyin: 'Nǐ duì shénme guòmǐn?',
        english: 'What are you allergic to?',
        note: 'the question word replaces the thing',
      },
      {
        chinese: '多运动对身体好。',
        pinyin: 'Duō yùndòng duì shēntǐ hǎo.',
        english: 'Exercising more is good for your health.',
        note: '对 + 身体 + 好 = good for your health',
      },
      {
        chinese: '他对猫过敏，不能去我家。',
        pinyin: 'Tā duì māo guòmǐn, bù néng qù wǒ jiā.',
        english: "He is allergic to cats, so he can't come to my place.",
      },
    ],
  },
  {
    id: 'gr-54',
    lessons: [29],
    title: 'If… Then… with 如果…就…',
    titleChinese: '如果…就…',
    pattern: '如果 + Condition，(Subject +) 就 + Result',
    explanation:
      '如果 rúguǒ introduces a condition ("if") and 就 jiù introduces what follows from it ("then"); 就 sits right before the verb or adjective of the second clause. In everyday speech 如果 is often dropped, but 就 usually stays. Two 如果 clauses side by side set up a neat contrast: if this happens, one result; if not, another.',
    examples: [
      {
        chinese: '如果过敏药有用，你在医院一天就行。',
        pinyin: 'Rúguǒ guòmǐn yào yǒuyòng, nǐ zài yīyuàn yì tiān jiù xíng.',
        english: 'If the allergy medicine works, one day in the hospital is enough.',
        note: '就 + 行 = that will do',
      },
      {
        chinese: '如果药有用就好，如果没用就向神祷告。',
        pinyin: 'Rúguǒ yào yǒuyòng jiù hǎo, rúguǒ méiyòng jiù xiàng shén dǎogào.',
        english: 'If the medicine works, great; if not, pray to God.',
        note: 'two 如果 clauses: works vs. does not work',
      },
      {
        chinese: '如果你发烧，就多喝水，多休息。',
        pinyin: 'Rúguǒ nǐ fāshāo, jiù duō hē shuǐ, duō xiūxi.',
        english: 'If you have a fever, drink more water and rest more.',
        note: 'advice follows 就',
      },
      {
        chinese: '如果你对花生过敏，就别吃花生。',
        pinyin: 'Rúguǒ nǐ duì huāshēng guòmǐn, jiù bié chī huāshēng.',
        english: "If you are allergic to peanuts, don't eat peanuts.",
        note: '别 + verb in the result clause',
      },
      {
        chinese: '你不舒服，就去医院。',
        pinyin: 'Nǐ bù shūfu, jiù qù yīyuàn.',
        english: 'If you feel unwell, go to the hospital.',
        note: '如果 dropped, 就 stays',
      },
    ],
  },

  // ── Translation Practice (都, 一定, 怕) (Lesson 30) ──
  {
    id: 'gr-55',
    lessons: [17, 30],
    title: 'Definitely & Not Necessarily — 一定 / 不一定',
    titleChinese: '一定、不一定',
    pattern: 'Subject + 一定 + (会) + Verb / Adjective · Subject + 不一定 + Verb / Adjective',
    explanation:
      '一定 yídìng goes before the verb or adjective and means "definitely": 一定会 + verb predicts, 一定 + adjective is a confident guess ("must be"), and 一定要 + verb is a firm "must". 不一定 bù yídìng means "not necessarily" — it only denies certainty — and differs from 一定不, "definitely not": 特价的东西不一定不好 = "special-offer items aren\'t necessarily bad".',
    examples: [
      {
        chinese: '吃太多，你一定会变胖的。',
        pinyin: 'Chī tài duō, nǐ yídìng huì biàn pàng de.',
        english: "If you eat too much, you'll definitely get fat.",
        note: '一定会 = will definitely',
      },
      {
        chinese: '我不知道，但是一定很热。',
        pinyin: 'Wǒ bù zhīdào, dànshì yídìng hěn rè.',
        english: "I don't know, but it must be really hot.",
        note: '一定 + adjective = must be (a confident guess)',
      },
      {
        chinese: '特价的东西不一定不好。',
        pinyin: 'Tèjià de dōngxi bù yídìng bù hǎo.',
        english: 'Things on special offer are not necessarily bad.',
        note: '不一定 = not necessarily',
      },
      {
        chinese: '他不一定会来。',
        pinyin: 'Tā bù yídìng huì lái.',
        english: "He won't necessarily come.",
        note: 'Not the same as 他一定不会来 = "he definitely won\'t come"',
      },
      {
        chinese: '郊区的房子一定比市中心的便宜吗？',
        pinyin: 'Jiāoqū de fángzi yídìng bǐ shìzhōngxīn de piányi ma?',
        english: 'Are houses in the suburbs definitely cheaper than those in the city centre?',
        note: '一定…吗？ asks whether something is really certain',
      },
    ],
  },
  {
    id: 'gr-56',
    lessons: [25, 27, 30],
    title: 'Being Afraid — 怕',
    titleChinese: '怕',
    pattern: 'Subject + 怕 + Noun / Verb Phrase / Clause · Subject + 怕冷 / 怕热 · 别怕',
    explanation:
      '怕 pà means "to be afraid of" and takes a noun (怕狗), a verb phrase (怕坐飞机) or a whole clause (怕明天下雨 = "worried it will rain tomorrow"). Before 冷, 热 or 辣 it means "can\'t stand" — 我怕冷 = "I feel the cold easily". Add 很 for emphasis, negate with 不怕, and say 别怕 for "don\'t be afraid".',
    examples: [
      {
        chinese: '我不想出去，我很怕冷。',
        pinyin: 'Wǒ bù xiǎng chūqù, wǒ hěn pà lěng.',
        english: "I don't want to go out; I can't stand the cold.",
        note: "怕 + 冷 = can't stand the cold",
      },
      {
        chinese: '别怕！你太棒了！',
        pinyin: 'Bié pà! Nǐ tài bàng le!',
        english: "Don't be afraid! You're amazing!",
        note: "别怕 = don't be afraid",
      },
      {
        chinese: '他很怕狗。',
        pinyin: 'Tā hěn pà gǒu.',
        english: 'He is very afraid of dogs.',
        note: '怕 + noun',
      },
      {
        chinese: '我怕坐飞机。',
        pinyin: 'Wǒ pà zuò fēijī.',
        english: "I'm afraid of flying.",
        note: '怕 + verb phrase',
      },
      {
        chinese: '我怕明天下雨。',
        pinyin: 'Wǒ pà míngtiān xiàyǔ.',
        english: "I'm afraid it will rain tomorrow.",
        note: '怕 + clause = worry that…',
      },
    ],
  },

  // ── I'm Jogging (Lesson 31) ──
  {
    id: 'gr-57',
    lessons: [31],
    title: 'Progressive with a Place, and 没在',
    titleChinese: '进行时：在…在… 与 没在',
    pattern: 'Subject + 在 + Place + 在 + Verb (+ 呢) · Subject + 没(有) + 在 + Verb',
    explanation:
      'To say both where someone is and what they are doing right now, 在 can be used twice: the first 在 introduces the place and the second marks the action in progress (他在家在看书). In everyday speech people often keep just one 在 and end with 呢 — 他在家看书呢. To say an action is not in progress, put 没 before 在: 我没在看电视. Use 没在 for "not doing" and 不在 only for "not at a place" (她不在家).',
    examples: [
      {
        chinese: '孩子们在学校在踢球。',
        pinyin: 'Háizimen zài xuéxiào zài tī qiú.',
        english: 'The children are playing soccer at school.',
        note: 'First 在 = place, second 在 = action in progress',
      },
      {
        chinese: '他在家在看书。',
        pinyin: 'Tā zài jiā zài kàn shū.',
        english: 'He is at home reading.',
      },
      {
        chinese: '蒂娜在咖啡厅在等朋友。',
        pinyin: 'Dìnà zài kāfēitīng zài děng péngyou.',
        english: 'Tina is waiting for a friend at the café.',
      },
      {
        chinese: '我没在看电视。',
        pinyin: 'Wǒ méi zài kàn diànshì.',
        english: "I'm not watching TV.",
        note: 'Negate the progressive with 没在, not 不在',
      },
      {
        chinese: '小刚没在看书。',
        pinyin: 'Xiǎogāng méi zài kàn shū.',
        english: "Xiao Gang isn't reading.",
      },
    ],
  },
  {
    id: 'gr-58',
    lessons: [27, 30, 31],
    title: 'All & Already with 都',
    titleChinese: '副词「都」',
    pattern: 'Subject(s) + 都 + Verb · 都 + Time / Number / Verb + 了',
    explanation:
      '都 dōu goes right before the verb and has two jobs. Meaning "all / both", it sums up the people or things named before it, so the subjects come first (她和孩子都…). Followed by a time, a number or a verb plus 了, it means "already" and hints that it is later or more than expected (都十一点了).',
    examples: [
      {
        chinese: '她和孩子都喜欢吃苹果。',
        pinyin: 'Tā hé háizi dōu xǐhuan chī píngguǒ.',
        english: 'She and the kids all like eating apples.',
        note: '都 sums up the subjects before it',
      },
      {
        chinese: '我们都去过北京。',
        pinyin: 'Wǒmen dōu qù guo Běijīng.',
        english: 'We have all been to Beijing.',
      },
      {
        chinese: '你还在睡觉吗？都十一点了。',
        pinyin: 'Nǐ hái zài shuìjiào ma? Dōu shíyī diǎn le.',
        english: "Are you still asleep? It's already eleven o'clock.",
        note: '都 + time + 了 = already',
      },
      {
        chinese: '孩子都五岁了。',
        pinyin: 'Háizi dōu wǔ suì le.',
        english: 'The child is already five.',
        note: '都 + number + 了 = already',
      },
      {
        chinese: '饭都凉了，快来吃吧。',
        pinyin: 'Fàn dōu liáng le, kuài lái chī ba.',
        english: 'The food has already gone cold — come and eat!',
        note: '都 + verb + 了 = already',
      },
    ],
  },
  {
    id: 'gr-59',
    lessons: [31],
    title: 'To / For Someone with 给',
    titleChinese: '介词「给」',
    pattern: 'Subject + 给 + Person + Verb (+ others) · Subject + 给 + Person + Thing',
    explanation:
      '给 gěi has two uses. As a verb it means "to give": 给 + person + thing. As a preposition it names the person an action is aimed at or done for, and the 给-phrase goes before the verb it belongs to — 给妈妈打电话 "call Mom", 给小狗买狗粮 "buy dog food for the puppy".',
    examples: [
      {
        chinese: '妈妈给女儿一件礼物。',
        pinyin: "Māma gěi nǚ'ér yí jiàn lǐwù.",
        english: 'Mom gives her daughter a present.',
        note: '给 as a verb: give + person + thing',
      },
      {
        chinese: '昨天我给妈妈打电话了。',
        pinyin: 'Zuótiān wǒ gěi māma dǎ diànhuà le.',
        english: 'I phoned my mom yesterday.',
        note: '给 + person comes before the verb',
      },
      {
        chinese: '哥哥给小狗买了狗粮。',
        pinyin: 'Gēge gěi xiǎogǒu mǎi le gǒuliáng.',
        english: 'My older brother bought dog food for the puppy.',
      },
      {
        chinese: '你能给我你的电话号码吗？',
        pinyin: 'Nǐ néng gěi wǒ nǐ de diànhuà hàomǎ ma?',
        english: 'Can you give me your phone number?',
      },
      {
        chinese: '你给我打电话的时候，我正在看球呢。',
        pinyin: 'Nǐ gěi wǒ dǎ diànhuà de shíhou, wǒ zhèngzài kàn qiú ne.',
        english: 'I was watching the game when you called me.',
        note: 'The 给-phrase also works inside a 的时候 clause',
      },
    ],
  },
  {
    id: 'gr-60',
    lessons: [31],
    title: 'Have To with 得 (děi)',
    titleChinese: '能愿动词「得」',
    pattern: 'Subject + 得 + Verb (+ others) · Subject + 不用 + Verb',
    explanation:
      '得 děi before a verb means "have to / need to": an obligation that comes from the situation, used in informal speech. Don\'t confuse it with 得 de (睡得很晚), which comes after a verb to describe how it is done. The usual negative is 不用 búyòng ("no need to", "don\'t have to"). To turn down an invitation, give your reason with 得: 不行啊，我得去机场接朋友。',
    examples: [
      { chinese: '我得去上班。', pinyin: 'Wǒ děi qù shàngbān.', english: 'I have to go to work.' },
      {
        chinese: '我们明天得加班。',
        pinyin: 'Wǒmen míngtiān děi jiābān.',
        english: 'We have to work overtime tomorrow.',
      },
      {
        chinese: '得先吃饭，再吃药。',
        pinyin: 'Děi xiān chī fàn, zài chī yào.',
        english: 'You have to eat first, then take the medicine.',
        note: 'The subject can be dropped in general advice; 先…再… = first … then …',
      },
      {
        chinese: '明天我们不用加班。',
        pinyin: 'Míngtiān wǒmen búyòng jiābān.',
        english: "We don't have to work overtime tomorrow.",
        note: '不用 = the negative of 得 děi',
      },
      {
        chinese: '今天下雪，他不用去上学。',
        pinyin: 'Jīntiān xià xuě, tā búyòng qù shàngxué.',
        english: "It's snowing today, so he doesn't have to go to school.",
      },
    ],
  },
  {
    id: 'gr-61',
    lessons: [31, 32],
    title: 'Again (Not Yet Happened) with 再',
    titleChinese: '副词「再」',
    pattern: 'Subject + (Modal verb) + 再 + Verb (+ others)',
    explanation:
      '再 zài means "again" or "once more" for a repetition or continuation that has not happened yet — a wish, a request or a plan. It sits right before the main verb, after a modal verb such as 能, 要 or 想. It is not 在 (also zài): 在 marks an action in progress or a place, while 再 looks ahead. For a repetition that has already happened, Chinese uses 又 instead.',
    examples: [
      {
        chinese: '这个蛋糕太好吃了，我想再吃一个。',
        pinyin: 'Zhège dàngāo tài hǎochī le, wǒ xiǎng zài chī yí ge.',
        english: "This cake is so good — I'd like to eat one more.",
      },
      {
        chinese: '这个问题我没听懂，你能再说一遍吗？',
        pinyin: 'Zhège wèntí wǒ méi tīngdǒng, nǐ néng zài shuō yí biàn ma?',
        english: "I didn't understand this question — can you say it one more time?",
        note: 'A modal verb such as 能 comes before 再',
      },
      {
        chinese: '我们能不能再见面？',
        pinyin: 'Wǒmen néng bu néng zài jiànmiàn?',
        english: 'Can we meet again?',
      },
      {
        chinese: '今天下雨了，我们下周再去爬山吧。',
        pinyin: 'Jīntiān xià yǔ le, wǒmen xiàzhōu zài qù páshān ba.',
        english: "It's raining today — let's go hiking again next week.",
        note: 'A plan for later uses 再',
      },
      {
        chinese: '那好吧，我们下次再约。',
        pinyin: 'Nà hǎo ba, wǒmen xiàcì zài yuē.',
        english: "All right then, let's arrange something another time.",
      },
    ],
  },
  {
    id: 'gr-62',
    lessons: [31],
    title: 'Nobody Ever… with 一直没人',
    titleChinese: '一直没人…',
    pattern: 'Time + Subject + 给 + Person + Action + 一直没人 + Result',
    explanation:
      'To complain that a call or message went unanswered, put the pieces in this order: when, who, 给 + the person contacted + the action, then 一直没人 + a result verb such as 接 (pick up), 回 (reply) or 看 (read). 一直 means "all along" and 没人 means "nobody", so together they say "nobody ever…".',
    examples: [
      {
        chinese: '昨天晚上我给你打电话，一直没人接。',
        pinyin: 'Zuótiān wǎnshang wǒ gěi nǐ dǎ diànhuà, yìzhí méi rén jiē.',
        english: 'I called you last night and nobody ever picked up.',
        note: 'Time + 我 + 给 + person + action + 一直没人 + result',
      },
      {
        chinese: '早上我给妈妈打电话，一直没人接。',
        pinyin: 'Zǎoshang wǒ gěi māma dǎ diànhuà, yìzhí méi rén jiē.',
        english: 'I phoned Mom this morning and nobody ever answered.',
      },
      {
        chinese: '上周我给老师发邮件，一直没人回。',
        pinyin: 'Shàngzhōu wǒ gěi lǎoshī fā yóujiàn, yìzhí méi rén huí.',
        english: 'Last week I emailed the teacher and nobody ever replied.',
        note: 'The result verb matches the action: 回 for a reply',
      },
    ],
  },

  // ── It's So Hot Today (Lesson 32) ──
  {
    id: 'gr-63',
    lessons: [32],
    title: 'Comparing with 比 and 没有',
    titleChinese: '比字句',
    pattern: 'A + 比 + B + Adjective · A + 没有 + B + Adjective',
    explanation:
      '比 bǐ means "than": A 比 B + adjective says A is more … than B. The adjective stands bare — never put 很, 非常 or 太 in front of it. To say the gap is large, add 多了 or 得多 after the adjective. The usual negative swaps 比 for 没有: A 没有 B + adjective means "A is not as … as B".',
    examples: [
      {
        chinese: '哥哥比妹妹高。',
        pinyin: 'Gēge bǐ mèimei gāo.',
        english: 'My older brother is taller than my younger sister.',
      },
      {
        chinese: '荔枝比山竹贵。',
        pinyin: 'Lìzhī bǐ shānzhú guì.',
        english: 'Lychees are more expensive than mangosteens.',
      },
      {
        chinese: '汽车比自行车贵多了。',
        pinyin: 'Qìchē bǐ zìxíngchē guì duō le.',
        english: 'A car is much more expensive than a bicycle.',
        note: '多了 / 得多 after the adjective = much more (汽车比自行车贵得多 means the same)',
      },
      {
        chinese: '妹妹没有哥哥高。',
        pinyin: 'Mèimei méiyǒu gēge gāo.',
        english: "My younger sister isn't as tall as my older brother.",
        note: 'Negative: 没有 replaces 比',
      },
      {
        chinese: '伦敦没有北京热。',
        pinyin: 'Lúndūn méiyǒu Běijīng rè.',
        english: "London isn't as hot as Beijing.",
      },
    ],
  },
  {
    id: 'gr-64',
    lessons: [32],
    title: 'Even More with 更',
    titleChinese: '比…更…',
    pattern: 'A + 比 + B + 更 + Adjective',
    explanation:
      '更 gèng means "even more" or "still more". In a 比 sentence it goes before the adjective: A is even more … than B. Use 更 here instead of 很, 非常 or 太, which cannot appear in a 比 sentence.',
    examples: [
      {
        chinese: '北京比伦敦更热。',
        pinyin: 'Běijīng bǐ Lúndūn gèng rè.',
        english: 'Beijing is even hotter than London.',
      },
      {
        chinese: '王林比刘中更快。',
        pinyin: 'Wáng Lín bǐ Liú Zhōng gèng kuài.',
        english: 'Wang Lin is even faster than Liu Zhong.',
      },
      {
        chinese: '明天的雨比今天更大。',
        pinyin: 'Míngtiān de yǔ bǐ jīntiān gèng dà.',
        english: "Tomorrow's rain will be even heavier than today's.",
      },
      {
        chinese: '今天比昨天更冷。',
        pinyin: 'Jīntiān bǐ zuótiān gèng lěng.',
        english: 'Today is even colder than yesterday.',
        note: '更, not 很 / 非常 / 太, in a 比 sentence',
      },
    ],
  },
  {
    id: 'gr-65',
    lessons: [32],
    title: 'Extremely with 极了',
    titleChinese: '形容词 + 极了',
    pattern: 'Adjective / Psychological verb + 极了',
    explanation:
      '极了 jíle goes straight after an adjective or a psychological verb (喜欢, 高兴, 激动, 难过, 害怕, 讨厌, 满意, 生气) and means "extremely". It comes AFTER the word it strengthens, and the sentence takes no extra 很 or 太. Use it for strong feelings, whether a complaint (冷极了) or delight (喜欢极了).',
    examples: [
      {
        chinese: '那个女孩漂亮极了。',
        pinyin: 'Nàge nǚhái piàoliang jíle.',
        english: 'That girl is extremely pretty.',
      },
      {
        chinese: '那个菜好吃极了。',
        pinyin: 'Nàge cài hǎochī jíle.',
        english: 'That dish is extremely tasty.',
      },
      {
        chinese: '我饿极了。',
        pinyin: 'Wǒ è jíle.',
        english: "I'm starving.",
        note: 'Works with physical states too',
      },
      {
        chinese: '谢谢你的礼物，我喜欢极了。',
        pinyin: 'Xièxie nǐ de lǐwù, wǒ xǐhuan jíle.',
        english: 'Thanks for the gift — I love it!',
        note: 'Psychological verb + 极了',
      },
      {
        chinese: '他的小狗死了，他难过极了。',
        pinyin: 'Tā de xiǎogǒu sǐ le, tā nánguò jíle.',
        english: "His puppy died and he's extremely sad.",
      },
    ],
  },
  {
    id: 'gr-66',
    lessons: [32],
    title: 'Approximate Numbers with 多',
    titleChinese: '概数「多」',
    pattern: 'Round number + 多 + Measure word + Noun · Other number + Measure word + 多 + Noun',
    explanation:
      '多 duō after a number means "and a bit more". After a ROUND number (十, 二十, 两百, 两千 …) it goes BEFORE the measure word: 二十多个同学 = 21–29 classmates. After a number that is not round it goes AFTER the measure word: 三岁多 = a little over three. With 十 the two orders differ: 十多岁 = 11–19 years old, 十岁多 = just over ten.',
    examples: [
      {
        chinese: '我有二十多个同学。',
        pinyin: 'Wǒ yǒu èrshí duō ge tóngxué.',
        english: 'I have more than twenty classmates.',
        note: 'Round number: 多 before the measure word (21–29)',
      },
      {
        chinese: '今天很热，三十多度。',
        pinyin: 'Jīntiān hěn rè, sānshí duō dù.',
        english: "It's very hot today — over thirty degrees.",
        note: '31–39 degrees',
      },
      {
        chinese: '他儿子三岁多了。',
        pinyin: 'Tā érzi sān suì duō le.',
        english: 'His son is a little over three.',
        note: 'Not a round number: measure word first, then 多',
      },
      {
        chinese: '我昨天晚上十一点多回到家。',
        pinyin: 'Wǒ zuótiān wǎnshang shíyī diǎn duō huídào jiā.',
        english: 'I got home a little after eleven last night.',
      },
      {
        chinese: '我和李月十多年没见面了。',
        pinyin: 'Wǒ hé Lǐ Yuè shí duō nián méi jiànmiàn le.',
        english: "Li Yue and I haven't seen each other for over ten years.",
        note: '十多年 = 11–19 years; 十年多 = just over 10 years',
      },
    ],
  },
  {
    id: 'gr-67',
    lessons: [32],
    title: 'Again (Already Happened) with 又',
    titleChinese: '又',
    pattern: 'Subject + 又 + Verb + 了',
    explanation:
      '又 yòu says an action or situation has happened AGAIN — it is already a fact, so the sentence usually ends with 了. 再 zài is for a repetition that has not happened yet (a plan, wish or request): 明天再去. Think of 又 as looking back and 再 as looking ahead. 又 often carries a note of annoyance or surprise.',
    examples: [
      {
        chinese: '你看，又下雨了！',
        pinyin: 'Nǐ kàn, yòu xià yǔ le!',
        english: "Look, it's raining again!",
      },
      {
        chinese: '他今天又迟到了。',
        pinyin: 'Tā jīntiān yòu chídào le.',
        english: "He's late again today.",
        note: '又 + 了: it has already happened',
      },
      {
        chinese: '我昨天又见到那个人了。',
        pinyin: 'Wǒ zuótiān yòu jiàndào nàge rén le.',
        english: 'I saw that person again yesterday.',
      },
      {
        chinese: '明天再开会吧，今天没时间。',
        pinyin: 'Míngtiān zài kāihuì ba, jīntiān méi shíjiān.',
        english: "Let's have the meeting tomorrow — there's no time today.",
        note: '再 = a repetition still to come',
      },
      {
        chinese: '我们什么时候再去那家饭店吃饭？',
        pinyin: 'Wǒmen shénme shíhou zài qù nà jiā fàndiàn chī fàn?',
        english: 'When shall we go to that restaurant again?',
        note: '再 in a question about the future',
      },
    ],
  },
  {
    id: 'gr-68',
    lessons: [32],
    title: 'Emphasis with 还…呢',
    titleChinese: '还…呢',
    pattern: 'Subject + 还 + Verb Phrase + 呢',
    explanation:
      '还 hái before a verb phrase, with 呢 at the end, stresses that something is impressive, special, unexpected or hard to achieve — "I even …!". It is often used to show off or to add a surprising extra detail. Don\'t mix it up with 还没…呢, which means "not yet".',
    examples: [
      {
        chinese: '我冬天还在外面游过泳呢。',
        pinyin: 'Wǒ dōngtiān hái zài wàimiàn yóuguo yǒng ne.',
        english: 'I even went swimming outdoors in winter!',
      },
      {
        chinese: '我还见过总统呢。',
        pinyin: 'Wǒ hái jiànguo zǒngtǒng ne.',
        english: "I've even met a president!",
      },
      {
        chinese: '他还去过北极呢。',
        pinyin: 'Tā hái qùguo Běijí ne.',
        english: "He's even been to the North Pole!",
      },
      {
        chinese: '妈妈还带我去了动物园呢。',
        pinyin: 'Māma hái dài wǒ qù le dòngwùyuán ne.',
        english: 'Mum even took me to the zoo!',
      },
    ],
  },
  {
    id: 'gr-69',
    lessons: [27, 32],
    title: 'But / However with 不过',
    titleChinese: '不过',
    pattern: 'Clause 1，不过 + Clause 2',
    explanation:
      '不过 búguò introduces a turn in the sentence: a positive or neutral statement first, then 不过 adds a qualification, a worry or a drawback — "but / however". It is a little softer and more conversational than 但是, which suits polite complaints and voicing concern. The subject of the second clause can follow 不过 directly.',
    examples: [
      {
        chinese: '最低气温零下二十多度，不过我们习惯了。',
        pinyin: 'Zuìdī qìwēn língxià èrshí duō dù, búguò wǒmen xíguàn le.',
        english: "The lowest temperature is over twenty below zero, but we're used to it.",
      },
      {
        chinese: '那件衣服很漂亮，不过太贵了，我不打算买。',
        pinyin: 'Nà jiàn yīfu hěn piàoliang, búguò tài guì le, wǒ bù dǎsuàn mǎi.',
        english:
          "That piece of clothing is very pretty, but it's too expensive, so I don't plan to buy it.",
        note: 'Complaint: the drawback follows 不过',
      },
      {
        chinese: '这次考试很难，不过我做了很好的准备，不会失败。',
        pinyin: 'Zhècì kǎoshì hěn nán, búguò wǒ zuò le hěn hǎo de zhǔnbèi, bú huì shībài.',
        english: "This exam is hard, but I prepared well and won't fail.",
      },
      {
        chinese: '爸妈身体很好，不过年纪大了，要小心一点。',
        pinyin: 'Bàmā shēntǐ hěn hǎo, búguò niánjì dà le, yào xiǎoxīn yìdiǎn.',
        english:
          "My parents are in good health, but they're getting on in years, so they need to be a bit careful.",
        note: 'Concern: 不过 flags the worry',
      },
    ],
  },
];
