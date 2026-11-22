// Word problems (phase 09): 1–2 steps, reused contexts, random names and objects.
// Tiers: T1 one step with no carry, T2 one step with one carry or two steps with none,
// T3 two steps with a carry or one step with two carries / a borrow across a zero.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { pickName, pickNames, pickNoun } from '../reasoning/reasoning-distractors';
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { pickAddPair, pickSubPair } from './add-sub-generators';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';
import { RANGE_1000, RANGE_10000, RANGE_100000 } from './arithmetic-ranges';
import { countAddCarries, countSubBorrows } from './carry-count';

/** One step: has a, buys b more / gives b away / has more than a friend. */
function oneStep(rng: Rng, tier: SkillTier, maxSum: number, skillId: string) {
  const frame = pick(rng, ['add', 'sub', 'compare'] as const);
  const item = pickNoun(rng);
  if (frame === 'add') {
    const [a, b] = pickAddPair(rng, maxSum, tier);
    const name = pickName(rng);
    return arithmeticItem(skillId, tier, ref('wpAddHave', { name, item, a, b }), [
      numberStep(ref('askTotal', { name, item }), a + b),
    ]);
  }
  let [a, b] = pickSubPair(rng, maxSum, tier);
  for (let t = 0; t < 20 && a === b; t++) [a, b] = pickSubPair(rng, maxSum, tier);
  if (frame === 'sub') {
    const name = pickName(rng);
    return arithmeticItem(skillId, tier, ref('wpSubGive', { name, item, a, b }), [
      numberStep(ref('askLeft', { name, item }), a - b),
    ]);
  }
  const [name, name2] = pickNames(rng);
  return arithmeticItem(skillId, tier, ref('wpCompare', { name, name2, item, a, b }), [
    numberStep(ref('askMore', { name, name2, item }), a - b),
  ]);
}

/** Two steps: has a, buys b, then buys c more / gives c away. */
function twoStep(rng: Rng, tier: SkillTier, maxSum: number, skillId: string) {
  const name = pickName(rng);
  const item = pickNoun(rng);
  const isAdd = rng() < 0.5;
  const minOperand = maxSum >= RANGE_100000 ? 10000 : maxSum >= RANGE_10000 ? 1000 : 10;
  for (let t = 0; t < 500; t++) {
    const a = randInt(rng, minOperand, maxSum - 20);
    if (maxSum - a - 10 < minOperand) continue;
    const b = randInt(rng, minOperand, maxSum - a - 10);
    const first = a + b;
    if (first > maxSum - minOperand) continue;
    const c = isAdd ? randInt(rng, minOperand, maxSum - first) : randInt(rng, minOperand, first);
    const total =
      countAddCarries(a, b) + (isAdd ? countAddCarries(first, c) : countSubBorrows(first, c));
    if (tier === 2 && total !== 0) continue;
    if (tier === 3 && total < 1) continue;
    const final = isAdd ? first + c : first - c;
    if (isAdd)
      return arithmeticItem(
        skillId,
        tier,
        ref('wpTwoStepAdd', { name, item, a, b, c }),
        [
          numberStep(ref('askAfterBuy', { name, item }), first),
          numberStep(ref('askFinalTotal', { name, item }), final),
        ],
        [first],
      );
    return arithmeticItem(
      skillId,
      tier,
      ref('wpTwoStepLeft', { name, item, a, b, c }),
      [
        numberStep(ref('askAfterBuy', { name, item }), first),
        numberStep(ref('askFinalLeft', { name, item }), final),
      ],
      [first],
    );
  }
  return arithmeticItem(
    skillId,
    tier,
    ref('wpTwoStepAdd', { name, item, a: 100, b: 100, c: 100 }),
    [
      numberStep(ref('askAfterBuy', { name, item }), 200),
      numberStep(ref('askFinalTotal', { name, item }), 300),
    ],
    [200],
  );
}

const wordProblem =
  (skillId: string, maxSum: number): ReasoningGenerator =>
  (rng, tier) => {
    const twoStepAt = tier === 1 ? false : tier === 2 ? rng() < 0.5 : rng() < 0.7;
    return twoStepAt ? twoStep(rng, tier, maxSum, skillId) : oneStep(rng, tier, maxSum, skillId);
  };

export const WORD_PROBLEM_GENERATORS: Record<string, ReasoningGenerator> = {
  'add-sub-1000-wp': wordProblem('add-sub-1000-wp', RANGE_1000),
  'add-sub-10000-wp': wordProblem('add-sub-10000-wp', RANGE_10000),
  'add-sub-100000-wp': wordProblem('add-sub-100000-wp', RANGE_100000),
};
