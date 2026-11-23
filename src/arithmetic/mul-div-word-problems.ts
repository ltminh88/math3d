// Word problems (phase 10): 1–2 steps, reused contexts, random names and objects.
// 2-digit WPs (B23, B26) stay one step; 3-digit mul WPs (B36) add a two-step form
// (multiply, then use some up); div WPs ask "cần ít nhất bao nhiêu hộp?" and round
// up when there is a remainder.
// Big-number contexts (le, 22/11): counts in the hundreds belong to a warehouse, a
// library or a school — never to one child's marbles or sweets. The 2-digit forms
// keep the personal nouns.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { pickName, pickNoun } from '../reasoning/reasoning-distractors';
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';
import { RANGE_99, RANGE_999 } from './arithmetic-ranges';
import { countMulCarries, countSubBorrows } from './carry-count';
import { pickMulPair } from './mul-generators';

/** A big-number two-step context: the story key, the step-1 key (which asks how much
 *  was bought in all — one purchase only, so never "Sau lần mua thứ nhất"), and the
 *  `i:` item for the generic final step. Exported for the phase-11 large word
 *  problems, which reuse the same contexts. */
export const BIG_THEN_SUB = [
  { story: 'wpMulThenSubRice', askFirst: 'askTotalBoughtRice', item: 'i:riceKg' },
  { story: 'wpMulThenSubBooks', askFirst: 'askTotalBoughtBooks', item: 'i:book' },
  { story: 'wpMulThenSubSchool', askFirst: 'askTotalBoughtSchool', item: 'i:book' },
] as const;

/** A big-number "gấp n lần" context: the story key and its step key. Exported for
 *  the phase-11 large word problems, which reuse the same contexts. */
export const BIG_TIMES = [
  { story: 'wpMulTimesRice', ask: 'askTotalRice' },
  { story: 'wpMulTimesBooks', ask: 'askTotalBooks' },
  { story: 'wpMulTimesStudents', ask: 'askTotalStudents' },
] as const;

/** One step: n boxes with the same count in each (2-digit product ≤ 99). */
const mulWp2d: ReasoningGenerator = (rng, tier) => {
  const [per, n] = pickMulPair(rng, RANGE_99, tier);
  const name = pickName(rng);
  const item = pickNoun(rng);
  return arithmeticItem('mul-2d-1d-wp', tier, ref('wpMulGroups', { name, item, per, n }), [
    numberStep(ref('askTotal', { name, item }), per * n),
  ]);
};

/** Two steps: a warehouse / library / school buys n boxes with the same count, then
 *  uses c up. Step 1 asks how much was bought in all (a single purchase). */
function mulThenSub(rng: Rng, tier: SkillTier, wantZero: boolean) {
  const ctx = pick(rng, BIG_THEN_SUB);
  for (let t = 0; t < 500; t++) {
    const per = randInt(rng, 101, 999);
    const n = randInt(rng, 2, 9);
    const total = per * n;
    if (total > RANGE_999) continue;
    const c = randInt(rng, 10, total);
    const carries = countMulCarries(per, n) + countSubBorrows(total, c);
    if (wantZero && carries !== 0) continue;
    if (!wantZero && carries < 1) continue;
    return arithmeticItem(
      'mul-3d-1d-wp',
      tier,
      ref(ctx.story, { per, n, c }),
      [
        numberStep(ref(ctx.askFirst), total),
        numberStep(ref('askFinalLeftBig', { item: ctx.item }), total - c),
      ],
      [total],
    );
  }
  const per = wantZero ? 111 : 115;
  const n = 2;
  const c = wantZero ? 22 : 30;
  const total = per * n;
  return arithmeticItem(
    'mul-3d-1d-wp',
    tier,
    ref(ctx.story, { per, n, c }),
    [
      numberStep(ref(ctx.askFirst), total),
      numberStep(ref('askFinalLeftBig', { item: ctx.item }), total - c),
    ],
    [total],
  );
}

/** One step: one warehouse / library / school has a, another has b times as many. */
function mulTimes(rng: Rng, tier: SkillTier) {
  const [a, b] = pickMulPair(rng, RANGE_999, tier);
  const ctx = pick(rng, BIG_TIMES);
  return arithmeticItem('mul-3d-1d-wp', tier, ref(ctx.story, { a, b }), [
    numberStep(ref(ctx.ask), a * b),
  ]);
}

/** 3-digit mul WP: T1 one step with no carry, T2 one step with one carry or two
 *  steps with none, T3 two steps with a carry or one step with two carries. */
const mulWp3d: ReasoningGenerator = (rng, tier) => {
  const twoStepAt = tier === 1 ? false : tier === 2 ? rng() < 0.5 : rng() < 0.7;
  return twoStepAt ? mulThenSub(rng, tier, tier === 2) : mulTimes(rng, tier);
};

/** One step: share a items equally among b friends. */
function divShare(rng: Rng, tier: SkillTier) {
  const name = pickName(rng);
  const item = pickNoun(rng);
  for (let t = 0; t < 500; t++) {
    const b = randInt(rng, 2, 9);
    const q = randInt(rng, 2, Math.floor(RANGE_99 / b));
    const a = q * b;
    if (a < 21) continue;
    return arithmeticItem('div-2d-1d-wp', tier, ref('wpDivShare', { name, item, a, b }), [
      numberStep(ref('askEach', { item }), q),
    ]);
  }
  const name2 = pickName(rng);
  return arithmeticItem(
    'div-2d-1d-wp',
    tier,
    ref('wpDivShare', { name: name2, item, a: 48, b: 4 }),
    [numberStep(ref('askEach', { item }), 12)],
  );
}

/** One or two steps: a items, b per box. T2 asks "cần ít nhất bao nhiêu hộp?"
 *  (round up). T3 asks three steps in order — full boxes, leftover, boxes needed
 *  to hold them all — because the leftover only makes sense once the full boxes
 *  are counted. */
function divBoxes(rng: Rng, tier: SkillTier) {
  const name = pickName(rng);
  const item = pickNoun(rng);
  for (let t = 0; t < 500; t++) {
    const b = randInt(rng, 2, 9);
    const q = randInt(rng, 2, Math.floor(RANGE_99 / b));
    const r = randInt(rng, 1, b - 1);
    const a = q * b + r;
    if (a < 21 || a > RANGE_99) continue;
    const boxes = q + 1;
    if (tier === 2)
      return arithmeticItem('div-2d-1d-wp', tier, ref('wpDivBoxes', { name, item, a, b }), [
        numberStep(ref('askBoxes'), boxes),
      ]);
    return arithmeticItem(
      'div-2d-1d-wp',
      tier,
      ref('wpDivBoxes', { name, item, a, b }),
      [
        numberStep(ref('askFullBoxes'), q),
        numberStep(ref('askLeftover', { item }), r),
        numberStep(ref('askBoxes'), boxes),
      ],
      [q, r],
    );
  }
  return arithmeticItem(
    'div-2d-1d-wp',
    tier,
    ref('wpDivBoxes', { name, item, a: 50, b: 4 }),
    tier === 2
      ? [numberStep(ref('askBoxes'), 13)]
      : [
          numberStep(ref('askFullBoxes'), 12),
          numberStep(ref('askLeftover', { item }), 2),
          numberStep(ref('askBoxes'), 13),
        ],
    tier === 2 ? [] : [12, 2],
  );
}

/** 2-digit div WP: T1 share equally, T2 boxes (round up), T3 boxes + the leftover. */
const divWp2d: ReasoningGenerator = (rng, tier) =>
  tier === 1 ? divShare(rng, tier) : divBoxes(rng, tier);

export const MUL_DIV_WP_GENERATORS: Record<string, ReasoningGenerator> = {
  'mul-2d-1d-wp': mulWp2d,
  'mul-3d-1d-wp': mulWp3d,
  'div-2d-1d-wp': divWp2d,
};
