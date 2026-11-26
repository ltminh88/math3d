// Mixed-unit generator (boost, Phase 1B): "1 m 5 cm <-> 105 cm" both ways.
// Bug values come from the catalogue, so a bug and its value can never drift apart.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { type Candidate, numberStep, reasoningItem, ref } from '../reasoning/reasoning-distractors';
import type { Misconception, ReasoningItem } from '../reasoning/reasoning-types';
import {
  bugMixedPair,
  bugMixedValue,
  dedupeCandidates,
  lenQtyChoiceStep,
  lenTextChoiceStep,
} from './length-bug-catalogue';
import { formatMixed, type LengthUnit, MM_PER_UNIT, mixedToMm } from './length-units';

/** A mixed value: `big` bigUnit + `small` smallUnit (small < one bigUnit). */
export interface Mixed {
  readonly big: number;
  readonly bigUnit: LengthUnit;
  readonly small: number;
  readonly smallUnit: LengthUnit;
}

export const mixedMm = (m: Mixed): number => mixedToMm(m.big, m.bigUnit, m.small, m.smallUnit);

/** The mixed pairs 1B uses, with the small part always a single digit. */
function pickMixed(rng: Rng, ladder: number): Mixed {
  const pairs: readonly (readonly [LengthUnit, LengthUnit])[] =
    ladder < 2
      ? [
          ['dm', 'cm'],
          ['cm', 'mm'],
        ]
      : [
          ['m', 'cm'],
          ['m', 'dm'],
          ['dm', 'cm'],
          ['cm', 'mm'],
        ];
  const [bigUnit, smallUnit] = pick(rng, pairs);
  const bigMax = bigUnit === 'm' ? 1 : 9;
  return {
    big: randInt(rng, 1, bigMax),
    bigUnit,
    small: randInt(rng, 1, 9),
    smallUnit,
  };
}

/** meas-len-mixed: 1 m 5 cm <-> 105 cm, both ways. */
export const measLenMixed = (rng: Rng, tier: SkillTier, ladder: number): ReasoningItem => {
  const m = pickMixed(rng, ladder);
  const to: LengthUnit = m.smallUnit;
  const total = mixedMm(m) / MM_PER_UNIT[to];
  const storyToSingle = ref('lenMixedToSingle', {
    a: m.big,
    ua: m.bigUnit,
    b: m.small,
    ub: m.smallUnit,
    to,
  });
  // Direction A: mixed -> single. Number step at tier 1, bug choices above.
  if (tier === 1 || rng() < 0.5) {
    if (tier === 1)
      return reasoningItem('meas-len-mixed', tier, storyToSingle, [
        numberStep(ref('askNumber'), total),
      ]);
    const candidates = dedupeCandidates(
      (['mixed-concat', 'mixed-drop-big', 'unit-factor'] as const).flatMap((bug) => {
        const v = bugMixedValue(bug, m.big, m.bigUnit, m.small, m.smallUnit, to);
        return v === null ? [] : [{ value: v, misconception: bug } satisfies Candidate<number>];
      }),
      total,
    );
    return reasoningItem('meas-len-mixed', tier, storyToSingle, [
      lenQtyChoiceStep(rng, ref('askNumber'), total, to, candidates),
    ]);
  }
  // Direction B: single -> mixed. Options are mixed pairs, as text.
  const story = ref('lenMixedFromSingle', { n: total, from: to, to: m.bigUnit, to2: m.smallUnit });
  const correctPair = { big: m.big, small: m.small };
  const wrongPairs: { pair: { big: number; small: number }; bug: Misconception }[] = [];
  const factor = bugMixedPair('unit-factor', mixedMm(m), m.bigUnit, m.smallUnit);
  if (factor) wrongPairs.push({ pair: factor, bug: 'unit-factor' });
  const ignored = bugMixedPair('ignore-unit', mixedMm(m), m.bigUnit, m.smallUnit);
  if (ignored) wrongPairs.push({ pair: ignored, bug: 'ignore-unit' });
  if (wrongPairs.length < 2) {
    // Near miss: one step off in the small part (or the big part when it is 1).
    const near = m.small > 1 ? { ...m, small: m.small - 1 } : { ...m, big: m.big + 1 };
    wrongPairs.push({ pair: { big: near.big, small: near.small }, bug: 'near-miss' });
  }
  const seen = new Set<string>([formatMixed(m.big, m.bigUnit, m.small, m.smallUnit)]);
  const candidates: Candidate<{ big: number; small: number }>[] = [];
  for (const w of wrongPairs) {
    const label = formatMixed(w.pair.big, m.bigUnit, w.pair.small, m.smallUnit);
    if (seen.has(label)) continue;
    seen.add(label);
    candidates.push({ value: w.pair, misconception: w.bug });
  }
  return reasoningItem('meas-len-mixed', tier, story, [
    lenTextChoiceStep(rng, ref('lenPickMixed'), correctPair, candidates.slice(0, 3), (p) =>
      ref('lenMixed', { a: p.big, ua: m.bigUnit, b: p.small, ub: m.smallUnit }),
    ),
  ]);
};
