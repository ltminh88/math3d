// Texts of numbers items for 7-9 year olds (vi source, KNTT terms; en mirror). Keys not found
// here come from geometry-strings.ts ('num') or reasoning-strings.ts ('expr', 'stmtEq').
import {
  renderGeometryPrompt,
  renderPromptWith,
  type Translator,
} from '../geometry/geometry-strings';
import { defineStrings } from '../i18n/i18n';
import { renderPrompt as renderReasoningPrompt } from '../reasoning/reasoning-strings';
import type { PromptRef } from '../reasoning/reasoning-types';
import { formatDigitRuns, formatNumber } from './numbers-format';

const vi = {
  readWords: 'Số đọc là “{words}”.',
  writeWords: 'Số {n} viết bằng chữ thế nào?',
  matchParts3: 'Số gồm {a} trăm {b} chục {c} đơn vị. Viết số đó.',
  matchParts4: 'Số gồm {a} nghìn {b} trăm {c} chục {d} đơn vị. Viết số đó.',
  matchParts5: 'Số gồm {a} chục nghìn {b} nghìn {c} trăm {d} chục {e} đơn vị. Viết số đó.',
  digitAtPlace: 'Số {n} có chữ số hàng {place} là mấy?',
  expandSum: 'Viết số {n} thành tổng các hàng.',
  neighbors: 'Tìm số liền trước và số liền sau của {n}.',
  neighborsTrio: 'Dãy ba số liên tiếp: {a}, {b}, ?',
  sequence: 'Dãy số: {a}, {b}, ?, {d}.',
  sequenceTwoGaps: 'Dãy số: {a}, ? (ô A), {c}, ? (ô B).',
  compare: 'So sánh hai số: {a} và {b}.',
  compareExpr: 'So sánh: {a} và {expr}.',
  orderAsc: 'Sắp xếp các số sau theo thứ tự tăng dần: {list}.',
  orderDesc: 'Sắp xếp các số sau theo thứ tự giảm dần: {list}.',
  maxMin: 'Trong các số: {list}.',
  expandFill: 'Số {n} viết thành tổng: {x} + ? + {y}.',
  expandVerdict: 'Bạn An viết số {n} thành tổng {sum}.',
  isAnTrue: 'Bạn An nói đúng hay sai?',
  makeMaxMin: 'Dùng các chữ số {digits} để lập số.',
  askWrite: 'Viết số đó.',
  askReading: 'Chọn cách đọc đúng:',
  askDigit: 'Chữ số đó là mấy?',
  askExpanded: 'Chọn cách viết đúng thành tổng:',
  askPrev: 'Số liền trước là mấy?',
  askNext: 'Số liền sau là mấy?',
  askMissing: 'Số còn thiếu là mấy?',
  askMissingArabic: 'Số còn thiếu là mấy? Viết bằng chữ số thường (ví dụ 7).',
  askMissingLabel: 'Số ở ô {label} là mấy?',
  askCompare: 'Chọn dấu đúng:',
  askOrder: 'Số {ord} ({pos}) là?',
  askLast: 'Số cuối cùng ({pos}) là?',
  askMax: 'Số nào lớn nhất?',
  askMin: 'Số nào bé nhất?',
  askFill: 'Số còn thiếu trong tổng là mấy?',
  askLargest: 'Số lớn nhất lập được là?',
  askSmallest: 'Số bé nhất lập được là?',
  askSum: 'Tổng đó bằng bao nhiêu?',
  roundAsk: 'Làm tròn số {n} đến hàng {place} được số nào?',
  roundWhichPlace: 'Số {n} làm tròn được {r}.',
  romanToNumber: 'Số La Mã {roman} bằng bao nhiêu?',
  numberToRoman: 'Số {n} viết bằng số La Mã là gì?',
  romanSequence: 'Dãy số La Mã: {seq}.',
  romanText: '{r}',
  askRound: 'Chọn số đúng:',
  askRoman: 'Chọn số La Mã đúng:',
  askPlace: 'Làm tròn đến hàng nào?',
  wordsText: '{w}',
  signGt: '>',
  signLt: '<',
  signEq: '=',
  item_ones: 'đơn vị',
  item_tens: 'chục',
  item_hundreds: 'trăm',
  item_thousands: 'nghìn',
  item_tenThousands: 'chục nghìn',
  item_first: 'thứ nhất',
  item_second: 'thứ hai',
  item_third: 'thứ ba',
  item_smallest: 'bé nhất',
  item_largest: 'lớn nhất',
  item_next: 'tiếp theo',
};

const en = {
  readWords: 'The number reads “{words}”.',
  writeWords: 'How is {n} written in words?',
  matchParts3: 'The number has {a} hundreds, {b} tens and {c} ones. Write it.',
  matchParts4: 'The number has {a} thousands, {b} hundreds, {c} tens and {d} ones. Write it.',
  matchParts5:
    'The number has {a} ten thousands, {b} thousands, {c} hundreds, {d} tens and {e} ones. Write it.',
  digitAtPlace: 'In {n}, what is the digit in the {place} place?',
  expandSum: 'Write {n} as a sum of place values.',
  neighbors: 'Find the number just before and just after {n}.',
  neighborsTrio: 'Three numbers in a row: {a}, {b}, ?',
  sequence: 'The sequence: {a}, {b}, ?, {d}.',
  sequenceTwoGaps: 'The sequence: {a}, ? (box A), {c}, ? (box B).',
  compare: 'Compare the two numbers: {a} and {b}.',
  compareExpr: 'Compare: {a} and {expr}.',
  orderAsc: 'Order these numbers from smallest to largest: {list}.',
  orderDesc: 'Order these numbers from largest to smallest: {list}.',
  maxMin: 'Among these numbers: {list}.',
  expandFill: '{n} as a sum: {x} + ? + {y}.',
  expandVerdict: 'An writes {n} as the sum {sum}.',
  isAnTrue: 'Is An right or wrong?',
  makeMaxMin: 'Use the digits {digits} to make a number.',
  askWrite: 'Write that number.',
  askReading: 'Pick the right reading:',
  askDigit: 'What is that digit?',
  askExpanded: 'Pick the right sum:',
  askPrev: 'What is the number just before?',
  askNext: 'What is the number just after?',
  askMissing: 'What is the missing number?',
  askMissingArabic: 'What is the missing number? Write it in ordinary numbers (for example 7).',
  askMissingLabel: 'What is the number in box {label}?',
  askCompare: 'Pick the right sign:',
  askOrder: 'The {ord} number ({pos}) is?',
  askLast: 'The last number ({pos}) is?',
  askMax: 'Which number is the largest?',
  askMin: 'Which number is the smallest?',
  askFill: 'What is the missing term of the sum?',
  askLargest: 'What is the largest number you can make?',
  askSmallest: 'What is the smallest number you can make?',
  askSum: 'What does that sum equal?',
  roundAsk: 'What does {n} round to at the {place} place?',
  roundWhichPlace: 'Rounding {n} gives {r}.',
  romanToNumber: 'What is the Roman numeral {roman} in numbers?',
  numberToRoman: 'How is {n} written in Roman numerals?',
  romanSequence: 'The Roman sequence: {seq}.',
  romanText: '{r}',
  askRound: 'Pick the right number:',
  askRoman: 'Pick the right Roman numeral:',
  askPlace: 'Rounded to which place?',
  wordsText: '{w}',
  signGt: '>',
  signLt: '<',
  signEq: '=',
  item_ones: 'ones',
  item_tens: 'tens',
  item_hundreds: 'hundreds',
  item_thousands: 'thousands',
  item_tenThousands: 'ten thousands',
  item_first: 'first',
  item_second: 'second',
  item_third: 'third',
  item_smallest: 'smallest',
  item_largest: 'largest',
  item_next: 'next',
};

const ns = defineStrings('numbers', { vi, en });

type Key = Parameters<typeof ns>[0];

/** Display copy of a prompt: numbers ≥ 1000 render SGK-grouped, data stays plain digits. */
function displayPrompt(prompt: PromptRef): PromptRef {
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(prompt.params ?? {}))
    params[name] =
      typeof value === 'number'
        ? formatNumber(value)
        : typeof value === 'string'
          ? formatDigitRuns(value)
          : value;
  return { ...prompt, params };
}

/**
 * Renders a numbers prompt; 'num' comes from geometry, 'expr'/'stmtEq' from reasoning.
 * Every number the child sees is grouped SGK-style (77 224, 70 000 + 7 000) — the
 * params themselves stay plain, so oracles and the number pad keep comparing numbers.
 */
export const renderNumbersPrompt = (prompt: PromptRef): string => {
  const shown = displayPrompt(prompt);
  if (shown.key in vi) return renderPromptWith(ns as Translator, shown);
  if (shown.key === 'num') return renderGeometryPrompt(shown);
  return renderReasoningPrompt(shown);
};

export type NumbersKey = Key;
