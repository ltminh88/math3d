// Arithmetic generators (phase 10): mul 2-3 digit by 1 digit, mental round
// tens/hundreds. Carries are the tier axis for plain mul: T1 no carry, T2 exactly
// one, T3 two carries (or one carry with a zero digit in a 3-digit multiplicand).
// The mental skills scale the round size at T1/T2 and chain two steps at T3.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';
import { RANGE_99, RANGE_999, RANGE_10000, RANGE_100000 } from './arithmetic-ranges';
import { countMulCarries } from './carry-count';
import { mentalVerdictItem, missingDigitItem, missingNumberItem } from './mul-div-missing-factor';

/** Fallbacks when rejection sampling misses (never in practice): one valid pair per tier. */
const MUL_FALLBACK: Record<number, Record<SkillTier, [number, number]>> = {
  [RANGE_99]: { 1: [12, 2], 2: [15, 2], 3: [19, 5] },
  [RANGE_999]: { 1: [111, 2], 2: [115, 2], 3: [199, 3] },
  [RANGE_10000]: { 1: [1002, 2], 2: [1005, 2], 3: [1999, 4] },
  [RANGE_100000]: { 1: [10002, 2], 2: [10005, 2], 3: [19999, 4] },
};

/** A mul pair (a, b): a 2-digit (maxProduct 99) or 3-digit (maxProduct 999) times a
 *  single digit, product ≤ maxProduct, with the tier's carry rule. */
export function pickMulPair(rng: Rng, maxProduct: number, tier: SkillTier): [number, number] {
  const minA =
    maxProduct === RANGE_99
      ? 11
      : maxProduct === RANGE_999
        ? 101
        : maxProduct === RANGE_10000
          ? 1001
          : 10001;
  for (let t = 0; t < 500; t++) {
    const a = randInt(rng, minA, maxProduct);
    const b = randInt(rng, 2, 9);
    if (a * b > maxProduct) continue;
    if (maxProduct === RANGE_99) {
      const ones = (a % 10) * b;
      if (tier === 1 && ones < 10) return [a, b];
      if (tier === 2 && ones >= 10 && ones < 20) return [a, b];
      if (tier === 3 && ones >= 20) return [a, b];
      continue;
    }
    const carries = countMulCarries(a, b);
    if (tier === 1 && carries === 0) return [a, b];
    if (tier === 2 && carries === 1) return [a, b];
    if (tier === 3 && (carries >= 2 || (carries >= 1 && String(a).includes('0')))) return [a, b];
  }
  return MUL_FALLBACK[maxProduct]?.[tier] ?? [12, 2];
}

/** One plain mul in range, result only (number pad). */
const plainMul =
  (skillId: string, maxProduct: number): ReasoningGenerator =>
  (rng, tier) => {
    const [a, b] = pickMulPair(rng, maxProduct, tier);
    return arithmeticItem(skillId, tier, ref('mulCalc', { a, b }), [
      numberStep(ref('askProduct'), a * b),
    ]);
  };

/** Round tens × a digit (product ≤ 99): T1 tens 1–5 × digit 2–5, T2 the wider
 *  range, T1–T2 a missing-number form (R117), T3 a two-step chain or a Đúng/Sai verdict. */
export const mulTensMental: ReasoningGenerator = (rng, tier) => {
  if (tier === 3) {
    if (rng() < 0.5) {
      for (let t = 0; t < 500; t++) {
        const tens = randInt(rng, 1, 9);
        const d = randInt(rng, 2, 9);
        if (tens * d > 9) continue;
        return mentalVerdictItem('mul-tens-mental', tier, true, tens * 10, d, rng, RANGE_99);
      }
      return mentalVerdictItem('mul-tens-mental', tier, true, 30, 2, rng);
    }
    for (let t = 0; t < 500; t++) {
      const a = randInt(rng, 1, 9) * 10;
      const b = randInt(rng, 2, 9);
      const first = a * b;
      if (first > RANGE_99) continue;
      const op = pick(rng, ['+', '−'] as const);
      const c = randInt(rng, 1, 9) * 10;
      const final = op === '+' ? first + c : first - c;
      if (final < 0 || final > RANGE_99) continue;
      return arithmeticItem(
        'mul-tens-mental',
        tier,
        ref('mentalCalc', { expr: `${a} × ${b} ${op} ${c}` }),
        [numberStep(ref('askResult'), final)],
      );
    }
    return arithmeticItem('mul-tens-mental', tier, ref('mentalCalc', { expr: '30 × 2 + 20' }), [
      numberStep(ref('askResult'), 80),
    ]);
  }
  for (let t = 0; t < 500; t++) {
    const tens = tier === 1 ? randInt(rng, 1, 5) : randInt(rng, 1, 9);
    const d = tier === 1 ? randInt(rng, 2, 5) : randInt(rng, 2, 9);
    if (tens * d > 9) continue;
    const a = tens * 10;
    const form = pick(rng, ['plain', 'digit', 'tens'] as const);
    if (form === 'digit')
      return missingDigitItem('mul-tens-mental', tier, `${a} × □ = ${a * d}`, d);
    if (form === 'tens')
      return missingNumberItem('mul-tens-mental', tier, `□ × ${d} = ${a * d}`, a);
    return arithmeticItem('mul-tens-mental', tier, ref('mentalCalc', { expr: `${a} × ${d}` }), [
      numberStep(ref('askResult'), a * d),
    ]);
  }
  return arithmeticItem(
    'mul-tens-mental',
    tier,
    ref('mentalCalc', { expr: tier === 1 ? '20 × 3' : '40 × 2' }),
    [numberStep(ref('askResult'), tier === 1 ? 60 : 80)],
  );
};

/** Round hundreds × a digit (product ≤ 999): T1 hundreds 1–4 × digit 2–4, T2 the
 *  wider range, T1–T2 a missing-number form (R117), T3 a two-step chain or a Đúng/Sai verdict. */
export const mulHundredsMental: ReasoningGenerator = (rng, tier) => {
  if (tier === 3) {
    if (rng() < 0.5) {
      for (let t = 0; t < 500; t++) {
        const h = randInt(rng, 1, 9);
        const d = randInt(rng, 2, 9);
        if (h * d > 9) continue;
        return mentalVerdictItem('mul-hundreds-mental', tier, true, h * 100, d, rng);
      }
      return mentalVerdictItem('mul-hundreds-mental', tier, true, 200, 3, rng);
    }
    for (let t = 0; t < 500; t++) {
      const a = randInt(rng, 1, 9) * 100;
      const b = randInt(rng, 2, 9);
      const first = a * b;
      if (first > RANGE_999) continue;
      const op = pick(rng, ['+', '−'] as const);
      const c = randInt(rng, 1, 9) * 100;
      const final = op === '+' ? first + c : first - c;
      if (final < 0 || final > RANGE_999) continue;
      return arithmeticItem(
        'mul-hundreds-mental',
        tier,
        ref('mentalCalc', { expr: `${a} × ${b} ${op} ${c}` }),
        [numberStep(ref('askResult'), final)],
      );
    }
    return arithmeticItem(
      'mul-hundreds-mental',
      tier,
      ref('mentalCalc', { expr: '200 × 3 + 100' }),
      [numberStep(ref('askResult'), 700)],
    );
  }
  for (let t = 0; t < 500; t++) {
    const h = tier === 1 ? randInt(rng, 1, 4) : randInt(rng, 1, 9);
    const d = tier === 1 ? randInt(rng, 2, 4) : randInt(rng, 2, 9);
    if (h * d > 9) continue;
    const a = h * 100;
    const form = pick(rng, ['plain', 'digit', 'hundreds'] as const);
    if (form === 'digit')
      return missingDigitItem('mul-hundreds-mental', tier, `${a} × □ = ${a * d}`, d);
    if (form === 'hundreds')
      return missingNumberItem('mul-hundreds-mental', tier, `□ × ${d} = ${a * d}`, a);
    return arithmeticItem('mul-hundreds-mental', tier, ref('mentalCalc', { expr: `${a} × ${d}` }), [
      numberStep(ref('askResult'), a * d),
    ]);
  }
  return arithmeticItem(
    'mul-hundreds-mental',
    tier,
    ref('mentalCalc', { expr: tier === 1 ? '200 × 2' : '300 × 2' }),
    [numberStep(ref('askResult'), tier === 1 ? 400 : 600)],
  );
};

/** 2-digit × 1-digit (product ≤ 99): the missing-number form at every tier
 *  (R117) — the pair still follows the tier's carry rule (T1 no carry). */
const mul2d1d: ReasoningGenerator = (rng, tier) => {
  const [a, b] = pickMulPair(rng, RANGE_99, tier);
  const form = pick(rng, ['plain', 'digit', 'a'] as const);
  if (form === 'digit') return missingDigitItem('mul-2d-1d', tier, `${a} × □ = ${a * b}`, b);
  if (form === 'a') return missingNumberItem('mul-2d-1d', tier, `□ × ${b} = ${a * b}`, a);
  return arithmeticItem('mul-2d-1d', tier, ref('mulCalc', { a, b }), [
    numberStep(ref('askProduct'), a * b),
  ]);
};

export const MUL_GENERATORS: Record<string, ReasoningGenerator> = {
  'mul-2d-1d': mul2d1d,
  'mul-tens-mental': mulTensMental,
  'mul-3d-1d': plainMul('mul-3d-1d', RANGE_999),
  'mul-hundreds-mental': mulHundredsMental,
  'mul-4d-1d': plainMul('mul-4d-1d', RANGE_10000),
  'mul-5d-1d': plainMul('mul-5d-1d', RANGE_100000),
};
