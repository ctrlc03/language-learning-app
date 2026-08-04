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
    lessons: [3],
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
    lessons: [3],
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
    lessons: [13],
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
    lessons: [13],
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
    lessons: [13],
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
    lessons: [13, 26],
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
    lessons: [3],
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
    lessons: [3],
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
    lessons: [19],
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
    lessons: [10, 26],
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
    lessons: [10],
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
    lessons: [20],
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
    lessons: [21],
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
    lessons: [25],
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
    lessons: [7],
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
    lessons: [21, 26],
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
    lessons: [21],
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
    lessons: [21],
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
    lessons: [24],
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
    lessons: [24],
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
    lessons: [12, 26],
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
    lessons: [6],
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
    lessons: [25],
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
    lessons: [25, 26],
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
    lessons: [25],
    title: 'Negating 了 with 没',
    titleChinese: '「没」否定完成',
    pattern: 'Subject + 没(有) + Verb (drop 了)',
    explanation:
      'To negate a completed action, use 没(有) and DROP 了 — 没 and 了 never appear together. A-not-A questions have two forms: V + 没 + V + others (你吃没吃饭？) or V + others + 了没有 (你吃饭了没有？).',
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
    lessons: [25],
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
    lessons: [25],
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

  // ── Illness & Advice ──
  {
    id: 'gr-38',
    lessons: [26],
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
    lessons: [26],
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
    lessons: [26],
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
];
