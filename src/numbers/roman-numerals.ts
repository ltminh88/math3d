// Roman numerals I..XX (phase 08, B47): the only Roman range in the book (I, V, X;
// IV, IX, XIV, XIX). Pure converter; the test oracle is an independent hand table.
export const ROMAN_MAX = 20;

const ROMAN_DIGITS: readonly [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/** 1..20 as a Roman numeral; throws outside the range. */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > ROMAN_MAX)
    throw new Error(`toRoman: ${n} is outside I..XX`);
  let rest = n;
  let out = '';
  for (const [value, digit] of ROMAN_DIGITS) {
    while (rest >= value) {
      out += digit;
      rest -= value;
    }
  }
  return out;
}

/** A strict Roman numeral I..XX back to a number; throws on anything else. */
export function fromRoman(s: string): number {
  if (s === '') throw new Error('fromRoman: empty numeral');
  let rest = s;
  let n = 0;
  for (const [value, digit] of ROMAN_DIGITS) {
    while (rest.startsWith(digit)) {
      n += value;
      rest = rest.slice(digit.length);
    }
  }
  if (rest !== '' || n < 1 || n > ROMAN_MAX || toRoman(n) !== s)
    throw new Error(`fromRoman: ${s} is not a numeral I..XX`);
  return n;
}
