// numberToVietnameseWords (phase 07): the hand-written oracle table the author reviews
// (KNTT reading rules: "lẻ", "mốt", "tư", "lăm", "không trăm"), plus a round-trip through
// the independent parser in numbers-test-oracles.ts. RED-first: the helper does not exist yet.
import { describe, expect, it } from 'vitest';
import { numberToVietnameseWords } from './number-words-vi';
import { wordsToNumber } from './numbers-test-oracles';

const TABLE: readonly (readonly [number, string])[] = [
  [0, 'không'],
  [1, 'một'],
  [5, 'năm'],
  [9, 'chín'],
  [10, 'mười'],
  [11, 'mười một'],
  [15, 'mười lăm'],
  [19, 'mười chín'],
  [20, 'hai mươi'],
  [21, 'hai mươi mốt'],
  [24, 'hai mươi tư'],
  [25, 'hai mươi lăm'],
  [26, 'hai mươi sáu'],
  [99, 'chín mươi chín'],
  [100, 'một trăm'],
  [101, 'một trăm lẻ một'],
  [105, 'một trăm lẻ năm'],
  [110, 'một trăm mười'],
  [115, 'một trăm mười lăm'],
  [121, 'một trăm hai mươi mốt'],
  [200, 'hai trăm'],
  [999, 'chín trăm chín mươi chín'],
  [1000, 'một nghìn'],
  [1001, 'một nghìn không trăm lẻ một'],
  [1005, 'một nghìn không trăm lẻ năm'],
  [1010, 'một nghìn không trăm mười'],
  [1100, 'một nghìn một trăm'],
  [2000, 'hai nghìn'],
  [9999, 'chín nghìn chín trăm chín mươi chín'],
  [10000, 'mười nghìn'],
  [10001, 'mười nghìn không trăm lẻ một'],
  [10010, 'mười nghìn không trăm mười'],
  [10100, 'mười nghìn một trăm'],
  [11000, 'mười một nghìn'],
  [20000, 'hai mươi nghìn'],
  [21000, 'hai mươi mốt nghìn'],
  [12345, 'mười hai nghìn ba trăm bốn mươi lăm'],
  [99999, 'chín mươi chín nghìn chín trăm chín mươi chín'],
  [100000, 'một trăm nghìn'],
];

describe('numberToVietnameseWords', () => {
  it.each(TABLE)('%d reads "%s"', (n, words) => {
    expect(numberToVietnameseWords(n)).toBe(words);
  });

  it('round-trips through the independent parser', () => {
    for (let n = 0; n <= 999; n++) expect(wordsToNumber(numberToVietnameseWords(n))).toBe(n);
    for (let n = 1000; n <= 100000; n += 137)
      expect(wordsToNumber(numberToVietnameseWords(n))).toBe(n);
  });

  it('rejects out-of-range numbers', () => {
    expect(() => numberToVietnameseWords(-1)).toThrow();
    expect(() => numberToVietnameseWords(100001)).toThrow();
    expect(() => numberToVietnameseWords(1.5)).toThrow();
  });
});
