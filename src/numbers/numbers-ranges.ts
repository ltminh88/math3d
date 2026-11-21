// Number ranges and digit helpers for the numbers family (phase 07): one generator family
// scales by range (1 000 / 10 000 / 100 000, chosen from the skill id); tiers raise the
// traps (zero digits, the 999/1000 and 9 999/10 000 edges), never the size.
import type { PlaceName } from './numbers-scene-types';

/** The top of the skill's range: the largest number its items may show. */
export const RANGE_1000 = 1000;
export const RANGE_10000 = 10000;
export const RANGE_100000 = 100000;

/** Range from the skill id ('100000' first: '10000' is a substring of it). */
export function rangeOfSkill(skillId: string): number {
  if (skillId.includes('100000')) return RANGE_100000;
  if (skillId.includes('10000')) return RANGE_10000;
  return RANGE_1000;
}

/** Decimal digits, most significant first. */
export const digitsOf = (n: number): number[] => String(n).split('').map(Number);

/** A number from its decimal digits, most significant first. */
export const fromDigits = (ds: readonly number[]): number => ds.reduce((a, d) => a * 10 + d, 0);

/** Whether any digit of `n` is zero. */
export const hasZeroDigit = (n: number): boolean => digitsOf(n).includes(0);

const PLACE_DIV: Record<PlaceName, number> = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1000,
  tenThousands: 10000,
};

/** The digit of `n` at a place. */
export function digitAt(n: number, place: PlaceName): number {
  return Math.floor(n / PLACE_DIV[place]) % 10;
}

/** The places of a range, most significant first. */
export const PLACES_OF_RANGE: Readonly<Record<number, readonly PlaceName[]>> = {
  [RANGE_1000]: ['hundreds', 'tens', 'ones'],
  [RANGE_10000]: ['thousands', 'hundreds', 'tens', 'ones'],
  [RANGE_100000]: ['tenThousands', 'thousands', 'hundreds', 'tens', 'ones'],
};

/** The Vietnamese place word ('trăm', 'nghìn', ...) for a place. */
export const PLACE_WORD: Record<PlaceName, string> = {
  tenThousands: 'chục nghìn',
  thousands: 'nghìn',
  hundreds: 'trăm',
  tens: 'chục',
  ones: 'đơn vị',
};
