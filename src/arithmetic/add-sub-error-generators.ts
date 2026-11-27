// Error generators (boost, Phase 1A — split from add-sub-generators.ts, no
// behaviour change except find-error's false value, which now comes from the
// bug catalogue when a bug applies): find-the-error and the missing digit.
import { pick, randInt } from '../learning/seeded-rng';
import { pickName } from '../reasoning/reasoning-distractors';
import type { ReasoningGenerator, ReasoningStep } from '../reasoning/reasoning-types';
import { bugsFor } from './add-sub-bug-catalogue';
import { pickAddPair, pickSubPair } from './add-sub-pair-pickers';
import {
  arithmeticItem,
  numberStep,
  ref,
  wrongAddByForgotCarry,
  wrongBySlip,
  wrongSubByNoBorrow,
} from './arithmetic-distractors';
import { tierRangeCap } from './arithmetic-ranges';
import type { ColumnCalcScene } from './column-calc-scene-types';

/** Đúng/Sai on a worked result: half the time the shown result is right, half the time it
 *  is built from the bug catalogue (Phase 1A) when a bug applies, otherwise from the
 *  misconception of the tier (a slip at T1, a forgotten carry / a missing borrow at
 *  T2–T3). The story always shows the full worked result. */
export const findError: ReasoningGenerator = (rng, tier) => {
  const cap = tierRangeCap(tier);
  const isAdd = rng() < 0.5;
  const [a, b] = isAdd ? pickAddPair(rng, cap, tier) : pickSubPair(rng, cap, tier);
  const correct = isAdd ? a + b : a - b;
  const truth = rng() < 0.5;
  let shown = correct;
  if (!truth) {
    // Bug values above the tier cap (a misaligned value can overshoot) are
    // not shown: every number the child sees stays inside the cap.
    const bugs = bugsFor(a, b, isAdd ? '+' : '−').filter((f) => f.value <= cap);
    const fromBug = bugs.length > 0 ? pick(rng, bugs).value : undefined;
    const fromTier =
      tier === 1
        ? wrongBySlip(correct, rng)
        : isAdd
          ? wrongAddByForgotCarry(a, b)
          : wrongSubByNoBorrow(a, b);
    shown = fromBug ?? fromTier;
    if (shown === correct || shown > cap) shown = wrongBySlip(correct, rng);
    if (shown === correct || shown > cap) shown = correct > 0 ? correct - 1 : 1;
  }
  const name = pickName(rng);
  const step: ReasoningStep = {
    kind: 'verdict',
    prompt: ref('isNameTrue', { name }),
    statement: ref('stmtEq', { text: `${a} ${isAdd ? '+' : '−'} ${b}`, value: shown }),
    answer: truth,
    ...(truth ? {} : { fix: { prompt: ref('askCorrect'), answer: correct } }),
  };
  // Boost, Phase 2A: from T2 the buggy row shows in the column-calc scene, so
  // the child reads the worked columns instead of a bare equation. T1 stays
  // scene-free (the range is small and the equation fits the step card).
  const scene: ColumnCalcScene | undefined =
    tier >= 2
      ? {
          kind: 'column-calc',
          op: isAdd ? '+' : '−',
          top: a,
          bottom: b,
          filled: [],
          carries: [],
          focusCol: 0,
          buggy: String(shown).split('').map(Number).reverse(),
        }
      : undefined;
  return arithmeticItem(
    'add-sub-find-error',
    tier,
    ref(isAdd ? 'errorAdd' : 'errorSub', { name, a, b, shown }),
    [step],
    truth ? [] : [correct],
    scene,
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

export const ADD_SUB_ERROR_GENERATORS: Record<string, ReasoningGenerator> = {
  'add-sub-find-error': findError,
  'add-missing-digit': missingDigit,
};
