// Arithmetic generators (phase 7 split): exact and remainder div 2-3 digit by
// 1 digit. Exact divisions use (quotient, divisor) construction; remainder items
// answer in two steps — "Thương?" then "Số dư?" — with dư < số chia enforced by
// construction. Zero in the quotient is the T3 trap.
import { type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';
import { RANGE_99, RANGE_999 } from './arithmetic-ranges';

const hasZero = (q: number): boolean => String(q).includes('0');

/** An exact 2-digit division: T1 the tens digit divides, T2 it does not (bring the
 *  ones down), T3 a divisor of 7–9. */
export function pickDivExact2d(rng: Rng, tier: SkillTier): [number, number] {
  for (let t = 0; t < 500; t++) {
    const b = tier === 3 ? randInt(rng, 7, 9) : randInt(rng, 2, 6);
    const q = tier === 3 ? randInt(rng, 2, 14) : randInt(rng, 11, 49);
    const a = q * b;
    if (a < 21 || a > RANGE_99) continue;
    const tensDivides = Math.floor(a / 10) % b === 0;
    if (tier === 1 && tensDivides && q >= 10) return [a, b];
    if (tier === 2 && !tensDivides && q >= 10) return [a, b];
    if (tier === 3) return [a, b];
  }
  return tier === 1 ? [84, 4] : tier === 2 ? [96, 4] : [63, 7];
}

/** A 2-digit division with a remainder: T1 divisor 2–3, T2 4–7, T3 8–9. */
export function pickDivRemainder2d(rng: Rng, tier: SkillTier): [number, number] {
  const b = tier === 1 ? randInt(rng, 2, 3) : tier === 2 ? randInt(rng, 4, 7) : randInt(rng, 8, 9);
  for (let t = 0; t < 500; t++) {
    const q = randInt(rng, 2, Math.floor(RANGE_99 / b));
    const r = randInt(rng, 1, b - 1);
    const a = q * b + r;
    if (a >= 21 && a <= RANGE_99) return [a, b];
  }
  return tier === 1 ? [25, 2] : tier === 2 ? [29, 4] : [35, 8];
}

/** An exact 3-digit division: T1 the first digit divides (3-digit quotient), T2 it
 *  does not (2-digit quotient), T3 a zero in the quotient. */
export function pickDivExact3d(rng: Rng, tier: SkillTier): [number, number] {
  for (let t = 0; t < 500; t++) {
    const b = randInt(rng, 2, 9);
    const q =
      tier === 1
        ? randInt(rng, 100, 499)
        : tier === 2
          ? randInt(rng, 10, 99)
          : randInt(rng, 101, 909);
    const a = q * b;
    if (a < 102 || a > RANGE_999) continue;
    if (tier === 3 && !hasZero(q)) continue;
    const firstDivides = Math.floor(a / 100) % b === 0;
    if (tier === 1 && firstDivides && q >= 100) return [a, b];
    if (tier === 2 && !firstDivides && q < 100) return [a, b];
    if (tier === 3) return [a, b];
  }
  return tier === 1 ? [824, 4] : tier === 2 ? [252, 6] : [804, 4];
}

/** A 3-digit division with a remainder: T1 divisor 2–3, T2 4–7, T3 a zero in the quotient. */
export function pickDivRemainder3d(rng: Rng, tier: SkillTier): [number, number] {
  for (let t = 0; t < 500; t++) {
    const b =
      tier === 1 ? randInt(rng, 2, 3) : tier === 2 ? randInt(rng, 4, 7) : randInt(rng, 2, 9);
    const q = randInt(rng, 10, Math.floor(RANGE_999 / b));
    const r = randInt(rng, 1, b - 1);
    const a = q * b + r;
    if (a < 102 || a > RANGE_999) continue;
    if (tier === 3 && !hasZero(q)) continue;
    return [a, b];
  }
  return tier === 1 ? [305, 2] : tier === 2 ? [307, 4] : [803, 4];
}

/** One exact division, result only (number pad). Exported for the phase-11
 *  4-5 digit generators, which reuse it with their own pickers. */
export const plainDiv =
  (skillId: string, pick: (rng: Rng, tier: SkillTier) => [number, number]): ReasoningGenerator =>
  (rng, tier) => {
    const [a, b] = pick(rng, tier);
    return arithmeticItem(skillId, tier, ref('divCalc', { a, b }), [
      numberStep(ref('askQuotient'), Math.floor(a / b)),
    ]);
  };

/** A division with a remainder: two steps, quotient then remainder. Exported for
 *  the phase-11 4-5 digit generators, which reuse it with their own pickers. */
export const remainderDiv =
  (skillId: string, pick: (rng: Rng, tier: SkillTier) => [number, number]): ReasoningGenerator =>
  (rng, tier) => {
    const [a, b] = pick(rng, tier);
    const q = Math.floor(a / b);
    const r = a - q * b;
    return arithmeticItem(skillId, tier, ref('divRemainderCalc', { a, b }), [
      numberStep(ref('askQuotient'), q),
      numberStep(ref('askRemainder'), r),
    ]);
  };

export const DIV_CALC_GENERATORS: Record<string, ReasoningGenerator> = {
  'div-2d-1d': plainDiv('div-2d-1d', pickDivExact2d),
  'div-2d-1d-remainder': remainderDiv('div-2d-1d-remainder', pickDivRemainder2d),
  'div-3d-1d': plainDiv('div-3d-1d', pickDivExact3d),
  'div-3d-1d-remainder': remainderDiv('div-3d-1d-remainder', pickDivRemainder3d),
};
