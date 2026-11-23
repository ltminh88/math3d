// KNTT B48 / B61: rounding to tens, hundreds, thousands, ten-thousands (5 rounds up),
// plus the tier-3 "which place" question. Tiers raise the traps (5s just below the
// place, boundary carries 995 → 1 000, 9 995 → 10 000, 99 995 → 100 000), never the size.
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import { type Candidate, numberStep, optionsFrom, ref } from '../reasoning/reasoning-distractors';
import type { ChoiceOption, ReasoningStep } from '../reasoning/reasoning-types';
import { numberItem } from './numbers-distractors';
import { RANGE_1000, RANGE_10000, RANGE_100000 } from './numbers-ranges';
import type { PlaceName } from './numbers-scene-types';

export type RoundPlace = 'tens' | 'hundreds' | 'thousands' | 'tenThousands';

const ROUND_DIV: Record<RoundPlace, number> = {
  tens: 10,
  hundreds: 100,
  thousands: 1000,
  tenThousands: 10000,
};

const PLACE_BELOW: Record<RoundPlace, RoundPlace | undefined> = {
  tens: undefined,
  hundreds: 'tens',
  thousands: 'hundreds',
  tenThousands: 'thousands',
};

const PLACE_ABOVE: Record<RoundPlace, RoundPlace | undefined> = {
  tens: 'hundreds',
  hundreds: 'thousands',
  thousands: 'tenThousands',
  tenThousands: undefined,
};

/** One rounding rule: 5 rounds up (Math.round on non-negative numbers). */
export function roundTo(n: number, place: PlaceName): number {
  const div = ROUND_DIV[place as RoundPlace];
  if (div === undefined) throw new Error(`roundTo: cannot round to ${place}`);
  return Math.round(n / div) * div;
}

const ROUND_SPECS: Record<
  string,
  { place: RoundPlace; lo: number; hi: number; edge: number; range: number }
> = {
  'round-tens': { place: 'tens', lo: 11, hi: 999, edge: 995, range: RANGE_1000 },
  'round-hundreds': { place: 'hundreds', lo: 101, hi: 999, edge: 995, range: RANGE_1000 },
  'round-thousands': { place: 'thousands', lo: 1001, hi: 9999, edge: 9995, range: RANGE_10000 },
  'round-ten-thousands': {
    place: 'tenThousands',
    lo: 10001,
    hi: 99999,
    edge: 99995,
    range: RANGE_100000,
  },
};

/**
 * A number to round: never already a multiple of the place (rounding it is trivial).
 * Tier 1 never has a 5 just below the place (the answer is never a coin flip);
 * tier 3 sometimes takes the boundary edge that carries up a whole place.
 */
function pickRoundable(
  rng: Rng,
  spec: { place: RoundPlace; lo: number; hi: number; edge: number },
  tier: SkillTier,
): number {
  if (tier === 3 && rng() < 0.05) return spec.edge;
  for (let tries = 0; tries < 20; tries++) {
    const n = randInt(rng, spec.lo, spec.hi);
    if (n % ROUND_DIV[spec.place] === 0) continue;
    if (tier === 1) {
      const below = Math.floor(n / (ROUND_DIV[spec.place] / 10)) % 10;
      if (below === 5) continue;
    }
    return n;
  }
  return spec.edge;
}

/** The MCQ for one rounding: the answer, the opposite rounding, the neighbouring places, the number itself. */
function roundChoiceStep(
  rng: Rng,
  n: number,
  place: RoundPlace,
  r: number,
  range: number,
): ReasoningStep {
  const div = ROUND_DIV[place];
  const floor = Math.floor(n / div) * div;
  const pool: number[] = [r === floor ? floor + div : floor, n];
  const below = PLACE_BELOW[place];
  if (below) pool.push(roundTo(n, below));
  const above = PLACE_ABOVE[place];
  if (above) pool.push(roundTo(n, above));
  const candidates: Candidate<number>[] = [...new Set(pool)]
    .filter((v) => v > 0 && v <= range && v !== r)
    .map((value) => ({ value, misconception: 'near-miss' as const }));
  return {
    kind: 'choice',
    prompt: ref('askRound'),
    options: optionsFrom(rng, r, candidates, (v) => ref('num', { n: v })),
  };
}

const makeRound =
  (skillId: string) =>
  (rng: Rng, tier: SkillTier): PracticeItem => {
    const spec = ROUND_SPECS[skillId];
    if (!spec) throw new Error(`no rounding spec for ${skillId}`);
    const n = pickRoundable(rng, spec, tier);
    const r = roundTo(n, spec.place);
    const story = ref('roundAsk', { n, place: `i:${spec.place}` });
    if (pick(rng, ['pad', 'choice']) === 'pad')
      return numberItem(skillId, tier, story, [numberStep(ref('askWrite'), r)]);
    return numberItem(skillId, tier, story, [roundChoiceStep(rng, n, spec.place, r, spec.range)]);
  };

export const roundTens = makeRound('round-tens');
export const roundHundreds = makeRound('round-hundreds');
export const roundThousands = makeRound('round-thousands');
export const roundTenThousands = makeRound('round-ten-thousands');

const WHICH_PLACES: Record<SkillTier, readonly RoundPlace[]> = {
  1: ['tens', 'hundreds'],
  2: ['tens', 'hundreds', 'thousands'],
  3: ['tens', 'hundreds', 'thousands', 'tenThousands'],
};

const WHICH_RANGE: Record<SkillTier, readonly [number, number]> = {
  1: [101, 999],
  2: [1001, 9999],
  3: [10001, 99999],
};

/**
 * "Which place?": the story gives the number and its rounded value, never the place.
 * The value must be reachable from exactly one of the offered places — scan upward
 * from a random start (a unique pair always exists, e.g. 147 → 150 at tens, 100 at
 * hundreds), so this always terminates.
 */
export const roundWhichPlace = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'round-which-place';
  const places = WHICH_PLACES[tier];
  const [lo, hi] = WHICH_RANGE[tier];
  const start = randInt(rng, lo, hi);
  let found: { n: number; p: RoundPlace; r: number } | undefined;
  for (let d = 0; d <= hi - lo && !found; d++) {
    const n = lo + ((start - lo + d) % (hi - lo + 1));
    for (const p of shuffle(rng, [...places])) {
      const r = roundTo(n, p);
      if (r === n) continue;
      if (places.every((q) => q === p || roundTo(n, q) !== r)) found = { n, p, r };
      if (found) break;
    }
  }
  if (!found) throw new Error('roundWhichPlace: no unique rounding found');
  const { n, p, r } = found;
  const options: ChoiceOption[] = shuffle(
    rng,
    places.map((place, i) => ({
      id: `o${i}`,
      label: ref(`item_${place}`),
      correct: place === p,
      ...(place === p ? {} : { misconception: 'near-miss' as const }),
    })),
  );
  return numberItem(skillId, tier, ref('roundWhichPlace', { n, r }), [
    { kind: 'choice', prompt: ref('askPlace'), options },
  ]);
};
