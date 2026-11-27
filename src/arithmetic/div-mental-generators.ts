// Arithmetic generators (phase 7 split): mental round tens/hundreds divisions and
// "giảm n lần". Exact divisions use (quotient, divisor) construction; the T3
// chains are two-step (divide, then add/subtract a round number).
import { pick, randInt } from '../learning/seeded-rng';
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';
import { RANGE_99, RANGE_999 } from './arithmetic-ranges';
import { mentalVerdictItem, missingDigitItem, missingNumberItem } from './mul-div-missing-factor';

const hasZero = (q: number): boolean => String(q).includes('0');

/** Round tens : a digit (exact, round-tens quotient): T1 quotient 10–40, T1–T2
 *  a missing-number form (R117), T3 a two-step chain or a Đúng/Sai verdict. */
export const divTensMental: ReasoningGenerator = (rng, tier) => {
  if (tier === 3) {
    if (rng() < 0.5) {
      for (let t = 0; t < 500; t++) {
        const tens = randInt(rng, 1, 9);
        const b = randInt(rng, 2, 9);
        if (tens % b !== 0) continue;
        return mentalVerdictItem('div-tens-mental', tier, false, tens * 10, b, rng);
      }
      return mentalVerdictItem('div-tens-mental', tier, false, 60, 3, rng);
    }
    for (let t = 0; t < 500; t++) {
      const tens = randInt(rng, 1, 9);
      const b = randInt(rng, 2, 9);
      if (tens % b !== 0) continue;
      const a = tens * 10;
      const first = a / b;
      const op = pick(rng, ['+', '−'] as const);
      const c = randInt(rng, 1, 9) * 10;
      const final = op === '+' ? first + c : first - c;
      if (final < 0 || final > RANGE_99) continue;
      return arithmeticItem(
        'div-tens-mental',
        tier,
        ref('mentalCalc', { expr: `${a} : ${b} ${op} ${c}` }),
        [numberStep(ref('askResult'), final)],
      );
    }
    return arithmeticItem('div-tens-mental', tier, ref('mentalCalc', { expr: '60 : 3 + 10' }), [
      numberStep(ref('askResult'), 30),
    ]);
  }
  for (let t = 0; t < 500; t++) {
    const tens = randInt(rng, 1, 9);
    const b = randInt(rng, 2, 9);
    if (tens % b !== 0) continue;
    const q = (tens / b) * 10;
    if (q > 40) continue;
    const a = tens * 10;
    const form = pick(rng, ['plain', 'divisor', 'dividend'] as const);
    if (form === 'divisor') return missingDigitItem('div-tens-mental', tier, `${a} : □ = ${q}`, b);
    if (form === 'dividend')
      return missingNumberItem('div-tens-mental', tier, `□ : ${b} = ${q}`, a);
    return arithmeticItem('div-tens-mental', tier, ref('mentalCalc', { expr: `${a} : ${b}` }), [
      numberStep(ref('askResult'), q),
    ]);
  }
  return arithmeticItem(
    'div-tens-mental',
    tier,
    ref('mentalCalc', { expr: tier === 1 ? '60 : 3' : '80 : 2' }),
    [numberStep(ref('askResult'), tier === 1 ? 20 : 40)],
  );
};

/** Round hundreds : a digit (exact, round-hundreds quotient): T1 quotient 100–400,
 *  T1–T2 a missing-number form (R117), T3 a two-step chain or a Đúng/Sai
 *  verdict. */
export const divHundredsMental: ReasoningGenerator = (rng, tier) => {
  if (tier === 3) {
    if (rng() < 0.5) {
      for (let t = 0; t < 500; t++) {
        const h = randInt(rng, 1, 9);
        const b = randInt(rng, 2, 9);
        if (h % b !== 0) continue;
        return mentalVerdictItem('div-hundreds-mental', tier, false, h * 100, b, rng);
      }
      return mentalVerdictItem('div-hundreds-mental', tier, false, 600, 3, rng);
    }
    for (let t = 0; t < 500; t++) {
      const h = randInt(rng, 1, 9);
      const b = randInt(rng, 2, 9);
      if (h % b !== 0) continue;
      const a = h * 100;
      const first = a / b;
      const op = pick(rng, ['+', '−'] as const);
      const c = randInt(rng, 1, 9) * 100;
      const final = op === '+' ? first + c : first - c;
      if (final < 0 || final > RANGE_999) continue;
      return arithmeticItem(
        'div-hundreds-mental',
        tier,
        ref('mentalCalc', { expr: `${a} : ${b} ${op} ${c}` }),
        [numberStep(ref('askResult'), final)],
      );
    }
    return arithmeticItem(
      'div-hundreds-mental',
      tier,
      ref('mentalCalc', { expr: '600 : 3 + 100' }),
      [numberStep(ref('askResult'), 300)],
    );
  }
  for (let t = 0; t < 500; t++) {
    const h = randInt(rng, 1, 9);
    const b = randInt(rng, 2, 9);
    if (h % b !== 0) continue;
    const q = (h / b) * 100;
    if (q > 400) continue;
    const a = h * 100;
    const form = pick(rng, ['plain', 'divisor', 'dividend'] as const);
    if (form === 'divisor')
      return missingDigitItem('div-hundreds-mental', tier, `${a} : □ = ${q}`, b);
    if (form === 'dividend')
      return missingNumberItem('div-hundreds-mental', tier, `□ : ${b} = ${q}`, a);
    return arithmeticItem('div-hundreds-mental', tier, ref('mentalCalc', { expr: `${a} : ${b}` }), [
      numberStep(ref('askResult'), q),
    ]);
  }
  return arithmeticItem(
    'div-hundreds-mental',
    tier,
    ref('mentalCalc', { expr: tier === 1 ? '200 : 2' : '800 : 2' }),
    [numberStep(ref('askResult'), tier === 1 ? 100 : 400)],
  );
};

/** "Giảm n lần": a quantity divided by n. T1 a round hundred, T2 a 3-digit exact
 *  division, T3 a zero in the quotient. The unit is a translated `i:` param. The
 *  story is the question itself ("Giảm … đi n lần thì được bao nhiêu …?") — reducing
 *  is a division, never "còn lại". */
export const divReduceTimes: ReasoningGenerator = (rng, tier) => {
  const unit = pick(rng, ['i:minute', 'i:meter', 'i:ml', 'i:gram'] as const);
  for (let t = 0; t < 500; t++) {
    const b = randInt(rng, 2, 9);
    const q =
      tier === 1
        ? randInt(rng, 10, 90)
        : tier === 2
          ? randInt(rng, 10, 99)
          : randInt(rng, 101, 909);
    const a = q * b;
    if (tier === 1 && a % 100 !== 0) continue;
    if (tier === 1 && (a < 100 || a > RANGE_999)) continue;
    if (tier !== 1 && (a < 102 || a > RANGE_999)) continue;
    if (tier === 2 && hasZero(q)) continue;
    if (tier === 3 && !hasZero(q)) continue;
    return arithmeticItem('div-reduce-times', tier, ref('wpReduceTimes', { a, unit, b }), [
      numberStep(ref('askResult'), q),
    ]);
  }
  const [a, b] = tier === 1 ? [400, 4] : tier === 2 ? [252, 6] : [804, 4];
  return arithmeticItem('div-reduce-times', tier, ref('wpReduceTimes', { a, unit, b }), [
    numberStep(ref('askResult'), a / b),
  ]);
};

export const DIV_MENTAL_GENERATORS: Record<string, ReasoningGenerator> = {
  'div-tens-mental': divTensMental,
  'div-hundreds-mental': divHundredsMental,
  'div-reduce-times': divReduceTimes,
};
