export interface GrammarRule {
  id: string;
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
    title: 'Basic Sentence Order',
    titleChinese: '基本句型',
    pattern: 'Subject + Verb + Object',
    explanation: 'Chinese follows SVO order, same as English. No verb conjugation — the verb stays the same regardless of tense or subject.',
    examples: [
      { chinese: '我吃米饭。', pinyin: 'Wǒ chī mǐfàn.', english: 'I eat rice.' },
      { chinese: '他喝咖啡。', pinyin: 'Tā hē kāfēi.', english: 'He drinks coffee.' },
      { chinese: '我们学中文。', pinyin: 'Wǒmen xué zhōngwén.', english: 'We study Chinese.' },
    ],
  },
  {
    id: 'gr-02',
    title: 'Negation with 不',
    titleChinese: '用不否定',
    pattern: 'Subject + 不 + Verb/Adj',
    explanation: '不 bù negates verbs and adjectives in the present/future. It changes to bú before a 4th tone word.',
    examples: [
      { chinese: '我不吃肉。', pinyin: 'Wǒ bù chī ròu.', english: "I don't eat meat." },
      { chinese: '他不高。', pinyin: 'Tā bù gāo.', english: 'He is not tall.' },
      { chinese: '我不是学生。', pinyin: 'Wǒ bú shì xuéshēng.', english: "I'm not a student.", note: '不 → bú before 4th tone 是' },
    ],
  },
  {
    id: 'gr-03',
    title: 'Negation with 没(有)',
    titleChinese: '用没有否定',
    pattern: 'Subject + 没(有) + Verb',
    explanation: '没有 méiyǒu negates past actions or possession. 有 can be omitted after 没 for verbs.',
    examples: [
      { chinese: '我没有猫。', pinyin: 'Wǒ méiyǒu māo.', english: "I don't have a cat." },
      { chinese: '他没去。', pinyin: 'Tā méi qù.', english: "He didn't go." },
      { chinese: '我没吃早饭。', pinyin: 'Wǒ méi chī zǎofàn.', english: "I didn't eat breakfast." },
    ],
  },

  // ── Questions ──
  {
    id: 'gr-04',
    title: 'Yes/No Questions with 吗',
    titleChinese: '吗字问句',
    pattern: 'Statement + 吗？',
    explanation: 'Add 吗 to the end of any statement to turn it into a yes/no question. No word order change needed.',
    examples: [
      { chinese: '你是学生吗？', pinyin: 'Nǐ shì xuéshēng ma?', english: 'Are you a student?' },
      { chinese: '他忙吗？', pinyin: 'Tā máng ma?', english: 'Is he busy?' },
      { chinese: '你吃米饭吗？', pinyin: 'Nǐ chī mǐfàn ma?', english: 'Do you eat rice?' },
    ],
  },
  {
    id: 'gr-05',
    title: 'Affirmative-Negative Questions',
    titleChinese: '正反疑问句',
    pattern: 'Verb/Adj + 不 + Verb/Adj？',
    explanation: 'Instead of 吗, repeat the verb or adjective with 不 in between. Both forms mean the same thing — this form sounds more natural in spoken Chinese.',
    examples: [
      { chinese: '他忙不忙？', pinyin: 'Tā máng bù máng?', english: 'Is he busy (or not)?' },
      { chinese: '你吃不吃米饭？', pinyin: 'Nǐ chī bù chī mǐfàn?', english: 'Do you eat rice (or not)?' },
      { chinese: '你想不想吃饺子？', pinyin: 'Nǐ xiǎng bù xiǎng chī jiǎozi?', english: 'Do you want dumplings (or not)?' },
      { chinese: '你有没有男朋友？', pinyin: 'Nǐ yǒu méiyǒu nánpéngyou?', english: 'Do you have a boyfriend?', note: '有 uses 没 instead of 不' },
    ],
  },
  {
    id: 'gr-06',
    title: 'Question Words',
    titleChinese: '疑问词',
    pattern: 'Question word stays in place of the answer',
    explanation: 'Unlike English, question words stay where the answer would go. No word order change.',
    examples: [
      { chinese: '你是哪里人？', pinyin: 'Nǐ shì nǎlǐ rén?', english: 'Where are you from?' },
      { chinese: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', english: 'What is your name?' },
      { chinese: '你怎么走？', pinyin: 'Nǐ zěnme zǒu?', english: 'How do you get there?' },
      { chinese: '你住几层？', pinyin: 'Nǐ zhù jǐ céng?', english: 'Which floor do you live on?' },
    ],
  },
  {
    id: 'gr-07',
    title: 'How Is...? with 怎么样',
    titleChinese: '怎么样',
    pattern: 'Subject/Verb + 怎么样？',
    explanation: 'Ask someone\'s opinion or make a suggestion. Can also be prefixed with 你觉得 (what do you think).',
    examples: [
      { chinese: '这件衣服怎么样？', pinyin: 'Zhè jiàn yīfu zěnmeyàng?', english: 'How is this piece of clothing?' },
      { chinese: '晚上吃意大利面怎么样？', pinyin: 'Wǎnshàng chī yìdàlì miàn zěnmeyàng?', english: 'How about eating pasta tonight?' },
      { chinese: '你身体怎么样？', pinyin: 'Nǐ shēntǐ zěnmeyàng?', english: 'How is your health?' },
    ],
  },

  // ── Intensifiers ──
  {
    id: 'gr-08',
    title: '很 vs 真 vs 太 — Degree Words',
    titleChinese: '很、真、太',
    pattern: 'Subject + 很/真/太 + Adj (+ 了)',
    explanation: '很 hěn = neutral "very" (stating a fact). 真 zhēn = "really/so" (personal feeling, praise, surprise). 太 tài = "too/so" (extreme, needs 了 at the end).',
    examples: [
      { chinese: '他很高。', pinyin: 'Tā hěn gāo.', english: 'He is tall.', note: 'Neutral fact' },
      { chinese: '你真好！', pinyin: 'Nǐ zhēn hǎo!', english: "You're so kind!", note: 'Personal praise' },
      { chinese: '太好了！', pinyin: 'Tài hǎo le!', english: "That's great!", note: 'Strong feeling, needs 了' },
      { chinese: '太贵了。', pinyin: 'Tài guì le.', english: 'Too expensive.', note: 'Negative extreme' },
    ],
  },
  {
    id: 'gr-09',
    title: 'Most / Superlative with 最',
    titleChinese: '用最表示最高级',
    pattern: 'Subject + 最 + Adj/Verb',
    explanation: '最 zuì = "most". Place before an adjective or verb to form the superlative.',
    examples: [
      { chinese: '你最喜欢吃什么肉？', pinyin: 'Nǐ zuì xǐhuān chī shénme ròu?', english: 'What meat do you like most?' },
      { chinese: '这个最贵。', pinyin: 'Zhège zuì guì.', english: 'This one is the most expensive.' },
    ],
  },

  // ── Commands & Requests ──
  {
    id: 'gr-10',
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
    title: 'Can You...? with 能',
    titleChinese: '能字请求句',
    pattern: '你能 + Verb + 吗？',
    explanation: '能 néng = "can/able to". Used for polite requests or asking about ability.',
    examples: [
      { chinese: '你能帮我拍张照片吗？', pinyin: 'Nǐ néng bāng wǒ pāi zhāng zhàopiàn ma?', english: 'Can you take a photo for me?' },
      { chinese: '你能告诉我怎么走吗？', pinyin: 'Nǐ néng gàosu wǒ zěnme zǒu ma?', english: 'Can you tell me how to get there?' },
      { chinese: '你能往左走几步吗？', pinyin: 'Nǐ néng wǎng zuǒ zǒu jǐ bù ma?', english: 'Can you walk a few steps to the left?' },
    ],
  },

  // ── Location & Direction ──
  {
    id: 'gr-12',
    title: 'Location with 在',
    titleChinese: '在字表示位置',
    pattern: 'Subject + 在 + Place',
    explanation: '在 zài indicates where something or someone is located.',
    examples: [
      { chinese: '他在那里。', pinyin: 'Tā zài nàlǐ.', english: 'He is over there.' },
      { chinese: '洗手间在那边。', pinyin: 'Xǐshǒujiān zài nàbiān.', english: 'The restroom is over there.' },
      { chinese: '沙发在房间中间。', pinyin: 'Shāfā zài fángjiān zhōngjiān.', english: 'The sofa is in the middle of the room.' },
    ],
  },
  {
    id: 'gr-13',
    title: 'Direction with 往',
    titleChinese: '往字表示方向',
    pattern: '往 + Direction + Verb',
    explanation: '往 wǎng = "towards". Used with direction words to indicate movement.',
    examples: [
      { chinese: '往前走。', pinyin: 'Wǎng qián zǒu.', english: 'Walk forward.' },
      { chinese: '往左拐。', pinyin: 'Wǎng zuǒ guǎi.', english: 'Turn left.' },
      { chinese: '那个人往左走了3米。', pinyin: 'Nàge rén wǎng zuǒ zǒu le sān mǐ.', english: 'That person walked 3 metres to the left.' },
    ],
  },
  {
    id: 'gr-14',
    title: 'From with 从...来',
    titleChinese: '从...来',
    pattern: '从 + Place + 来',
    explanation: '从 cóng = "from". Used with 来 lái (come) to express origin.',
    examples: [
      { chinese: '我从北京来。', pinyin: 'Wǒ cóng Běijīng lái.', english: 'I come from Beijing.' },
      { chinese: '从这儿往前走。', pinyin: 'Cóng zhèr wǎng qián zǒu.', english: 'Go straight from here.' },
    ],
  },

  // ── Result Complements ──
  {
    id: 'gr-15',
    title: 'Result Complement with 见/到',
    titleChinese: '结果补语：见/到',
    pattern: 'Verb + 见 / Verb + 到',
    explanation: 'Adding 见 jiàn or 到 dào after a perception verb shows the action was completed/successful. 看 = looking / 看见 = actually saw it.',
    examples: [
      { chinese: '看见熊猫我们非常高兴。', pinyin: 'Kànjiàn xióngmāo wǒmen fēicháng gāoxìng.', english: 'Seeing the pandas we were extremely happy.' },
      { chinese: '你听见了吗？', pinyin: 'Nǐ tīngjiàn le ma?', english: 'Did you hear it?' },
      { chinese: '我看见了熊猫。', pinyin: 'Wǒ kànjiàn le xióngmāo.', english: 'I saw a panda.' },
    ],
  },

  // ── Duration & Time ──
  {
    id: 'gr-16',
    title: 'How Long with 多久/多长时间',
    titleChinese: '多久/多长时间',
    pattern: 'Verb + 多久/多长时间？',
    explanation: '多久 duō jiǔ and 多长时间 duō cháng shíjiān both ask "how long".',
    examples: [
      { chinese: '你住这里多久了？', pinyin: 'Nǐ zhù zhèlǐ duō jiǔ le?', english: 'How long have you lived here?' },
      { chinese: '走路要多久？', pinyin: 'Zǒulù yào duō jiǔ?', english: 'How long does it take to walk?' },
      { chinese: '多长时间？', pinyin: 'Duō cháng shíjiān?', english: 'How long will it take?' },
    ],
  },
  {
    id: 'gr-17',
    title: 'Just/Recently with 刚',
    titleChinese: '刚字表示最近',
    pattern: 'Subject + 刚 + Verb',
    explanation: '刚 gāng = "just" — indicates something happened very recently.',
    examples: [
      { chinese: '我上周刚搬来。', pinyin: 'Wǒ shàng zhōu gāng bān lái.', english: 'I just moved in last week.' },
      { chinese: '我刚吃完。', pinyin: 'Wǒ gāng chī wán.', english: 'I just finished eating.' },
    ],
  },

  // ── Comparisons & Descriptions ──
  {
    id: 'gr-18',
    title: 'Both...and... with 又...又...',
    titleChinese: '又...又...',
    pattern: 'Subject + 又 + Adj1 + 又 + Adj2',
    explanation: 'Describes something with two qualities at the same time.',
    examples: [
      { chinese: '他又高又壮。', pinyin: 'Tā yòu gāo yòu zhuàng.', english: 'He is both tall and strong.' },
      { chinese: '那个蓝色的又大又便宜。', pinyin: 'Nà ge lánsè de yòu dà yòu piányi.', english: 'That blue one is both big and cheap.' },
    ],
  },
  {
    id: 'gr-19',
    title: 'Completed Action with 了',
    titleChinese: '了字表示完成',
    pattern: 'Verb + 了',
    explanation: '了 le after a verb indicates the action is completed. It is NOT the same as past tense — it marks completion.',
    examples: [
      { chinese: '我住了两年了。', pinyin: 'Wǒ zhù le liǎng nián le.', english: "I've lived here two years." },
      { chinese: '他走了。', pinyin: 'Tā zǒu le.', english: 'He left.' },
      { chinese: '我吃了早饭。', pinyin: 'Wǒ chī le zǎofàn.', english: 'I ate breakfast.' },
    ],
  },
  {
    id: 'gr-21',
    title: 'Chinese Discounts with 折',
    titleChinese: '打折',
    pattern: 'Number + 折 = "you pay X0%"',
    explanation: 'Chinese discounts work opposite to English! The number refers to how much you PAY, not how much you save. 8折 = you pay 80% = 20% off. Use 打X折 dǎ X zhé as the verb.',
    examples: [
      { chinese: '今天打8折。', pinyin: 'Jīntiān dǎ bā zhé.', english: "Today it's 20% off.", note: '8折 = pay 80%' },
      { chinese: '这件衣服9折。', pinyin: 'Zhè jiàn yīfu jiǔ zhé.', english: '10% off this piece of clothing.', note: '9折 = pay 90%' },
      { chinese: '5折！', pinyin: 'Wǔ zhé!', english: 'Half price!', note: '5折 = pay 50%' },
      { chinese: '你能给我个折扣吗？', pinyin: 'Nǐ néng gěi wǒ ge zhékòu ma?', english: 'Can you give me a discount?' },
    ],
  },
  {
    id: 'gr-22',
    title: 'Bargaining with 行',
    titleChinese: '行字议价',
    pattern: '行 / 不行 / 行吗？',
    explanation: '行 xíng = "okay / that works / fine". Used frequently in bargaining and everyday agreement. 不行 = not okay.',
    examples: [
      { chinese: '10块行吗？', pinyin: 'Shí kuài xíng ma?', english: 'Is 10 kuai okay?' },
      { chinese: '行！', pinyin: 'Xíng!', english: 'Okay!' },
      { chinese: '不行，太贵了。', pinyin: 'Bù xíng, tài guì le.', english: 'No way, too expensive.' },
      { chinese: '行，没问题！', pinyin: 'Xíng, méi wèntí!', english: 'Sure, no problem!' },
    ],
  },
  {
    id: 'gr-20',
    title: 'Measure Words',
    titleChinese: '量词',
    pattern: 'Number + Measure Word + Noun',
    explanation: 'Chinese requires a measure word between a number and a noun. 个 gè is the most common/default one.',
    examples: [
      { chinese: '一个人', pinyin: 'yī gè rén', english: 'one person' },
      { chinese: '一只猫', pinyin: 'yī zhī māo', english: 'one cat', note: '只 for animals' },
      { chinese: '一件衣服', pinyin: 'yī jiàn yīfu', english: 'one piece of clothing', note: '件 for clothing/items' },
      { chinese: '一张照片', pinyin: 'yī zhāng zhàopiàn', english: 'one photo', note: '张 for flat objects' },
      { chinese: '三层', pinyin: 'sān céng', english: '3rd floor', note: '层 for floors/levels' },
    ],
  },
];
