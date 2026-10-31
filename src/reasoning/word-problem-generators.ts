// Two-step word problems (KNTT T1 B24, B27, B28, B39). Tier 1 asks each step, tier 2 only the
// result, tier 3 first asks which calculation solves it (misconception expressions) then the result.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  expressionChoiceStep,
  numberChoiceStep,
  numberStep,
  pickNames,
  pickNoun,
  reasoningItem,
  ref,
} from './reasoning-distractors';
import { MAX_NUMBER, TIER_RANGES } from './reasoning-ranges';
import type { ReasoningGenerator, ReasoningStep } from './reasoning-types';

const PICK_EXPR = ref('pickExpr');
const ASK_BOTH = ref('askBoth');

/** Shared tier shape: [step 1, result] / [result] / [expression choice, result]. */
function tiered(
  tier: SkillTier,
  first: ReasoningStep,
  pickExpr: () => ReasoningStep,
  result: ReasoningStep,
): ReasoningStep[] {
  if (tier === 1) return [first, result];
  return tier === 2 ? [result] : [pickExpr(), result];
}

/** A, then B "gấp n lần" A; how many together? a·n + a. */
export const wpTimesThenAdd: ReasoningGenerator = (rng, tier) => {
  const n = pick(rng, TIER_RANGES[tier].factors);
  const a = randInt(rng, 2, Math.min(TIER_RANGES[tier].maxBase, Math.floor(MAX_NUMBER / (n + 1))));
  const [who1, who2] = pickNames(rng);
  const story = ref('wpTimesThenAdd', { who1, who2, a, n, item: pickNoun(rng) });
  const steps = tiered(
    tier,
    numberStep(ref('askOther', { who: who2 }), a * n),
    () =>
      expressionChoiceStep(rng, PICK_EXPR, `${a} × ${n} + ${a}`, [
        { value: `${a} × ${n}`, misconception: 'one-step-only' },
        { value: `${a} + ${n} + ${a}`, misconception: 'add-instead-of-times' },
        { value: `${a} + ${n}`, misconception: 'add-instead-of-times' },
      ]),
    numberStep(ASK_BOTH, a * n + a),
  );
  return reasoningItem('wp-times-then-add', tier, story, steps, [a * n, a * n + a]);
};

/** A, then B is A "giảm n lần"; how many together? a + a:n. */
export const wpDivideThenAdd: ReasoningGenerator = (rng, tier) => {
  const n = pick(rng, TIER_RANGES[tier].factors);
  const maxQ = Math.min(
    Math.floor(TIER_RANGES[tier].maxBase / n),
    Math.floor(MAX_NUMBER / (n + 1)),
  );
  const q = randInt(rng, 2, Math.max(2, maxQ));
  const a = q * n;
  const [who1, who2] = pickNames(rng);
  const story = ref('wpDivideThenAdd', { who1, who2, a, n, item: pickNoun(rng) });
  const steps = tiered(
    tier,
    numberStep(ref('askOther', { who: who2 }), q),
    () =>
      expressionChoiceStep(rng, PICK_EXPR, `${a} : ${n} + ${a}`, [
        { value: `${a} : ${n}`, misconception: 'one-step-only' },
        { value: `${a} − ${n} + ${a}`, misconception: 'minus-instead-of-divide' },
        { value: `${a} × ${n} + ${a}`, misconception: 'wrong-inverse' },
      ]),
    numberStep(ASK_BOTH, a + q),
  );
  return reasoningItem('wp-divide-then-add', tier, story, steps, [q, a + q]);
};

/** A, B has d more / fewer; how many together? a + (a ± d). */
export const wpMoreLessThenTotal: ReasoningGenerator = (rng, tier) => {
  const more = rng() < 0.5;
  const maxA = Math.min(TIER_RANGES[tier].maxBase, 45);
  const a = randInt(rng, 6, maxA);
  const d = more ? randInt(rng, 1, Math.min(20, MAX_NUMBER - 2 * a)) : randInt(rng, 1, a - 1);
  const b = more ? a + d : a - d;
  const sign = more ? '+' : '−';
  const [who1, who2] = pickNames(rng);
  const story = ref(more ? 'wpMoreThenTotal' : 'wpLessThenTotal', {
    who1,
    who2,
    a,
    d,
    item: pickNoun(rng),
  });
  const steps = tiered(
    tier,
    numberStep(ref('askOther', { who: who2 }), b),
    () =>
      expressionChoiceStep(rng, PICK_EXPR, `${a} + (${a} ${sign} ${d})`, [
        { value: `${a} ${sign} ${d}`, misconception: 'one-step-only' },
        { value: `${a} + (${a} ${more ? '−' : '+'} ${d})`, misconception: 'wrong-step' },
        { value: `${a} + ${d}`, misconception: 'one-step-only' },
      ]),
    numberStep(ASK_BOTH, a + b),
  );
  return reasoningItem('wp-more-less-then-total', tier, story, steps, [b, a + b]);
};

/** `boxes` equal boxes hold `total`; how many in `m` boxes? total : boxes × m. */
export const wpUnitThenTimes: ReasoningGenerator = (rng, tier) => {
  const factors = TIER_RANGES[tier].factors;
  const boxes = pick(rng, factors);
  const m = pick(
    rng,
    factors.filter((f) => f !== boxes),
  );
  const unit = randInt(rng, 2, Math.max(2, Math.floor(MAX_NUMBER / Math.max(boxes, m))));
  const total = boxes * unit;
  const story = ref('wpUnitThenTimes', { boxes, total, m, item: pickNoun(rng) });
  const steps = tiered(
    tier,
    numberStep(ref('askUnit'), unit),
    () =>
      expressionChoiceStep(rng, PICK_EXPR, `${total} : ${boxes} × ${m}`, [
        { value: `${total} : ${boxes}`, misconception: 'one-step-only' },
        { value: `${total} + ${m}`, misconception: 'add-instead-of-times' },
        { value: `${total} × ${boxes} : ${m}`, misconception: 'wrong-inverse' },
      ]),
    numberStep(ref('askTotal', { m }), unit * m),
  );
  return reasoningItem('wp-unit-then-times', tier, story, steps, [unit, unit * m]);
};

function comparePair(rng: Rng, tier: SkillTier): { big: number; small: number; n: number } {
  const n = pick(rng, [...TIER_RANGES[tier].factors, ...(tier > 1 ? [10] : [])]);
  const small = randInt(
    rng,
    2,
    Math.max(2, Math.floor(Math.min(TIER_RANGES[tier].maxBase, MAX_NUMBER) / n)),
  );
  return { big: small * n, small, n };
}

/** "big gấp mấy lần small?" (B39); the trap is the difference. */
export const wpTimesCompare: ReasoningGenerator = (rng, tier) => {
  const { big, small, n } = comparePair(rng, tier);
  const story = ref('wpTimesCompare', { big, small, item: pickNoun(rng) });
  const ask = ref('askTimes');
  const trap = [{ value: big - small, misconception: 'difference-not-quotient' as const }];
  const steps: ReasoningStep[] =
    tier === 1
      ? [numberChoiceStep(rng, ask, n, trap)]
      : tier === 2
        ? [numberStep(ask, n)]
        : [numberStep(ref('askMore'), big - small), numberStep(ask, n)];
  return reasoningItem('wp-times-compare', tier, story, steps, [n]);
};

/** "big hơn small bao nhiêu?" (B39); the trap is the quotient. */
export const wpDifferenceCompare: ReasoningGenerator = (rng, tier) => {
  const { big, small, n } = comparePair(rng, tier);
  const story = ref('wpDifferenceCompare', { big, small, item: pickNoun(rng) });
  const ask = ref('askMore');
  const trap = [{ value: n, misconception: 'quotient-not-difference' as const }];
  const steps: ReasoningStep[] =
    tier === 1
      ? [numberChoiceStep(rng, ask, big - small, trap)]
      : tier === 2
        ? [numberStep(ask, big - small)]
        : [numberStep(ref('askTimes'), n), numberStep(ask, big - small)];
  return reasoningItem('wp-difference-compare', tier, story, steps, [big - small]);
};
