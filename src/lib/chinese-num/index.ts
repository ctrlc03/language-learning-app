/**
 * Chinese number / money / date rendering for the numbers drill. Converts an
 * integer to its Chinese numeral form (with 零 insertion and the 十 leading
 * rule) so we can quiz reading spoken/written numbers back to digits.
 *
 * Uses 二 (not 两) throughout for simplicity — both are understood; 两 is a
 * colloquial variant that doesn't change the digit answer.
 */

const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const SMALL_UNITS = ['', '十', '百', '千'];

/** Convert 0–9999 to Chinese (no 万 grouping). */
function under10000(n: number): string {
  if (n === 0) return '';
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
    if (pos === 1 && d === 1 && !started) {
      out += SMALL_UNITS[pos];
    } else {
      out += DIGITS[d] + SMALL_UNITS[pos];
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

  if (wan === 0) return under10000(rest);

  let out = under10000(wan) + '万';
  if (rest === 0) return out;
  // A gap of a whole place group needs a 零: 10001 → 一万零一.
  if (rest < 1000) out += '零';
  out += under10000(rest);
  return out;
}

/** Money in yuan.jiao (e.g. 12.5 → 十二块五毛). Rounds to one jiao. */
export function moneyToChinese(yuan: number, jiao: number): string {
  if (yuan === 0 && jiao === 0) return '零块';
  let out = '';
  if (yuan > 0) out += numberToChinese(yuan) + '块';
  if (jiao > 0) out += numberToChinese(jiao) + '毛';
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
