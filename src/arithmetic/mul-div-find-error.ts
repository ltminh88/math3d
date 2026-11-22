// Mul/div find-error (phase 10): Đúng/Sai on a worked mul or div result. The wrong
// result comes from the tier's misconception — a slip at T1, a forgotten carry /
// a wrong quotient digit at T2, and at T3 the classic dropped zero in the quotient
// (804 : 4 shown as 21 instead of 201) or a forgotten carry in a 3-digit product.
// The story always shows the full worked result.
import type { Rng } from '../learning/seeded-rng';
import { pickName } from '../reasoning/reasoning-distractors';
import type { ReasoningGenerator, ReasoningStep } from '../reasoning/reasoning-types';
import { arithmeticItem, ref, wrongBySlip, wrongMulByForgotCarry } from './arithmetic-distractors';
import { RANGE_99, tierRangeCapMulDiv } from './arithmetic-ranges';
import { pickDivExact2d, pickDivExact3d } from './div-generators';
import { pickMulPair } from './mul-generators';

/** The quotient with its first zero digit dropped (201 -> 21), or undefined when
 *  the quotient has no zero to drop. */
function dropZero(q: number): number | undefined {
  const s = String(q);
  const idx = s.indexOf('0');
  if (idx === -1) return undefined;
  return Number(s.slice(0, idx) + s.slice(idx + 1));
}

/** A wrong quotient: the dropped zero when there is one, else a small slip. */
function wrongQuotient(q: number, rng: Rng): number {
  const dropped = dropZero(q);
  if (dropped !== undefined && dropped !== q) return dropped;
  return wrongBySlip(q, rng);
}

export const mulDivFindError: ReasoningGenerator = (rng, tier) => {
  const cap = tierRangeCapMulDiv(tier);
  const isMul = rng() < 0.5;
  let a: number;
  let b: number;
  let correct: number;
  if (isMul) {
    [a, b] = pickMulPair(rng, cap, tier);
    correct = a * b;
  } else if (cap === RANGE_99) {
    [a, b] = pickDivExact2d(rng, tier);
    correct = a / b;
  } else {
    [a, b] = tier === 3 ? pickDivExact3d(rng, 3) : pickDivExact3d(rng, 2);
    correct = a / b;
  }
  const truth = rng() < 0.5;
  let shown = correct;
  if (!truth) {
    if (isMul) {
      shown = tier === 1 ? wrongBySlip(correct, rng) : wrongMulByForgotCarry(a, b);
    } else if (tier === 3) {
      shown = wrongQuotient(correct, rng);
    } else {
      shown = wrongBySlip(correct, rng);
    }
    if (shown === correct) shown = wrongBySlip(correct, rng);
  }
  const name = pickName(rng);
  const step: ReasoningStep = {
    kind: 'verdict',
    prompt: ref('isNameTrue', { name }),
    statement: ref('stmtEq', { text: `${a} ${isMul ? '×' : ':'} ${b}`, value: shown }),
    answer: truth,
    ...(truth ? {} : { fix: { prompt: ref('askCorrect'), answer: correct } }),
  };
  return arithmeticItem(
    'mul-div-find-error',
    tier,
    ref(isMul ? 'errorMul' : 'errorDiv', { name, a, b, shown }),
    [step],
    truth ? [] : [correct],
  );
};

export const MUL_DIV_FIND_ERROR_GENERATORS: Record<string, ReasoningGenerator> = {
  'mul-div-find-error': mulDivFindError,
};
