// Length-ladder generators (boost, Phase 1B): the ladder itself, adjacent
// conversions and far conversions. Items are plain ReasoningItems — no scene
// until 2B draws the `length-ladder` scene. The ladder level comes from the skill
// tier (tier 1 -> L0-1, tier 2 -> L2-3, tier 3 -> L4-5); m<->mm only at L2+.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { type Candidate, numberStep, reasoningItem, ref } from '../reasoning/reasoning-distractors';
import type { ReasoningItem } from '../reasoning/reasoning-types';
import { bugConvertValue, dedupeCandidates, lenQtyChoiceStep } from './length-bug-catalogue';
import { convertLength, formatQty, LENGTH_LADDER, type LengthUnit } from './length-units';
import { LENGTH_LADDER_MAX } from './measurement-ranges';

const ADJACENT: readonly (readonly [LengthUnit, LengthUnit])[] = [
  ['m', 'dm'],
  ['dm', 'cm'],
  ['cm', 'mm'],
];
const FAR: readonly (readonly [LengthUnit, LengthUnit])[] = [
  ['m', 'cm'],
  ['dm', 'mm'],
];

/** One rung of a chain: the value in that unit, or '?' for the blank. */
function chainString(values: readonly (number | null)[], units: readonly LengthUnit[]): string {
  return values
    .map((v, i) => (v === null ? '?' : formatQty(v, units[i] as LengthUnit)))
    .join(' = ');
}

/**
 * meas-len-ladder: one blank in a x10 / ÷10 chain. L0-1 chains have 2 rungs and
 * only go down (x10); L2+ chains have 3 rungs and may divide.
 */
export const measLenLadder = (rng: Rng, tier: SkillTier, ladder: number): ReasoningItem => {
  const down = ladder === 0 ? true : rng() < 0.5;
  const rungs = ladder >= 2 ? 3 : 2;
  const start = randInt(rng, 0, LENGTH_LADDER.length - rungs);
  // Down the ladder the units run big -> small (1 m = 10 dm = 100 cm); up the
  // ladder they run small -> big (100 cm = 10 dm = 1 m) — the numbers are
  // equal quantities either way.
  const units = down
    ? LENGTH_LADDER.slice(start, start + rungs)
    : LENGTH_LADDER.slice(start, start + rungs).reverse();
  // Down starts small (n, n*10, n*100); up starts big and divides by 10.
  const first = down
    ? randInt(rng, 1, Math.floor(LENGTH_LADDER_MAX / 10 ** (rungs - 1)))
    : randInt(rng, 1, 9) * 10 ** (rungs - 1);
  const values = units.map((_, i) => (down ? first * 10 ** i : first / 10 ** i));
  const blankAt = randInt(rng, 0, rungs - 1);
  const answer = values[blankAt] as number;
  const shown = values.map((v, i) => (i === blankAt ? null : v));
  return reasoningItem(
    'meas-len-ladder',
    tier,
    ref('lenLadder', { chain: chainString(shown, units) }),
    [numberStep(ref('askLadderBlank'), answer)],
    values,
  );
};

/** One adjacent conversion; number step at tier 1, bug-tagged choices above. */
export const measLenConvert = (rng: Rng, tier: SkillTier, _ladder: number): ReasoningItem => {
  const [big, small] = pick(rng, ADJACENT);
  const down = rng() < 0.5;
  const from = down ? big : small;
  const to = down ? small : big;
  const n = down ? randInt(rng, 1, 100) : randInt(rng, 1, 100) * 10;
  const answer = convertLength(n, from, to) as number;
  const story = ref('lenConvert', { n, from, to });
  if (tier === 1)
    return reasoningItem('meas-len-convert', tier, story, [numberStep(ref('askNumber'), answer)]);
  const candidates = dedupeCandidates(
    (['unit-direction', 'ignore-unit'] as const).flatMap((bug) => {
      const v = bugConvertValue(bug, n, from, to);
      return v === null ? [] : [{ value: v, misconception: bug } satisfies Candidate<number>];
    }),
    answer,
  );
  return reasoningItem('meas-len-convert', tier, story, [
    lenQtyChoiceStep(rng, ref('askNumber'), answer, to, candidates),
  ]);
};

/** One far conversion (2 rungs, or m<->mm at L2+); number step at tier 1. */
export const measLenConvertFar = (rng: Rng, tier: SkillTier, ladder: number): ReasoningItem => {
  const pairs = ladder >= 2 ? [...FAR, ['m', 'mm'] as const] : FAR;
  const [big, small] = pick(rng, pairs);
  const down = rng() < 0.5;
  const from = down ? big : small;
  const to = down ? small : big;
  const factor = big === 'm' && small === 'mm' ? 1000 : 100;
  const n = down
    ? randInt(rng, 1, Math.floor(LENGTH_LADDER_MAX / factor))
    : randInt(rng, 1, Math.floor(LENGTH_LADDER_MAX / factor)) * factor;
  const answer = convertLength(n, from, to) as number;
  const story = ref('lenConvert', { n, from, to });
  if (tier === 1)
    return reasoningItem('meas-len-convert-far', tier, story, [
      numberStep(ref('askNumber'), answer),
    ]);
  const candidates = dedupeCandidates(
    (['unit-direction', 'unit-factor', 'dm-skipped', 'ignore-unit'] as const).flatMap((bug) => {
      const v = bugConvertValue(bug, n, from, to);
      return v === null ? [] : [{ value: v, misconception: bug } satisfies Candidate<number>];
    }),
    answer,
  );
  return reasoningItem('meas-len-convert-far', tier, story, [
    lenQtyChoiceStep(rng, ref('askNumber'), answer, to, candidates),
  ]);
};
