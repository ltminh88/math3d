// Pair pickers (boost, Phase 1A — split from add-sub-generators.ts, no behaviour
// change): tier pairs for add/sub, chain triples, and the ladder picker, which
// samples a pair whose regroup pattern matches one ladder step (T0–T4).
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { RANGE_1000, RANGE_10000, RANGE_100000 } from './arithmetic-ranges';
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

// --- Ladder picker (Phase 1A) ------------------------------------------------

/** Ladder step: 0 no regroup, 1 one regroup in units, 2 one in tens, 3 two, 4 zero. */
export type Ladder = 0 | 1 | 2 | 3 | 4;

/** Whether adding a and b carries out of column `col` (0 = units). */
export const addCarryAt = (a: number, b: number, col: number): boolean => {
  let carry = 0;
  for (let i = 0; i <= col; i++) {
    const sum = (Math.floor(a / 10 ** i) % 10) + (Math.floor(b / 10 ** i) % 10) + carry;
    carry = Math.floor(sum / 10);
  }
  return carry > 0;
};

/** Whether subtracting b from a borrows out of column `col` (0 = units). */
export const subBorrowAt = (a: number, b: number, col: number): boolean => {
  let borrow = 0;
  for (let i = 0; i <= col; i++) {
    const raw = (Math.floor(a / 10 ** i) % 10) - (Math.floor(b / 10 ** i) % 10) - borrow;
    borrow = raw < 0 ? 1 : 0;
  }
  return borrow > 0;
};

/** One valid pair per (op, ladder) when rejection sampling misses. */
const LADDER_FALLBACK: Record<'+' | '−', Record<Ladder, [number, number]>> = {
  '+': { 0: [123, 234], 1: [47, 38], 2: [186, 172], 3: [385, 247], 4: [385, 247] },
  '−': { 0: [876, 123], 1: [52, 27], 2: [428, 157], 3: [403, 158], 4: [403, 158] },
};

const matchesLadder = (a: number, b: number, op: '+' | '−', ladder: Ladder): boolean => {
  if (ladder === 0) return op === '+' ? countAddCarries(a, b) === 0 : countSubBorrows(a, b) === 0;
  if (ladder === 1) {
    if (op === '+') return countAddCarries(a, b) === 1 && addCarryAt(a, b, 0);
    return countSubBorrows(a, b) === 1 && subBorrowAt(a, b, 0);
  }
  if (ladder === 2) {
    if (op === '+') return countAddCarries(a, b) === 1 && addCarryAt(a, b, 1);
    return countSubBorrows(a, b) === 1 && subBorrowAt(a, b, 1);
  }
  if (ladder === 3) return op === '+' ? countAddCarries(a, b) >= 2 : countSubBorrows(a, b) >= 2;
  // L4: subtraction borrows across a zero (403 − 158). Addition has no zero
  // case, so it falls back to the L3 rule (two regroups).
  return op === '−' ? hasBorrowAcrossZero(a, b) : countAddCarries(a, b) >= 2;
};

/**
 * A pair (a, b) whose regroup pattern is exactly the ladder step, with
 * a + b ≤ max (add) or a ≤ max, a ≥ b (sub). Default max is 1 000; a 4/5-digit
 * skill keeps its own range.
 */
export function pickLadderPair(
  rng: Rng,
  op: '+' | '−',
  ladder: Ladder,
  max: number = RANGE_1000,
): [number, number] {
  const minAddend = max >= RANGE_100000 ? 10000 : max >= RANGE_10000 ? 1000 : 10;
  const minMinuend = max >= RANGE_100000 ? 10000 : max >= RANGE_10000 ? 1000 : 100;
  const minSub = max === RANGE_1000 ? 10 : max / 10;
  for (let t = 0; t < 500; t++) {
    let a: number;
    let b: number;
    if (op === '+') {
      a = randInt(rng, minAddend, max - 10);
      b = randInt(rng, minAddend, max - a);
      if (b < minAddend) continue;
    } else {
      a = randInt(rng, minMinuend, max);
      b = randInt(rng, minSub, a);
    }
    if (matchesLadder(a, b, op, ladder)) return [a, b];
  }
  return LADDER_FALLBACK[op][ladder];
}

/** SkillTier 1 practises L0, tier 2 practises L1/L2, tier 3 practises L3/L4. */
export const ladderOfSkillTier = (rng: Rng, tier: SkillTier): Ladder => {
  if (tier === 1) return 0;
  if (tier === 2) return pick(rng, [1, 2] as const);
  return pick(rng, [3, 4] as const);
};
