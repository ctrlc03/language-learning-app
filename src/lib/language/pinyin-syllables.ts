/**
 * Splits written pinyin into syllables: "Wǒ shì xuésheng." → wǒ · shì · xué · sheng.
 * Course pinyin joins the syllables of a word, so boundaries come from the table
 * of Mandarin syllables (fewest syllables wins, as the apostrophe rule assumes:
 * "xian" is one syllable, "Xī'ān" two). An erhua r stays with its syllable (diǎnr).
 */

// Every standard Mandarin syllable without its tone, ü written v. lue / nue
// are common spellings of lüe / nüe; ng, hm and hng are interjections (嗯).
const SYLLABLES = new Set(
  `a ai an ang ao e ei en eng er o ou ng hm hng
  ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu
  pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu
  ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu
  fa fan fang fei fen feng fo fou fu
  da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo
  ta tai tan tang tao te tei teng ti tian tiao tie ting tong tou tu tuan tui tun tuo
  na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nun nuo nv nve nue
  la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lv lve lue
  ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo
  ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo
  ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo
  ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun
  qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun
  xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun
  zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo
  cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo
  sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo
  ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo
  za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo
  ca cai can cang cao ce cen ceng ci cong cou cu cuan cui cun cuo
  sa sai san sang sao se sen seng si song sou su suan sui sun suo
  ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun
  wa wai wan wang wei wen weng wo wu`.split(/\s+/),
);
const LONGEST = 6; // zhuang, chuang, shuang

const TONE_MARKS: Record<string, number> = { '\u0304': 1, '\u0301': 2, '\u030C': 3, '\u0300': 4 };
const DIAERESIS = '\u0308';

export interface PinyinSyllable {
  /** Lowercase letters without the tone, ü written v; an erhua r is kept ("dianr"). */
  letters: string;
  /** 1–4 from the tone mark; 0 when unmarked (neutral tone). */
  tone: number;
  /** The syllable as written: "Xué", "diǎnr". */
  text: string;
}

interface Letter {
  ch: string;
  tone: number;
  /** Span in the NFD source. */
  from: number;
  to: number;
}

/** End offsets of the syllables in a run of letters, or null when it isn't pinyin. */
function syllabify(letters: string): number[] | null {
  const n = letters.length;
  const cost = new Array<number>(n + 1).fill(Infinity);
  const back = new Array<number>(n + 1).fill(-1);
  cost[0] = 0;
  for (let i = 0; i < n; i++) {
    if (cost[i] === Infinity) continue;
    for (let len = 1; len <= Math.min(LONGEST, n - i); len++) {
      const piece = letters.slice(i, i + len);
      // An erhua r only follows a syllable; it costs a piece, so real syllables win ties.
      if (!SYLLABLES.has(piece) && !(piece === 'r' && i > 0)) continue;
      if (cost[i] + 1 < cost[i + len]) {
        cost[i + len] = cost[i] + 1;
        back[i + len] = i;
      }
    }
  }
  if (cost[n] === Infinity) return null;
  const ends: number[] = [];
  for (let end = n; end > 0; end = back[end]) ends.unshift(end);
  return ends;
}

/**
 * Syllables of tone-marked pinyin. Spaces, apostrophes and punctuation separate
 * runs; capitals are folded. Returns null when the text isn't pinyin (digits,
 * other scripts, or letters that don't split into syllables).
 */
export function parsePinyin(written: string): PinyinSyllable[] | null {
  const source = written.normalize('NFD');
  const out: PinyinSyllable[] = [];
  let run: Letter[] = [];

  const flush = (): boolean => {
    if (run.length === 0) return true;
    const ends = syllabify(run.map((l) => l.ch).join(''));
    if (!ends) return false;
    let start = 0;
    for (const end of ends) {
      const part = run.slice(start, end);
      const letters = part.map((l) => l.ch).join('');
      const text = source.slice(part[0].from, part[part.length - 1].to).normalize('NFC');
      const prev = out[out.length - 1];
      if (letters === 'r' && start > 0 && prev) {
        prev.letters += letters;
        prev.text += text;
      } else {
        out.push({ letters, tone: part.find((l) => l.tone)?.tone ?? 0, text });
      }
      start = end;
    }
    run = [];
    return true;
  };

  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    const lower = c.toLowerCase();
    const last = run[run.length - 1];
    if (lower >= 'a' && lower <= 'z') {
      run.push({ ch: lower, tone: 0, from: i, to: i + 1 });
    } else if (c in TONE_MARKS || c === DIAERESIS) {
      if (!last) return null;
      if (c === DIAERESIS) last.ch = 'v';
      else last.tone = TONE_MARKS[c];
      last.to = i + 1;
    } else if (/[\p{L}\p{N}]/u.test(c)) {
      return null;
    } else if (!flush()) {
      return null;
    }
  }
  return flush() ? out : null;
}
