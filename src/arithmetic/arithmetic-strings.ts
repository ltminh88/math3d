// Texts of arithmetic items for 7-9 year olds (vi source, KNTT terms; en mirror).
// Keys not found here come from reasoning-strings.ts ('stmtEq').
import { renderPromptWith, type Translator } from '../geometry/geometry-strings';
import { defineStrings } from '../i18n/i18n';
import { formatDigitRuns, formatNumber } from '../numbers/numbers-format';
import { renderPrompt as renderReasoningPrompt } from '../reasoning/reasoning-strings';
import type { PromptRef } from '../reasoning/reasoning-types';

const vi = {
  addCalc: 'Tính: {a} + {b}.',
  subCalc: 'Tính: {a} − {b}.',
  mentalCalc: 'Tính nhẩm: {expr}.',
  chainCalc: 'Tính: {expr}.',
  wpAddHave: '{name} có {a} {item}. {name} mua thêm {b} {item}.',
  wpSubGive: '{name} có {a} {item}. {name} cho bạn {b} {item}.',
  wpTwoStepAdd: '{name} có {a} {item}. {name} mua thêm {b} {item}, rồi mua thêm {c} {item}.',
  wpTwoStepLeft: '{name} có {a} {item}. {name} mua thêm {b} {item}, rồi cho bạn {c} {item}.',
  wpCompare: '{name} có {a} {item}. {name2} có {b} {item}.',
  errorAdd: '{name} tính: {a} + {b} = {shown}.',
  errorSub: '{name} tính: {a} − {b} = {shown}.',
  missingDigit: 'Tìm chữ số còn thiếu: {equation}',
  mulCalc: 'Tính: {a} × {b}.',
  divCalc: 'Tính: {a} : {b}.',
  divRemainderCalc: 'Tính: {a} : {b}.',
  wpMulGroups: '{name} có {n} hộp, mỗi hộp có {per} {item}.',
  wpMulTimes: '{name} có {a} {item}. {name2} có gấp {b} lần số {item} của {name}.',
  wpMulThenSub: '{name} có {n} hộp, mỗi hộp có {per} {item}. {name} dùng hết {c} {item}.',
  wpDivShare: '{name} có {a} {item}. {name} chia đều cho {b} bạn.',
  wpDivBoxes: '{name} có {a} {item}. Mỗi hộp đựng được {b} {item}.',
  wpReduceTimes: '{name} có {a} {unit}. {name} giảm số đó đi {b} lần.',
  errorMul: '{name} tính: {a} × {b} = {shown}.',
  errorDiv: '{name} tính: {a} : {b} = {shown}.',
  askSum: 'Tổng bằng bao nhiêu?',
  askDiff: 'Hiệu bằng bao nhiêu?',
  askResult: 'Kết quả là bao nhiêu?',
  askFirst: 'Tính {expr} bằng bao nhiêu?',
  askTotal: 'Hỏi {name} có tất cả bao nhiêu {item}?',
  askLeft: 'Hỏi {name} còn lại bao nhiêu {item}?',
  askMore: 'Hỏi {name} có nhiều hơn {name2} bao nhiêu {item}?',
  askAfterBuy: 'Sau khi mua thêm, {name} có tất cả bao nhiêu {item}?',
  askFinalTotal: 'Cuối cùng {name} có tất cả bao nhiêu {item}?',
  askFinalLeft: 'Cuối cùng {name} còn lại bao nhiêu {item}?',
  askMissingDigit: 'Chữ số còn thiếu là mấy?',
  isNameTrue: 'Bạn {name} tính đúng hay sai?',
  askCorrect: 'Kết quả đúng là bao nhiêu?',
  askProduct: 'Tích bằng bao nhiêu?',
  askQuotient: 'Thương bằng bao nhiêu?',
  askRemainder: 'Số dư bằng bao nhiêu?',
  askEach: 'Hỏi mỗi bạn được bao nhiêu {item}?',
  askBoxes: 'Hỏi cần ít nhất bao nhiêu hộp?',
  askLeftover: 'Hỏi còn dư bao nhiêu {item}?',
  askReduced: 'Hỏi còn lại bao nhiêu {unit}?',
  item_marble: 'viên bi',
  item_candy: 'cái kẹo',
  item_flower: 'bông hoa',
  item_book: 'quyển sách',
  item_apple: 'quả táo',
  item_fish: 'con cá',
  item_minute: 'phút',
  item_meter: 'm',
  item_ml: 'ml',
  item_gram: 'g',
};

const en = {
  addCalc: 'Work out: {a} + {b}.',
  subCalc: 'Work out: {a} − {b}.',
  mentalCalc: 'Work it out in your head: {expr}.',
  chainCalc: 'Work out: {expr}.',
  wpAddHave: '{name} has {a} {item}. {name} buys {b} more {item}.',
  wpSubGive: '{name} has {a} {item}. {name} gives {b} {item} to a friend.',
  wpTwoStepAdd: '{name} has {a} {item}. {name} buys {b} more {item}, then buys {c} more {item}.',
  wpTwoStepLeft:
    '{name} has {a} {item}. {name} buys {b} more {item}, then gives {c} {item} to a friend.',
  wpCompare: '{name} has {a} {item}. {name2} has {b} {item}.',
  errorAdd: '{name} worked out: {a} + {b} = {shown}.',
  errorSub: '{name} worked out: {a} − {b} = {shown}.',
  missingDigit: 'Find the missing digit: {equation}',
  mulCalc: 'Work out: {a} × {b}.',
  divCalc: 'Work out: {a} : {b}.',
  divRemainderCalc: 'Work out: {a} : {b}.',
  wpMulGroups: '{name} has {n} boxes with {per} {item} in each box.',
  wpMulTimes: '{name} has {a} {item}. {name2} has {b} times as many {item} as {name}.',
  wpMulThenSub: '{name} has {n} boxes with {per} {item} in each box. {name} uses {c} {item}.',
  wpDivShare: '{name} has {a} {item}. {name} shares them equally among {b} friends.',
  wpDivBoxes: '{name} has {a} {item}. Each box holds {b} {item}.',
  wpReduceTimes: '{name} has {a} {unit}. {name} reduces that number {b} times.',
  errorMul: '{name} worked out: {a} × {b} = {shown}.',
  errorDiv: '{name} worked out: {a} : {b} = {shown}.',
  askSum: 'What is the sum?',
  askDiff: 'What is the difference?',
  askResult: 'What is the result?',
  askFirst: 'What is {expr}?',
  askTotal: 'How many {item} does {name} have in all?',
  askLeft: 'How many {item} does {name} have left?',
  askMore: 'How many more {item} does {name} have than {name2}?',
  askAfterBuy: 'After buying more, how many {item} does {name} have in all?',
  askFinalTotal: 'In the end, how many {item} does {name} have in all?',
  askFinalLeft: 'In the end, how many {item} does {name} have left?',
  askMissingDigit: 'What is the missing digit?',
  isNameTrue: 'Did {name} work it out right or wrong?',
  askCorrect: 'What is the right answer?',
  askProduct: 'What is the product?',
  askQuotient: 'What is the quotient?',
  askRemainder: 'What is the remainder?',
  askEach: 'How many {item} does each friend get?',
  askBoxes: 'How many boxes are needed at least?',
  askLeftover: 'How many {item} are left over?',
  askReduced: 'How many {unit} are left?',
  item_marble: 'marbles',
  item_candy: 'sweets',
  item_flower: 'flowers',
  item_book: 'books',
  item_apple: 'apples',
  item_fish: 'fish',
  item_minute: 'minutes',
  item_meter: 'm',
  item_ml: 'ml',
  item_gram: 'g',
};

const ns = defineStrings('arithmetic', { vi, en });

type Key = Parameters<typeof ns>[0];

/** Groups a missing-digit equation SGK-style, counting '?' as a digit (45 6?8). */
function groupWithBlank(text: string): string {
  return text.replace(/[\d?]{4,}/g, (run) => {
    const groups: string[] = [];
    for (let i = run.length; i > 0; i -= 3) groups.unshift(run.slice(Math.max(0, i - 3), i));
    return groups.join(' ');
  });
}

/** Display copy of a prompt: numbers ≥ 1000 render SGK-grouped, data stays plain digits. */
function displayPrompt(prompt: PromptRef): PromptRef {
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(prompt.params ?? {}))
    params[name] =
      typeof value === 'number'
        ? formatNumber(value)
        : typeof value === 'string'
          ? name === 'equation'
            ? groupWithBlank(value)
            : formatDigitRuns(value)
          : value;
  return { ...prompt, params };
}

/**
 * Renders an arithmetic prompt; 'stmtEq' comes from reasoning. Every number the child
 * sees is grouped SGK-style (12 345, 70 000 + 7 000) — the params themselves stay plain,
 * so oracles and the number pad keep comparing numbers.
 */
export const renderArithmeticPrompt = (prompt: PromptRef): string => {
  const shown = displayPrompt(prompt);
  if (shown.key in vi) return renderPromptWith(ns as Translator, shown);
  return renderReasoningPrompt(shown);
};

export type ArithmeticKey = Key;
