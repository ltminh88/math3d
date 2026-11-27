// Texts of arithmetic items for 7-9 year olds (vi source, KNTT terms; en mirror).
// Keys not found here come from reasoning-strings.ts ('stmtEq').
import { renderPromptWith, type Translator } from '../geometry/geometry-strings';
import { defineStrings } from '../i18n/i18n';
import { formatDigitRuns, formatNumber } from '../numbers/numbers-format';
import { renderPrompt as renderReasoningPrompt } from '../reasoning/reasoning-strings';
import type { PromptRef } from '../reasoning/reasoning-types';
import { addSubFormatStrings } from './add-sub-format-strings';

const vi = {
  addCalc: 'Tính: {a} + {b}.',
  subCalc: 'Tính: {a} − {b}.',
  mentalCalc: 'Tính nhẩm: {expr}.',
  chainCalc: 'Tính: {expr}.',
  wpAddHave: '{name} có {a} {item}. {name} mua thêm {b} {item}.',
  wpSubGive: '{name} có {a} {item}. {name} cho bạn {b} {item}.',
  wpSubGiveOut: '{name} có {a} {item}. {name} xuất đi {b} {item}.',
  wpSubGiveLend: '{name} có {a} {item}. {name} cho mượn {b} {item}.',
  wpSubGiveHandout: '{name} có {a} {item}. {name} phát cho học sinh {b} {item}.',
  wpTwoStepAdd: '{name} có {a} {item}. {name} mua thêm {b} {item}, rồi mua thêm {c} {item}.',
  wpTwoStepLeft: '{name} có {a} {item}. {name} mua thêm {b} {item}, rồi cho bạn {c} {item}.',
  wpTwoStepLeftOut: '{name} có {a} {item}. {name} mua thêm {b} {item}, rồi xuất đi {c} {item}.',
  wpTwoStepLeftLend: '{name} có {a} {item}. {name} mua thêm {b} {item}, rồi cho mượn {c} {item}.',
  wpTwoStepLeftHandout:
    '{name} có {a} {item}. {name} mua thêm {b} {item}, rồi phát cho học sinh {c} {item}.',
  wpCompare: '{name} có {a} {item}. {name2} có {b} {item}.',
  errorAdd: '{name} tính: {a} + {b} = {shown}.',
  errorSub: '{name} tính: {a} − {b} = {shown}.',
  missingDigit: 'Tìm chữ số còn thiếu: {equation}',
  mulCalc: 'Tính: {a} × {b}.',
  divCalc: 'Tính: {a} : {b}.',
  divRemainderCalc: 'Tính: {a} : {b}.',
  wpMulGroups: '{name} có {n} hộp, mỗi hộp có {per} {item}.',
  wpMulTimesRice: 'Kho A có {a} kg gạo. Kho B có gấp {b} lần số gạo của kho A.',
  wpMulTimesBooks:
    'Thư viện A có {a} quyển sách. Thư viện B có gấp {b} lần số sách của thư viện A.',
  wpMulTimesStudents: 'Trường A có {a} học sinh. Trường B có gấp {b} lần số học sinh của trường A.',
  wpMulThenSubRice: 'Kho mua {n} bao, mỗi bao có {per} kg gạo. Kho xuất đi {c} kg gạo.',
  wpMulThenSubBooks:
    'Thư viện mua {n} thùng, mỗi thùng có {per} quyển sách. Thư viện cho mượn {c} quyển sách.',
  wpMulThenSubSchool:
    'Trường mua {n} thùng, mỗi thùng có {per} quyển sách. Trường phát cho học sinh {c} quyển sách.',
  wpDivShare: '{name} có {a} {item}. {name} chia đều cho {b} bạn.',
  wpDivBoxes: '{name} có {a} {item}. Mỗi hộp đựng được {b} {item}.',
  wpReduceTimes: 'Giảm {a} {unit} đi {b} lần thì được bao nhiêu {unit}?',
  wpMoneyChange:
    '{name} mua {n} {item}. Mỗi {item} giá {per} đồng. {name} đưa cho người bán {paid} đồng.',
  wpCompareLarge: 'Ba phép tính: {expr1}; {expr2}; {expr3}.',
  askSpent: 'Mua hết tất cả bao nhiêu đồng?',
  askChange: 'Người bán thối lại bao nhiêu đồng?',
  askMaxResult: 'Kết quả nào lớn nhất?',
  askMinResult: 'Kết quả nào bé nhất?',
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
  askTotalBoughtRice: 'Kho mua về tất cả bao nhiêu kg gạo?',
  askTotalBoughtBooks: 'Thư viện mua về tất cả bao nhiêu quyển sách?',
  askTotalBoughtSchool: 'Trường mua về tất cả bao nhiêu quyển sách?',
  askFinalLeftBig: 'Cuối cùng còn lại bao nhiêu {item}?',
  askTotalRice: 'Hỏi kho B có tất cả bao nhiêu kg gạo?',
  askTotalBooks: 'Hỏi thư viện B có tất cả bao nhiêu quyển sách?',
  askTotalStudents: 'Hỏi trường B có tất cả bao nhiêu học sinh?',
  askFinalTotal: 'Cuối cùng {name} có tất cả bao nhiêu {item}?',
  askFinalLeft: 'Cuối cùng {name} còn lại bao nhiêu {item}?',
  askMissingDigit: 'Chữ số còn thiếu là mấy?',
  isNameTrue: 'Bạn {name} tính đúng hay sai?',
  askCorrect: 'Kết quả đúng là bao nhiêu?',
  askProduct: 'Tích bằng bao nhiêu?',
  askQuotient: 'Thương bằng bao nhiêu?',
  askRemainder: 'Số dư bằng bao nhiêu?',
  askEach: 'Hỏi mỗi bạn được bao nhiêu {item}?',
  askBoxes: 'Hỏi cần ít nhất bao nhiêu hộp để đựng hết?',
  askFullBoxes: 'Hỏi xếp được đầy bao nhiêu hộp?',
  askLeftover: 'Hỏi còn dư bao nhiêu {item}?',
  item_marble: 'viên bi',
  item_candy: 'cái kẹo',
  item_flower: 'bông hoa',
  item_book: 'quyển sách',
  item_notebook: 'quyển vở',
  item_pen: 'cái bút',
  item_cake: 'cái bánh',
  item_apple: 'quả táo',
  item_fish: 'con cá',
  item_minute: 'phút',
  item_meter: 'm',
  item_ml: 'ml',
  item_gram: 'g',
  item_riceKg: 'kg gạo',
  // Boost Phase 1A formats (add-sub-format-strings.ts).
  ...addSubFormatStrings.vi,
};

const en = {
  addCalc: 'Work out: {a} + {b}.',
  subCalc: 'Work out: {a} − {b}.',
  mentalCalc: 'Work it out in your head: {expr}.',
  chainCalc: 'Work out: {expr}.',
  wpAddHave: '{name} has {a} {item}. {name} buys {b} more {item}.',
  wpSubGive: '{name} has {a} {item}. {name} gives {b} {item} to a friend.',
  wpSubGiveOut: '{name} has {a} {item}. {name} ships out {b} {item}.',
  wpSubGiveLend: '{name} has {a} {item}. {name} lends out {b} {item}.',
  wpSubGiveHandout: '{name} has {a} {item}. {name} gives {b} {item} to its students.',
  wpTwoStepAdd: '{name} has {a} {item}. {name} buys {b} more {item}, then buys {c} more {item}.',
  wpTwoStepLeft:
    '{name} has {a} {item}. {name} buys {b} more {item}, then gives {c} {item} to a friend.',
  wpTwoStepLeftOut:
    '{name} has {a} {item}. {name} buys {b} more {item}, then ships out {c} {item}.',
  wpTwoStepLeftLend:
    '{name} has {a} {item}. {name} buys {b} more {item}, then lends out {c} {item}.',
  wpTwoStepLeftHandout:
    '{name} has {a} {item}. {name} buys {b} more {item}, then gives {c} {item} to its students.',
  wpCompare: '{name} has {a} {item}. {name2} has {b} {item}.',
  errorAdd: '{name} worked out: {a} + {b} = {shown}.',
  errorSub: '{name} worked out: {a} − {b} = {shown}.',
  missingDigit: 'Find the missing digit: {equation}',
  mulCalc: 'Work out: {a} × {b}.',
  divCalc: 'Work out: {a} : {b}.',
  divRemainderCalc: 'Work out: {a} : {b}.',
  wpMulGroups: '{name} has {n} boxes with {per} {item} in each box.',
  wpMulTimesRice:
    'Warehouse A has {a} kg of rice. Warehouse B has {b} times as much rice as warehouse A.',
  wpMulTimesBooks: 'Library A has {a} books. Library B has {b} times as many books as library A.',
  wpMulTimesStudents:
    'School A has {a} students. School B has {b} times as many students as school A.',
  wpMulThenSubRice:
    'The warehouse buys {n} sacks with {per} kg of rice in each. The warehouse ships out {c} kg of rice.',
  wpMulThenSubBooks:
    'The library buys {n} crates with {per} books in each. The library lends out {c} books.',
  wpMulThenSubSchool:
    'The school buys {n} crates with {per} books in each. The school gives {c} books to its students.',
  wpDivShare: '{name} has {a} {item}. {name} shares them equally among {b} friends.',
  wpDivBoxes: '{name} has {a} {item}. Each box holds {b} {item}.',
  wpReduceTimes: 'Reduce {a} {unit} by {b} times. How many {unit} is that?',
  wpMoneyChange:
    '{name} buys {n} {item}. Each one costs {per} đồng. {name} hands the seller {paid} đồng.',
  wpCompareLarge: 'Three calculations: {expr1}; {expr2}; {expr3}.',
  askSpent: 'How many đồng did the shopping cost in all?',
  askChange: 'How many đồng does the seller give back?',
  askMaxResult: 'Which result is the biggest?',
  askMinResult: 'Which result is the smallest?',
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
  askTotalBoughtRice: 'How many kg of rice did the warehouse buy in all?',
  askTotalBoughtBooks: 'How many books did the library buy in all?',
  askTotalBoughtSchool: 'How many books did the school buy in all?',
  askFinalLeftBig: 'In the end, how many {item} are left?',
  askTotalRice: 'How many kg of rice does warehouse B have in all?',
  askTotalBooks: 'How many books does library B have in all?',
  askTotalStudents: 'How many students does school B have in all?',
  askFinalTotal: 'In the end, how many {item} does {name} have in all?',
  askFinalLeft: 'In the end, how many {item} does {name} have left?',
  askMissingDigit: 'What is the missing digit?',
  isNameTrue: 'Did {name} work it out right or wrong?',
  askCorrect: 'What is the right answer?',
  askProduct: 'What is the product?',
  askQuotient: 'What is the quotient?',
  askRemainder: 'What is the remainder?',
  askEach: 'How many {item} does each friend get?',
  askBoxes: 'How many boxes are needed at least to hold them all?',
  askFullBoxes: 'How many boxes are filled completely?',
  askLeftover: 'How many {item} are left over?',
  item_marble: 'marbles',
  item_candy: 'sweets',
  item_flower: 'flowers',
  item_book: 'books',
  item_notebook: 'notebooks',
  item_pen: 'pens',
  item_cake: 'cakes',
  item_apple: 'apples',
  item_fish: 'fish',
  item_minute: 'minutes',
  item_meter: 'm',
  item_ml: 'ml',
  item_gram: 'g',
  item_riceKg: 'kg of rice',
  // Boost Phase 1A formats (add-sub-format-strings.ts).
  ...addSubFormatStrings.en,
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
