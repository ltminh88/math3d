// Arithmetic generators (phase 09): add/sub to 100 000, mental round numbers, chains,
// find-the-error and the missing digit. Carries are the tier axis: T1 no carry, T2
// exactly one, T3 a chain / a borrow across a zero. All numbers the child sees are
// plain in the params; the strings table groups them SGK-style for display.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { pickName } from '../reasoning/reasoning-distractors';
import type { ReasoningGenerator, ReasoningStep } from '../reasoning/reasoning-types';
import {
  arithmeticItem,
  numberStep,
  ref,
  wrongAddByForgotCarry,
  wrongBySlip,
  wrongSubByNoBorrow,
} from './arithmetic-distractors';
import { RANGE_1000, RANGE_10000, RANGE_100000, tierRangeCap } from './arithmetic-ranges';
import { countAddCarries, countSubBorrows, hasBorrowAcrossZero } from './carry-count';

/** Fallbacks when rejection sampling misses (never in practice): one valid pair per tier. */
const ADD_FALLBACK: Record<number, Record<SkillTier, [number, number]>> = {
  [RANGE_1000]: { 1: [100, 100], 2: [150, 150], 3: [456, 378] },
  [RANGE_10000]: { 1: [1000, 1000], 2: [1500, 1500], 3: [4567, 3789] },
  [RANGE_100000]: { 1: [10000, 10000], 2: [15000, 15000], 3: [45678, 37890] },
};

const SUB_FALLBACK: Record<number, Record<SkillTier, [number, number]>> = {
  [RANGE_1000]: { 1: [876, 234], 2: [456, 128], 3: [1000, 137] },
  [RANGE_10000]: { 1: [8765, 2341], 2: [4567, 1238], 3: [10000, 137] },
  [RANGE_100000]: { 1: [87654, 23412], 2: [45678, 12349], 3: [100000, 137] },
};

/** An add pair (a, b) with a + b ≤ maxSum and the tier's carry count. */
export function pickAddPair(rng: Rng, maxSum: number, tier: SkillTier): [number, number] {
  const minAddend = maxSum >= RANGE_100000 ? 10000 : maxSum >= RANGE_10000 ? 1000 : 10;
  for (let t = 0; t < 500; t++) {
    const a = randInt(rng, minAddend, maxSum - 10);
    const b = randInt(rng, minAddend, maxSum - a);
    if (b < minAddend) continue;
    const c = countAddCarries(a, b);
    if (tier === 1 && c === 0) return [a, b];
    if (tier === 2 && c === 1) return [a, b];
    if (tier === 3 && c >= 2) return [a, b];
  }
  return ADD_FALLBACK[maxSum]?.[tier] ?? [100, 100];
}

/** A sub pair (a, b) with a ≤ maxMinuend, a ≥ b, and the tier's borrow count. */
export function pickSubPair(rng: Rng, maxMinuend: number, tier: SkillTier): [number, number] {
  const minMinuend = maxMinuend >= RANGE_100000 ? 10000 : maxMinuend >= RANGE_10000 ? 1000 : 100;
  const minSub = maxMinuend === RANGE_1000 ? 10 : maxMinuend / 10;
  for (let t = 0; t < 500; t++) {
    const a = randInt(rng, minMinuend, maxMinuend);
    const b = randInt(rng, minSub, a);
    const borrows = countSubBorrows(a, b);
    if (tier === 1 && borrows === 0) return [a, b];
    if (tier === 2 && borrows === 1) return [a, b];
    if (tier === 3 && hasBorrowAcrossZero(a, b)) return [a, b];
  }
  return SUB_FALLBACK[maxMinuend]?.[tier] ?? [876, 234];
}

export interface ChainTriple {
  a: number;
  b: number;
  c: number;
  op1: '+' | '−';
  op2: '+' | '−';
}

/** A three-number chain a op1 b op2 c, both partial and final results in [0, 1000]. */
export function pickChainTriple(rng: Rng, tier: SkillTier): ChainTriple {
  for (let t = 0; t < 500; t++) {
    const op1 = pick(rng, ['+', '−'] as const);
    const op2 = pick(rng, ['+', '−'] as const);
    const a = randInt(rng, 100, 999);
    const b = randInt(rng, 10, 999);
    const first = op1 === '+' ? a + b : a - b;
    if (first < 0 || first > RANGE_1000) continue;
    const c = randInt(rng, 10, 999);
    const final = op2 === '+' ? first + c : first - c;
    if (final < 0 || final > RANGE_1000) continue;
    const total =
      (op1 === '+' ? countAddCarries(a, b) : countSubBorrows(a, b)) +
      (op2 === '+' ? countAddCarries(first, c) : countSubBorrows(first, c));
    if (tier === 1 && total === 0) return { a, b, c, op1, op2 };
    if (tier === 2 && total === 1) return { a, b, c, op1, op2 };
    if (tier === 3 && total >= 2) return { a, b, c, op1, op2 };
  }
  return tier === 1
    ? { a: 100, b: 100, c: 100, op1: '+', op2: '+' }
    : tier === 2
      ? { a: 150, b: 150, c: 100, op1: '+', op2: '+' }
      : { a: 456, b: 378, c: 100, op1: '+', op2: '+' };
}

/** Round hundreds (T1), round tens (T2), or a three-term chain of round numbers (T3). */
export const mentalRound: ReasoningGenerator = (rng, tier) => {
  if (tier === 1) {
    const op = pick(rng, ['+', '−'] as const);
    const aH = randInt(rng, 1, 9);
    const bH = op === '+' ? randInt(rng, 1, 10 - aH) : randInt(rng, 1, aH);
    const a = aH * 100;
    const b = bH * 100;
    const answer = op === '+' ? a + b : a - b;
    return arithmeticItem(
      'add-sub-mental-round',
      tier,
      ref('mentalCalc', { expr: `${a} ${op} ${b}` }),
      [numberStep(ref('askResult'), answer)],
    );
  }
  if (tier === 2) {
    const op = pick(rng, ['+', '−'] as const);
    let aT = randInt(rng, 11, op === '+' ? 89 : 99);
    while (aT % 10 === 0) aT = randInt(rng, 11, op === '+' ? 89 : 99);
    let bT = op === '+' ? randInt(rng, 11, 100 - aT) : randInt(rng, 11, aT);
    while (bT % 10 === 0 || bT < 11)
      bT = op === '+' ? randInt(rng, 11, 100 - aT) : randInt(rng, 11, aT);
    const a = aT * 10;
    const b = bT * 10;
    const answer = op === '+' ? a + b : a - b;
    return arithmeticItem(
      'add-sub-mental-round',
      tier,
      ref('mentalCalc', { expr: `${a} ${op} ${b}` }),
      [numberStep(ref('askResult'), answer)],
    );
  }
  for (let t = 0; t < 500; t++) {
    const op1 = pick(rng, ['+', '−'] as const);
    const op2 = pick(rng, ['+', '−'] as const);
    const a = randInt(rng, 1, 19) * 50;
    const b = randInt(rng, 1, 19) * 50;
    const first = op1 === '+' ? a + b : a - b;
    if (first < 0 || first > RANGE_1000) continue;
    const c = randInt(rng, 1, 19) * 50;
    const final = op2 === '+' ? first + c : first - c;
    if (final < 0 || final > RANGE_1000) continue;
    return arithmeticItem(
      'add-sub-mental-round',
      tier,
      ref('mentalCalc', { expr: `${a} ${op1} ${b} ${op2} ${c}` }),
      [numberStep(ref('askResult'), final)],
    );
  }
  return arithmeticItem(
    'add-sub-mental-round',
    tier,
    ref('mentalCalc', { expr: '300 + 200 + 100' }),
    [numberStep(ref('askResult'), 600)],
  );
};

/** One plain add or sub in range, result only (number pad). */
const plain =
  (skillId: string, maxSum: number, op: 'add' | 'sub' | 'both'): ReasoningGenerator =>
  (rng, tier) => {
    const isAdd = op === 'add' || (op === 'both' && rng() < 0.5);
    const [a, b] = isAdd ? pickAddPair(rng, maxSum, tier) : pickSubPair(rng, maxSum, tier);
    const answer = isAdd ? a + b : a - b;
    return arithmeticItem(skillId, tier, ref(isAdd ? 'addCalc' : 'subCalc', { a, b }), [
      numberStep(ref(isAdd ? 'askSum' : 'askDiff'), answer),
    ]);
  };

/** A two-operation chain: first the partial result, then the final one. */
export const addSubChain: ReasoningGenerator = (rng, tier) => {
  const { a, b, c, op1, op2 } = pickChainTriple(rng, tier);
  const first = op1 === '+' ? a + b : a - b;
  const final = op2 === '+' ? first + c : first - c;
  return arithmeticItem(
    'add-sub-1000-chain',
    tier,
    ref('chainCalc', { expr: `${a} ${op1} ${b} ${op2} ${c}`, a, b, c, op1, op2 }),
    [
      numberStep(ref('askFirst', { expr: `${a} ${op1} ${b}` }), first),
      numberStep(ref('askResult'), final),
    ],
    [first],
  );
};

/** Đúng/Sai on a worked result: half the time the shown result is right, half the time it
 *  is built from the misconception of the tier (a slip at T1, a forgotten carry / a
 *  missing borrow at T2–T3). The story always shows the full worked result. */
export const findError: ReasoningGenerator = (rng, tier) => {
  const cap = tierRangeCap(tier);
  const isAdd = rng() < 0.5;
  const [a, b] = isAdd ? pickAddPair(rng, cap, tier) : pickSubPair(rng, cap, tier);
  const correct = isAdd ? a + b : a - b;
  const truth = rng() < 0.5;
  let shown = correct;
  if (!truth) {
    shown =
      tier === 1
        ? wrongBySlip(correct, rng)
        : isAdd
          ? wrongAddByForgotCarry(a, b)
          : wrongSubByNoBorrow(a, b);
    if (shown === correct) shown = wrongBySlip(correct, rng);
  }
  const name = pickName(rng);
  const step: ReasoningStep = {
    kind: 'verdict',
    prompt: ref('isNameTrue', { name }),
    statement: ref('stmtEq', { text: `${a} ${isAdd ? '+' : '−'} ${b}`, value: shown }),
    answer: truth,
    ...(truth ? {} : { fix: { prompt: ref('askCorrect'), answer: correct } }),
  };
  return arithmeticItem(
    'add-sub-find-error',
    tier,
    ref(isAdd ? 'errorAdd' : 'errorSub', { name, a, b, shown }),
    [step],
    truth ? [] : [correct],
  );
};

/** One digit of an operand or the result is blank: T1 the result, T2 the second operand,
 *  T3 the first operand. The missing digit is always uniquely determined. */
export const missingDigit: ReasoningGenerator = (rng, tier) => {
  const cap = tierRangeCap(tier);
  const isAdd = rng() < 0.5;
  const [a, b] = isAdd ? pickAddPair(rng, cap, tier) : pickSubPair(rng, cap, tier);
  const correct = isAdd ? a + b : a - b;
  const op = isAdd ? '+' : '−';
  const blank = (n: number): { text: string; digit: number } => {
    const ds = String(n).split('');
    const idx = ds.length > 1 ? randInt(rng, 1, ds.length - 1) : 0;
    const digit = Number(ds[idx]);
    ds[idx] = '?';
    return { text: ds.join(''), digit };
  };
  let equation: string;
  let missing: number;
  if (tier === 1) {
    const r = blank(correct);
    equation = `${a} ${op} ${b} = ${r.text}`;
    missing = r.digit;
  } else if (tier === 2) {
    const r = blank(b);
    equation = `${a} ${op} ${r.text} = ${correct}`;
    missing = r.digit;
  } else {
    const r = blank(a);
    equation = `${r.text} ${op} ${b} = ${correct}`;
    missing = r.digit;
  }
  return arithmeticItem('add-missing-digit', tier, ref('missingDigit', { equation }), [
    numberStep(ref('askMissingDigit'), missing),
  ]);
};
export const ADD_SUB_GENERATORS: Record<string, ReasoningGenerator> = {
  'add-sub-mental-round': mentalRound,
  'add-sub-1000': plain('add-sub-1000', RANGE_1000, 'both'),
  'add-sub-1000-chain': addSubChain,
  'add-4digit': plain('add-4digit', RANGE_10000, 'add'),
  'sub-4digit': plain('sub-4digit', RANGE_10000, 'sub'),
  'add-5digit': plain('add-5digit', RANGE_100000, 'add'),
  'sub-5digit': plain('sub-5digit', RANGE_100000, 'sub'),
  'add-sub-find-error': findError,
  'add-missing-digit': missingDigit,
};
