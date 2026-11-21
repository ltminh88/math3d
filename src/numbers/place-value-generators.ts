// KNTT B1 / B45 / B59: reading, writing and place value of numbers to 1 000 / 10 000 /
// 100 000, neighbours and sequences. Tiers raise the traps (zero digits, the 999/1000 edge,
// the tricky "mốt / tư / lăm" readings), never the size. Tier 1 is always scene-free;
// from tier 2 the place-value and sequence items carry their picture as plain data.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import { numberToVietnameseWords } from './number-words-vi';
import {
  expandedChoiceStep,
  numberItem,
  numberLineScene,
  placeValueScene,
  taggedDistractors,
  wordsChoiceStep,
} from './numbers-distractors';
import {
  digitAt,
  digitsOf,
  fromDigits,
  PLACES_OF_RANGE,
  RANGE_1000,
  RANGE_10000,
  RANGE_100000,
} from './numbers-ranges';
import type { PlaceName } from './numbers-scene-types';

type NumKind = 'noZero' | 'hasZero' | 'tricky' | 'plain';

/** A number with `digits` digits of the requested kind (leading digit never zero). */
export function pickNumber(rng: Rng, digits: 3 | 4 | 5, kind: NumKind): number {
  const ds: number[] = [randInt(rng, 1, 9)];
  if (kind === 'noZero') {
    for (let i = 1; i < digits; i++) ds.push(randInt(rng, 1, 9));
  } else if (kind === 'hasZero') {
    const zeroAt = randInt(rng, 1, digits - 1);
    for (let i = 1; i < digits; i++) ds.push(i === zeroAt ? 0 : randInt(rng, 1, 9));
    if (rng() < 0.2) ds[randInt(rng, 1, digits - 1)] = 0;
  } else if (kind === 'tricky') {
    for (let i = 1; i < digits - 2; i++) ds.push(randInt(rng, 0, 9));
    // Weighted by pool size (24 vs 1 tens/ones combos) so the tricky readings cover
    // uniformly instead of drilling "mười lăm" on 40% of draws.
    if (rng() < 0.96) {
      ds.push(randInt(rng, 2, 9));
      ds.push(pick(rng, [1, 4, 5]));
    } else {
      ds.push(1);
      ds.push(5);
    }
  } else {
    for (let i = 1; i < digits; i++) ds.push(randInt(rng, 0, 9));
  }
  return fromDigits(ds);
}

/** T1 no zero, T2 a zero digit, T3 the tricky readings. */
export const kindFor = (tier: SkillTier): NumKind =>
  tier === 1 ? 'noZero' : tier === 2 ? 'hasZero' : 'tricky';

/** Read-write for one range: words → digits (number pad) or digits → words (MCQ). */
const makeReadWrite =
  (skillId: string, digits: 3 | 4 | 5, range: number, edge: number) =>
  (rng: Rng, tier: SkillTier): PracticeItem => {
    let n = pickNumber(rng, digits, kindFor(tier));
    if (tier === 3 && rng() < 0.05) n = edge;
    if (pick(rng, ['readWords', 'writeWords']) === 'readWords')
      return numberItem(skillId, tier, ref('readWords', { words: numberToVietnameseWords(n) }), [
        numberStep(ref('askWrite'), n),
      ]);
    return numberItem(skillId, tier, ref('writeWords', { n }), [
      wordsChoiceStep(rng, ref('askReading'), n, taggedDistractors(n, range), range),
    ]);
  };

export const numReadWrite1000 = makeReadWrite('num-read-write-1000', 3, RANGE_1000, 1000);
export const numReadWrite10000 = makeReadWrite('num-read-write-10000', 4, RANGE_10000, 10000);
export const numReadWrite100000 = makeReadWrite('num-read-write-100000', 5, RANGE_100000, 100000);

/** Place value for one range: match the parts, name the digit at a place, expand (T3). */
const makePlaceValue =
  (skillId: string, digits: 3 | 4 | 5, range: number) =>
  (rng: Rng, tier: SkillTier): PracticeItem => {
    const n = pickNumber(rng, digits, kindFor(tier));
    const scene = tier === 1 ? undefined : placeValueScene(n, range);
    const form =
      tier === 3
        ? pick(rng, ['matchParts', 'digitAtPlace', 'expandSum'] as const)
        : pick(rng, ['matchParts', 'digitAtPlace'] as const);
    if (form === 'matchParts') {
      const ds = digitsOf(n);
      const at = (i: number): number => {
        const d = ds[i];
        if (d === undefined) throw new Error(`no digit ${i} in ${n}`);
        return d;
      };
      const params: Record<string, number> =
        digits === 3
          ? { a: at(0), b: at(1), c: at(2) }
          : digits === 4
            ? { a: at(0), b: at(1), c: at(2), d: at(3) }
            : { a: at(0), b: at(1), c: at(2), d: at(3), e: at(4) };
      return numberItem(
        skillId,
        tier,
        ref(`matchParts${digits}`, params),
        [numberStep(ref('askWrite'), n)],
        scene,
      );
    }
    if (form === 'digitAtPlace') {
      const place = pick(rng, PLACES_OF_RANGE[range] ?? []) as PlaceName;
      return numberItem(
        skillId,
        tier,
        ref('digitAtPlace', { n, place: `i:${place}` }),
        [numberStep(ref('askDigit'), digitAt(n, place))],
        scene,
      );
    }
    return numberItem(
      skillId,
      tier,
      ref('expandSum', { n }),
      [expandedChoiceStep(rng, ref('askExpanded'), n, range)],
      scene,
    );
  };

export const numPlaceValue1000 = makePlaceValue('num-place-value-1000', 3, RANGE_1000);
export const numPlaceValue10000 = makePlaceValue('num-place-value-10000', 4, RANGE_10000);

/** Neighbours (B1): T1 inside a ten, T2 across a hundred, T3 three in a row. */
export const numNeighbors1000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-neighbors-1000';
  if (tier === 1) {
    const twoDigit = rng() < 0.4;
    const n = twoDigit
      ? randInt(rng, 1, 9) * 10 + randInt(rng, 2, 8)
      : randInt(rng, 1, 9) * 100 + randInt(rng, 0, 9) * 10 + randInt(rng, 2, 8);
    return numberItem(skillId, 1, ref('neighbors', { n }), [
      numberStep(ref('askPrev'), n - 1),
      numberStep(ref('askNext'), n + 1),
    ]);
  }
  if (tier === 2) {
    // Every hundred boundary: the round hundred itself (prev crosses), the number just
    // past it (prev is the round hundred) and the number just before the next (next crosses).
    const n = pick(
      rng,
      [
        100, 200, 300, 400, 500, 600, 700, 800, 900, 101, 201, 301, 401, 501, 601, 701, 801, 901,
        199, 299, 399, 499, 599, 699, 799, 899, 999,
      ],
    );
    return numberItem(skillId, 2, ref('neighbors', { n }), [
      numberStep(ref('askPrev'), n - 1),
      numberStep(ref('askNext'), n + 1),
    ]);
  }
  const s = pick(rng, [1, -1] as const);
  const a = s === 1 ? (rng() < 0.15 ? 998 : randInt(rng, 100, 997)) : randInt(rng, 3, 1000);
  return numberItem(skillId, 3, ref('neighborsTrio', { a, b: a + s }), [
    numberStep(ref('askMissing'), a + 2 * s),
  ]);
};

/** Sequences of step 1 (B1): T1 up, T2 down (sometimes from 1000), T3 two gaps. */
export const numSequence1000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-sequence-1000';
  if (tier === 1) {
    const a = randInt(rng, 100, 996);
    return numberItem(skillId, 1, ref('sequence', { a, b: a + 1, d: a + 3 }), [
      numberStep(ref('askMissing'), a + 2),
    ]);
  }
  if (tier === 2) {
    const a = rng() < 0.05 ? 1000 : randInt(rng, 103, 999);
    const marks = [a, a - 1, a - 2, a - 3];
    return numberItem(
      skillId,
      2,
      ref('sequence', { a, b: a - 1, d: a - 3 }),
      [numberStep(ref('askMissing'), a - 2)],
      numberLineScene(marks, [2], -1),
    );
  }
  const s = pick(rng, [1, -1] as const);
  const a = s === 1 ? randInt(rng, 100, 997) : randInt(rng, 103, 999);
  const marks = [a, a + s, a + 2 * s, a + 3 * s];
  return numberItem(
    skillId,
    3,
    ref('sequenceTwoGaps', { a, c: a + 2 * s }),
    [
      numberStep(ref('askMissingLabel', { label: 'A' }), a + s),
      numberStep(ref('askMissingLabel', { label: 'B' }), a + 3 * s),
    ],
    numberLineScene(marks, [1, 3], s),
  );
};
