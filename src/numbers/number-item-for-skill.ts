// One entry point for the numbers family (phase 07): a number-family skill id + rng + tier
// -> item. The dispatcher already consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import {
  numCompare1000,
  numCompare10000,
  numCompare100000,
  numExpand100000,
  numOrder1000,
  numOrder10000,
  numOrder100000,
} from './compare-order-generators';
import {
  numNeighbors1000,
  numPlaceValue1000,
  numPlaceValue10000,
  numReadWrite1000,
  numReadWrite10000,
  numReadWrite100000,
  numSequence1000,
} from './place-value-generators';

export type NumberGenerator = (rng: Rng, tier: SkillTier) => PracticeItem;

const GENERATORS: Readonly<Record<string, NumberGenerator>> = {
  'num-read-write-1000': numReadWrite1000,
  'num-place-value-1000': numPlaceValue1000,
  'num-neighbors-1000': numNeighbors1000,
  'num-compare-1000': numCompare1000,
  'num-order-1000': numOrder1000,
  'num-sequence-1000': numSequence1000,
  'num-read-write-10000': numReadWrite10000,
  'num-place-value-10000': numPlaceValue10000,
  'num-compare-10000': numCompare10000,
  'num-order-10000': numOrder10000,
  'num-read-write-100000': numReadWrite100000,
  'num-expand-100000': numExpand100000,
  'num-compare-100000': numCompare100000,
  'num-order-100000': numOrder100000,
};

/** The number skills (catalog order) that have a generator. */
export const NUMBER_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isNumberSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a number generator. */
export function numberItemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`number: no generator for skill "${id}"`);
  return generate(rng, tier);
}
