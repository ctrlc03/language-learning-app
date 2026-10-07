/**
 * Chinese number / money / date rendering for the numbers drill. Converts an
 * integer to its Chinese numeral form (with 零 insertion and the 十 leading
 * rule) so we can quiz reading spoken/written numbers back to digits.
 *
 * Reads 2 as 两 where Mandarin does: before a measure word (两块, 两毛) and
 * before 千/万 (两千, 两万, 一万两千). 二 stays in 十二, 二十, 二十二 and in dates
 * (二月, 二号). 百 takes 两 when it opens the number (两百) and 二 after a
 * larger place (两千二百); 二百 and 两百 are interchangeable to a listener.
 */

const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const SMALL_UNITS = ['', '十', '百', '千'];

/**
 * Convert 1–9999 to Chinese (no 万 grouping). `leading` is true when nothing
 * is read before this group, which is when 十 drops its 一 (十二) and 百 may
 * take 两.
 */
function under10000(n: number, leading: boolean): string {
  let out = '';
  let zeroRun = false;
  let started = false;
  for (let pos = 3; pos >= 0; pos--) {
    const place = Math.pow(10, pos);
    const d = Math.floor(n / place) % 10;
    if (d === 0) {
      if (started) zeroRun = true;
      continue;
    }
    if (zeroRun) out += '零';
    zeroRun = false;
    // Leading tens (10–19) drop the 一: 十二 not 一十二.
    if (pos === 1 && d === 1 && !started && leading) {
      out += SMALL_UNITS[pos];
    } else {
      const liang = d === 2 && (pos === 3 || (pos === 2 && leading && !started));
      out += (liang ? '两' : DIGITS[d]) + SMALL_UNITS[pos];
    }
    started = true;
  }
  return out;
}

/** Convert 0–99,999,999 to Chinese numerals. */
export function numberToChinese(n: number): string {
  if (n === 0) return '零';
  if (n < 0) return '负' + numberToChinese(-n);

  const wan = Math.floor(n / 10000);
  const rest = n % 10000;

  if (wan === 0) return under10000(rest, true);

  let out = (wan === 2 ? '两' : under10000(wan, true)) + '万';
  if (rest === 0) return out;
  // A gap of a whole place group needs a 零: 10001 → 一万零一.
  if (rest < 1000) out += '零';
  out += under10000(rest, false);
  return out;
}

/** Money in yuan.jiao (e.g. 12.5 → 十二块五毛; 2 → 两块). */
export function moneyToChinese(yuan: number, jiao: number): string {
  if (yuan === 0 && jiao === 0) return '零块';
  // A bare 2 sits directly before the measure word, so it is 两.
  const amount = (n: number) => (n === 2 ? '两' : numberToChinese(n));
  let out = '';
  if (yuan > 0) out += amount(yuan) + '块';
  if (jiao > 0) out += amount(jiao) + '毛';
  return out;
}

export const WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
export const WEEKDAYS_EN = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** A date like 2026年7月8日 using Chinese numerals. */
export function dateToChinese(year: number, month: number, day: number): string {
  const yearStr = String(year)
    .split('')
    .map((c) => DIGITS[Number(c)])
    .join('');
  return `${yearStr}年${numberToChinese(month)}月${numberToChinese(day)}日`;
}
