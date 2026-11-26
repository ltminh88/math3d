// Length units for the boost ladder (Phase 1B, D1): m, dm, cm, mm; whole numbers
// <= LENGTH_LADDER_MAX (1000); m<->mm only from ladder L2. The ladder is
// m -> dm -> cm -> mm, one x10 step per rung; legacy skills keep the <=100 cap.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { formatNumber } from '../numbers/numbers-format';

export type LengthUnit = 'm' | 'dm' | 'cm' | 'mm';

/** Ladder order, largest first; neighbours differ by x10. */
export const LENGTH_LADDER: readonly LengthUnit[] = ['m', 'dm', 'cm', 'mm'];

/** Millimetres in one unit. */
export const MM_PER_UNIT: Readonly<Record<LengthUnit, number>> = {
  m: 1000,
  dm: 100,
  cm: 10,
  mm: 1,
};

/** Rungs between two units on the ladder (m->cm = 2, m->mm = 3). */
export function rungsBetween(from: LengthUnit, to: LengthUnit): number {
  return Math.abs(LENGTH_LADDER.indexOf(from) - LENGTH_LADDER.indexOf(to));
}

/** Convert `value` in `from` to `to`; null when the result is not a whole number. */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number | null {
  const out = (value * MM_PER_UNIT[from]) / MM_PER_UNIT[to];
  return Number.isInteger(out) ? out : null;
}

/** Millimetres in `big` bigUnit + `small` smallUnit. */
export function mixedToMm(
  big: number,
  bigUnit: LengthUnit,
  small: number,
  smallUnit: LengthUnit,
): number {
  return big * MM_PER_UNIT[bigUnit] + small * MM_PER_UNIT[smallUnit];
}

/** "1 m 5 cm": a mixed value, numbers grouped as in the textbook. */
export function formatMixed(
  big: number,
  bigUnit: LengthUnit,
  small: number,
  smallUnit: LengthUnit,
): string {
  return `${formatNumber(big)} ${bigUnit} ${formatNumber(small)} ${smallUnit}`;
}

/** "3 m": one quantity, number grouped as in the textbook. */
export function formatQty(value: number, unit: LengthUnit): string {
  return `${formatNumber(value)} ${unit}`;
}

/** Ladder L0-L5 for a skill tier: tier 1 -> L0-1, tier 2 -> L2-3, tier 3 -> L4-5. */
export function ladderForTier(tier: SkillTier, rng: Rng): number {
  return (tier - 1) * 2 + randInt(rng, 0, 1);
}

/** True when the ladder allows the m<->mm jump (L2+). */
export function allowsMetreToMillimetre(ladder: number): boolean {
  return ladder >= 2;
}

/** The units a ladder level may convert between (adjacent first, far jumps later). */
export function ladderPairs(ladder: number): readonly (readonly [LengthUnit, LengthUnit])[] {
  const adjacent: (readonly [LengthUnit, LengthUnit])[] = [
    ['m', 'dm'],
    ['dm', 'cm'],
    ['cm', 'mm'],
  ];
  const far: (readonly [LengthUnit, LengthUnit])[] = [
    ['m', 'cm'],
    ['dm', 'mm'],
  ];
  if (ladder >= 2) return [...adjacent, ...far, ['m', 'mm'] as const];
  return [...adjacent, ...far];
}

export const pickPair = (
  rng: Rng,
  pairs: readonly (readonly [LengthUnit, LengthUnit])[],
): readonly [LengthUnit, LengthUnit] => pick(rng, pairs);
