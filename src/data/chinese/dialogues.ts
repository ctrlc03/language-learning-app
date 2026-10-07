import type { DialogueLine } from '@/types';

export interface Dialogue {
  id: string;
  title: string;
  titleChinese: string;
  setting: string;
  lesson: number;
  lines: DialogueLine[];
}

export const chineseDialogues: Dialogue[] = [
  // ============================================================
  // Lesson 3 - Pinyin & Adjectives
  // ============================================================
  {
    id: 'dlg-l03-01',
    title: 'Describing a Friend',
    titleChinese: '形容朋友',
    setting: 'Two classmates talk about a mutual friend.',
    lesson: 3,
    lines: [
      {
        speaker: 'A',
        text: '你认识李明吗？',
        pinyin: 'Nǐ rènshi Lǐ Míng ma?',
        translation: 'Do you know Li Ming?',
      },
      {
        speaker: 'B',
        text: '认识。他很高，也很帅。',
        pinyin: 'Rènshi. Tā hěn gāo, yě hěn shuài.',
        translation: 'Yes. He is very tall and also very handsome.',
      },
      { speaker: 'A', text: '他聪明吗？', pinyin: 'Tā cōngming ma?', translation: 'Is he smart?' },
      {
        speaker: 'B',
        text: '他很聪明，也很友好。',
        pinyin: 'Tā hěn cōngming, yě hěn yǒuhǎo.',
        translation: 'He is very smart and also very friendly.',
      },
      {
        speaker: 'A',
        text: '太好了！我想认识他。',
        pinyin: 'Tài hǎo le! Wǒ xiǎng rènshi tā.',
        translation: 'Great! I want to get to know him.',
      },
    ],
  },
  {
    id: 'dlg-l03-02',
    title: 'Talking About the Weather',
    titleChinese: '谈天气',
    setting: "Two neighbors chat about today's weather.",
    lesson: 3,
    lines: [
      {
        speaker: 'A',
        text: '今天天气怎么样？',
        pinyin: 'Jīntiān tiānqì zěnmeyàng?',
        translation: 'How is the weather today?',
      },
      {
        speaker: 'B',
        text: '今天很热，也很闷。',
        pinyin: 'Jīntiān hěn rè, yě hěn mēn.',
        translation: 'Today is very hot and also stuffy.',
      },
      {
        speaker: 'A',
        text: '明天呢？',
        pinyin: 'Míngtiān ne?',
        translation: 'What about tomorrow?',
      },
      {
        speaker: 'B',
        text: '明天会凉快一点。',
        pinyin: 'Míngtiān huì liángkuai yìdiǎn.',
        translation: 'Tomorrow will be a bit cooler.',
      },
      {
        speaker: 'A',
        text: '那太好了！今天太热了。',
        pinyin: 'Nà tài hǎo le! Jīntiān tài rè le.',
        translation: "That's great! Today is too hot.",
      },
    ],
  },
  {
    id: 'dlg-l03-03',
    title: 'Describing Things',
    titleChinese: '形容东西',
    setting: 'Two friends look at items in a shop window.',
    lesson: 3,
    lines: [
      {
        speaker: 'A',
        text: '你看，那个包很好看！',
        pinyin: 'Nǐ kàn, nà ge bāo hěn hǎokàn!',
        translation: 'Look, that bag is very pretty!',
      },
      {
        speaker: 'B',
        text: '是的，可是太贵了。',
        pinyin: 'Shì de, kěshì tài guì le.',
        translation: "Yes, but it's too expensive.",
      },
      {
        speaker: 'A',
        text: '这个红色的呢？很便宜。',
        pinyin: 'Zhè ge hóngsè de ne? Hěn piányi.',
        translation: "How about this red one? It's very cheap.",
      },
      {
        speaker: 'B',
        text: '红色的太小了。我喜欢大的。',
        pinyin: 'Hóngsè de tài xiǎo le. Wǒ xǐhuan dà de.',
        translation: 'The red one is too small. I like big ones.',
      },
      {
        speaker: 'A',
        text: '那个蓝色的又大又便宜。',
        pinyin: 'Nà ge lánsè de yòu dà yòu piányi.',
        translation: 'That blue one is both big and cheap.',
      },
      {
        speaker: 'B',
        text: '不错，我很喜欢！',
        pinyin: 'Búcuò, wǒ hěn xǐhuan!',
        translation: 'Not bad, I really like it!',
      },
    ],
  },
  {
    id: 'dlg-l03-04',
    title: 'New Classmate',
    titleChinese: '新同学',
    setting: 'Students discuss a new classmate.',
    lesson: 3,
    lines: [
      {
        speaker: 'A',
        text: '新来的同学是哪国人？',
        pinyin: 'Xīn lái de tóngxué shì nǎ guó rén?',
        translation: 'Where is the new classmate from?',
      },
      {
        speaker: 'B',
        text: '她是法国人。',
        pinyin: 'Tā shì Fǎguó rén.',
        translation: 'She is French.',
      },
      {
        speaker: 'A',
        text: '她漂亮吗？',
        pinyin: 'Tā piàoliang ma?',
        translation: 'Is she pretty?',
      },
      {
        speaker: 'B',
        text: '很漂亮，头发长长的，眼睛大大的。',
        pinyin: 'Hěn piàoliang, tóufa chángcháng de, yǎnjing dàdà de.',
        translation: 'Very pretty, with long hair and big eyes.',
      },
      {
        speaker: 'A',
        text: '她的中文好不好？',
        pinyin: 'Tā de Zhōngwén hǎo bu hǎo?',
        translation: 'Is her Chinese good?',
      },
      {
        speaker: 'B',
        text: '还不错，她很努力。',
        pinyin: 'Hái búcuò, tā hěn nǔlì.',
        translation: 'Not bad, she works very hard.',
      },
    ],
  },

  // ============================================================
  // Lesson 5 - Time & Daily Schedule
  // ============================================================
  {
    id: 'dlg-l05-01',
    title: 'Morning Routine',
    titleChinese: '早上的安排',
    setting: 'Roommates discuss their morning plans.',
    lesson: 5,
    lines: [
      {
        speaker: 'A',
        text: '你每天几点起床？',
        pinyin: 'Nǐ měitiān jǐ diǎn qǐchuáng?',
        translation: 'What time do you get up every day?',
      },
      {
        speaker: 'B',
        text: '我六点半起床。你呢？',
        pinyin: 'Wǒ liù diǎn bàn qǐchuáng. Nǐ ne?',
        translation: 'I get up at 6:30. You?',
      },
      {
        speaker: 'A',
        text: '我七点起床，然后吃早饭。',
        pinyin: 'Wǒ qī diǎn qǐchuáng, ránhòu chī zǎofàn.',
        translation: 'I get up at 7, then eat breakfast.',
      },
      {
        speaker: 'B',
        text: '你几点上课？',
        pinyin: 'Nǐ jǐ diǎn shàngkè?',
        translation: 'What time do you start class?',
      },
      {
        speaker: 'A',
        text: '八点上课。我得走了！',
        pinyin: 'Bā diǎn shàngkè. Wǒ děi zǒu le!',
        translation: 'Class starts at 8. I have to go!',
      },
      {
        speaker: 'B',
        text: '再见，路上小心！',
        pinyin: 'Zàijiàn, lùshang xiǎoxīn!',
        translation: 'Bye, be careful on the way!',
      },
    ],
  },
  {
    id: 'dlg-l05-02',
    title: 'Making Plans',
    titleChinese: '做计划',
    setting: 'Two friends make plans for the afternoon.',
    lesson: 5,
    lines: [
      {
        speaker: 'A',
        text: '你下午有空吗？',
        pinyin: 'Nǐ xiàwǔ yǒu kòng ma?',
        translation: 'Are you free this afternoon?',
      },
      {
        speaker: 'B',
        text: '下午两点到四点有课。四点以后有空。',
        pinyin: 'Xiàwǔ liǎng diǎn dào sì diǎn yǒu kè. Sì diǎn yǐhòu yǒu kòng.',
        translation: "I have class from 2 to 4. I'm free after 4.",
      },
      {
        speaker: 'A',
        text: '那我们四点半去打篮球，好不好？',
        pinyin: 'Nà wǒmen sì diǎn bàn qù dǎ lánqiú, hǎo bu hǎo?',
        translation: "Then let's go play basketball at 4:30, OK?",
      },
      {
        speaker: 'B',
        text: '好的！在哪儿见面？',
        pinyin: 'Hǎode! Zài nǎr jiànmiàn?',
        translation: 'OK! Where shall we meet?',
      },
      {
        speaker: 'A',
        text: '在学校门口见。',
        pinyin: 'Zài xuéxiào ménkǒu jiàn.',
        translation: "Let's meet at the school gate.",
      },
      {
        speaker: 'B',
        text: '没问题，四点半见！',
        pinyin: 'Méi wèntí, sì diǎn bàn jiàn!',
        translation: 'No problem, see you at 4:30!',
      },
    ],
  },
  {
    id: 'dlg-l05-03',
    title: 'Daily Schedule',
    titleChinese: '每天的日程',
    setting: 'A student describes their typical day to a language partner.',
    lesson: 5,
    lines: [
      {
        speaker: 'A',
        text: '你每天都很忙吗？',
        pinyin: 'Nǐ měitiān dōu hěn máng ma?',
        translation: 'Are you busy every day?',
      },
      {
        speaker: 'B',
        text: '是的。上午我上课，下午我去图书馆。',
        pinyin: 'Shì de. Shàngwǔ wǒ shàngkè, xiàwǔ wǒ qù túshūguǎn.',
        translation: 'Yes. In the morning I have class, in the afternoon I go to the library.',
      },
      {
        speaker: 'A',
        text: '晚上做什么？',
        pinyin: 'Wǎnshang zuò shénme?',
        translation: 'What do you do in the evening?',
      },
      {
        speaker: 'B',
        text: '晚上我先做作业，然后看电视。',
        pinyin: 'Wǎnshang wǒ xiān zuò zuòyè, ránhòu kàn diànshì.',
        translation: 'In the evening I do homework first, then watch TV.',
      },
      {
        speaker: 'A',
        text: '你几点睡觉？',
        pinyin: 'Nǐ jǐ diǎn shuìjiào?',
        translation: 'What time do you go to sleep?',
      },
      {
        speaker: 'B',
        text: '十一点左右睡觉。太晚了，我知道！',
        pinyin: 'Shíyī diǎn zuǒyòu shuìjiào. Tài wǎn le, wǒ zhīdào!',
        translation: 'Around 11. Too late, I know!',
      },
    ],
  },

  // ============================================================
  // Lesson 6 - Family & Occupations
  // ============================================================
  {
    id: 'dlg-l06-01',
    title: 'Introducing Family',
    titleChinese: '介绍家人',
    setting: 'A student introduces their family to a new friend.',
    lesson: 6,
    lines: [
      {
        speaker: 'A',
        text: '你家有几口人？',
        pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?',
        translation: 'How many people are in your family?',
      },
      {
        speaker: 'B',
        text: '我家有四口人：爸爸、妈妈、姐姐和我。',
        pinyin: 'Wǒ jiā yǒu sì kǒu rén: bàba, māma, jiějie hé wǒ.',
        translation: 'There are four people in my family: dad, mom, older sister, and me.',
      },
      {
        speaker: 'A',
        text: '你爸爸做什么工作？',
        pinyin: 'Nǐ bàba zuò shénme gōngzuò?',
        translation: 'What does your dad do for work?',
      },
      {
        speaker: 'B',
        text: '我爸爸是医生，我妈妈是老师。',
        pinyin: 'Wǒ bàba shì yīshēng, wǒ māma shì lǎoshī.',
        translation: 'My dad is a doctor, my mom is a teacher.',
      },
      {
        speaker: 'A',
        text: '你姐姐呢？她也工作了吗？',
        pinyin: 'Nǐ jiějie ne? Tā yě gōngzuò le ma?',
        translation: 'What about your sister? Does she work too?',
      },
      {
        speaker: 'B',
        text: '她还在上大学，学的是法律。',
        pinyin: 'Tā hái zài shàng dàxué, xué de shì fǎlǜ.',
        translation: 'She is still in college, studying law.',
      },
    ],
  },
  {
    id: 'dlg-l06-02',
    title: 'Talking About Jobs',
    titleChinese: '谈工作',
    setting: 'Two people meet at a party and discuss their jobs.',
    lesson: 6,
    lines: [
      {
        speaker: 'A',
        text: '你好！你是做什么工作的？',
        pinyin: 'Nǐ hǎo! Nǐ shì zuò shénme gōngzuò de?',
        translation: 'Hello! What do you do for work?',
      },
      {
        speaker: 'B',
        text: '我是程序员，在一家科技公司上班。你呢？',
        pinyin: 'Wǒ shì chéngxùyuán, zài yì jiā kējì gōngsī shàngbān. Nǐ ne?',
        translation: "I'm a programmer, I work at a tech company. You?",
      },
      {
        speaker: 'A',
        text: '我是记者。工作很忙，但是很有意思。',
        pinyin: 'Wǒ shì jìzhě. Gōngzuò hěn máng, dànshì hěn yǒu yìsi.',
        translation: "I'm a journalist. Work is busy, but very interesting.",
      },
      {
        speaker: 'B',
        text: '你每天都要写文章吗？',
        pinyin: 'Nǐ měitiān dōu yào xiě wénzhāng ma?',
        translation: 'Do you write articles every day?',
      },
      {
        speaker: 'A',
        text: '差不多。有时候也要出去采访。',
        pinyin: 'Chàbuduō. Yǒu shíhou yě yào chūqù cǎifǎng.',
        translation: 'More or less. Sometimes I also go out for interviews.',
      },
    ],
  },
  {
    id: 'dlg-l06-03',
    title: 'Family Photo',
    titleChinese: '家庭照片',
    setting: 'A friend shows a family photo and explains who everyone is.',
    lesson: 6,
    lines: [
      {
        speaker: 'A',
        text: '这是你的家庭照片吗？',
        pinyin: 'Zhè shì nǐ de jiātíng zhàopiàn ma?',
        translation: 'Is this your family photo?',
      },
      {
        speaker: 'B',
        text: '是的。这是我爷爷和奶奶。',
        pinyin: 'Shì de. Zhè shì wǒ yéye hé nǎinai.',
        translation: 'Yes. This is my grandpa and grandma.',
      },
      {
        speaker: 'A',
        text: '他们看起来很年轻！',
        pinyin: 'Tāmen kàn qǐlái hěn niánqīng!',
        translation: 'They look very young!',
      },
      {
        speaker: 'B',
        text: '谢谢。这是我弟弟，他今年十岁。',
        pinyin: 'Xièxie. Zhè shì wǒ dìdi, tā jīnnián shí suì.',
        translation: 'Thanks. This is my younger brother, he is 10 this year.',
      },
      {
        speaker: 'A',
        text: '他长得很可爱！你们一家人都很幸福。',
        pinyin: "Tā zhǎng de hěn kě'ài! Nǐmen yì jiā rén dōu hěn xìngfú.",
        translation: 'He is so cute! Your whole family looks very happy.',
      },
      { speaker: 'B', text: '谢谢你！', pinyin: 'Xièxie nǐ!', translation: 'Thank you!' },
    ],
  },

  // ============================================================
  // Lesson 7 - Shopping & Money
  // ============================================================
  {
    id: 'dlg-l07-01',
    title: 'Buying Clothes',
    titleChinese: '买衣服',
    setting: 'A customer shops for clothes at a store.',
    lesson: 7,
    lines: [
      {
        speaker: 'A (Customer)',
        text: '请问，这件衣服多少钱？',
        pinyin: 'Qǐngwèn, zhè jiàn yīfu duōshao qián?',
        translation: 'Excuse me, how much is this piece of clothing?',
      },
      {
        speaker: 'B (Seller)',
        text: '这件200块。',
        pinyin: 'Zhè jiàn liǎng bǎi kuài.',
        translation: 'This one is 200 yuan.',
      },
      {
        speaker: 'A',
        text: '太贵了！能便宜一点吗？',
        pinyin: 'Tài guì le! Néng piányi yìdiǎn ma?',
        translation: 'Too expensive! Can it be cheaper?',
      },
      {
        speaker: 'B',
        text: '最少160块。',
        pinyin: 'Zuìshǎo yìbǎi liùshí kuài.',
        translation: 'At least 160 yuan.',
      },
      {
        speaker: 'A',
        text: '150块行不行？',
        pinyin: 'Yìbǎi wǔshí kuài xíng bu xíng?',
        translation: 'How about 150 yuan?',
      },
      {
        speaker: 'B',
        text: '好吧，150块。您要什么颜色？',
        pinyin: 'Hǎo ba, yìbǎi wǔshí kuài. Nín yào shénme yánsè?',
        translation: 'Fine, 150 yuan. What color do you want?',
      },
      {
        speaker: 'A',
        text: '我要黑色的。',
        pinyin: 'Wǒ yào hēisè de.',
        translation: 'I want the black one.',
      },
    ],
  },
  {
    id: 'dlg-l07-02',
    title: 'At the Supermarket',
    titleChinese: '在超市',
    setting: 'A customer asks for help finding items in a supermarket.',
    lesson: 7,
    lines: [
      {
        speaker: 'A (Customer)',
        text: '请问，水果在哪儿？',
        pinyin: 'Qǐngwèn, shuǐguǒ zài nǎr?',
        translation: 'Excuse me, where is the fruit?',
      },
      {
        speaker: 'B (Staff)',
        text: '在那边，第三排。',
        pinyin: 'Zài nàbiān, dì sān pái.',
        translation: 'Over there, third aisle.',
      },
      {
        speaker: 'A',
        text: '谢谢。苹果怎么卖？',
        pinyin: 'Xièxie. Píngguǒ zěnme mài?',
        translation: 'Thanks. How much are the apples?',
      },
      {
        speaker: 'B',
        text: '苹果8块钱一斤。',
        pinyin: 'Píngguǒ bā kuài qián yì jīn.',
        translation: 'Apples are 8 yuan per jin.',
      },
      {
        speaker: 'A',
        text: '我要两斤苹果和一斤香蕉。',
        pinyin: 'Wǒ yào liǎng jīn píngguǒ hé yì jīn xiāngjiāo.',
        translation: 'I want two jin of apples and one jin of bananas.',
      },
      {
        speaker: 'B',
        text: '一共22块。在那边付钱。',
        pinyin: "Yígòng èrshí'èr kuài. Zài nàbiān fù qián.",
        translation: '22 yuan total. Pay over there.',
      },
    ],
  },
  {
    id: 'dlg-l07-03',
    title: 'Bargaining at a Market',
    titleChinese: '讨价还价',
    setting: 'A tourist bargains at a market stall.',
    lesson: 7,
    lines: [
      {
        speaker: 'A (Seller)',
        text: '看看吧！这些帽子很好看！',
        pinyin: 'Kànkan ba! Zhèxiē màozi hěn hǎokàn!',
        translation: 'Take a look! These hats are very nice!',
      },
      {
        speaker: 'B (Customer)',
        text: '这个帽子多少钱？',
        pinyin: 'Zhè ge màozi duōshao qián?',
        translation: 'How much is this hat?',
      },
      { speaker: 'A', text: '80块。', pinyin: 'Bāshí kuài.', translation: '80 yuan.' },
      {
        speaker: 'B',
        text: '80块太贵了！40块卖不卖？',
        pinyin: 'Bāshí kuài tài guì le! Sìshí kuài mài bu mài?',
        translation: '80 yuan is too expensive! Will you sell for 40?',
      },
      {
        speaker: 'A',
        text: '40块不行。最少60块。',
        pinyin: 'Sìshí kuài bù xíng. Zuìshǎo liùshí kuài.',
        translation: "40 yuan won't work. At least 60.",
      },
      {
        speaker: 'B',
        text: '50块，好不好？',
        pinyin: 'Wǔshí kuài, hǎo bu hǎo?',
        translation: '50 yuan, OK?',
      },
      {
        speaker: 'A',
        text: '好吧好吧，50就50。',
        pinyin: 'Hǎo ba hǎo ba, wǔshí jiù wǔshí.',
        translation: 'Fine fine, 50 it is.',
      },
    ],
  },

  // ============================================================
  // Lesson 8 - Chinese New Year & Mobile Payment
  // ============================================================
  {
    id: 'dlg-l08-01',
    title: 'New Year Greetings',
    titleChinese: '新年祝福',
    setting: 'Friends exchange Chinese New Year greetings.',
    lesson: 8,
    lines: [
      {
        speaker: 'A',
        text: '新年快乐！恭喜发财！',
        pinyin: 'Xīnnián kuàilè! Gōngxǐ fācái!',
        translation: 'Happy New Year! Wishing you prosperity!',
      },
      {
        speaker: 'B',
        text: '新年快乐！你今年回家过年吗？',
        pinyin: 'Xīnnián kuàilè! Nǐ jīnnián huí jiā guònián ma?',
        translation: 'Happy New Year! Are you going home for New Year this year?',
      },
      {
        speaker: 'A',
        text: '是的，我买了火车票，明天回去。',
        pinyin: 'Shì de, wǒ mǎi le huǒchē piào, míngtiān huíqù.',
        translation: 'Yes, I bought a train ticket, going back tomorrow.',
      },
      {
        speaker: 'B',
        text: '你们家怎么过春节？',
        pinyin: 'Nǐmen jiā zěnme guò Chūnjié?',
        translation: 'How does your family celebrate Spring Festival?',
      },
      {
        speaker: 'A',
        text: '我们一起吃年夜饭，放鞭炮，看春晚。',
        pinyin: 'Wǒmen yìqǐ chī niányèfàn, fàng biānpào, kàn Chūnwǎn.',
        translation:
          "We eat New Year's Eve dinner together, set off firecrackers, and watch the Spring Festival Gala.",
      },
      {
        speaker: 'B',
        text: '真好！祝你一路平安！',
        pinyin: "Zhēn hǎo! Zhù nǐ yílù píng'ān!",
        translation: 'How nice! Wish you a safe journey!',
      },
    ],
  },
  {
    id: 'dlg-l08-02',
    title: 'Scanning to Pay',
    titleChinese: '扫码支付',
    setting: 'A customer pays using mobile payment at a convenience store.',
    lesson: 8,
    lines: [
      {
        speaker: 'A (Cashier)',
        text: '一共18块5毛。',
        pinyin: 'Yígòng shíbā kuài wǔ máo.',
        translation: "That's 18.50 yuan total.",
      },
      {
        speaker: 'B (Customer)',
        text: '可以用微信支付吗？',
        pinyin: 'Kěyǐ yòng Wēixìn zhīfù ma?',
        translation: 'Can I pay with WeChat Pay?',
      },
      {
        speaker: 'A',
        text: '可以，你扫我还是我扫你？',
        pinyin: 'Kěyǐ, nǐ sǎo wǒ háishi wǒ sǎo nǐ?',
        translation: 'Sure, do you scan me or I scan you?',
      },
      { speaker: 'B', text: '我扫你吧。', pinyin: 'Wǒ sǎo nǐ ba.', translation: "I'll scan you." },
      {
        speaker: 'A',
        text: '好，这是二维码。',
        pinyin: 'Hǎo, zhè shì èrwéimǎ.',
        translation: 'OK, here is the QR code.',
      },
      { speaker: 'B', text: '付好了。', pinyin: 'Fù hǎo le.', translation: 'Payment done.' },
      {
        speaker: 'A',
        text: '收到了，谢谢！',
        pinyin: 'Shōudào le, xièxie!',
        translation: 'Received, thanks!',
      },
    ],
  },
  {
    id: 'dlg-l08-03',
    title: 'Red Envelopes',
    titleChinese: '红包',
    setting: 'Colleagues talk about red envelopes during Chinese New Year.',
    lesson: 8,
    lines: [
      {
        speaker: 'A',
        text: '你收到红包了吗？',
        pinyin: 'Nǐ shōudào hóngbāo le ma?',
        translation: 'Did you receive any red envelopes?',
      },
      {
        speaker: 'B',
        text: '收到了！爷爷奶奶给了我一个大红包。',
        pinyin: 'Shōudào le! Yéye nǎinai gěi le wǒ yí ge dà hóngbāo.',
        translation: 'Yes! Grandpa and grandma gave me a big red envelope.',
      },
      {
        speaker: 'A',
        text: '现在很多人在微信上发红包。',
        pinyin: 'Xiànzài hěn duō rén zài Wēixìn shang fā hóngbāo.',
        translation: 'Nowadays many people send red envelopes on WeChat.',
      },
      {
        speaker: 'B',
        text: '对，我也在群里抢了几个红包。',
        pinyin: 'Duì, wǒ yě zài qúnlǐ qiǎng le jǐ ge hóngbāo.',
        translation: 'Right, I also grabbed a few red envelopes in group chats.',
      },
      {
        speaker: 'A',
        text: '哈哈，抢到多少钱？',
        pinyin: 'Hāhā, qiǎng dào duōshao qián?',
        translation: 'Haha, how much did you get?',
      },
      {
        speaker: 'B',
        text: '不多，加起来才五块钱。',
        pinyin: 'Bù duō, jiā qǐlái cái wǔ kuài qián.',
        translation: 'Not much, only 5 yuan altogether.',
      },
    ],
  },
  {
    id: 'dlg-l08-04',
    title: 'Spring Festival Traditions',
    titleChinese: '春节传统',
    setting: 'A Chinese student explains Spring Festival traditions to a foreign friend.',
    lesson: 8,
    lines: [
      {
        speaker: 'A',
        text: '春节你们为什么要贴春联？',
        pinyin: 'Chūnjié nǐmen wèishénme yào tiē chūnlián?',
        translation: 'Why do you put up spring couplets during Spring Festival?',
      },
      {
        speaker: 'B',
        text: '因为春联代表好运。我们还要贴"福"字。',
        pinyin: 'Yīnwèi chūnlián dàibiǎo hǎoyùn. Wǒmen hái yào tiē "fú" zì.',
        translation:
          'Because spring couplets represent good luck. We also put up the character "fu" (blessing).',
      },
      {
        speaker: 'A',
        text: '我看到有人倒着贴"福"字，为什么？',
        pinyin: 'Wǒ kàndào yǒu rén dàozhe tiē "fú" zì, wèishénme?',
        translation: 'I saw some people put the "fu" character upside down, why?',
      },
      {
        speaker: 'B',
        text: '因为"倒"和"到"发音一样，意思是福到了！',
        pinyin: 'Yīnwèi "dào" hé "dào" fāyīn yíyàng, yìsi shì fú dào le!',
        translation:
          'Because "upside down" and "arrive" sound the same, it means blessings have arrived!',
      },
      {
        speaker: 'A',
        text: '太有意思了！中国文化真丰富。',
        pinyin: 'Tài yǒu yìsi le! Zhōngguó wénhuà zhēn fēngfù.',
        translation: 'So interesting! Chinese culture is really rich.',
      },
    ],
  },

  // ============================================================
  // Lesson 9 - Review & Advanced Topics
  // ============================================================
  {
    id: 'dlg-l09-01',
    title: 'Lost Phone',
    titleChinese: '手机丢了',
    setting: 'Someone has lost their phone and asks for help.',
    lesson: 9,
    lines: [
      {
        speaker: 'A',
        text: '糟糕！我的手机不见了！',
        pinyin: 'Zāogāo! Wǒ de shǒujī bújiàn le!',
        translation: 'Oh no! My phone is gone!',
      },
      {
        speaker: 'B',
        text: '别着急。你最后一次用手机是什么时候？',
        pinyin: 'Bié zhāojí. Nǐ zuìhòu yí cì yòng shǒujī shì shénme shíhou?',
        translation: "Don't worry. When was the last time you used your phone?",
      },
      {
        speaker: 'A',
        text: '在餐馆吃饭的时候，我用手机付了钱。',
        pinyin: 'Zài cānguǎn chīfàn de shíhou, wǒ yòng shǒujī fù le qián.',
        translation: 'When I was eating at the restaurant, I used my phone to pay.',
      },
      {
        speaker: 'B',
        text: '那你回餐馆看看吧。可能忘在那儿了。',
        pinyin: 'Nà nǐ huí cānguǎn kànkan ba. Kěnéng wàng zài nàr le.',
        translation: 'Then go back to the restaurant and check. Maybe you left it there.',
      },
      {
        speaker: 'A',
        text: '好的，我现在就去。谢谢你！',
        pinyin: 'Hǎode, wǒ xiànzài jiù qù. Xièxie nǐ!',
        translation: "OK, I'll go right now. Thank you!",
      },
      {
        speaker: 'B',
        text: '不客气。希望你能找到！',
        pinyin: 'Bú kèqi. Xīwàng nǐ néng zhǎodào!',
        translation: "You're welcome. Hope you find it!",
      },
    ],
  },
  {
    id: 'dlg-l09-02',
    title: 'Seeing a Doctor',
    titleChinese: '看医生',
    setting: 'A patient visits the doctor with a cold.',
    lesson: 9,
    lines: [
      {
        speaker: 'A (Doctor)',
        text: '你哪儿不舒服？',
        pinyin: 'Nǐ nǎr bù shūfu?',
        translation: "What's bothering you?",
      },
      {
        speaker: 'B (Patient)',
        text: '我头疼，还有点发烧。',
        pinyin: 'Wǒ tóu téng, hái yǒudiǎn fāshāo.',
        translation: 'I have a headache and a slight fever.',
      },
      {
        speaker: 'A',
        text: '从什么时候开始的？',
        pinyin: 'Cóng shénme shíhou kāishǐ de?',
        translation: 'When did it start?',
      },
      {
        speaker: 'B',
        text: '从昨天晚上开始的。',
        pinyin: 'Cóng zuótiān wǎnshang kāishǐ de.',
        translation: 'Since last night.',
      },
      {
        speaker: 'A',
        text: '你感冒了。多喝水，多休息。我给你开点药。',
        pinyin: 'Nǐ gǎnmào le. Duō hē shuǐ, duō xiūxi. Wǒ gěi nǐ kāi diǎn yào.',
        translation: "You have a cold. Drink more water, rest more. I'll prescribe some medicine.",
      },
      {
        speaker: 'B',
        text: '好的，谢谢医生。',
        pinyin: 'Hǎode, xièxie yīshēng.',
        translation: 'OK, thank you doctor.',
      },
    ],
  },
  {
    id: 'dlg-l09-03',
    title: 'Renting an Apartment',
    titleChinese: '租房子',
    setting: 'Someone inquires about renting an apartment.',
    lesson: 9,
    lines: [
      {
        speaker: 'A',
        text: '请问，这个房子还出租吗？',
        pinyin: 'Qǐngwèn, zhè ge fángzi hái chūzū ma?',
        translation: 'Excuse me, is this apartment still for rent?',
      },
      {
        speaker: 'B (Landlord)',
        text: '是的。一个月3000块，水电费另算。',
        pinyin: 'Shì de. Yí ge yuè sānqiān kuài, shuǐdiànfèi lìng suàn.',
        translation: 'Yes. 3000 yuan per month, utilities extra.',
      },
      {
        speaker: 'A',
        text: '有家具吗？',
        pinyin: 'Yǒu jiājù ma?',
        translation: 'Is it furnished?',
      },
      {
        speaker: 'B',
        text: '有床、桌子、衣柜和空调。',
        pinyin: 'Yǒu chuáng, zhuōzi, yīguì hé kōngtiáo.',
        translation: 'There is a bed, desk, wardrobe, and air conditioning.',
      },
      {
        speaker: 'A',
        text: '能养宠物吗？',
        pinyin: 'Néng yǎng chǒngwù ma?',
        translation: 'Can I keep pets?',
      },
      {
        speaker: 'B',
        text: '小的可以，大的不行。',
        pinyin: 'Xiǎo de kěyǐ, dà de bù xíng.',
        translation: 'Small ones are OK, large ones are not.',
      },
      {
        speaker: 'A',
        text: '好的，我考虑一下。',
        pinyin: 'Hǎode, wǒ kǎolǜ yíxià.',
        translation: 'OK, let me think about it.',
      },
    ],
  },

  // ============================================================
  // Lesson 10 - Asking for Directions
  // ============================================================
  {
    id: 'dlg-l10-01',
    title: 'Finding a Bank',
    titleChinese: '找银行',
    setting: 'A pedestrian asks for directions to the bank.',
    lesson: 10,
    lines: [
      {
        speaker: 'A',
        text: '请问，附近有银行吗？',
        pinyin: 'Qǐngwèn, fùjìn yǒu yínháng ma?',
        translation: 'Excuse me, is there a bank nearby?',
      },
      {
        speaker: 'B',
        text: '有。你一直往前走，到第二个路口左转。',
        pinyin: 'Yǒu. Nǐ yìzhí wǎng qián zǒu, dào dì èr ge lùkǒu zuǒ zhuǎn.',
        translation: 'Yes. Go straight ahead and turn left at the second intersection.',
      },
      {
        speaker: 'A',
        text: '左转以后呢？',
        pinyin: 'Zuǒ zhuǎn yǐhòu ne?',
        translation: 'After turning left?',
      },
      {
        speaker: 'B',
        text: '走大概五分钟，银行就在右边。',
        pinyin: 'Zǒu dàgài wǔ fēnzhōng, yínháng jiù zài yòubiān.',
        translation: 'Walk about 5 minutes, the bank is on the right side.',
      },
      {
        speaker: 'A',
        text: '远不远？走路能到吗？',
        pinyin: 'Yuǎn bu yuǎn? Zǒulù néng dào ma?',
        translation: 'Is it far? Can I walk there?',
      },
      {
        speaker: 'B',
        text: '不远，走路十分钟左右就到了。',
        pinyin: 'Bù yuǎn, zǒulù shí fēnzhōng zuǒyòu jiù dào le.',
        translation: 'Not far, about 10 minutes on foot.',
      },
      { speaker: 'A', text: '谢谢你！', pinyin: 'Xièxie nǐ!', translation: 'Thank you!' },
    ],
  },
  {
    id: 'dlg-l10-02',
    title: 'Taking the Subway',
    titleChinese: '坐地铁',
    setting: 'A tourist asks how to get to a destination by subway.',
    lesson: 10,
    lines: [
      {
        speaker: 'A',
        text: '请问，去天安门怎么走？',
        pinyin: "Qǐngwèn, qù Tiān'ānmén zěnme zǒu?",
        translation: 'Excuse me, how do I get to Tiananmen?',
      },
      {
        speaker: 'B',
        text: '你可以坐地铁。这儿有地铁站。',
        pinyin: 'Nǐ kěyǐ zuò dìtiě. Zhèr yǒu dìtiě zhàn.',
        translation: "You can take the subway. There's a subway station here.",
      },
      {
        speaker: 'A',
        text: '坐几号线？',
        pinyin: 'Zuò jǐ hào xiàn?',
        translation: 'Which line should I take?',
      },
      {
        speaker: 'B',
        text: '坐一号线，到天安门东站下车。',
        pinyin: "Zuò yī hào xiàn, dào Tiān'ānmén Dōng zhàn xià chē.",
        translation: 'Take Line 1, get off at Tiananmen East station.',
      },
      {
        speaker: 'A',
        text: '要换乘吗？',
        pinyin: 'Yào huànchéng ma?',
        translation: 'Do I need to transfer?',
      },
      {
        speaker: 'B',
        text: '不用换乘，直接到。大概三站就到了。',
        pinyin: 'Búyòng huànchéng, zhíjiē dào. Dàgài sān zhàn jiù dào le.',
        translation: 'No need to transfer, it goes directly. About 3 stops.',
      },
    ],
  },
  {
    id: 'dlg-l10-03',
    title: 'Taking a Taxi',
    titleChinese: '打车',
    setting: 'A passenger gives directions to a taxi driver.',
    lesson: 10,
    lines: [
      {
        speaker: 'A (Passenger)',
        text: '师傅，去火车站。',
        pinyin: 'Shīfu, qù huǒchē zhàn.',
        translation: 'Driver, to the train station please.',
      },
      {
        speaker: 'B (Driver)',
        text: '好的。走哪条路？',
        pinyin: 'Hǎode. Zǒu nǎ tiáo lù?',
        translation: 'OK. Which road should I take?',
      },
      {
        speaker: 'A',
        text: '走大路吧，快一点。',
        pinyin: 'Zǒu dàlù ba, kuài yìdiǎn.',
        translation: "Take the main road, it's faster.",
      },
      {
        speaker: 'B',
        text: '现在堵车，走小路可能更快。',
        pinyin: 'Xiànzài dǔchē, zǒu xiǎolù kěnéng gèng kuài.',
        translation: "There's traffic now, side roads might be faster.",
      },
      {
        speaker: 'A',
        text: '那你决定吧。我两点的火车。',
        pinyin: 'Nà nǐ juédìng ba. Wǒ liǎng diǎn de huǒchē.',
        translation: "Then you decide. My train is at 2 o'clock.",
      },
      {
        speaker: 'B',
        text: '没问题，肯定来得及。',
        pinyin: 'Méi wèntí, kěndìng lái de jí.',
        translation: "No problem, you'll definitely make it in time.",
      },
    ],
  },

  // ============================================================
  // Lesson 11 - Class Notes & Dialogues (existing)
  // ============================================================
  {
    id: 'dlg-l11-01',
    title: 'At a Restaurant',
    titleChinese: '在餐馆',
    setting: 'A waiter greets a customer at a restaurant.',
    lesson: 11,
    lines: [
      {
        speaker: 'A (Waiter)',
        text: '欢迎光临！请问，您想喝点儿什么？',
        pinyin: 'Huānyíng guānglín! Qǐngwèn, nín xiǎng hē diǎnr shénme?',
        translation: 'Welcome! Excuse me, what would you like to drink?',
      },
      {
        speaker: 'B (Customer)',
        text: '我想喝咖啡。',
        pinyin: 'Wǒ xiǎng hē kāfēi.',
        translation: 'I want to drink coffee.',
      },
      {
        speaker: 'A',
        text: '好的，大杯还是小杯？',
        pinyin: 'Hǎode, dà bēi háishi xiǎo bēi?',
        translation: 'OK, large or small cup?',
      },
      {
        speaker: 'B',
        text: '小杯，谢谢。',
        pinyin: 'Xiǎo bēi, xièxie.',
        translation: 'Small cup, thanks.',
      },
    ],
  },
  {
    id: 'dlg-l11-02',
    title: 'Ordering Food',
    titleChinese: '点菜',
    setting: 'Two friends decide what to eat.',
    lesson: 11,
    lines: [
      {
        speaker: 'A',
        text: '你想吃什么？',
        pinyin: 'Nǐ xiǎng chī shénme?',
        translation: 'What do you want to eat?',
      },
      {
        speaker: 'B',
        text: '我想吃饺子。你呢？',
        pinyin: 'Wǒ xiǎng chī jiǎozi. Nǐ ne?',
        translation: 'I want to eat dumplings. How about you?',
      },
      {
        speaker: 'A',
        text: '我不想吃饺子，我想吃面条。',
        pinyin: 'Wǒ bù xiǎng chī jiǎozi, wǒ xiǎng chī miàntiáo.',
        translation: "I don't want dumplings, I want noodles.",
      },
      {
        speaker: 'B',
        text: '那我们点一份饺子，一份面条。',
        pinyin: 'Nà wǒmen diǎn yī fèn jiǎozi, yī fèn miàntiáo.',
        translation: "Then let's order one serving of dumplings and one of noodles.",
      },
      { speaker: 'A', text: '好主意！', pinyin: 'Hǎo zhǔyì!', translation: 'Good idea!' },
    ],
  },
  {
    id: 'dlg-l11-03',
    title: 'Deciding What to Eat',
    titleChinese: '决定吃什么',
    setting: 'Two people decide where and what to eat.',
    lesson: 11,
    lines: [
      {
        speaker: 'A',
        text: '今天吃什么？米饭还是面条？',
        pinyin: 'Jīntiān chī shénme? Mǐfàn háishi miàntiáo?',
        translation: 'What shall we eat today? Rice or noodles?',
      },
      {
        speaker: 'B',
        text: '我不想吃米饭。',
        pinyin: 'Wǒ bù xiǎng chī mǐfàn.',
        translation: "I don't want rice.",
      },
      {
        speaker: 'A',
        text: '那我们吃面条吧。',
        pinyin: 'Nà wǒmen chī miàntiáo ba.',
        translation: "Then let's eat noodles.",
      },
      {
        speaker: 'B',
        text: '好的，怎么样？去那个饭馆？',
        pinyin: 'Hǎode, zěnmeyàng? Qù nà ge fànguǎn?',
        translation: 'OK, what do you think? Go to that restaurant?',
      },
      {
        speaker: 'A',
        text: '那个饭馆很好，咱们去吧！',
        pinyin: 'Nà ge fànguǎn hěn hǎo, zánmen qù ba!',
        translation: "That restaurant is great, let's go!",
      },
    ],
  },
  {
    id: 'dlg-l11-04',
    title: 'Paying the Bill',
    titleChinese: '付钱',
    setting: 'A customer pays the bill at a restaurant.',
    lesson: 11,
    lines: [
      {
        speaker: 'A (Customer)',
        text: '一共多少钱？',
        pinyin: 'Yígòng duōshao qián?',
        translation: 'How much in total?',
      },
      {
        speaker: 'B (Waiter)',
        text: '一共45块。',
        pinyin: 'Yígòng sìshíwǔ kuài.',
        translation: '45 yuan in total.',
      },
      {
        speaker: 'A',
        text: '你们可以刷卡吗？',
        pinyin: 'Nǐmen kěyǐ shuākǎ ma?',
        translation: 'Can I pay by card?',
      },
      {
        speaker: 'B',
        text: '可以。现金还是刷卡？',
        pinyin: 'Kěyǐ. Xiànjīn háishi shuākǎ?',
        translation: 'Yes. Cash or card?',
      },
      { speaker: 'A', text: '刷卡。', pinyin: 'Shuākǎ.', translation: 'Card.' },
      {
        speaker: 'B',
        text: '好的，谢谢光临！',
        pinyin: 'Hǎode, xièxie guānglín!',
        translation: 'OK, thank you for coming!',
      },
    ],
  },
  {
    id: 'dlg-l11-05',
    title: 'At a Cafe',
    titleChinese: '在咖啡馆',
    setting: 'A customer orders tea at a cafe with a special price.',
    lesson: 11,
    lines: [
      {
        speaker: 'A (Waiter)',
        text: '请问，您想喝点儿什么？',
        pinyin: 'Qǐngwèn, nín xiǎng hē diǎnr shénme?',
        translation: 'What would you like to drink?',
      },
      {
        speaker: 'B (Customer)',
        text: '你们有什么茶？',
        pinyin: 'Nǐmen yǒu shénme chá?',
        translation: 'What teas do you have?',
      },
      {
        speaker: 'A',
        text: '我们有红茶和绿茶。',
        pinyin: 'Wǒmen yǒu hóngchá hé lǜchá.',
        translation: 'We have black tea and green tea.',
      },
      {
        speaker: 'B',
        text: '红茶多少钱？',
        pinyin: 'Hóngchá duōshao qián?',
        translation: 'How much is the black tea?',
      },
      {
        speaker: 'A',
        text: '红茶15块，今天特价12块。',
        pinyin: "Hóngchá shíwǔ kuài, jīntiān tèjià shí'èr kuài.",
        translation: 'Black tea is 15 yuan, today special price 12 yuan.',
      },
      {
        speaker: 'B',
        text: '真便宜！那我要一杯红茶。',
        pinyin: 'Zhēn piányi! Nà wǒ yào yī bēi hóngchá.',
        translation: "Really cheap! Then I'll have a cup of black tea.",
      },
      {
        speaker: 'A',
        text: '好的，请稍等。',
        pinyin: 'Hǎode, qǐng shāo děng.',
        translation: 'OK, please wait a moment.',
      },
    ],
  },
  {
    id: 'dlg-l11-06',
    title: 'Weekend Plans',
    titleChinese: '周末计划',
    setting: 'Two friends discuss weekend plans.',
    lesson: 11,
    lines: [
      {
        speaker: 'A',
        text: '周末你想做什么？',
        pinyin: 'Zhōumò nǐ xiǎng zuò shénme?',
        translation: 'What do you want to do this weekend?',
      },
      {
        speaker: 'B',
        text: '我想去超市买衣服。你呢？',
        pinyin: 'Wǒ xiǎng qù chāoshì mǎi yīfu. Nǐ ne?',
        translation: 'I want to go to the supermarket to buy clothes. You?',
      },
      {
        speaker: 'A',
        text: '我想去游泳。',
        pinyin: 'Wǒ xiǎng qù yóuyǒng.',
        translation: 'I want to go swimming.',
      },
      {
        speaker: 'B',
        text: '那下午我们一起去超市，怎么样？',
        pinyin: 'Nà xiàwǔ wǒmen yīqǐ qù chāoshì, zěnmeyàng?',
        translation: 'Then in the afternoon we go to the supermarket together, how about it?',
      },
      { speaker: 'A', text: '好主意！', pinyin: 'Hǎo zhǔyì!', translation: 'Good idea!' },
    ],
  },

  // ============================================================
  // Lesson 12 - Ordering Food & Drinks (existing)
  // ============================================================
  {
    id: 'dlg-notes-08',
    title: 'Buying Watermelon',
    titleChinese: '买西瓜',
    setting: 'A customer bargains and buys watermelon at a market stall.',
    lesson: 12,
    lines: [
      {
        speaker: 'A (Seller)',
        text: '西瓜是3块9毛9一斤。',
        pinyin: 'Xīguā shì sān kuài jiǔ máo jiǔ yì jīn.',
        translation: 'Watermelon is 3.99 yuan per jin.',
      },
      {
        speaker: 'A',
        text: '你买一个还是半个？',
        pinyin: 'Nǐ mǎi yí ge háishi bàn ge?',
        translation: 'Do you want a whole one or half?',
      },
      {
        speaker: 'B (Customer)',
        text: '我要一个西瓜。',
        pinyin: 'Wǒ yào yí ge xīguā.',
        translation: 'I want one watermelon.',
      },
      {
        speaker: 'A',
        text: '好的，这个西瓜8斤，一共31块吧。',
        pinyin: 'Hǎode, zhè ge xīguā bā jīn, yígòng sānshíyī kuài ba.',
        translation: "OK, this watermelon is 8 jin, let's say 31 yuan total.",
      },
      {
        speaker: 'B',
        text: '我给你32块。',
        pinyin: "Wǒ gěi nǐ sānshí'èr kuài.",
        translation: "I'll give you 32 yuan.",
      },
      {
        speaker: 'A',
        text: '找您一块。谢谢！',
        pinyin: 'Zhǎo nín yí kuài. Xièxie!',
        translation: "Here's 1 yuan change. Thanks!",
      },
      { speaker: 'B', text: '不客气。', pinyin: 'Bú kèqi.', translation: "You're welcome." },
    ],
  },
  {
    id: 'dlg-notes-09',
    title: 'At the Egg Cake Stand',
    titleChinese: '蛋烘糕',
    setting: 'A customer discovers and orders egg cakes at a Sichuan street food stand.',
    lesson: 12,
    lines: [
      {
        speaker: 'B (Customer)',
        text: '上午好！请问这是什么？',
        pinyin: 'Shàngwǔ hǎo! Qǐngwèn zhè shì shénme?',
        translation: 'Good morning! Excuse me, what is this?',
      },
      {
        speaker: 'A (Seller)',
        text: '这是蛋烘糕。',
        pinyin: 'Zhè shì dàn hōng gāo.',
        translation: 'This is egg cake.',
      },
      {
        speaker: 'B',
        text: '蛋烘糕是什么？',
        pinyin: 'Dàn hōng gāo shì shénme?',
        translation: 'What is egg cake?',
      },
      {
        speaker: 'A',
        text: '它有鸡蛋、糖、牛奶和馅儿，很好吃。',
        pinyin: 'Tā yǒu jīdàn, táng, niúnǎi hé xiànr, hěn hǎochī.',
        translation: 'It has eggs, sugar, milk and fillings. Very delicious.',
      },
      {
        speaker: 'B',
        text: '你有什么馅儿？',
        pinyin: 'Nǐ yǒu shénme xiànr?',
        translation: 'What fillings do you have?',
      },
      {
        speaker: 'A',
        text: '有花生、豆沙、肉松。',
        pinyin: 'Yǒu huāshēng, dòushā, ròusōng.',
        translation: 'We have peanut, red bean paste, meat floss.',
      },
      {
        speaker: 'B',
        text: '我要一个肉松和一个豆沙。多少钱？',
        pinyin: 'Wǒ yào yí ge ròusōng hé yí ge dòushā. Duōshao qián?',
        translation: 'I want one meat floss and one red bean. How much?',
      },
      {
        speaker: 'A',
        text: '肉松4块钱一个，豆沙3块钱一个，一共7块钱。',
        pinyin: 'Ròusōng sì kuài qián yí ge, dòushā sān kuài qián yí ge, yígòng qī kuài qián.',
        translation: 'Meat floss is 4 yuan each, red bean is 3 yuan each, total 7 yuan.',
      },
      {
        speaker: 'B',
        text: '我给你10块，谢谢。',
        pinyin: 'Wǒ gěi nǐ shí kuài, xièxie.',
        translation: "I'll give you 10 yuan, thanks.",
      },
      {
        speaker: 'A',
        text: '你能扫码吗？我没有零钱。',
        pinyin: 'Nǐ néng sǎomǎ ma? Wǒ méiyǒu língqián.',
        translation: "Can you scan? I don't have change.",
      },
      {
        speaker: 'B',
        text: '好的。支付宝还是微信？',
        pinyin: 'Hǎode. Zhīfùbǎo háishi Wēixìn?',
        translation: 'OK. Alipay or WeChat?',
      },
      { speaker: 'A', text: '都可以。', pinyin: 'Dōu kěyǐ.', translation: 'Both are fine.' },
      {
        speaker: 'A',
        text: '蛋烘糕好了，请慢用。',
        pinyin: 'Dàn hōng gāo hǎo le, qǐng màn yòng.',
        translation: 'The egg cake is ready, please enjoy.',
      },
    ],
  },

  // ============================================================
  // Lesson 13 - Question Words & Patterns
  // ============================================================
  {
    id: 'dlg-l13-01',
    title: 'Meeting Someone New',
    titleChinese: '认识新朋友',
    setting: 'Two people meet for the first time and ask questions to get to know each other.',
    lesson: 13,
    lines: [
      {
        speaker: 'A',
        text: '你好！你叫什么名字？',
        pinyin: 'Nǐ hǎo! Nǐ jiào shénme míngzi?',
        translation: 'Hello! What is your name?',
      },
      {
        speaker: 'B',
        text: '我叫王丽。你是哪国人？',
        pinyin: 'Wǒ jiào Wáng Lì. Nǐ shì nǎ guó rén?',
        translation: 'My name is Wang Li. Where are you from?',
      },
      {
        speaker: 'A',
        text: '我是美国人。你在哪儿工作？',
        pinyin: 'Wǒ shì Měiguó rén. Nǐ zài nǎr gōngzuò?',
        translation: "I'm American. Where do you work?",
      },
      {
        speaker: 'B',
        text: '我在大学工作。你呢？你做什么工作？',
        pinyin: 'Wǒ zài dàxué gōngzuò. Nǐ ne? Nǐ zuò shénme gōngzuò?',
        translation: 'I work at a university. You? What do you do?',
      },
      {
        speaker: 'A',
        text: '我是学生。你为什么学英语？',
        pinyin: 'Wǒ shì xuésheng. Nǐ wèishénme xué Yīngyǔ?',
        translation: "I'm a student. Why are you learning English?",
      },
      {
        speaker: 'B',
        text: '因为我想去美国旅游！',
        pinyin: 'Yīnwèi wǒ xiǎng qù Měiguó lǚyóu!',
        translation: 'Because I want to travel to America!',
      },
    ],
  },
  {
    id: 'dlg-l13-02',
    title: 'At the Lost and Found',
    titleChinese: '在失物招领处',
    setting: 'Someone goes to the lost and found office to look for a lost item.',
    lesson: 13,
    lines: [
      {
        speaker: 'A (Staff)',
        text: '你好，请问你找什么？',
        pinyin: 'Nǐ hǎo, qǐngwèn nǐ zhǎo shénme?',
        translation: 'Hello, what are you looking for?',
      },
      {
        speaker: 'B',
        text: '我的包丢了。',
        pinyin: 'Wǒ de bāo diū le.',
        translation: 'I lost my bag.',
      },
      {
        speaker: 'A',
        text: '你的包是什么颜色的？',
        pinyin: 'Nǐ de bāo shì shénme yánsè de?',
        translation: 'What color is your bag?',
      },
      {
        speaker: 'B',
        text: '黑色的。里面有我的钱包和手机。',
        pinyin: 'Hēisè de. Lǐmiàn yǒu wǒ de qiánbāo hé shǒujī.',
        translation: 'Black. Inside there is my wallet and phone.',
      },
      {
        speaker: 'A',
        text: '你是在哪儿丢的？什么时候丢的？',
        pinyin: 'Nǐ shì zài nǎr diū de? Shénme shíhou diū de?',
        translation: 'Where did you lose it? When did you lose it?',
      },
      {
        speaker: 'B',
        text: '今天上午在地铁上丢的。',
        pinyin: 'Jīntiān shàngwǔ zài dìtiě shang diū de.',
        translation: 'I lost it on the subway this morning.',
      },
      {
        speaker: 'A',
        text: '是这个吗？有人捡到一个黑色的包。',
        pinyin: 'Shì zhè ge ma? Yǒu rén jiǎndào yí ge hēisè de bāo.',
        translation: 'Is this it? Someone found a black bag.',
      },
      {
        speaker: 'B',
        text: '是的！太感谢了！是谁捡到的？',
        pinyin: 'Shì de! Tài gǎnxiè le! Shì shéi jiǎndào de?',
        translation: 'Yes! Thank you so much! Who found it?',
      },
    ],
  },
  {
    id: 'dlg-l13-03',
    title: 'Planning a Trip',
    titleChinese: '计划旅行',
    setting: 'Friends discuss where and how to travel.',
    lesson: 13,
    lines: [
      {
        speaker: 'A',
        text: '暑假你想去哪儿玩？',
        pinyin: 'Shǔjià nǐ xiǎng qù nǎr wán?',
        translation: 'Where do you want to go for summer vacation?',
      },
      {
        speaker: 'B',
        text: '我想去成都。你知道怎么去吗？',
        pinyin: 'Wǒ xiǎng qù Chéngdū. Nǐ zhīdào zěnme qù ma?',
        translation: 'I want to go to Chengdu. Do you know how to get there?',
      },
      {
        speaker: 'A',
        text: '可以坐飞机或者坐火车。你想坐哪个？',
        pinyin: 'Kěyǐ zuò fēijī huòzhě zuò huǒchē. Nǐ xiǎng zuò nǎ ge?',
        translation: 'You can fly or take a train. Which would you like?',
      },
      {
        speaker: 'B',
        text: '机票多少钱？',
        pinyin: 'Jīpiào duōshao qián?',
        translation: 'How much is a plane ticket?',
      },
      {
        speaker: 'A',
        text: '大概800块。火车便宜，但是要几个小时。',
        pinyin: 'Dàgài bābǎi kuài. Huǒchē piányi, dànshì yào jǐ ge xiǎoshí.',
        translation: 'About 800 yuan. The train is cheaper, but takes several hours.',
      },
      {
        speaker: 'B',
        text: '我们为什么不坐高铁呢？又快又便宜。',
        pinyin: 'Wǒmen wèishénme bú zuò gāotiě ne? Yòu kuài yòu piányi.',
        translation: "Why don't we take the high-speed rail? It's both fast and cheap.",
      },
      {
        speaker: 'A',
        text: '好主意！那我们什么时候出发？',
        pinyin: 'Hǎo zhǔyì! Nà wǒmen shénme shíhou chūfā?',
        translation: 'Good idea! Then when do we leave?',
      },
    ],
  },
  {
    id: 'dlg-l13-04',
    title: 'Asking About a Class',
    titleChinese: '问课程',
    setting: 'A new student asks questions about a Chinese class.',
    lesson: 13,
    lines: [
      {
        speaker: 'A',
        text: '请问，中文课每周上几次？',
        pinyin: 'Qǐngwèn, Zhōngwén kè měi zhōu shàng jǐ cì?',
        translation: 'Excuse me, how many times per week is Chinese class?',
      },
      {
        speaker: 'B',
        text: '每周三次，周一、周三和周五。',
        pinyin: 'Měi zhōu sān cì, zhōuyī, zhōusān hé zhōuwǔ.',
        translation: 'Three times a week, Monday, Wednesday, and Friday.',
      },
      {
        speaker: 'A',
        text: '老师是谁？',
        pinyin: 'Lǎoshī shì shéi?',
        translation: 'Who is the teacher?',
      },
      {
        speaker: 'B',
        text: '张老师。她教得很好。',
        pinyin: 'Zhāng lǎoshī. Tā jiāo de hěn hǎo.',
        translation: 'Teacher Zhang. She teaches very well.',
      },
      {
        speaker: 'A',
        text: '教室在哪儿？',
        pinyin: 'Jiàoshì zài nǎr?',
        translation: 'Where is the classroom?',
      },
      {
        speaker: 'B',
        text: '在三楼305教室。',
        pinyin: 'Zài sān lóu sān líng wǔ jiàoshì.',
        translation: 'Room 305 on the third floor.',
      },
      {
        speaker: 'A',
        text: '我怎么报名？',
        pinyin: 'Wǒ zěnme bàomíng?',
        translation: 'How do I sign up?',
      },
      {
        speaker: 'B',
        text: '你去一楼的办公室问问就行了。',
        pinyin: 'Nǐ qù yī lóu de bàngōngshì wènwen jiù xíng le.',
        translation: 'Just go ask at the office on the first floor.',
      },
    ],
  },
  // Lesson 17 — China Travel Plan (monologue)
  {
    id: 'dlg-l17-01',
    title: 'Our China Travel Plan — Hong Kong',
    titleChinese: '我们的中国旅行计划——香港',
    setting: 'Narrating the first stop of a China trip.',
    lesson: 17,
    lines: [
      {
        speaker: 'Narrator',
        text: '4月24号我们将飞往香港。',
        pinyin: 'Sì yuè èrshísì hào wǒmen jiāng fēi wǎng Xiānggǎng.',
        translation: 'On April 24th we will fly to Hong Kong.',
      },
      {
        speaker: 'Narrator',
        text: '坐飞机要10个小时。',
        pinyin: 'Zuò fēijī yào shí ge xiǎoshí.',
        translation: 'It takes 10 hours by plane.',
      },
      {
        speaker: 'Narrator',
        text: '我们将停留三天。',
        pinyin: 'Wǒmen jiāng tíngliú sān tiān.',
        translation: 'We will stay three days.',
      },
      {
        speaker: 'Narrator',
        text: '在香港，我们想去维多利亚港。',
        pinyin: 'Zài Xiānggǎng, wǒmen xiǎng qù Wéiduōlìyà gǎng.',
        translation: 'In Hong Kong we want to go to Victoria Harbour.',
      },
    ],
  },
  {
    id: 'dlg-l17-02',
    title: 'Our China Travel Plan — Macau',
    titleChinese: '我们的中国旅行计划——澳门',
    setting: 'Narrating the Macau leg of the trip.',
    lesson: 17,
    lines: [
      {
        speaker: 'Narrator',
        text: '星期二我们要去澳门。',
        pinyin: 'Xīngqí èr wǒmen yào qù Àomén.',
        translation: 'On Tuesday we are going to Macau.',
      },
      {
        speaker: 'Narrator',
        text: '在澳门我们想赢很多钱。',
        pinyin: 'Zài Àomén wǒmen xiǎng yíng hěnduō qián.',
        translation: 'In Macau we want to win a lot of money.',
      },
      {
        speaker: 'Narrator',
        text: '试试博彩。',
        pinyin: 'Shìshi bócǎi.',
        translation: 'Try gambling.',
      },
      {
        speaker: 'Narrator',
        text: '我们知道庄家会一直赢。',
        pinyin: 'Wǒmen zhīdào zhuāngjia huì yīzhí yíng.',
        translation: 'We know the house always wins.',
      },
    ],
  },
  {
    id: 'dlg-l17-03',
    title: 'Our China Travel Plan — Chengdu',
    titleChinese: '我们的中国旅行计划——成都',
    setting: 'Narrating the Chengdu leg of the trip.',
    lesson: 17,
    lines: [
      {
        speaker: 'Narrator',
        text: '星期三，我们要去成都。',
        pinyin: 'Xīngqí sān, wǒmen yào qù Chéngdū.',
        translation: 'On Wednesday we are going to Chengdu.',
      },
      {
        speaker: 'Narrator',
        text: '在成都，我们要去看熊猫。',
        pinyin: 'Zài Chéngdū, wǒmen yào qù kàn xióngmāo.',
        translation: 'In Chengdu we are going to see pandas.',
      },
      {
        speaker: 'Narrator',
        text: '还要试试掏耳朵。',
        pinyin: 'Hái yào shìshi tāo ěrduǒ.',
        translation: 'Also want to try ear cleaning.',
      },
    ],
  },
  {
    id: 'dlg-l17-04',
    title: 'Our China Travel Plan — Chongqing',
    titleChinese: '我们的中国旅行计划——重庆',
    setting: 'Narrating the Chongqing leg of the trip.',
    lesson: 17,
    lines: [
      {
        speaker: 'Narrator',
        text: '星期六我们要去重庆。',
        pinyin: 'Xīngqí liù wǒmen yào qù Chóngqìng.',
        translation: 'On Saturday we are going to Chongqing.',
      },
      {
        speaker: 'Narrator',
        text: '在重庆，我们将探索这个城市。',
        pinyin: 'Zài Chóngqìng, wǒmen jiāng tànsuǒ zhège chéngshì.',
        translation: 'In Chongqing we will explore this city.',
      },
      {
        speaker: 'Narrator',
        text: '尝试重庆的辛辣美食。',
        pinyin: 'Chángshì Chóngqìng de xīnlà měishí.',
        translation: "Try Chongqing's spicy food.",
      },
      {
        speaker: 'Narrator',
        text: '你想尝尝这个吗？',
        pinyin: 'Nǐ xiǎng chángcháng zhège ma?',
        translation: 'Do you want to try this?',
      },
    ],
  },
  {
    id: 'dlg-l17-05',
    title: 'Our China Travel Plan — Beijing',
    titleChinese: '我们的中国旅行计划——北京',
    setting: 'Narrating the final stop in Beijing.',
    lesson: 17,
    lines: [
      {
        speaker: 'Narrator',
        text: '5月5号我们将飞往北京。',
        pinyin: 'Wǔ yuè wǔ hào wǒmen jiāng fēi wǎng Běijīng.',
        translation: 'On May 5th we will fly to Beijing.',
      },
      {
        speaker: 'Narrator',
        text: '在北京，我们计划游览长城、故宫。',
        pinyin: 'Zài Běijīng, wǒmen jìhuà yóulǎn Chángchéng, Gùgōng.',
        translation: 'In Beijing we plan to tour the Great Wall and the Forbidden City.',
      },
      {
        speaker: 'Narrator',
        text: '还要吃北京烤鸭。',
        pinyin: 'Hái yào chī Běijīng kǎoyā.',
        translation: 'Also want to eat Peking Duck.',
      },
      {
        speaker: 'Narrator',
        text: '你们在北京待几天？',
        pinyin: 'Nǐmen zài Běijīng dāi jǐ tiān?',
        translation: 'How many days are you staying in Beijing?',
      },
      {
        speaker: 'Narrator',
        text: '不幸的是，中间有劳动节假期。',
        pinyin: 'Bùxìng de shì, zhōngjiān yǒu Láodòng jié jiàqī.',
        translation: 'Unfortunately, Labour Day holiday falls in between.',
      },
      {
        speaker: 'Narrator',
        text: '人一定很多。',
        pinyin: 'Rén yīdìng hěn duō.',
        translation: 'There will definitely be a lot of people.',
      },
    ],
  },
  {
    id: 'dlg-l17-06',
    title: 'Our China Travel Plan — Full',
    titleChinese: '我们的中国旅行计划',
    setting: 'The complete travel plan narrated from start to finish.',
    lesson: 17,
    lines: [
      {
        speaker: 'Narrator',
        text: '4月24号我们将飞往香港。',
        pinyin: 'Sì yuè èrshísì hào wǒmen jiāng fēi wǎng Xiānggǎng.',
        translation: 'On April 24th we will fly to Hong Kong.',
      },
      {
        speaker: 'Narrator',
        text: '坐飞机要10个小时。',
        pinyin: 'Zuò fēijī yào shí ge xiǎoshí.',
        translation: 'It takes 10 hours by plane.',
      },
      {
        speaker: 'Narrator',
        text: '我们将停留三天。',
        pinyin: 'Wǒmen jiāng tíngliú sān tiān.',
        translation: 'We will stay three days.',
      },
      {
        speaker: 'Narrator',
        text: '在香港，我们想去维多利亚港。',
        pinyin: 'Zài Xiānggǎng, wǒmen xiǎng qù Wéiduōlìyà gǎng.',
        translation: 'In Hong Kong we want to go to Victoria Harbour.',
      },
      {
        speaker: 'Narrator',
        text: '星期二我们要去澳门。',
        pinyin: 'Xīngqí èr wǒmen yào qù Àomén.',
        translation: 'On Tuesday we are going to Macau.',
      },
      {
        speaker: 'Narrator',
        text: '在澳门我们想赢很多钱。',
        pinyin: 'Zài Àomén wǒmen xiǎng yíng hěnduō qián.',
        translation: 'In Macau we want to win a lot of money.',
      },
      {
        speaker: 'Narrator',
        text: '我们知道庄家会一直赢。',
        pinyin: 'Wǒmen zhīdào zhuāngjia huì yīzhí yíng.',
        translation: 'We know the house always wins.',
      },
      {
        speaker: 'Narrator',
        text: '星期三，我们要去成都。',
        pinyin: 'Xīngqí sān, wǒmen yào qù Chéngdū.',
        translation: 'On Wednesday we are going to Chengdu.',
      },
      {
        speaker: 'Narrator',
        text: '在成都，我们要去看熊猫。',
        pinyin: 'Zài Chéngdū, wǒmen yào qù kàn xióngmāo.',
        translation: 'In Chengdu we are going to see pandas.',
      },
      {
        speaker: 'Narrator',
        text: '还要试试掏耳朵。',
        pinyin: 'Hái yào shìshi tāo ěrduǒ.',
        translation: 'Also want to try ear cleaning.',
      },
      {
        speaker: 'Narrator',
        text: '星期六我们要去重庆。',
        pinyin: 'Xīngqí liù wǒmen yào qù Chóngqìng.',
        translation: 'On Saturday we are going to Chongqing.',
      },
      {
        speaker: 'Narrator',
        text: '在重庆，我们将探索这个城市。',
        pinyin: 'Zài Chóngqìng, wǒmen jiāng tànsuǒ zhège chéngshì.',
        translation: 'In Chongqing we will explore this city.',
      },
      {
        speaker: 'Narrator',
        text: '尝试重庆的辛辣美食。',
        pinyin: 'Chángshì Chóngqìng de xīnlà měishí.',
        translation: "Try Chongqing's spicy food.",
      },
      {
        speaker: 'Narrator',
        text: '5月5号我们将飞往北京。',
        pinyin: 'Wǔ yuè wǔ hào wǒmen jiāng fēi wǎng Běijīng.',
        translation: 'On May 5th we will fly to Beijing.',
      },
      {
        speaker: 'Narrator',
        text: '在北京，我们计划游览长城、故宫。',
        pinyin: 'Zài Běijīng, wǒmen jìhuà yóulǎn Chángchéng, Gùgōng.',
        translation: 'In Beijing we plan to tour the Great Wall and the Forbidden City.',
      },
      {
        speaker: 'Narrator',
        text: '还要吃北京烤鸭。',
        pinyin: 'Hái yào chī Běijīng kǎoyā.',
        translation: 'Also want to eat Peking Duck.',
      },
      {
        speaker: 'Narrator',
        text: '不幸的是，中间有劳动节假期。',
        pinyin: 'Bùxìng de shì, zhōngjiān yǒu Láodòng jié jiàqī.',
        translation: 'Unfortunately, Labour Day holiday falls in between.',
      },
      {
        speaker: 'Narrator',
        text: '人一定很多。',
        pinyin: 'Rén yīdìng hěn duō.',
        translation: 'There will definitely be a lot of people.',
      },
    ],
  },

  // ============================================================
  // Lesson 18 - April Notes (四月课堂笔记)
  // ============================================================
  {
    id: 'dlg-l18-01',
    title: 'This and That',
    titleChinese: '这和那',
    setting: 'A teacher asks students to identify objects in the classroom.',
    lesson: 18,
    lines: [
      { speaker: 'A', text: '这是什么？', pinyin: 'Zhè shì shénme?', translation: 'What is this?' },
      {
        speaker: 'B',
        text: '这是一本书。',
        pinyin: 'Zhè shì yì běn shū.',
        translation: 'This is a book.',
      },
      {
        speaker: 'A',
        text: '那个呢？那里是什么？',
        pinyin: 'Nà ge ne? Nàlǐ shì shénme?',
        translation: 'What about that? What is over there?',
      },
      {
        speaker: 'B',
        text: '那里是教室。',
        pinyin: 'Nàlǐ shì jiàoshì.',
        translation: 'Over there is the classroom.',
      },
      {
        speaker: 'A',
        text: '这些都是你的吗？',
        pinyin: 'Zhè xiē dōu shì nǐ de ma?',
        translation: 'Are these all yours?',
      },
      {
        speaker: 'B',
        text: '这些是我的，那些是他的。',
        pinyin: 'Zhè xiē shì wǒ de, nà xiē shì tā de.',
        translation: 'These are mine, those are his.',
      },
    ],
  },
  {
    id: 'dlg-l18-02',
    title: "Don't Do That!",
    titleChinese: '别那样做！',
    setting: 'A parent gives advice to their child before a trip.',
    lesson: 18,
    lines: [
      {
        speaker: 'A',
        text: '外面很冷，别感冒。',
        pinyin: 'Wàimiàn hěn lěng, bié gǎnmào.',
        translation: "It's cold outside, don't catch a cold.",
      },
      {
        speaker: 'B',
        text: '好的，我知道了。',
        pinyin: 'Hǎo de, wǒ zhīdào le.',
        translation: 'OK, I know.',
      },
      {
        speaker: 'A',
        text: '别害怕，别放弃。',
        pinyin: 'Bié hàipà, bié fàngqì.',
        translation: "Don't be afraid, don't give up.",
      },
      { speaker: 'B', text: '我不害怕！', pinyin: 'Wǒ bú hàipà!', translation: "I'm not afraid!" },
      {
        speaker: 'A',
        text: '还有，别说谎。',
        pinyin: 'Hái yǒu, bié shuō huǎng.',
        translation: "Also, don't lie.",
      },
      {
        speaker: 'B',
        text: '我不会说谎的。',
        pinyin: 'Wǒ bú huì shuō huǎng de.',
        translation: "I won't lie.",
      },
    ],
  },
  {
    id: 'dlg-l18-03',
    title: 'Do You Know That Person?',
    titleChinese: '你认识那个人吗？',
    setting: 'Two friends spot someone they might know.',
    lesson: 18,
    lines: [
      {
        speaker: 'A',
        text: '你认识前面那个人吗？',
        pinyin: 'Nǐ rènshi qiánmiàn nà ge rén ma?',
        translation: 'Do you know that person in front?',
      },
      {
        speaker: 'B',
        text: '认识，他是我的老师。',
        pinyin: 'Rènshi, tā shì wǒ de lǎoshī.',
        translation: 'Yes, he is my teacher.',
      },
      {
        speaker: 'A',
        text: '你认识几个汉字？',
        pinyin: 'Nǐ rènshi jǐ ge hànzì?',
        translation: 'How many Chinese characters do you know?',
      },
      {
        speaker: 'B',
        text: '我认识几个汉字。',
        pinyin: 'Wǒ rènshi jǐ ge hànzì.',
        translation: 'I know a few Chinese characters.',
      },
      { speaker: 'A', text: '非常好！', pinyin: 'Fēicháng hǎo!', translation: 'Very good!' },
    ],
  },
  {
    id: 'dlg-l18-04',
    title: 'Walking Directions',
    titleChinese: '走路方向',
    setting: 'Someone asks for directions on the street.',
    lesson: 18,
    lines: [
      {
        speaker: 'A',
        text: '请问，那个高楼怎么走？',
        pinyin: 'Qǐngwèn, nà ge gāo lóu zěnme zǒu?',
        translation: 'Excuse me, how do I get to that tall building?',
      },
      {
        speaker: 'B',
        text: '往前走走。',
        pinyin: 'Wǎng qián zǒuzǒu.',
        translation: 'Walk forward a bit.',
      },
      { speaker: 'A', text: '走几步？', pinyin: 'Zǒu jǐ bù?', translation: 'How many steps?' },
      {
        speaker: 'B',
        text: '往前走了几步，然后往左走3米。',
        pinyin: 'Wǎng qián zǒu le jǐ bù, ránhòu wǎng zuǒ zǒu sān mǐ.',
        translation: 'Walk a few steps forward, then go 3 metres to the left.',
      },
      {
        speaker: 'A',
        text: '那个高楼有几层？',
        pinyin: 'Nà ge gāo lóu yǒu jǐ céng?',
        translation: 'How many floors does that tall building have?',
      },
      {
        speaker: 'B',
        text: '那个高楼有30层。',
        pinyin: 'Nà ge gāo lóu yǒu sānshí céng.',
        translation: 'That tall building has 30 floors.',
      },
    ],
  },
  {
    id: 'dlg-l18-05',
    title: 'Seeing Pandas',
    titleChinese: '看见熊猫',
    setting: 'Friends talk about their favourite experiences in China.',
    lesson: 18,
    lines: [
      {
        speaker: 'A',
        text: '看见熊猫我们非常高兴。',
        pinyin: 'Kàn jiàn xióngmāo wǒmen fēicháng gāoxìng.',
        translation: 'Seeing the pandas we were extremely happy.',
      },
      {
        speaker: 'B',
        text: '去香港我们非常高兴。',
        pinyin: 'Qù Xiānggǎng wǒmen fēicháng gāoxìng.',
        translation: 'Going to Hong Kong we are extremely happy.',
      },
      {
        speaker: 'A',
        text: '去长城我们非常高兴。',
        pinyin: 'Qù Chángchéng wǒmen fēicháng gāoxìng.',
        translation: 'Going to the Great Wall we are extremely happy.',
      },
      {
        speaker: 'B',
        text: '这个价钱高不高？',
        pinyin: 'Zhège jiàqián gāo bù gāo?',
        translation: 'Is this price high or not?',
      },
      {
        speaker: 'A',
        text: '不高，价钱很低。',
        pinyin: 'Bù gāo, jiàqián hěn dī.',
        translation: 'Not high, the price is very low.',
      },
    ],
  },
  {
    id: 'dlg-l18-06',
    title: 'Describing People',
    titleChinese: '形容人',
    setting: 'Two friends describe classmates.',
    lesson: 18,
    lines: [
      { speaker: 'A', text: '他个子高吗？', pinyin: 'Tā gèzi gāo ma?', translation: 'Is he tall?' },
      {
        speaker: 'B',
        text: '他又高又壮。',
        pinyin: 'Tā yòu gāo yòu zhuàng.',
        translation: 'He is both tall and strong.',
      },
      {
        speaker: 'A',
        text: '他个子多高？',
        pinyin: 'Tā gèzi duō gāo?',
        translation: 'How tall is he?',
      },
      { speaker: 'B', text: '他1米8。', pinyin: 'Tā yī mǐ bā.', translation: 'He is 1.80m.' },
      {
        speaker: 'A',
        text: '那个女孩呢？',
        pinyin: 'Nàge nǚhái ne?',
        translation: 'What about that girl?',
      },
      {
        speaker: 'B',
        text: '她不高也不矮，很瘦。',
        pinyin: 'Tā bù gāo yě bù ǎi, hěn shòu.',
        translation: 'She is neither tall nor short, and very slim.',
      },
      {
        speaker: 'A',
        text: '她的头发很长。',
        pinyin: 'Tā de tóufa hěn cháng.',
        translation: 'Her hair is very long.',
      },
    ],
  },
  {
    id: 'dlg-l18-07',
    title: 'Where Do You Live?',
    titleChinese: '你住哪里？',
    setting: 'Neighbours chat in an apartment building.',
    lesson: 18,
    lines: [
      {
        speaker: 'A',
        text: '你住几层？',
        pinyin: 'Nǐ zhù jǐ céng?',
        translation: 'Which floor do you live on?',
      },
      {
        speaker: 'B',
        text: '我住三层。你呢？',
        pinyin: 'Wǒ zhù sān céng. Nǐ ne?',
        translation: 'I live on the 3rd floor. And you?',
      },
      {
        speaker: 'A',
        text: '我住五层。你的邻居好吗？',
        pinyin: 'Wǒ zhù wǔ céng. Nǐ de línjū hǎo ma?',
        translation: 'I live on the 5th floor. Are your neighbours nice?',
      },
      {
        speaker: 'B',
        text: '很好，他们非常友好。',
        pinyin: 'Hěn hǎo, tāmen fēicháng yǒuhǎo.',
        translation: 'Very nice, they are extremely friendly.',
      },
      {
        speaker: 'A',
        text: '别担心，这里的邻居都很好。',
        pinyin: 'Bié dānxīn, zhèlǐ de línjū dōu hěn hǎo.',
        translation: "Don't worry, the neighbours here are all very nice.",
      },
    ],
  },
  {
    id: 'dlg-l18-08',
    title: 'Did You See It?',
    titleChinese: '你看见了吗？',
    setting: 'Two friends discuss what they saw and heard.',
    lesson: 18,
    lines: [
      {
        speaker: 'A',
        text: '你看见那只小狗了吗？',
        pinyin: 'Nǐ kànjiàn nà zhī xiǎo gǒu le ma?',
        translation: 'Did you see that little dog?',
      },
      {
        speaker: 'B',
        text: '看见了！很可爱。',
        pinyin: "Kànjiàn le! Hěn kě'ài.",
        translation: 'I saw it! Very cute.',
      },
      {
        speaker: 'A',
        text: '你听见了吗？它在叫。',
        pinyin: 'Nǐ tīngjiàn le ma? Tā zài jiào.',
        translation: 'Did you hear it? It is barking.',
      },
      {
        speaker: 'B',
        text: '听见了。小狗往前走了一步。',
        pinyin: 'Tīngjiàn le. Xiǎo gǒu wǎng qián zǒu le yī bù.',
        translation: 'I heard it. The little dog walked one step forward.',
      },
      {
        speaker: 'A',
        text: '我很喜欢小狗。',
        pinyin: 'Wǒ hěn xǐhuan xiǎo gǒu.',
        translation: 'I really like dogs.',
      },
      {
        speaker: 'B',
        text: '我也是！别害怕，它很勇敢。',
        pinyin: 'Wǒ yě shì! Bié hàipà, tā hěn yǒnggǎn.',
        translation: "Me too! Don't be scared, it is very brave.",
      },
    ],
  },
  {
    id: 'dlg-l18-09',
    title: 'Where Are You From?',
    titleChinese: '你是哪里人？',
    setting: 'A new neighbour introduces themselves.',
    lesson: 18,
    lines: [
      {
        speaker: 'A',
        text: '你好！你是哪里人？',
        pinyin: 'Nǐ hǎo! Nǐ shì nǎlǐ rén?',
        translation: 'Hello! Where are you from?',
      },
      {
        speaker: 'B',
        text: '我是英国人，你呢？',
        pinyin: 'Wǒ shì Yīngguó rén, nǐ ne?',
        translation: "I'm British, and you?",
      },
      {
        speaker: 'A',
        text: '我是中国人，我从北京来。',
        pinyin: 'Wǒ shì Zhōngguó rén, wǒ cóng Běijīng lái.',
        translation: "I'm Chinese, I'm from Beijing.",
      },
      {
        speaker: 'B',
        text: '你住这里多久了？',
        pinyin: 'Nǐ zhù zhèlǐ duō jiǔ le?',
        translation: 'How long have you lived here?',
      },
      {
        speaker: 'A',
        text: '我住了两年了，你呢？',
        pinyin: 'Wǒ zhù le liǎng nián le, nǐ ne?',
        translation: "I've lived here two years, and you?",
      },
      {
        speaker: 'B',
        text: '我上周刚搬来！',
        pinyin: 'Wǒ shàng zhōu gāng bān lái!',
        translation: 'I just moved in last week!',
      },
    ],
  },
  {
    id: 'dlg-l18-10',
    title: 'Living Alone or With Family?',
    titleChinese: '一个人住吗？',
    setting: 'Neighbours get to know each other.',
    lesson: 18,
    lines: [
      {
        speaker: 'A',
        text: '你一个人住吗？',
        pinyin: 'Nǐ yī gè rén zhù ma?',
        translation: 'Do you live alone?',
      },
      {
        speaker: 'B',
        text: '不，我和我的家人一起住。你呢？',
        pinyin: 'Bù, wǒ hé wǒ de jiārén yīqǐ zhù. Nǐ ne?',
        translation: 'No, I live with my family. And you?',
      },
      {
        speaker: 'A',
        text: '我一个人住。',
        pinyin: 'Wǒ yī gè rén zhù.',
        translation: 'I live alone.',
      },
      {
        speaker: 'B',
        text: '我可以加你的微信吗？',
        pinyin: 'Wǒ kěyǐ jiā nǐ de Wēixìn ma?',
        translation: 'Can I add you on WeChat?',
      },
      { speaker: 'A', text: '当然可以！', pinyin: 'Dāngrán kěyǐ!', translation: 'Of course!' },
      {
        speaker: 'B',
        text: '有什么需要帮忙的，随时告诉我！',
        pinyin: 'Yǒu shénme xūyào bāngmáng de, suíshí gàosu wǒ!',
        translation: 'If you need anything, just let me know!',
      },
      {
        speaker: 'A',
        text: '谢谢你，你真好！',
        pinyin: 'Xièxiè nǐ, nǐ zhēn hǎo!',
        translation: "Thank you, you're so kind!",
      },
    ],
  },

  // ============================================================
  // Lesson 19 - Body, Food & Grammar (身体、食物和语法)
  // ============================================================
  {
    id: 'dlg-l19-01',
    title: 'Meeting a New Neighbour',
    titleChinese: '认识新邻居',
    setting: 'Two neighbours meet for the first time in an apartment building.',
    lesson: 19,
    lines: [
      {
        speaker: 'A',
        text: '你好，我是你的新邻居。',
        pinyin: 'Nǐ hǎo, wǒ shì nǐ de xīn línjū.',
        translation: "Hi, I'm your new neighbour.",
      },
      {
        speaker: 'B',
        text: '你好！你住几层？',
        pinyin: 'Nǐ hǎo! Nǐ zhù jǐ céng?',
        translation: 'Hello! What floor do you live on?',
      },
      {
        speaker: 'A',
        text: '我住3层304，你呢？',
        pinyin: 'Wǒ zhù sān céng sān líng sì, nǐ ne?',
        translation: 'I live on floor 3, apt 304. And you?',
      },
      {
        speaker: 'B',
        text: '我住4层406。你是哪国人？',
        pinyin: 'Wǒ zhù sì céng sì líng liù. Nǐ shì nǎ guó rén?',
        translation: 'I live on floor 4, apt 406. What nationality are you?',
      },
      {
        speaker: 'A',
        text: '我是意大利人。你呢？',
        pinyin: 'Wǒ shì Yìdàlì rén. Nǐ ne?',
        translation: "I'm Italian. And you?",
      },
      {
        speaker: 'B',
        text: '我是中国人。你是学生吗？',
        pinyin: 'Wǒ shì Zhōngguó rén. Nǐ shì xuésheng ma?',
        translation: "I'm Chinese. Are you a student?",
      },
      {
        speaker: 'A',
        text: '不是，我是医生。',
        pinyin: 'Bú shì, wǒ shì yīshēng.',
        translation: "No, I'm a doctor.",
      },
      {
        speaker: 'B',
        text: '你在这里住了多久？',
        pinyin: 'Nǐ zài zhèlǐ zhù le duō jiǔ?',
        translation: 'How long have you lived here?',
      },
      {
        speaker: 'A',
        text: '我上个月刚搬来。这里有什么好玩的吗？',
        pinyin: 'Wǒ shàng gè yuè gāng bān lái. Zhèlǐ yǒu shénme hǎowán de ma?',
        translation: 'I just moved here last month. Is there anything fun around here?',
      },
      {
        speaker: 'B',
        text: '这里有一家很大的电影院，住户有折扣！',
        pinyin: 'Zhèlǐ yǒu yī jiā hěn dà de diànyǐngyuàn, zhùhù yǒu zhékòu!',
        translation: 'There is a big cinema here, residents get a discount!',
      },
      {
        speaker: 'A',
        text: '太好了，我明天去看看！',
        pinyin: 'Tài hǎo le, wǒ míngtiān qù kànkan!',
        translation: "Great, I'll go check it out tomorrow!",
      },
    ],
  },
  {
    id: 'dlg-l19-02',
    title: "What's for Dinner?",
    titleChinese: '晚饭吃什么？',
    setting: 'Two friends discuss what to eat for dinner.',
    lesson: 19,
    lines: [
      {
        speaker: 'A',
        text: '我在想晚饭吃什么。',
        pinyin: 'Wǒ zài xiǎng wǎnfàn chī shénme.',
        translation: "I'm thinking about what to eat for dinner.",
      },
      {
        speaker: 'B',
        text: '有面条、面包，还有蔬菜。',
        pinyin: 'Yǒu miàntiáo, miànbāo, hái yǒu shūcài.',
        translation: 'There are noodles, bread, and vegetables.',
      },
      {
        speaker: 'A',
        text: '但是我想吃肉。',
        pinyin: 'Dànshì wǒ xiǎng chī ròu.',
        translation: 'But I want meat.',
      },
      {
        speaker: 'B',
        text: '你最喜欢吃什么肉？',
        pinyin: 'Nǐ zuì xǐhuan chī shénme ròu?',
        translation: 'What meat do you like most?',
      },
      {
        speaker: 'A',
        text: '我喜欢吃牛肉。牛肉面很好吃！',
        pinyin: 'Wǒ xǐhuan chī niúròu. Niúròu miàn hěn hǎochī!',
        translation: 'I like beef. Beef noodles are delicious!',
      },
      {
        speaker: 'B',
        text: '晚上吃意大利面怎么样？',
        pinyin: 'Wǎnshàng chī yìdàlì miàn zěnmeyàng?',
        translation: 'How about eating pasta tonight?',
      },
      {
        speaker: 'A',
        text: '好啊！你想不想吃饺子？',
        pinyin: 'Hǎo a! Nǐ xiǎng bù xiǎng chī jiǎozi?',
        translation: 'Sure! Do you want to eat dumplings?',
      },
      {
        speaker: 'B',
        text: '想！饺子里面是猪肉还是鸡肉？',
        pinyin: 'Xiǎng! Jiǎozi lǐmiàn shì zhūròu háishi jīròu?',
        translation: 'Yes! Are the dumplings pork or chicken?',
      },
      { speaker: 'A', text: '猪肉的。', pinyin: 'Zhūròu de.', translation: 'Pork ones.' },
    ],
  },
  {
    id: 'dlg-l19-03',
    title: 'Weekend Plans',
    titleChinese: '周末计划',
    setting: 'Friends talk about weekend plans and fitness.',
    lesson: 19,
    lines: [
      {
        speaker: 'A',
        text: '你周末做什么？',
        pinyin: 'Nǐ zhōumò zuò shénme?',
        translation: 'What are you doing this weekend?',
      },
      {
        speaker: 'B',
        text: '我去健身。教练说要多休息。',
        pinyin: 'Wǒ qù jiànshēn. Jiàoliàn shuō yào duō xiūxi.',
        translation: 'I am going to work out. The coach says to rest more.',
      },
      {
        speaker: 'A',
        text: '你身体怎么样？',
        pinyin: 'Nǐ shēntǐ zěnmeyàng?',
        translation: 'How is your health?',
      },
      {
        speaker: 'B',
        text: '放心吧，我身体很好。',
        pinyin: 'Fàngxīn ba, wǒ shēntǐ hěn hǎo.',
        translation: "Don't worry, I am very healthy.",
      },
      {
        speaker: 'A',
        text: '你能帮我拍张照片吗？',
        pinyin: 'Nǐ néng bāng wǒ pāi zhāng zhàopiàn ma?',
        translation: 'Can you take a photo for me?',
      },
      { speaker: 'B', text: '当然可以！', pinyin: 'Dāngrán kěyǐ!', translation: 'Of course!' },
    ],
  },
  {
    id: 'dlg-l19-04',
    title: 'How Is It?',
    titleChinese: '怎么样？',
    setting: 'Practising 怎么样 questions and 很/真/太 intensifiers.',
    lesson: 19,
    lines: [
      {
        speaker: 'A',
        text: '这件衣服怎么样？',
        pinyin: 'Zhè jiàn yīfu zěnmeyàng?',
        translation: 'How is this piece of clothing?',
      },
      {
        speaker: 'B',
        text: '很好看！但是太贵了。',
        pinyin: 'Hěn hǎokàn! Dànshì tài guì le.',
        translation: 'Very nice! But too expensive.',
      },
      {
        speaker: 'A',
        text: '你觉得这个怎么样？',
        pinyin: 'Nǐ juéde zhège zěnmeyàng?',
        translation: 'What do you think of this one?',
      },
      {
        speaker: 'B',
        text: '你真好看！这件衣服也真好看。',
        pinyin: 'Nǐ zhēn hǎokàn! Zhè jiàn yīfu yě zhēn hǎokàn.',
        translation: 'You look great! This piece of clothing also looks really nice.',
      },
      {
        speaker: 'A',
        text: '他忙不忙？',
        pinyin: 'Tā máng bù máng?',
        translation: 'Is he busy or not?',
      },
      { speaker: 'B', text: '他很忙。', pinyin: 'Tā hěn máng.', translation: 'He is very busy.' },
      {
        speaker: 'A',
        text: '你吃不吃米饭？',
        pinyin: 'Nǐ chī bù chī mǐfàn?',
        translation: 'Do you eat rice or not?',
      },
      {
        speaker: 'B',
        text: '吃！我最喜欢吃米饭。',
        pinyin: 'Chī! Wǒ zuì xǐhuan chī mǐfàn.',
        translation: 'Yes! I like rice the most.',
      },
    ],
  },
  {
    id: 'dlg-l19-05',
    title: 'Asking for a Discount',
    titleChinese: '打折',
    setting: 'A customer bargains with a shop owner.',
    lesson: 19,
    lines: [
      {
        speaker: 'A',
        text: '老板，这件衣服多少钱？',
        pinyin: 'Lǎobǎn, zhè jiàn yīfu duōshao qián?',
        translation: 'Boss, how much is this piece of clothing?',
      },
      { speaker: 'B', text: '20块。', pinyin: 'Èrshí kuài.', translation: '20 kuai.' },
      {
        speaker: 'A',
        text: '你能给我个折扣吗？',
        pinyin: 'Nǐ néng gěi wǒ ge zhékòu ma?',
        translation: 'Can you give me a discount?',
      },
      {
        speaker: 'B',
        text: '今天打8折。',
        pinyin: 'Jīntiān dǎ bā zhé.',
        translation: "Today it's 20% off.",
      },
      {
        speaker: 'A',
        text: '10块行吗？',
        pinyin: 'Shí kuài xíng ma?',
        translation: 'Is 10 kuai okay?',
      },
      {
        speaker: 'B',
        text: '不行，太便宜了。15块。',
        pinyin: 'Bù xíng, tài piányi le. Shíwǔ kuài.',
        translation: 'No way, too cheap. 15 kuai.',
      },
      {
        speaker: 'A',
        text: '行，没问题！',
        pinyin: 'Xíng, méi wèntí!',
        translation: 'Okay, no problem!',
      },
    ],
  },
  {
    id: 'dlg-l19-06',
    title: 'How Are You Feeling?',
    titleChinese: '你的心情怎么样？',
    setting: 'A friend notices another looks tired.',
    lesson: 19,
    lines: [
      {
        speaker: 'A',
        text: '你看上去很累。',
        pinyin: 'Nǐ kànshàngqu hěn lèi.',
        translation: 'You look very tired.',
      },
      {
        speaker: 'B',
        text: '是的，我今天心情不好。',
        pinyin: 'Shì de, wǒ jīntiān xīnqíng bù hǎo.',
        translation: "Yes, I'm in a bad mood today.",
      },
      {
        speaker: 'A',
        text: '别担心，明天会更好。',
        pinyin: 'Bié dānxīn, míngtiān huì gèng hǎo.',
        translation: "Don't worry, tomorrow will be better.",
      },
      {
        speaker: 'B',
        text: '你能告诉我怎么去公园吗？我想散步。',
        pinyin: 'Nǐ néng gàosu wǒ zěnme qù gōngyuán ma? Wǒ xiǎng sànbù.',
        translation: 'Can you tell me how to get to the park? I want to take a walk.',
      },
      {
        speaker: 'A',
        text: '行，跟我来！',
        pinyin: 'Xíng, gēn wǒ lái!',
        translation: 'Sure, come with me!',
      },
    ],
  },
  {
    id: 'dlg-l20-01',
    title: 'Getting to the Forbidden City',
    titleChinese: '去故宫',
    setting: 'A tourist asks a local for directions.',
    lesson: 20,
    lines: [
      {
        speaker: 'A',
        text: '不好意思，故宫怎么走？',
        pinyin: 'Bù hǎoyìsi, Gùgōng zěnme zǒu?',
        translation: 'Excuse me, how do I get to the Forbidden City?',
      },
      {
        speaker: 'B',
        text: '你坐地铁吧，坐二号线。',
        pinyin: 'Nǐ zuò dìtiě ba, zuò èr hào xiàn.',
        translation: 'Take the subway, take Line 2.',
      },
      {
        speaker: 'A',
        text: '要多长时间？',
        pinyin: 'Yào duō cháng shíjiān?',
        translation: 'How long does it take?',
      },
      {
        speaker: 'B',
        text: '大约二十分钟。',
        pinyin: 'Dàyuē èrshí fēnzhōng.',
        translation: 'About 20 minutes.',
      },
      {
        speaker: 'A',
        text: '好的，谢谢！还有几站？',
        pinyin: 'Hǎo de, xièxiè! Hái yǒu jǐ zhàn?',
        translation: 'Okay, thank you! How many more stops?',
      },
      {
        speaker: 'B',
        text: '三站。不客气！',
        pinyin: 'Sān zhàn. Bú kèqì!',
        translation: "Three stops. You're welcome!",
      },
    ],
  },
  {
    id: 'dlg-l20-02',
    title: 'At a Restaurant',
    titleChinese: '在餐厅',
    setting: 'A tourist orders food and asks questions.',
    lesson: 20,
    lines: [
      {
        speaker: 'A',
        text: '服务员！能给我菜单吗？',
        pinyin: 'Fúwùyuán! Néng gěi wǒ càidān ma?',
        translation: 'Waiter! Can I have the menu?',
      },
      {
        speaker: 'B',
        text: '好的，请稍等。',
        pinyin: 'Hǎo de, qǐng shāo děng.',
        translation: 'Sure, please wait a moment.',
      },
      { speaker: 'A', text: '这个辣吗？', pinyin: 'Zhège là ma?', translation: 'Is this spicy?' },
      {
        speaker: 'B',
        text: '有点儿辣。有不辣的吗？',
        pinyin: 'Yǒu diǎnr là. Yǒu bù là de ma?',
        translation: 'A little spicy. Do you want something non-spicy?',
      },
      {
        speaker: 'A',
        text: '有素食吗？我不能吃肉。',
        pinyin: 'Yǒu sùshí ma? Wǒ bùnéng chī ròu.',
        translation: "Do you have vegetarian food? I can't eat meat.",
      },
      {
        speaker: 'B',
        text: '有的！这个很好吃。',
        pinyin: 'Yǒu de! Zhège hěn hǎochī.',
        translation: 'Yes! This one is very tasty.',
      },
      {
        speaker: 'A',
        text: '好，要这个。能刷卡吗？',
        pinyin: 'Hǎo, yào zhège. Néng shuā kǎ ma?',
        translation: "Okay, I'll have this. Can I pay by card?",
      },
      {
        speaker: 'B',
        text: '可以，也可以用微信。',
        pinyin: 'Kěyǐ, yě kěyǐ yòng Wēixìn.',
        translation: 'Yes, you can also use WeChat.',
      },
    ],
  },
  {
    id: 'dlg-l20-03',
    title: 'Checking into a Hotel',
    titleChinese: '入住酒店',
    setting: 'A tourist checks into their hotel.',
    lesson: 20,
    lines: [
      {
        speaker: 'A',
        text: '你好，有空房间吗？',
        pinyin: 'Nǐ hǎo, yǒu kōng fángjiān ma?',
        translation: 'Hello, do you have any rooms available?',
      },
      {
        speaker: 'B',
        text: '有的。一晚多少钱？',
        pinyin: 'Yǒu de. Yī wǎn duōshao qián?',
        translation: 'Yes we do. How much is one night?',
      },
      {
        speaker: 'A',
        text: '标准间三百块一晚。',
        pinyin: 'Biāozhǔn jiān sānbǎi kuài yī wǎn.',
        translation: 'A standard room is 300 kuai per night.',
      },
      {
        speaker: 'B',
        text: '几点可以入住？',
        pinyin: 'Jǐ diǎn kěyǐ rùzhù?',
        translation: 'What time can I check in?',
      },
      {
        speaker: 'A',
        text: '下午两点以后。几点退房？',
        pinyin: 'Xiàwǔ liǎng diǎn yǐhòu. Jǐ diǎn tuìfáng?',
        translation: 'After 2pm. What time is check-out?',
      },
      {
        speaker: 'B',
        text: '早上十一点之前。可以寄存行李吗？',
        pinyin: 'Zǎoshang shíyī diǎn zhīqián. Kěyǐ jìcún xíngli ma?',
        translation: 'Before 11am. Can I store my luggage?',
      },
      { speaker: 'A', text: '当然可以！', pinyin: 'Dāngrán kěyǐ!', translation: 'Of course!' },
    ],
  },
  {
    id: 'dlg-l20-04',
    title: 'At a Tourist Attraction',
    titleChinese: '在景点',
    setting: 'A tourist buys a ticket and asks about the attraction.',
    lesson: 20,
    lines: [
      {
        speaker: 'A',
        text: '你好，门票多少钱？',
        pinyin: 'Nǐ hǎo, ménpiào duōshao qián?',
        translation: 'Hello, how much is the entrance ticket?',
      },
      {
        speaker: 'B',
        text: '成人八十，学生半价。',
        pinyin: 'Chéngrén bāshí, xuésheng bànjià.',
        translation: 'Adults 80, students half price.',
      },
      {
        speaker: 'A',
        text: '几点开门？几点关门？',
        pinyin: 'Jǐ diǎn kāimén? Jǐ diǎn guānmén?',
        translation: 'What time does it open? What time does it close?',
      },
      {
        speaker: 'B',
        text: '早上八点开，下午六点关。',
        pinyin: 'Zǎoshang bā diǎn kāi, xiàwǔ liù diǎn guān.',
        translation: 'Opens at 8am, closes at 6pm.',
      },
      {
        speaker: 'A',
        text: '这里能拍照吗？',
        pinyin: 'Zhèlǐ néng pāizhào ma?',
        translation: 'Can I take photos here?',
      },
      {
        speaker: 'B',
        text: '可以拍照，但是不能用闪光灯。',
        pinyin: 'Kěyǐ pāizhào, dànshì bùnéng yòng shǎnguāngdēng.',
        translation: "You can take photos, but you can't use a flash.",
      },
      {
        speaker: 'A',
        text: '好的。洗手间在哪儿？',
        pinyin: 'Hǎo de. Xǐshǒujiān zài nǎr?',
        translation: 'Okay. Where is the restroom?',
      },
      {
        speaker: 'B',
        text: '往左走，就在那儿。',
        pinyin: 'Wǎng zuǒ zǒu, jiù zài nàr.',
        translation: "Walk to the left, it's right there.",
      },
    ],
  },

  // ============================================================
  // Lesson 21 - Hobbies & Special Skills
  // ============================================================
  {
    id: 'dlg-l21-01',
    title: 'Talking About Hobbies',
    titleChinese: '谈爱好',
    setting: 'Two classmates compare what they like to do.',
    lesson: 21,
    lines: [
      {
        speaker: 'A',
        text: '你有什么爱好？',
        pinyin: 'Nǐ yǒu shénme àihào?',
        translation: 'What hobbies do you have?',
      },
      {
        speaker: 'B',
        text: '我喜欢唱歌和打网球。你呢？',
        pinyin: 'Wǒ xǐhuan chànggē hé dǎ wǎngqiú. Nǐ ne?',
        translation: 'I like singing and playing tennis. And you?',
      },
      {
        speaker: 'A',
        text: '我会打篮球，不过打得不太好。',
        pinyin: 'Wǒ huì dǎ lánqiú, búguò dǎ de bú tài hǎo.',
        translation: 'I can play basketball, but not very well.',
      },
      {
        speaker: 'B',
        text: '你会唱歌吗？',
        pinyin: 'Nǐ huì chànggē ma?',
        translation: 'Can you sing?',
      },
      {
        speaker: 'A',
        text: '会一点儿，唱得还可以。',
        pinyin: 'Huì yìdiǎnr, chàng de hái kěyǐ.',
        translation: 'A little — I sing okay.',
      },
      {
        speaker: 'B',
        text: '太好了！除了唱歌，我们还可以一起打网球。',
        pinyin: 'Tài hǎo le! Chúle chànggē, wǒmen hái kěyǐ yìqǐ dǎ wǎngqiú.',
        translation: 'Great! Besides singing, we can also play tennis together.',
      },
    ],
  },
  {
    id: 'dlg-l21-02',
    title: 'Special Skills',
    titleChinese: '特长',
    setting: 'A host welcomes a guest and asks about their talents.',
    lesson: 21,
    lines: [
      {
        speaker: 'A',
        text: '请进，请坐！',
        pinyin: 'Qǐng jìn, qǐng zuò!',
        translation: 'Come in, have a seat!',
      },
      {
        speaker: 'B',
        text: '谢谢。你的中文说得真好！',
        pinyin: 'Xièxie. Nǐ de zhōngwén shuō de zhēn hǎo!',
        translation: 'Thank you. You speak Chinese really well!',
      },
      {
        speaker: 'A',
        text: '哪里哪里。你有什么特长？',
        pinyin: 'Nǎli nǎli. Nǐ yǒu shénme tècháng?',
        translation: 'Not at all. What special skills do you have?',
      },
      {
        speaker: 'B',
        text: '我会一点儿功夫。',
        pinyin: 'Wǒ huì yìdiǎnr gōngfu.',
        translation: 'I know a little kung fu.',
      },
      {
        speaker: 'A',
        text: '真的吗？太厉害了！',
        pinyin: 'Zhēn de ma? Tài lìhai le!',
        translation: "Really? That's amazing!",
      },
      {
        speaker: 'B',
        text: '不过我更喜欢旅游和看电影。',
        pinyin: 'Búguò wǒ gèng xǐhuan lǚyóu hé kàn diànyǐng.',
        translation: 'But I prefer traveling and watching movies.',
      },
    ],
  },

  // ============================================================
  // Lesson 24 - Have You Been to Shanghai?
  // ============================================================
  {
    id: 'dlg-l24-01',
    title: 'Have You Been to Shanghai?',
    titleChinese: '你去过上海吗？',
    setting: 'Two friends talk about places they have visited.',
    lesson: 24,
    lines: [
      {
        speaker: 'A',
        text: '你去过上海吗？',
        pinyin: 'Nǐ qù guo Shànghǎi ma?',
        translation: 'Have you ever been to Shanghai?',
      },
      {
        speaker: 'B',
        text: '去过，以前放假的时候去过一次。',
        pinyin: 'Qù guo, yǐqián fàngjià de shíhou qù guo yí cì.',
        translation: 'Yes, I went once during a holiday before.',
      },
      {
        speaker: 'A',
        text: '上海怎么样？',
        pinyin: 'Shànghǎi zěnmeyàng?',
        translation: 'What is Shanghai like?',
      },
      {
        speaker: 'B',
        text: '上海是个很有名的地方，很漂亮。',
        pinyin: 'Shànghǎi shì ge hěn yǒumíng de dìfang, hěn piàoliang.',
        translation: 'Shanghai is a very famous place, very beautiful.',
      },
      {
        speaker: 'A',
        text: '我还没去过呢，真想去看看。',
        pinyin: 'Wǒ hái méi qù guo ne, zhēn xiǎng qù kànkan.',
        translation: "I haven't been yet — I really want to go and see it.",
      },
      {
        speaker: 'B',
        text: '下个假期我们一起去吧！',
        pinyin: 'Xià ge jiàqī wǒmen yìqǐ qù ba!',
        translation: "Let's go together next holiday!",
      },
    ],
  },
  {
    id: 'dlg-l24-02',
    title: 'Ordering Takeout',
    titleChinese: '点外卖',
    setting: 'Two roommates decide what to order for dinner.',
    lesson: 24,
    lines: [
      {
        speaker: 'A',
        text: '今天我们点外卖吧，我不想做饭。',
        pinyin: 'Jīntiān wǒmen diǎn wàimài ba, wǒ bù xiǎng zuò fàn.',
        translation: "Let's order takeout today, I don't want to cook.",
      },
      {
        speaker: 'B',
        text: '好啊。我在网上订一家西餐厅的菜，可以吗？',
        pinyin: 'Hǎo a. Wǒ zài wǎngshàng dìng yì jiā xīcāntīng de cài, kěyǐ ma?',
        translation: 'Sure. Can I order from a Western restaurant online?',
      },
      {
        speaker: 'A',
        text: '可以。那家有名吗？味道怎么样？',
        pinyin: 'Kěyǐ. Nà jiā yǒumíng ma? Wèidào zěnmeyàng?',
        translation: 'Sure. Is that place famous? How does it taste?',
      },
      {
        speaker: 'B',
        text: '很有名，不过菜有点儿辣。',
        pinyin: 'Hěn yǒumíng, búguò cài yǒudiǎnr là.',
        translation: 'Very famous, but the food is a little spicy.',
      },
      {
        speaker: 'A',
        text: '没关系，我特别喜欢吃辣的。',
        pinyin: 'Méi guānxi, wǒ tèbié xǐhuan chī là de.',
        translation: "It's fine, I especially like spicy food.",
      },
      {
        speaker: 'B',
        text: '好，我订了。不过送得比较慢，我们等一等。',
        pinyin: 'Hǎo, wǒ dìng le. Búguò sòng de bǐjiào màn, wǒmen děng yi děng.',
        translation: "Okay, I've ordered. But the delivery is rather slow, let's wait a bit.",
      },
    ],
  },

  // ============================================================
  // Lesson 25 - Where Did You Go on the Weekend?
  // ============================================================
  {
    id: 'dlg-l25-01',
    title: 'Where Did You Go on the Weekend?',
    titleChinese: '周末你去哪儿了？',
    setting: 'Two classmates chat on Monday about their weekend.',
    lesson: 25,
    lines: [
      {
        speaker: 'A',
        text: '周末你去哪儿了？',
        pinyin: 'Zhōumò nǐ qù nǎr le?',
        translation: 'Where did you go on the weekend?',
      },
      {
        speaker: 'B',
        text: '我和朋友一起去滑雪了。',
        pinyin: 'Wǒ hé péngyou yìqǐ qù huáxuě le.',
        translation: 'My friend and I went skiing together.',
      },
      {
        speaker: 'A',
        text: '滑雪难吗？你不怕摔吗？',
        pinyin: 'Huáxuě nán ma? Nǐ bú pà shuāi ma?',
        translation: "Is skiing hard? Aren't you afraid of falling?",
      },
      {
        speaker: 'B',
        text: '不太难，好好准备就行。开始我有点儿怕，后来就不怕了。',
        pinyin: 'Bú tài nán, hǎohāo zhǔnbèi jiù xíng. Kāishǐ wǒ yǒudiǎnr pà, hòulái jiù bú pà le.',
        translation:
          "Not too hard, good preparation is enough. At first I was a bit afraid, but later I wasn't anymore.",
      },
      {
        speaker: 'A',
        text: '太棒了！下次你叫我一起去吧。',
        pinyin: 'Tài bàng le! Xià cì nǐ jiào wǒ yìqǐ qù ba.',
        translation: 'Awesome! Next time tell me to come along.',
      },
      {
        speaker: 'B',
        text: '好，我带你去。我教你，你别怕！',
        pinyin: 'Hǎo, wǒ dài nǐ qù. Wǒ jiāo nǐ, nǐ bié pà!',
        translation: "Okay, I'll take you. I'll teach you — don't be afraid!",
      },
    ],
  },
  {
    id: 'dlg-l25-02',
    title: 'What Is Everyone Doing?',
    titleChinese: '大家在干什么？',
    setting: 'A phone call — one friend asks what the others are up to.',
    lesson: 25,
    lines: [
      {
        speaker: 'A',
        text: '喂，你们在干什么呢？',
        pinyin: 'Wéi, nǐmen zài gàn shénme ne?',
        translation: 'Hello, what are you all doing?',
      },
      {
        speaker: 'B',
        text: '同学们在做沙拉，妈妈在做饭。',
        pinyin: 'Tóngxuémen zài zuò shālā, māma zài zuò fàn.',
        translation: 'The classmates are making salad, and Mom is cooking.',
      },
      {
        speaker: 'A',
        text: '你吃饭了没有？',
        pinyin: 'Nǐ chī fàn le méiyǒu?',
        translation: 'Have you eaten yet?',
      },
      {
        speaker: 'B',
        text: '还没吃呢。妈妈要求我们等一等。你猜今天吃什么？',
        pinyin: 'Hái méi chī ne. Māma yāoqiú wǒmen děng yi děng. Nǐ cāi jīntiān chī shénme?',
        translation: "Not yet. Mom asked us to wait a bit. Guess what we're eating today?",
      },
      {
        speaker: 'A',
        text: '我猜不到。有什么好办法能早点儿吃饭吗？',
        pinyin: 'Wǒ cāi bú dào. Yǒu shénme hǎo bànfǎ néng zǎo diǎnr chī fàn ma?',
        translation: "I can't guess. Is there a good way to eat a bit earlier?",
      },
      {
        speaker: 'B',
        text: '你来我家一起吃就行，我们等你！',
        pinyin: 'Nǐ lái wǒ jiā yìqǐ chī jiù xíng, wǒmen děng nǐ!',
        translation: "Just come to my house and eat with us — we'll wait for you!",
      },
    ],
  },
  {
    id: 'dlg-l25-03',
    title: 'Skiing in the Suburbs',
    titleChinese: '周末你去哪儿了？（课文一）',
    setting: 'Wang Xiaotian asks a student about the weekend and hears about a ski trip.',
    lesson: 25,
    lines: [
      {
        speaker: 'Wang Xiaotian',
        text: '周末你去哪儿了？',
        pinyin: 'Zhōumò nǐ qù nǎr le?',
        translation: 'Where did you go on the weekend?',
      },
      {
        speaker: 'Student',
        text: '我跟同学一起去郊区滑雪了。',
        pinyin: 'Wǒ gēn tóngxué yìqǐ qù jiāoqū huáxuě le.',
        translation: 'I went skiing in the suburbs together with my classmates.',
      },
      {
        speaker: 'Wang Xiaotian',
        text: '滑雪？好玩儿吗？',
        pinyin: 'Huáxuě? Hǎowánr ma?',
        translation: 'Skiing? Was it fun?',
      },
      {
        speaker: 'Student',
        text: '很好玩儿，那儿的滑雪场特别棒，人也不多。',
        pinyin: 'Hěn hǎowánr, nàr de huáxuěchǎng tèbié bàng, rén yě bù duō.',
        translation:
          "Very fun. The ski resort there is really great, and there aren't many people.",
      },
      {
        speaker: 'Wang Xiaotian',
        text: '我还没滑过雪呢。难不难？',
        pinyin: 'Wǒ hái méi huáguo xuě ne. Nán bu nán?',
        translation: "I've never been skiing. Is it hard?",
      },
      {
        speaker: 'Student',
        text: '不难，你不怕摔就行。下次我请你去。',
        pinyin: 'Bù nán, nǐ bú pà shuāi jiù xíng. Xià cì wǒ qǐng nǐ qù.',
        translation:
          "Not hard — it's enough if you're not afraid of falling. Next time I'll take you.",
      },
      {
        speaker: 'Wang Xiaotian',
        text: '我想想吧。',
        pinyin: 'Wǒ xiǎngxiang ba.',
        translation: 'Let me think about it.',
      },
    ],
  },
  {
    id: 'dlg-l25-04',
    title: 'Friends Over for Dinner',
    titleChinese: '星期天你都干什么了？（课文二）',
    setting: 'An older sister asks Xiaomei what she did on Sunday and guesses what she cooked.',
    lesson: 25,
    lines: [
      {
        speaker: 'Sister',
        text: '星期天你都干什么了？',
        pinyin: 'Xīngqītiān nǐ dōu gàn shénme le?',
        translation: 'What did you get up to on Sunday?',
      },
      {
        speaker: 'Xiaomei',
        text: '几个朋友来我家吃饭了。',
        pinyin: 'Jǐ ge péngyou lái wǒ jiā chī fàn le.',
        translation: 'A few friends came to my place for dinner.',
      },
      {
        speaker: 'Sister',
        text: '你会做饭吗？',
        pinyin: 'Nǐ huì zuò fàn ma?',
        translation: 'Can you cook?',
      },
      {
        speaker: 'Xiaomei',
        text: '我们要求每个人带一个菜。',
        pinyin: 'Wǒmen yāoqiú měi ge rén dài yí ge cài.',
        translation: 'We asked everyone to bring a dish.',
      },
      {
        speaker: 'Sister',
        text: '这真是个好办法！你也做菜了吗？',
        pinyin: 'Zhè zhēn shì ge hǎo bànfǎ! Nǐ yě zuò cài le ma?',
        translation: "That's a really good idea! Did you cook something too?",
      },
      {
        speaker: 'Xiaomei',
        text: '做了。你猜我做什么了。',
        pinyin: 'Zuò le. Nǐ cāi wǒ zuò shénme le.',
        translation: 'I did. Guess what I made.',
      },
      {
        speaker: 'Sister',
        text: '一定是沙拉。',
        pinyin: 'Yídìng shì shālā.',
        translation: 'It must be salad.',
      },
    ],
  },

  // ============================================================
  // Lesson 26 - At the Doctor's 哪儿不舒服？
  // ============================================================
  {
    id: 'dlg-l26-01',
    title: 'Where Does It Hurt?',
    titleChinese: '你哪儿不舒服？',
    setting: 'A student sees the doctor at the campus clinic.',
    lesson: 26,
    lines: [
      {
        speaker: 'A (Doctor)',
        text: '你哪儿不舒服？',
        pinyin: 'Nǐ nǎr bù shūfu?',
        translation: 'Where are you feeling unwell?',
      },
      {
        speaker: 'B (Patient)',
        text: '我头疼，还有点儿冷。',
        pinyin: 'Wǒ tóu téng, hái yǒudiǎnr lěng.',
        translation: 'I have a headache, and I feel a bit cold too.',
      },
      {
        speaker: 'A (Doctor)',
        text: '你觉得发烧了吗？让我量一下体温。',
        pinyin: 'Nǐ juéde fāshāo le ma? Ràng wǒ liáng yíxià tǐwēn.',
        translation: 'Do you think you have a fever? Let me take your temperature.',
      },
      {
        speaker: 'A (Doctor)',
        text: '三十八度五，你发烧了。',
        pinyin: 'Sānshíbā dù wǔ, nǐ fāshāo le.',
        translation: '38.5 degrees — you have a fever.',
      },
      {
        speaker: 'B (Patient)',
        text: '我是不是感冒了？要验血吗？',
        pinyin: 'Wǒ shì bu shì gǎnmào le? Yào yàn xiě ma?',
        translation: 'Have I caught a cold? Do I need a blood test?',
      },
      {
        speaker: 'A (Doctor)',
        text: '你先去验血吧，然后我们再看看。',
        pinyin: 'Nǐ xiān qù yàn xiě ba, ránhòu wǒmen zài kànkan.',
        translation: "Go and have a blood test first, then we'll take another look.",
      },
    ],
  },
  {
    id: 'dlg-l26-02',
    title: 'How to Take the Medicine',
    titleChinese: '这个药怎么吃？',
    setting: 'The doctor explains the prescription after the blood test.',
    lesson: 26,
    lines: [
      {
        speaker: 'A (Doctor)',
        text: '你只是感冒了，不用担心。',
        pinyin: 'Nǐ zhǐshì gǎnmào le, búyòng dānxīn.',
        translation: "It's only a cold, don't worry.",
      },
      {
        speaker: 'B (Patient)',
        text: '这个药怎么吃？',
        pinyin: 'Zhège yào zěnme chī?',
        translation: 'How do I take this medicine?',
      },
      {
        speaker: 'A (Doctor)',
        text: '一天吃三次，一次两片，先吃药再睡觉。',
        pinyin: 'Yì tiān chī sān cì, yí cì liǎng piàn, xiān chī yào zài shuìjiào.',
        translation:
          'Three times a day, two tablets each time. Take the medicine first, then sleep.',
      },
      {
        speaker: 'B (Patient)',
        text: '我对青霉素过敏，能吃这个药吗？',
        pinyin: 'Wǒ duì qīngméisù guòmǐn, néng chī zhège yào ma?',
        translation: "I'm allergic to penicillin — can I take this medicine?",
      },
      {
        speaker: 'A (Doctor)',
        text: '能，这个药没问题。多喝水，多休息，少工作。',
        pinyin: 'Néng, zhège yào méi wèntí. Duō hē shuǐ, duō xiūxi, shǎo gōngzuò.',
        translation: 'Yes, this one is fine. Drink lots of water, rest a lot, and work less.',
      },
      {
        speaker: 'B (Patient)',
        text: '好的，谢谢医生！',
        pinyin: 'Hǎo de, xièxie yīshēng!',
        translation: 'Okay, thank you, doctor!',
      },
    ],
  },
  {
    id: 'dlg-l26-03',
    title: 'Asking for Sick Leave',
    titleChinese: '我想请假',
    setting: 'A student phones a classmate to ask for help with sick leave.',
    lesson: 26,
    lines: [
      {
        speaker: 'A',
        text: '喂，小李，你怎么了？你的声音很不好。',
        pinyin: 'Wéi, Xiǎo Lǐ, nǐ zěnme le? Nǐ de shēngyīn hěn bù hǎo.',
        translation: "Hello, Xiao Li, what's wrong? You don't sound good.",
      },
      {
        speaker: 'B',
        text: '我生病了，嗓子疼，还咳嗽。',
        pinyin: 'Wǒ shēngbìng le, sǎngzi téng, hái késou.',
        translation: 'I got sick — my throat hurts and I have a cough.',
      },
      {
        speaker: 'A',
        text: '你今天能来上课吗？',
        pinyin: 'Nǐ jīntiān néng lái shàngkè ma?',
        translation: 'Can you come to class today?',
      },
      {
        speaker: 'B',
        text: '不能。你能帮我请一天假吗？',
        pinyin: 'Bù néng. Nǐ néng bāng wǒ qǐng yì tiān jià ma?',
        translation: "No. Can you ask for one day's leave for me?",
      },
      {
        speaker: 'A',
        text: '没问题。你还是去医院看看吧。',
        pinyin: 'Méi wèntí. Nǐ háishi qù yīyuàn kànkan ba.',
        translation: "No problem. You'd better go to the hospital and get checked.",
      },
      {
        speaker: 'B',
        text: '我下午去。谢谢你！',
        pinyin: 'Wǒ xiàwǔ qù. Xièxie nǐ!',
        translation: "I'll go this afternoon. Thank you!",
      },
      {
        speaker: 'A',
        text: '快点儿好起来！',
        pinyin: 'Kuài diǎnr hǎo qǐlái!',
        translation: 'Get better soon!',
      },
    ],
  },
  {
    id: 'dlg-l26-04',
    title: "Why Aren't You Up Yet?",
    titleChinese: '你怎么还不起床？',
    setting: "Àihuá visits Nuòmǐn's room and finds her still in bed and feeling unwell.",
    lesson: 26,
    lines: [
      { speaker: 'A (Nuòmǐn)', text: '请进。', pinyin: 'Qǐng jìn.', translation: 'Come in.' },
      {
        speaker: 'B (Àihuá)',
        text: '诺敏，你怎么还不起床？今天不上课吗？',
        pinyin: 'Nuòmǐn, nǐ zěnme hái bù qǐchuáng? Jīntiān bú shàngkè ma?',
        translation: "Nuòmǐn, why aren't you up yet? Don't you have class today?",
      },
      {
        speaker: 'A (Nuòmǐn)',
        text: '我有点儿不舒服。',
        pinyin: 'Wǒ yǒudiǎnr bù shūfu.',
        translation: "I don't feel very well.",
      },
      { speaker: 'B (Àihuá)', text: '怎么了？', pinyin: 'Zěnme le?', translation: "What's wrong?" },
      {
        speaker: 'A (Nuòmǐn)',
        text: '我头很疼，觉得特别冷。',
        pinyin: 'Wǒ tóu hěn téng, juéde tèbié lěng.',
        translation: 'My head hurts a lot and I feel especially cold.',
      },
      {
        speaker: 'B (Àihuá)',
        text: '是不是发烧了？量量体温吧。',
        pinyin: 'Shì bu shì fāshāo le? Liángliang tǐwēn ba.',
        translation: 'Do you have a fever? Take your temperature.',
      },
      {
        speaker: 'A (Nuòmǐn)',
        text: '我现在只想睡觉。',
        pinyin: 'Wǒ xiànzài zhǐ xiǎng shuìjiào.',
        translation: 'Right now I just want to sleep.',
      },
      {
        speaker: 'B (Àihuá)',
        text: '三十八度五。还是去医院看看吧。',
        pinyin: 'Sānshíbā dù wǔ. Háishi qù yīyuàn kànkan ba.',
        translation: "It's 38.5 degrees. You'd better go to the hospital and get checked.",
      },
    ],
  },
  {
    id: 'dlg-l26-05',
    title: 'Cold Medicine and a Leave Message',
    titleChinese: '感冒药和请假',
    setting:
      'Nuòmǐn brings her blood-test report to the doctor, who prescribes cold medicine, and she then sends a WeChat message asking her classmate Lǐ Jūn to ask for leave for her.',
    lesson: 26,
    lines: [
      {
        speaker: 'A (Doctor)',
        text: '哪儿不舒服？',
        pinyin: 'Nǎr bù shūfu?',
        translation: 'Where do you feel unwell?',
      },
      {
        speaker: 'B (Nuòmǐn)',
        text: '头疼，发烧。',
        pinyin: 'Tóu téng, fāshāo.',
        translation: 'A headache and a fever.',
      },
      {
        speaker: 'A (Doctor)',
        text: '先去验血吧。',
        pinyin: 'Xiān qù yàn xiě ba.',
        translation: 'Go and have a blood test first.',
      },
      {
        speaker: 'A (Doctor)',
        text: '你感冒了。吃这种感冒药，一天三次，一次两片。',
        pinyin: 'Nǐ gǎnmào le. Chī zhè zhǒng gǎnmào yào, yì tiān sān cì, yí cì liǎng piàn.',
        translation:
          'You have a cold. Take this cold medicine three times a day, two tablets each time.',
      },
      { speaker: 'B (Nuòmǐn)', text: '好的。', pinyin: 'Hǎo de.', translation: 'OK.' },
      {
        speaker: 'A (Doctor)',
        text: '多喝水，多休息，少吃辣的菜。',
        pinyin: 'Duō hē shuǐ, duō xiūxi, shǎo chī là de cài.',
        translation: 'Drink lots of water, rest a lot, and eat less spicy food.',
      },
      {
        speaker: 'B (Nuòmǐn)',
        text: '谢谢大夫！',
        pinyin: 'Xièxie dàifu!',
        translation: 'Thank you, doctor!',
      },
      {
        speaker: 'B (Nuòmǐn)',
        text: '李君，我是诺敏。我病了，今天不能去上课了，你帮我请个假吧，谢谢！',
        pinyin:
          'Lǐ Jūn, wǒ shì Nuòmǐn. Wǒ bìng le, jīntiān bù néng qù shàngkè le, nǐ bāng wǒ qǐng ge jià ba, xièxie!',
        translation:
          "Lǐ Jūn, it's Nuòmǐn. I'm ill and can't go to class today — please ask for leave for me. Thanks!",
      },
    ],
  },

  // ============================================================
  // Lesson 27 - HSKK Practice Tests HSKK练习
  // ============================================================
  {
    id: 'dlg-l27-01',
    title: 'An International Student in China',
    titleChinese: '在中国的留学生',
    setting: 'A short reading passage about an American student who is studying Chinese in China.',
    lesson: 27,
    lines: [
      {
        speaker: 'Narrator',
        text: '大卫是一个美国留学生，他今年二十二岁。',
        pinyin: "Dàwèi shì yí ge Měiguó liúxuéshēng, tā jīnnián èrshí'èr suì.",
        translation: 'David is an American international student; he is twenty-two this year.',
      },
      {
        speaker: 'Narrator',
        text: '他喜欢中国文化，所以来中国学习汉语。',
        pinyin: 'Tā xǐhuan Zhōngguó wénhuà, suǒyǐ lái Zhōngguó xuéxí Hànyǔ.',
        translation: 'He likes Chinese culture, so he came to China to study Chinese.',
      },
      {
        speaker: 'Narrator',
        text: '大卫去过上海和杭州，他觉得这两个城市很漂亮。',
        pinyin: 'Dàwèi qù guo Shànghǎi hé Hángzhōu, tā juéde zhè liǎng ge chéngshì hěn piàoliang.',
        translation:
          'David has been to Shanghai and Hangzhou; he thinks these two cities are very beautiful.',
      },
      {
        speaker: 'Narrator',
        text: '他还没去过西安，想假期和同学一起去。',
        pinyin: "Tā hái méi qù guo Xī'ān, xiǎng jiàqī hé tóngxué yìqǐ qù.",
        translation:
          "He hasn't been to Xi'an yet and wants to go there with his classmates in the holidays.",
      },
      {
        speaker: 'Narrator',
        text: '大卫会说一点儿汉语，他也会做中国菜，比如西红柿炒鸡蛋。',
        pinyin:
          'Dàwèi huì shuō yìdiǎnr Hànyǔ, tā yě huì zuò Zhōngguó cài, bǐrú xīhóngshì chǎo jīdàn.',
        translation:
          'David can speak a little Chinese, and he can also cook Chinese dishes, such as stir-fried tomato and egg.',
      },
      {
        speaker: 'Narrator',
        text: '周末的时候，他常常和朋友去咖啡店喝咖啡，或者去公园散步。',
        pinyin:
          'Zhōumò de shíhou, tā chángcháng hé péngyou qù kāfēidiàn hē kāfēi, huòzhě qù gōngyuán sànbù.',
        translation:
          'On weekends he often goes with friends to a café for coffee, or goes for a walk in the park.',
      },
    ],
  },
  {
    id: 'dlg-l27-02',
    title: 'My Roommate',
    titleChinese: '我的同屋',
    setting: 'A short reading passage about a roommate who works long hours.',
    lesson: 27,
    lines: [
      {
        speaker: 'Narrator',
        text: '我的同屋是中国人，他在一家汽车公司工作。',
        pinyin: 'Wǒ de tóngwū shì Zhōngguó rén, tā zài yì jiā qìchē gōngsī gōngzuò.',
        translation: 'My roommate is Chinese; he works at a car company.',
      },
      {
        speaker: 'Narrator',
        text: '他每天都很忙，从早上八点到下午五点都在公司上班，有时候周末也去上班。',
        pinyin:
          'Tā měi tiān dōu hěn máng, cóng zǎoshang bā diǎn dào xiàwǔ wǔ diǎn dōu zài gōngsī shàngbān, yǒu shíhou zhōumò yě qù shàngbān.',
        translation:
          'He is busy every day: he is at the office from eight in the morning to five in the afternoon, and sometimes he goes to work on weekends too.',
      },
      {
        speaker: 'Narrator',
        text: '平时我在学校吃饭，他也不在家吃饭。',
        pinyin: 'Píngshí wǒ zài xuéxiào chī fàn, tā yě bú zài jiā chī fàn.',
        translation: "On ordinary days I eat at school, and he doesn't eat at home either.",
      },
      {
        speaker: 'Narrator',
        text: '休息的时候，我们在家做饭。',
        pinyin: 'Xiūxi de shíhou, wǒmen zài jiā zuò fàn.',
        translation: 'When we are off, we cook at home.',
      },
      {
        speaker: 'Narrator',
        text: '我做韩国菜，他做中国菜，我们一起吃饭聊天儿。',
        pinyin: 'Wǒ zuò Hánguó cài, tā zuò Zhōngguó cài, wǒmen yìqǐ chī fàn liáotiānr.',
        translation: 'I cook Korean food and he cooks Chinese food, and we eat and chat together.',
      },
    ],
  },
  {
    id: 'dlg-l27-03',
    title: 'Plans for the Holiday',
    titleChinese: '假期的计划',
    setting: 'Two friends talk about going to Shanghai together during the holiday.',
    lesson: 27,
    lines: [
      {
        speaker: 'A',
        text: '你去过上海吗？',
        pinyin: 'Nǐ qù guo Shànghǎi ma?',
        translation: 'Have you ever been to Shanghai?',
      },
      {
        speaker: 'B',
        text: '没去过，我想去。',
        pinyin: 'Méi qù guo, wǒ xiǎng qù.',
        translation: "No, but I'd like to go.",
      },
      {
        speaker: 'A',
        text: '假期我们一起去上海吧。',
        pinyin: 'Jiàqī wǒmen yìqǐ qù Shànghǎi ba.',
        translation: "Let's go to Shanghai together in the holidays.",
      },
      {
        speaker: 'B',
        text: '我也想去。可是我要加班。',
        pinyin: 'Wǒ yě xiǎng qù. Kěshì wǒ yào jiābān.',
        translation: "I'd like to go too, but I have to work overtime.",
      },
    ],
  },

  // ============================================================
  // Lesson 28 - Characters: One Person to Many 人体汉字（三）：单人到多人
  // ============================================================
  {
    id: 'dlg-l28-01',
    title: 'A Park in the City',
    titleChinese: '西山公园',
    setting:
      'A short reading passage describing West Mountain Park, on the west side of the city, and what people do there.',
    lesson: 28,
    lines: [
      {
        speaker: 'Narrator',
        text: '这个城市西边有一个公园，叫西山公园。',
        pinyin: 'Zhège chéngshì xībian yǒu yí ge gōngyuán, jiào Xīshān Gōngyuán.',
        translation: 'On the west side of this city there is a park called West Mountain Park.',
      },
      {
        speaker: 'Narrator',
        text: '那里有山，有水，有树，有花。',
        pinyin: 'Nàlǐ yǒu shān, yǒu shuǐ, yǒu shù, yǒu huā.',
        translation: 'There are mountains, water, trees and flowers.',
      },
      {
        speaker: 'Narrator',
        text: '风景非常漂亮，空气也非常新鲜。',
        pinyin: 'Fēngjǐng fēicháng piàoliang, kōngqì yě fēicháng xīnxiān.',
        translation: 'The scenery is very beautiful and the air is very fresh.',
      },
      {
        speaker: 'Narrator',
        text: '每天都有很多人去那儿爬山，看风景，呼吸新鲜空气。',
        pinyin: 'Měi tiān dōu yǒu hěn duō rén qù nàr pá shān, kàn fēngjǐng, hūxī xīnxiān kōngqì.',
        translation:
          'Every day many people go there to climb the mountain, enjoy the scenery and breathe the fresh air.',
      },
      {
        speaker: 'Narrator',
        text: '这个星期天我们也去爬山。',
        pinyin: 'Zhège xīngqītiān wǒmen yě qù pá shān.',
        translation: 'This Sunday we are also going to climb the mountain.',
      },
    ],
  },

  // ============================================================
  // Lesson 29 - Allergies & Health Advice 过敏和健康建议
  // ============================================================
  {
    id: 'dlg-l29-01',
    title: 'I Think I Have an Allergy',
    titleChinese: '我觉得我过敏了',
    setting:
      'A patient with an itchy face and trouble breathing tells the doctor about eating peanuts that afternoon, and the doctor decides to keep the patient in the hospital overnight.',
    lesson: 29,
    lines: [
      {
        speaker: 'A (Doctor)',
        text: '你怎么了？',
        pinyin: 'Nǐ zěnme le?',
        translation: "What's wrong?",
      },
      {
        speaker: 'B (Patient)',
        text: '我觉得我过敏了。',
        pinyin: 'Wǒ juéde wǒ guòmǐn le.',
        translation: 'I think I have an allergy.',
      },
      {
        speaker: 'A (Doctor)',
        text: '你对什么过敏？',
        pinyin: 'Nǐ duì shénme guòmǐn?',
        translation: 'What are you allergic to?',
      },
      {
        speaker: 'B (Patient)',
        text: '我下午吃了一些花生。我对花生有点儿过敏。',
        pinyin: 'Wǒ xiàwǔ chī le yìxiē huāshēng. Wǒ duì huāshēng yǒudiǎnr guòmǐn.',
        translation: "I ate some peanuts this afternoon. I'm a bit allergic to peanuts.",
      },
      {
        speaker: 'A (Doctor)',
        text: '你觉得怎么样？',
        pinyin: 'Nǐ juéde zěnmeyàng?',
        translation: 'How do you feel?',
      },
      {
        speaker: 'B (Patient)',
        text: '我的脸很痒。我的呼吸也不太好。我很不舒服。',
        pinyin: 'Wǒ de liǎn hěn yǎng. Wǒ de hūxī yě bú tài hǎo. Wǒ hěn bù shūfu.',
        translation:
          "My face is very itchy. My breathing isn't very good either. I feel very unwell.",
      },
      {
        speaker: 'A (Doctor)',
        text: '你睡觉了吗？我先量量你的体温吧。',
        pinyin: 'Nǐ shuìjiào le ma? Wǒ xiān liángliang nǐ de tǐwēn ba.',
        translation: 'Have you slept? Let me take your temperature first.',
      },
      { speaker: 'B (Patient)', text: '好的。', pinyin: 'Hǎo de.', translation: 'OK.' },
      {
        speaker: 'A (Doctor)',
        text: '你体温很高。晚上你住院，我们有一个病床。明天我再量量你的体温。',
        pinyin:
          'Nǐ tǐwēn hěn gāo. Wǎnshang nǐ zhùyuàn, wǒmen yǒu yí ge bìngchuáng. Míngtiān wǒ zài liángliang nǐ de tǐwēn.',
        translation:
          'Your temperature is high. You will stay in the hospital tonight; we have a bed. Tomorrow I will take your temperature again.',
      },
      {
        speaker: 'A (Doctor)',
        text: '晚上你喝一杯汤，吃过敏药。你可以去你的病床。你的病床在那儿。',
        pinyin:
          'Wǎnshang nǐ hē yì bēi tāng, chī guòmǐn yào. Nǐ kěyǐ qù nǐ de bìngchuáng. Nǐ de bìngchuáng zài nàr.',
        translation:
          'Tonight, drink a cup of soup and take the allergy medicine. You can go to your bed. Your bed is over there.',
      },
    ],
  },
  {
    id: 'dlg-l29-02',
    title: 'No Insurance, No Worries',
    titleChinese: '没有医保，别担心',
    setting:
      'The patient has no medical insurance and asks the doctor how much the allergy medicine costs and how long the hospital stay will be.',
    lesson: 29,
    lines: [
      {
        speaker: 'A (Doctor)',
        text: '你有医保吗？',
        pinyin: 'Nǐ yǒu yībǎo ma?',
        translation: 'Do you have medical insurance?',
      },
      {
        speaker: 'B (Patient)',
        text: '我没有医保。过敏药贵吗？',
        pinyin: 'Wǒ méiyǒu yībǎo. Guòmǐn yào guì ma?',
        translation: "I don't have medical insurance. Is the allergy medicine expensive?",
      },
      {
        speaker: 'A (Doctor)',
        text: '不贵。别担心。',
        pinyin: 'Bú guì. Bié dānxīn.',
        translation: "Not expensive. Don't worry.",
      },
      {
        speaker: 'B (Patient)',
        text: '好的，谢谢。我要在医院住几天？',
        pinyin: 'Hǎo de, xièxie. Wǒ yào zài yīyuàn zhù jǐ tiān?',
        translation: 'OK, thank you. How many days do I need to stay in the hospital?',
      },
      {
        speaker: 'A (Doctor)',
        text: '如果过敏药有用，你在医院一天就行。但是如果过敏药没用，你可以试试向神祷告。',
        pinyin:
          'Rúguǒ guòmǐn yào yǒuyòng, nǐ zài yīyuàn yì tiān jiù xíng. Dànshì rúguǒ guòmǐn yào méiyòng, nǐ kěyǐ shìshi xiàng shén dǎogào.',
        translation:
          "If the allergy medicine works, one day in the hospital is enough. But if the allergy medicine doesn't work, you can try praying to God.",
      },
    ],
  },
  {
    id: 'dlg-l29-03',
    title: 'Allergy Check-up (Short Version)',
    titleChinese: '过敏检查（简短版）',
    setting:
      'A short practice version of the allergy visit, in which the doctor admits a patient who is allergic to peanuts.',
    lesson: 29,
    lines: [
      {
        speaker: 'A (Doctor)',
        text: '你怎么了？',
        pinyin: 'Nǐ zěnme le?',
        translation: "What's wrong?",
      },
      {
        speaker: 'B (Patient)',
        text: '我过敏了。',
        pinyin: 'Wǒ guòmǐn le.',
        translation: 'I have an allergy.',
      },
      {
        speaker: 'A (Doctor)',
        text: '你对什么过敏？',
        pinyin: 'Nǐ duì shénme guòmǐn?',
        translation: 'What are you allergic to?',
      },
      {
        speaker: 'B (Patient)',
        text: '我对花生过敏。我的脸很痒，呼吸也不太好。',
        pinyin: 'Wǒ duì huāshēng guòmǐn. Wǒ de liǎn hěn yǎng, hūxī yě bú tài hǎo.',
        translation:
          "I'm allergic to peanuts. My face is very itchy and my breathing isn't very good either.",
      },
      {
        speaker: 'A (Doctor)',
        text: '我先量量你的体温。你的体温很高。晚上你住院吧。',
        pinyin: 'Wǒ xiān liángliang nǐ de tǐwēn. Nǐ de tǐwēn hěn gāo. Wǎnshang nǐ zhùyuàn ba.',
        translation:
          'Let me take your temperature first. Your temperature is high. You had better stay in the hospital tonight.',
      },
      {
        speaker: 'B (Patient)',
        text: '我要住几天？',
        pinyin: 'Wǒ yào zhù jǐ tiān?',
        translation: 'How many days do I need to stay?',
      },
      {
        speaker: 'A (Doctor)',
        text: '如果药有用，一天就行。',
        pinyin: 'Rúguǒ yào yǒuyòng, yì tiān jiù xíng.',
        translation: 'If the medicine works, one day will do.',
      },
    ],
  },

  // ============================================================
  // Lesson 30 - Translation Practice (都, 一定, 怕) 翻译练习：都、一定、怕
  // ============================================================
  {
    id: 'dlg-l30-01',
    title: 'What to Do with the Sofa and Bed',
    titleChinese: '沙发和床怎么办？',
    setting:
      'Two people who are moving house decide what to do with the furniture still left in the room.',
    lesson: 30,
    lines: [
      {
        speaker: 'Narrator',
        text: '他们在搬家。',
        pinyin: 'Tāmen zài bānjiā.',
        translation: 'They are moving house.',
      },
      {
        speaker: 'A',
        text: '房间里还有一个沙发和一张床，我们应该怎么办？',
        pinyin: 'Fángjiān li hái yǒu yí ge shāfā hé yì zhāng chuáng, wǒmen yīnggāi zěnme bàn?',
        translation: "There's still a sofa and a bed in the room. What should we do with them?",
      },
      {
        speaker: 'B',
        text: '都送给邻居吧。',
        pinyin: 'Dōu sòng gěi línjū ba.',
        translation: 'Give them both to the neighbour.',
      },
    ],
  },
  {
    id: 'dlg-l30-02',
    title: 'Paying by Scanning a Code',
    titleChinese: '扫码付款',
    setting:
      'A cashier gives the total and the customer asks whether they can pay by scanning a code.',
    lesson: 30,
    lines: [
      {
        speaker: 'A (Cashier)',
        text: '一共三百二十九块。您想怎么付款？',
        pinyin: 'Yígòng sānbǎi èrshíjiǔ kuài. Nín xiǎng zěnme fùkuǎn?',
        translation: "That's 329 yuan in total. How would you like to pay?",
      },
      {
        speaker: 'B (Customer)',
        text: '可以扫码吗？',
        pinyin: 'Kěyǐ sǎo mǎ ma?',
        translation: 'Can I scan a code?',
      },
      {
        speaker: 'A (Cashier)',
        text: '好的。支付宝和微信都可以。',
        pinyin: 'Hǎo de. Zhīfùbǎo hé Wēixìn dōu kěyǐ.',
        translation: 'Sure. Alipay and WeChat are both fine.',
      },
    ],
  },
  {
    id: 'dlg-l30-03',
    title: 'The Surprise Dinner',
    titleChinese: '惊喜的晚饭',
    setting:
      'A man tells how his plan for a surprise dinner with his wife was spoiled when his boss made him work overtime.',
    lesson: 30,
    lines: [
      {
        speaker: 'Narrator',
        text: '我和我妻子打算今天晚上去一家很有名的日本餐厅吃晚饭。',
        pinyin:
          'Wǒ hé wǒ qīzi dǎsuàn jīntiān wǎnshang qù yì jiā hěn yǒumíng de Rìběn cāntīng chī wǎnfàn.',
        translation:
          'My wife and I plan to go to a very famous Japanese restaurant for dinner tonight.',
      },
      {
        speaker: 'Narrator',
        text: '我订了位子，还买了礼物，想给她一个惊喜。',
        pinyin: 'Wǒ dìng le wèizi, hái mǎi le lǐwù, xiǎng gěi tā yí ge jīngxǐ.',
        translation: 'I booked a table and bought a gift to give her a surprise.',
      },
      {
        speaker: 'Narrator',
        text: '但是，我老板突然告诉我要加班。',
        pinyin: 'Dànshì, wǒ lǎobǎn tūrán gàosu wǒ yào jiābān.',
        translation: 'But my boss suddenly told me to work overtime.',
      },
      {
        speaker: 'Narrator',
        text: '我妻子打电话的时候，我在我老板的办公室，没能接电话。',
        pinyin:
          'Wǒ qīzi dǎ diànhuà de shíhou, wǒ zài wǒ lǎobǎn de bàngōngshì, méi néng jiē diànhuà.',
        translation:
          "When my wife called me, I was in my boss's office and could not answer the phone.",
      },
      {
        speaker: 'Narrator',
        text: '我妻子生气了，因为她打了五次电话，没有人接。',
        pinyin: 'Wǒ qīzi shēngqì le, yīnwèi tā dǎ le wǔ cì diànhuà, méiyǒu rén jiē.',
        translation:
          'My wife was very angry because she had called five times and nobody picked up.',
      },
    ],
  },

  // ============================================================
  // Lesson 31 - I'm Jogging 我正在跑步呢
  // ============================================================
  {
    id: 'dlg-l31-01',
    title: 'Plans to Watch the Game',
    titleChinese: '晚上去看球',
    setting:
      'Xītián phones Nuòmǐn, who is out jogging, to arrange an evening trip to watch a ball game.',
    lesson: 31,
    lines: [
      { speaker: 'A (Nuòmǐn)', text: '喂，你好！', pinyin: 'Wèi, nǐ hǎo!', translation: 'Hello!' },
      {
        speaker: 'B (Xītián)',
        text: '诺敏，我是西田。你在干吗呢？',
        pinyin: 'Nuòmǐn, wǒ shì Xītián. Nǐ zài gànmá ne?',
        translation: "Nuòmǐn, it's Xītián. What are you up to?",
      },
      {
        speaker: 'A (Nuòmǐn)',
        text: '我正在跑步呢。有事吗？',
        pinyin: 'Wǒ zhèngzài pǎobù ne. Yǒu shì ma?',
        translation: "I'm out jogging right now. What's up?",
      },
      {
        speaker: 'B (Xītián)',
        text: '我和大卫打算晚上去看球，你来吗？',
        pinyin: 'Wǒ hé Dàwèi dǎsuàn wǎnshang qù kàn qiú, nǐ lái ma?',
        translation:
          'David and I are planning to go and watch a ball game tonight. Are you coming?',
      },
      {
        speaker: 'A (Nuòmǐn)',
        text: '好啊。什么时候出发？',
        pinyin: 'Hǎo a. Shénme shíhou chūfā?',
        translation: 'Sure. When are we setting off?',
      },
      {
        speaker: 'B (Xītián)',
        text: '我现在在外边吃饭呢，六点半在宿舍门口见，怎么样？',
        pinyin: 'Wǒ xiànzài zài wàibian chī fàn ne, liù diǎn bàn zài sùshè ménkǒu jiàn, zěnmeyàng?',
        translation:
          "I'm eating outside right now. Shall we meet at the dormitory entrance at 6:30?",
      },
      {
        speaker: 'A (Nuòmǐn)',
        text: '好，不见不散。',
        pinyin: 'Hǎo, bújiàn búsàn.',
        translation: 'OK — see you there, no matter what.',
      },
    ],
  },
  {
    id: 'dlg-l31-02',
    title: 'Are You Still Asleep?',
    titleChinese: '你还在睡觉吗？',
    setting:
      'Dàshù teases Xītián for sleeping in until eleven, mentions that nobody picked up the phone last night, and invites Xītián to play basketball.',
    lesson: 31,
    lines: [
      {
        speaker: 'A (Dàshù)',
        text: '你还在睡觉吗？都十一点了。',
        pinyin: 'Nǐ hái zài shuìjiào ma? Dōu shíyī diǎn le.',
        translation: "Are you still asleep? It's already eleven o'clock.",
      },
      {
        speaker: 'B (Xītián)',
        text: '我昨天去看球了，睡得很晚。',
        pinyin: 'Wǒ zuótiān qù kàn qiú le, shuì de hěn wǎn.',
        translation: 'I went to watch a game yesterday and went to bed very late.',
      },
      {
        speaker: 'A (Dàshù)',
        text: '昨天晚上我给你打电话，一直没人接。',
        pinyin: 'Zuótiān wǎnshang wǒ gěi nǐ dǎ diànhuà, yìzhí méi rén jiē.',
        translation: 'I called you last night and nobody ever picked up.',
      },
      {
        speaker: 'B (Xītián)',
        text: '不好意思，你给我打电话的时候，我正在看球呢。',
        pinyin: 'Bù hǎoyìsi, nǐ gěi wǒ dǎ diànhuà de shíhou, wǒ zhèngzài kàn qiú ne.',
        translation: 'Sorry — when you called me, I was in the middle of watching the game.',
      },
      {
        speaker: 'A (Dàshù)',
        text: '下午两点跟我们一起去打篮球吧。',
        pinyin: 'Xiàwǔ liǎng diǎn gēn wǒmen yìqǐ qù dǎ lánqiú ba.',
        translation: 'Come and play basketball with us at two this afternoon.',
      },
      {
        speaker: 'B (Xītián)',
        text: '不行啊，我得去机场接朋友。',
        pinyin: 'Bùxíng a, wǒ děi qù jīchǎng jiē péngyou.',
        translation: "I can't — I have to go to the airport to pick up a friend.",
      },
      {
        speaker: 'A (Dàshù)',
        text: '那好吧，我们下次再约。',
        pinyin: 'Nà hǎo ba, wǒmen xiàcì zài yuē.',
        translation: "Oh well, let's arrange something another time.",
      },
    ],
  },
  {
    id: 'dlg-l31-03',
    title: 'Hello? Two Quick Calls',
    titleChinese: '喂？两个电话',
    setting:
      'Two short phone exchanges: one asks whether a teacher is at home, the other asks a friend what they are doing.',
    lesson: 31,
    lines: [
      {
        speaker: 'A',
        text: '喂，李老师在家吗？',
        pinyin: 'Wèi, Lǐ lǎoshī zài jiā ma?',
        translation: 'Hello, is Teacher Li at home?',
      },
      {
        speaker: 'B',
        text: '她不在家，去学校了。',
        pinyin: 'Tā bú zài jiā, qù xuéxiào le.',
        translation: "She isn't home — she's gone to school.",
      },
      {
        speaker: 'A',
        text: '喂，你在做什么呢？',
        pinyin: 'Wèi, nǐ zài zuò shénme ne?',
        translation: 'Hello, what are you doing?',
      },
      {
        speaker: 'B',
        text: '我在看书呢。',
        pinyin: 'Wǒ zài kàn shū ne.',
        translation: "I'm reading.",
      },
    ],
  },
  {
    id: 'dlg-l31-04',
    title: 'Still in Bed at Noon',
    titleChinese: '你怎么还没起床？',
    setting: 'A friend phones at noon to wake someone up and make plans to play tennis.',
    lesson: 31,
    lines: [
      { speaker: 'A', text: '喂，你好！', pinyin: 'Wèi, nǐ hǎo!', translation: 'Hello!' },
      {
        speaker: 'B',
        text: '早上好，你怎么还没起床？都十二点了！',
        pinyin: "Zǎoshang hǎo, nǐ zěnme hái méi qǐchuáng? Dōu shí'èr diǎn le!",
        translation: "Good morning! Why aren't you up yet? It's already twelve o'clock!",
      },
      {
        speaker: 'A',
        text: '我昨天晚上去唱歌了，唱到十一点。',
        pinyin: 'Wǒ zuótiān wǎnshang qù chànggē le, chàng dào shíyī diǎn.',
        translation: 'Last night I went singing, and I sang until eleven.',
      },
      {
        speaker: 'B',
        text: '今天我们去打网球，怎么样？',
        pinyin: 'Jīntiān wǒmen qù dǎ wǎngqiú, zěnmeyàng?',
        translation: "Let's go and play tennis today — how about it?",
      },
      {
        speaker: 'A',
        text: '好啊，咱们几点见？',
        pinyin: 'Hǎo a, zánmen jǐ diǎn jiàn?',
        translation: 'Sure! What time shall we meet?',
      },
      {
        speaker: 'B',
        text: '两点见，怎么样？',
        pinyin: 'Liǎng diǎn jiàn, zěnmeyàng?',
        translation: 'How about meeting at two?',
      },
      {
        speaker: 'A',
        text: '好，不见不散！',
        pinyin: 'Hǎo, bújiàn búsàn!',
        translation: 'OK — see you there, no matter what!',
      },
    ],
  },
  {
    id: 'dlg-l31-05',
    title: 'Our Kitten Is Sick',
    titleChinese: '我们的猫病了',
    setting:
      'Two people who share a cat talk on the phone: one is on the way to the pet hospital with the sick kitten, the other is in a meeting.',
    lesson: 31,
    lines: [
      {
        speaker: 'A',
        text: '喂，你忙吗？我们的猫病了，我们在去宠物医院的路上，你也马上来吧。',
        pinyin:
          'Wèi, nǐ máng ma? Wǒmen de māo bìng le, wǒmen zài qù chǒngwù yīyuàn de lùshang, nǐ yě mǎshàng lái ba.',
        translation:
          "Hello, are you busy? Our cat is sick — we're on the way to the pet hospital. Come right away too.",
      },
      {
        speaker: 'B',
        text: '小猫怎么了？早上还好好的。',
        pinyin: 'Xiǎomāo zěnme le? Zǎoshang hái hǎohǎo de.',
        translation: "What's wrong with the kitten? It was fine this morning.",
      },
      {
        speaker: 'A',
        text: '小猫吐了，我给兽医打了电话，他告诉我必须马上来宠物医院。',
        pinyin:
          'Xiǎomāo tù le, wǒ gěi shòuyī dǎ le diànhuà, tā gàosu wǒ bìxū mǎshàng lái chǒngwù yīyuàn.',
        translation:
          'The kitten threw up. I phoned the vet, who told me we have to come to the pet hospital right away.',
      },
      {
        speaker: 'B',
        text: '我正在开会呢，现在不能和你去医院。除了吐，小猫还有别的症状吗？',
        pinyin:
          'Wǒ zhèngzài kāihuì ne, xiànzài bù néng hé nǐ qù yīyuàn. Chúle tù, xiǎomāo hái yǒu biéde zhèngzhuàng ma?',
        translation:
          "I'm in a meeting right now, so I can't go to the hospital with you at the moment. Besides throwing up, does the kitten have any other symptoms?",
      },
      {
        speaker: 'A',
        text: '除了吐，它还发抖，一直叫。我不知道它怎么了，我很担心。下班以后马上来宠物医院吧。',
        pinyin:
          'Chúle tù, tā hái fādǒu, yìzhí jiào. Wǒ bù zhīdào tā zěnme le, wǒ hěn dānxīn. Xiàbān yǐhòu mǎshàng lái chǒngwù yīyuàn ba.',
        translation:
          "Besides throwing up, it's trembling and meowing non-stop. I don't know what's wrong with it, and I'm very worried. Come to the pet hospital right after work.",
      },
      {
        speaker: 'B',
        text: '好的，我下班以后就去。有事给我打电话。',
        pinyin: 'Hǎo de, wǒ xiàbān yǐhòu jiù qù. Yǒu shì gěi wǒ dǎ diànhuà.',
        translation: "OK, I'll go right after work. Call me if anything comes up.",
      },
      {
        speaker: 'A',
        text: '我现在就在给你打电话啊。',
        pinyin: 'Wǒ xiànzài jiù zài gěi nǐ dǎ diànhuà a.',
        translation: "I'm calling you right now!",
      },
      {
        speaker: 'B',
        text: '我的意思是医生检查完以后给我打电话。',
        pinyin: 'Wǒ de yìsi shì yīshēng jiǎnchá wán yǐhòu gěi wǒ dǎ diànhuà.',
        translation: 'What I mean is: call me after the doctor has finished examining it.',
      },
      { speaker: 'A', text: '好的。', pinyin: 'Hǎo de.', translation: 'OK.' },
      {
        speaker: 'B',
        text: '别担心，小猫会没事的。',
        pinyin: 'Bié dānxīn, xiǎomāo huì méishì de.',
        translation: "Don't worry — the kitten will be fine.",
      },
    ],
  },

  // ============================================================
  // Lesson 32 - It's So Hot Today 今天天气真热
  // ============================================================
  {
    id: 'dlg-l32-01',
    title: 'Hot in Beijing, Freezing in Moscow',
    titleChinese: '今天天气真热',
    setting:
      'Aihua and Dashu chat about the hot weather in Beijing and compare it with winter in Moscow.',
    lesson: 32,
    lines: [
      {
        speaker: 'Aihua',
        text: '今天天气真热！',
        pinyin: 'Jīntiān tiānqì zhēn rè!',
        translation: 'The weather is so hot today!',
      },
      {
        speaker: 'Dashu',
        text: '是啊。莫斯科的夏天也很热吗？',
        pinyin: 'Shì a. Mòsīkē de xiàtiān yě hěn rè ma?',
        translation: 'It is. Is summer in Moscow hot too?',
      },
      {
        speaker: 'Aihua',
        text: '那儿比北京凉快。',
        pinyin: 'Nàr bǐ Běijīng liángkuai.',
        translation: "It's cooler there than in Beijing.",
      },
      {
        speaker: 'Dashu',
        text: '听说莫斯科的冬天冷极了，是吗？',
        pinyin: 'Tīngshuō Mòsīkē de dōngtiān lěng jíle, shì ma?',
        translation: 'I hear winter in Moscow is extremely cold — is that right?',
      },
      {
        speaker: 'Aihua',
        text: '是，比北京冷多了。',
        pinyin: 'Shì, bǐ Běijīng lěng duō le.',
        translation: "Yes, it's much colder than Beijing.",
      },
      {
        speaker: 'Dashu',
        text: '大概多少度？',
        pinyin: 'Dàgài duōshao dù?',
        translation: 'Roughly how many degrees?',
      },
      {
        speaker: 'Aihua',
        text: '最低气温零下二十多度，不过我们习惯了，不怕冷。我冬天还在外边游过泳呢！',
        pinyin:
          'Zuìdī qìwēn língxià èrshí duō dù, búguò wǒmen xíguàn le, bú pà lěng. Wǒ dōngtiān hái zài wàibian yóuguo yǒng ne!',
        translation:
          "The lowest temperature is over twenty below zero, but we're used to it and aren't afraid of the cold. I've even gone swimming outdoors in winter!",
      },
    ],
  },
  {
    id: 'dlg-l32-02',
    title: 'Rain Again!',
    titleChinese: '又下雨了',
    setting:
      'Wang Xiaotian and a friend talk about the rainy weather and the football match planned for tomorrow.',
    lesson: 32,
    lines: [
      {
        speaker: 'Wang Xiaotian',
        text: '你看，又下雨了！',
        pinyin: 'Nǐ kàn, yòu xià yǔ le!',
        translation: "Look, it's raining again!",
      },
      {
        speaker: 'Friend',
        text: '是啊，最近常常下雨。',
        pinyin: 'Shì a, zuìjìn chángcháng xià yǔ.',
        translation: "Yes, it's been raining a lot lately.",
      },
      {
        speaker: 'Wang Xiaotian',
        text: '今年的雨比去年多多了。',
        pinyin: 'Jīnnián de yǔ bǐ qùnián duōduō le.',
        translation: "There's far more rain this year than last year.",
      },
      {
        speaker: 'Friend',
        text: '你看天气预报了吗？明天天气怎么样？',
        pinyin: 'Nǐ kàn tiānqì yùbào le ma? Míngtiān tiānqì zěnmeyàng?',
        translation:
          'Have you checked the weather forecast? What will the weather be like tomorrow?',
      },
      {
        speaker: 'Wang Xiaotian',
        text: '天气预报说，明天的雨比今天更大。',
        pinyin: 'Tiānqì yùbào shuō, míngtiān de yǔ bǐ jīntiān gèng dà.',
        translation: "The forecast says tomorrow's rain will be even heavier than today's.",
      },
      {
        speaker: 'Friend',
        text: '那咱们明天的足球比赛怎么办啊？',
        pinyin: 'Nà zánmen míngtiān de zúqiú bǐsài zěnme bàn a?',
        translation: 'Then what shall we do about our football match tomorrow?',
      },
      {
        speaker: 'Wang Xiaotian',
        text: '那只能下周再比了。',
        pinyin: 'Nà zhǐ néng xià zhōu zài bǐ le.',
        translation: 'Then we can only play it next week.',
      },
    ],
  },
  {
    id: 'dlg-l32-03',
    title: 'Eating Out and Takeaway',
    titleChinese: '我平时不常在家吃饭',
    setting: 'A short passage about where and how often the speaker eats.',
    lesson: 32,
    lines: [
      {
        speaker: 'Narrator',
        text: '我平时不常在家吃饭，经常在食堂吃饭，有时候也去饭馆或者快餐店。',
        pinyin:
          'Wǒ píngshí bù cháng zài jiā chī fàn, jīngcháng zài shítáng chī fàn, yǒushíhou yě qù fànguǎn huòzhě kuàicāndiàn.',
        translation:
          "I don't usually eat at home — I often eat in the canteen, and sometimes I go to a restaurant or a fast-food place.",
      },
      {
        speaker: 'Narrator',
        text: '周末我常常叫外卖。',
        pinyin: 'Zhōumò wǒ chángcháng jiào wàimài.',
        translation: 'At the weekend I often order takeaway.',
      },
      {
        speaker: 'Narrator',
        text: '外卖可以送到家里，特别方便。',
        pinyin: 'Wàimài kěyǐ sòngdào jiāli, tèbié fāngbiàn.',
        translation: 'Takeaway can be delivered to your home, which is especially convenient.',
      },
    ],
  },

  // ============================================================
  // Lesson 33 - Mid-Autumn Festival 中秋节
  // ============================================================
  {
    id: 'dlg-l33-01',
    title: "The Legend of Chang'e Flying to the Moon",
    titleChinese: '嫦娥奔月',
    setting: "A narrator retells the legend of Chang'e and Hou Yi in simple sentences.",
    lesson: 33,
    lines: [
      {
        speaker: 'Narrator',
        text: '很久以前，天上有十个太阳，天气太热了。',
        pinyin: 'Hěn jiǔ yǐqián, tiānshang yǒu shí ge tàiyáng, tiānqì tài rè le.',
        translation: 'Long ago there were ten suns in the sky, and the weather was far too hot.',
      },
      {
        speaker: 'Narrator',
        text: '后羿是一个神射手。他射下了九个太阳，救了人类，大家都说他是英雄。',
        pinyin:
          'Hòuyì shì yí ge shénshèshǒu. Tā shè xià le jiǔ ge tàiyáng, jiù le rénlèi, dàjiā dōu shuō tā shì yīngxióng.',
        translation:
          'Hou Yi was a master archer. He shot down nine suns and saved humankind, and everyone said he was a hero.',
      },
      {
        speaker: 'Narrator',
        text: '后羿和他的妻子嫦娥是一对好夫妻。',
        pinyin: "Hòuyì hé tā de qīzi Cháng'é shì yí duì hǎo fūqī.",
        translation: "Hou Yi and his wife Chang'e were a good married couple.",
      },
      {
        speaker: 'Narrator',
        text: '玉帝给了后羿一颗仙丹，吃了它，人就可以飞到天上。后羿请嫦娥保管。',
        pinyin:
          "Yùdì gěi le Hòuyì yì kē xiāndān, chī le tā, rén jiù kěyǐ fēi dào tiānshang. Hòuyì qǐng Cháng'é bǎoguǎn.",
        translation:
          "The Jade Emperor gave Hou Yi an elixir pill; whoever ate it could fly up to the heavens. Hou Yi asked Chang'e to keep it safe.",
      },
      {
        speaker: 'Narrator',
        text: '有一天，一个坏人来了，他想拿到仙丹。嫦娥不同意交出仙丹。',
        pinyin:
          "Yǒu yì tiān, yí ge huàirén lái le, tā xiǎng nádào xiāndān. Cháng'é bù tóngyì jiāochū xiāndān.",
        translation:
          "One day a villain came; he wanted to get the elixir. Chang'e did not agree to hand it over.",
      },
      {
        speaker: 'Narrator',
        text: '为了不让坏人拿到仙丹，嫦娥把它吃了。',
        pinyin: "Wèile bú ràng huàirén nádào xiāndān, Cháng'é bǎ tā chī le.",
        translation: "So that the villain would not get the elixir, Chang'e ate it.",
      },
      {
        speaker: 'Narrator',
        text: '她飞了起来，飞到了月亮上。月亮上有宫殿，还有一只小兔子陪伴她。',
        pinyin:
          'Tā fēi le qǐlái, fēi dào le yuèliang shang. Yuèliang shang yǒu gōngdiàn, hái yǒu yì zhī xiǎo tùzi péibàn tā.',
        translation:
          'She began to float, and flew up to the moon. There is a palace on the moon, and a little rabbit keeps her company.',
      },
      {
        speaker: 'Narrator',
        text: '后羿追不上嫦娥，他每天都看着月亮，思念她。',
        pinyin: "Hòuyì zhuībushàng Cháng'é, tā měi tiān dōu kàn zhe yuèliang, sīniàn tā.",
        translation:
          "Hou Yi could not catch up with Chang'e. Every day he looked at the moon and missed her.",
      },
      {
        speaker: 'Narrator',
        text: '所以每年中秋节，人们看着月亮，思念自己的家人。',
        pinyin: 'Suǒyǐ měi nián Zhōngqiūjié, rénmen kàn zhe yuèliang, sīniàn zìjǐ de jiārén.',
        translation:
          'So every year at the Mid-Autumn Festival, people look at the moon and think of their own families.',
      },
    ],
  },
  {
    id: 'dlg-l33-02',
    title: 'Mooncakes and Moon-Gazing',
    titleChinese: '吃月饼，赏月亮',
    setting:
      "Two friends greet each other on Mid-Autumn night and talk about family, mooncakes and the legend of Chang'e.",
    lesson: 33,
    lines: [
      {
        speaker: '玛丽',
        text: '小李，中秋节快乐！',
        pinyin: 'Xiǎo Lǐ, Zhōngqiūjié kuàilè!',
        translation: 'Xiao Li, happy Mid-Autumn Festival!',
      },
      {
        speaker: '小李',
        text: '中秋节快乐，玛丽！你看，今天的月亮真圆！',
        pinyin: 'Zhōngqiūjié kuàilè, Mǎlì! Nǐ kàn, jīntiān de yuèliang zhēn yuán!',
        translation: 'Happy Mid-Autumn Festival, Mary! Look, the moon is so round today!',
      },
      {
        speaker: '玛丽',
        text: '是啊。你们家今天晚上做什么？',
        pinyin: 'Shì a. Nǐmen jiā jīntiān wǎnshang zuò shénme?',
        translation: 'It is. What is your family doing tonight?',
      },
      {
        speaker: '小李',
        text: '我们一家人一起吃饭、吃月饼，然后赏月。',
        pinyin: 'Wǒmen yì jiā rén yìqǐ chī fàn, chī yuèbing, ránhòu shǎngyuè.',
        translation:
          'The whole family eats together, we eat mooncakes, and then we admire the moon.',
      },
      {
        speaker: '玛丽',
        text: '你的家人都在这儿吗？',
        pinyin: 'Nǐ de jiārén dōu zài zhèr ma?',
        translation: 'Is your family all here?',
      },
      {
        speaker: '小李',
        text: '爸爸妈妈在家，哥哥今天也从上海回来了。',
        pinyin: 'Bàba māma zài jiā, gēge jīntiān yě cóng Shànghǎi huílái le.',
        translation:
          'Mom and Dad are at home, and my older brother came back from Shanghai today too.',
      },
      {
        speaker: '玛丽',
        text: '太好了！一家人团圆真幸福。',
        pinyin: 'Tài hǎo le! Yì jiā rén tuányuán zhēn xìngfú.',
        translation: 'Great! A family reunion is such happiness.',
      },
      {
        speaker: '小李',
        text: '你呢？你想家吗？',
        pinyin: 'Nǐ ne? Nǐ xiǎng jiā ma?',
        translation: 'And you? Do you miss home?',
      },
      {
        speaker: '玛丽',
        text: '有点儿想。我很思念我的家人。',
        pinyin: 'Yǒudiǎnr xiǎng. Wǒ hěn sīniàn wǒ de jiārén.',
        translation: 'A little. I really miss my family.',
      },
      {
        speaker: '小李',
        text: '别难过，来我家吧。先吃块月饼。',
        pinyin: 'Bié nánguò, lái wǒ jiā ba. Xiān chī kuài yuèbing.',
        translation: "Don't be sad, come to my place. First have a mooncake.",
      },
      {
        speaker: '玛丽',
        text: '谢谢！你知道嫦娥的故事吗？',
        pinyin: "Xièxie! Nǐ zhīdào Cháng'é de gùshi ma?",
        translation: "Thanks! Do you know the story of Chang'e?",
      },
      {
        speaker: '小李',
        text: '知道。她吃了仙丹，飞到月亮上去了。',
        pinyin: 'Zhīdào. Tā chī le xiāndān, fēi dào yuèliang shang qù le.',
        translation: 'Yes. She ate the elixir and flew up to the moon.',
      },
      {
        speaker: '玛丽',
        text: '你看，月亮上好像有一只小兔子！',
        pinyin: 'Nǐ kàn, yuèliang shang hǎoxiàng yǒu yì zhī xiǎo tùzi!',
        translation: 'Look, it seems there is a little rabbit on the moon!',
      },
      {
        speaker: '小李',
        text: '对，它在陪伴嫦娥呢。',
        pinyin: "Duì, tā zài péibàn Cháng'é ne.",
        translation: "Yes, it is keeping Chang'e company.",
      },
    ],
  },
];
