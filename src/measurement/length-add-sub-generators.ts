// Add/sub generator (boost, Phase 1B): word problems that add or subtract
// lengths. Bug values come from the catalogue per part, then combine with the
// operation — so a bug and its value can never drift apart.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { type Candidate, numberStep, reasoningItem, ref } from '../reasoning/reasoning-distractors';
import type { Misconception } from '../reasoning/reasoning-types';
import {
  bugConvertValue,
  bugMixedValue,
  dedupeCandidates,
  lenQtyChoiceStep,
} from './length-bug-catalogue';
import type { Mixed } from './length-mixed-unit-generators';
import { mixedMm } from './length-mixed-unit-generators';
import { type LengthItem, ladderScene, lengthItem, plainLadderScene } from './length-scene-types';
import { convertLength, formatMixed, type LengthUnit, MM_PER_UNIT } from './length-units';
import { LENGTH_LADDER_MAX } from './measurement-ranges';

/** A part converted with the bug when it applies, correctly otherwise. */
function partWithBug(bug: Misconception, value: number, from: LengthUnit, to: LengthUnit): number {
  return bugConvertValue(bug, value, from, to) ?? (convertLength(value, from, to) as number);
}

/** One mixed value converted with the bug when it applies, correctly otherwise. */
function mixedWithBug(bug: Misconception, m: Mixed, to: LengthUnit): number {
  return (
    bugMixedValue(bug, m.big, m.bigUnit, m.small, m.smallUnit, to) ?? mixedMm(m) / MM_PER_UNIT[to]
  );
}

const LEN_OBJECTS = ['i:rope', 'i:ribbon', 'i:cloth', 'i:road'] as const;

/** meas-len-add-sub: word problems that add or subtract lengths. */
export const measLenAddSub = (rng: Rng, tier: SkillTier, _ladder: number): LengthItem => {
  const item = pick(rng, LEN_OBJECTS);
  const add = rng() < 0.5;
  if (tier === 1) {
    // Same unit, number step: the operation itself is the lesson.
    const unit = pick(rng, ['m', 'dm', 'cm'] as const);
    const max = unit === 'm' ? 5 : 9;
    const a = randInt(rng, 2, max);
    const b = add ? randInt(rng, 1, max) : randInt(rng, 1, a - 1);
    const answer = add ? a + b : a - b;
    const story = ref(add ? 'lenAddStory' : 'lenSubStory', {
      item,
      a,
      ua: unit,
      b,
      ub: unit,
    });
    return lengthItem(
      reasoningItem('meas-len-add-sub', tier, story, [
        numberStep(ref(add ? 'lenAskTotal' : 'lenAskLeft', { to: unit }), answer),
      ]),
      plainLadderScene(),
    );
  }
  if (tier === 2) {
    // Two different units, one conversion: bug values per part, then combine.
    // Add keeps the total <= 1000 (so m only subtracts); sub keeps it positive.
    const [bigUnit, smallUnit] = pick(
      rng,
      add
        ? [
            ['dm', 'cm'],
            ['cm', 'mm'],
          ]
        : [
            ['m', 'cm'],
            ['dm', 'cm'],
            ['cm', 'mm'],
          ],
    ) as readonly [LengthUnit, LengthUnit];
    const to: LengthUnit = smallUnit;
    const a = bigUnit === 'm' ? 1 : randInt(rng, 2, 9);
    const aMm = a * MM_PER_UNIT[bigUnit];
    const perB = MM_PER_UNIT[smallUnit];
    const bMax = add ? Math.floor((LENGTH_LADDER_MAX - aMm) / perB) : Math.floor((aMm - 1) / perB);
    const b = randInt(rng, 1, Math.max(1, Math.min(90, bMax)));
    const bMm = b * perB;
    const total = (add ? aMm + bMm : aMm - bMm) / MM_PER_UNIT[to];
    const story = ref(add ? 'lenAddStory' : 'lenSubStory', {
      item,
      a,
      ua: bigUnit,
      b,
      ub: smallUnit,
    });
    const candidates = dedupeCandidates(
      (['unit-factor', 'ignore-unit'] as const).flatMap((bug) => {
        const v =
          partWithBug(bug, a, bigUnit, to) + (add ? 1 : -1) * partWithBug(bug, b, smallUnit, to);
        return v > 0 && v <= LENGTH_LADDER_MAX && v !== total
          ? [{ value: v, misconception: bug } satisfies Candidate<number>]
          : [];
      }),
      total,
    );
    return lengthItem(
      reasoningItem('meas-len-add-sub', tier, story, [
        lenQtyChoiceStep(
          rng,
          ref(add ? 'lenAskTotal' : 'lenAskLeft', { to }),
          total,
          to,
          candidates,
        ),
      ]),
      ladderScene(bigUnit, smallUnit),
    );
  }
  // Tier 3: two mixed values, one operation (the bigger one is cut for sub).
  const pair = pick(rng, [
    ['m', 'cm'],
    ['dm', 'cm'],
  ] as const);
  const [bigUnit, smallUnit] = pair;
  const mk = (): Mixed => ({
    big: bigUnit === 'm' ? 1 : randInt(rng, 1, 5),
    bigUnit,
    small: randInt(rng, 1, 9),
    smallUnit,
  });
  let m1 = mk();
  let m2 = mk();
  while (mixedMm(m1) === mixedMm(m2)) m2 = mk();
  if (!add && mixedMm(m1) < mixedMm(m2)) [m1, m2] = [m2, m1];
  const to: LengthUnit = smallUnit;
  const total = (mixedMm(m1) + (add ? 1 : -1) * mixedMm(m2)) / MM_PER_UNIT[to];
  const story = ref(add ? 'lenAddMixedStory' : 'lenSubMixedStory', {
    item,
    a: formatMixed(m1.big, m1.bigUnit, m1.small, m1.smallUnit),
    b: formatMixed(m2.big, m2.bigUnit, m2.small, m2.smallUnit),
  });
  const candidates = dedupeCandidates(
    (['mixed-concat', 'mixed-drop-big', 'unit-factor'] as const).flatMap((bug) => {
      const v = mixedWithBug(bug, m1, to) + (add ? 1 : -1) * mixedWithBug(bug, m2, to);
      return v > 0 && v <= LENGTH_LADDER_MAX && v !== total
        ? [{ value: v, misconception: bug } satisfies Candidate<number>]
        : [];
    }),
    total,
  );
  return lengthItem(
    reasoningItem('meas-len-add-sub', tier, story, [
      lenQtyChoiceStep(rng, ref(add ? 'lenAskTotal' : 'lenAskLeft', { to }), total, to, candidates),
    ]),
    ladderScene(bigUnit, smallUnit),
  );
};
