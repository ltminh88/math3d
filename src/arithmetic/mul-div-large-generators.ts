// Arithmetic generators (phase 11): div 4-5 digit by 1 digit, mental round
// thousands. Exact divisions use (quotient, divisor) construction; remainder items
// answer in two steps — "Thương?" then "Số dư?" — with dư < số chia enforced by
// construction. Zero in the quotient is the T3 trap, same as the 3-digit skills.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';
import { RANGE_10000, RANGE_100000 } from './arithmetic-ranges';
import { plainDiv, remainderDiv } from './div-generators';

const hasZero = (q: number): boolean => String(q).includes('0');

/** An exact n-digit division (n = 4 or 5): T1 the first digit divides (full-digit
 *  quotient), T2 it does not (one fewer digit), T3 a zero in the quotient. */
export function pickDivExactNd(rng: Rng, digits: 4 | 5, tier: SkillTier): [number, number] {
  const minQ = 10 ** (digits - 1);
  const minA = digits === 4 ? 1002 : 10002;
  const maxA = digits === 4 ? RANGE_10000 : RANGE_100000;
  for (let t = 0; t < 500; t++) {
    const b = randInt(rng, 2, 9);
    const q =
      tier === 1
        ? randInt(rng, minQ, minQ * 5 - 1)
        : tier === 2
          ? randInt(rng, minQ / 10, minQ - 1)
          : randInt(rng, minQ + 1, minQ * 9 + 99);
    const a = q * b;
    if (a < minA || a >= maxA) continue;
    if (tier === 3 && !hasZero(q)) continue;
    const firstDivides = Math.floor(a / minQ) % b === 0;
    if (tier === 1 && firstDivides && q >= minQ) return [a, b];
    if (tier === 2 && !firstDivides && q < minQ) return [a, b];
    if (tier === 3) return [a, b];
  }
  return digits === 4
    ? tier === 1
      ? [8240, 4]
      : tier === 2
        ? [2520, 6]
        : [8040, 4]
    : tier === 1
      ? [82400, 4]
      : tier === 2
        ? [25200, 6]
        : [80400, 4];
}

/** An n-digit division (n = 4 or 5) with a remainder: T1 divisor 2–3, T2 4–7,
 *  T3 a zero in the quotient. */
export function pickDivRemainderNd(rng: Rng, digits: 4 | 5, tier: SkillTier): [number, number] {
  const minA = digits === 4 ? 1002 : 10002;
  const maxA = digits === 4 ? RANGE_10000 : RANGE_100000;
  for (let t = 0; t < 500; t++) {
    const b =
      tier === 1 ? randInt(rng, 2, 3) : tier === 2 ? randInt(rng, 4, 7) : randInt(rng, 2, 9);
    const q = randInt(rng, 10, Math.floor((maxA - 1) / b));
    const r = randInt(rng, 1, b - 1);
    const a = q * b + r;
    if (a < minA || a >= maxA) continue;
    if (tier === 3 && !hasZero(q)) continue;
    return [a, b];
  }
  return digits === 4
    ? tier === 1
      ? [3025, 2]
      : tier === 2
        ? [3007, 4]
        : [8003, 4]
    : tier === 1
      ? [30025, 2]
      : tier === 2
        ? [30007, 4]
        : [80003, 4];
}

/** Round thousands × a digit (product ≤ 10 000): T1 a small product, T2 the rest,
 *  T3 a two-step chain of round thousands. */
export const mulThousandsMental: ReasoningGenerator = (rng, tier) => {
  if (tier === 3) {
    for (let t = 0; t < 500; t++) {
      const a = randInt(rng, 1, 9) * 1000;
      const b = randInt(rng, 2, 9);
      const first = a * b;
      if (first > RANGE_10000) continue;
      const op = pick(rng, ['+', '−'] as const);
      const c = randInt(rng, 1, 9) * 1000;
      const final = op === '+' ? first + c : first - c;
      if (final < 0 || final > RANGE_10000) continue;
      return arithmeticItem(
        'mul-thousands-mental',
        tier,
        ref('mentalCalc', { expr: `${a} × ${b} ${op} ${c}` }),
        [numberStep(ref('askResult'), final)],
      );
    }
    return arithmeticItem(
      'mul-thousands-mental',
      tier,
      ref('mentalCalc', { expr: '2000 × 3 + 1000' }),
      [numberStep(ref('askResult'), 7000)],
    );
  }
  for (let t = 0; t < 500; t++) {
    const th = randInt(rng, 1, 9);
    const d = randInt(rng, 2, 9);
    if (th * d > 10) continue;
    if (tier === 1 && th * d > 5) continue;
    if (tier === 2 && th * d < 6) continue;
    const a = th * 1000;
    return arithmeticItem(
      'mul-thousands-mental',
      tier,
      ref('mentalCalc', { expr: `${a} × ${d}` }),
      [numberStep(ref('askResult'), a * d)],
    );
  }
  return arithmeticItem(
    'mul-thousands-mental',
    tier,
    ref('mentalCalc', { expr: tier === 1 ? '2000 × 2' : '3000 × 2' }),
    [numberStep(ref('askResult'), tier === 1 ? 4000 : 6000)],
  );
};

/** Round thousands : a digit (exact, round-thousands quotient): T1 quotient 1000,
 *  T2 2000–4000, T3 a two-step chain of round thousands. */
export const divThousandsMental: ReasoningGenerator = (rng, tier) => {
  if (tier === 3) {
    for (let t = 0; t < 500; t++) {
      const th = randInt(rng, 1, 9);
      const b = randInt(rng, 2, 9);
      if (th % b !== 0) continue;
      const a = th * 1000;
      const first = a / b;
      const op = pick(rng, ['+', '−'] as const);
      const c = randInt(rng, 1, 9) * 1000;
      const final = op === '+' ? first + c : first - c;
      if (final < 0 || final > RANGE_10000) continue;
      return arithmeticItem(
        'div-thousands-mental',
        tier,
        ref('mentalCalc', { expr: `${a} : ${b} ${op} ${c}` }),
        [numberStep(ref('askResult'), final)],
      );
    }
    return arithmeticItem(
      'div-thousands-mental',
      tier,
      ref('mentalCalc', { expr: '6000 : 3 + 1000' }),
      [numberStep(ref('askResult'), 3000)],
    );
  }
  for (let t = 0; t < 500; t++) {
    const th = randInt(rng, 1, 9);
    const b = randInt(rng, 2, 9);
    if (th % b !== 0) continue;
    const q = (th / b) * 1000;
    if (tier === 1 && q !== 1000) continue;
    if (tier === 2 && ![2000, 3000, 4000].includes(q)) continue;
    const a = th * 1000;
    return arithmeticItem(
      'div-thousands-mental',
      tier,
      ref('mentalCalc', { expr: `${a} : ${b}` }),
      [numberStep(ref('askResult'), q)],
    );
  }
  return arithmeticItem(
    'div-thousands-mental',
    tier,
    ref('mentalCalc', { expr: tier === 1 ? '2000 : 2' : '8000 : 2' }),
    [numberStep(ref('askResult'), tier === 1 ? 1000 : 4000)],
  );
};

export const LARGE_DIV_GENERATORS: Record<string, ReasoningGenerator> = {
  'div-4d-1d': plainDiv('div-4d-1d', (rng, tier) => pickDivExactNd(rng, 4, tier)),
  'div-4d-1d-remainder': remainderDiv('div-4d-1d-remainder', (rng, tier) =>
    pickDivRemainderNd(rng, 4, tier),
  ),
  'div-thousands-mental': divThousandsMental,
  'div-5d-1d': plainDiv('div-5d-1d', (rng, tier) => pickDivExactNd(rng, 5, tier)),
  'div-5d-1d-remainder': remainderDiv('div-5d-1d-remainder', (rng, tier) =>
    pickDivRemainderNd(rng, 5, tier),
  ),
};

export const LARGE_MUL_GENERATORS: Record<string, ReasoningGenerator> = {
  'mul-thousands-mental': mulThousandsMental,
};
