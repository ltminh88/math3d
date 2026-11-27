// Everyday objects with realistic length ranges (anti-repeat Phase 6): the
// choose-unit item draws its number inside the range, so one object is many
// questions. Ranges stay realistic for a child (a 9 m pencil is never drawn).
// mm objects only play at ladder L2+ (the generator filters them out below).
import { type Rng, randInt } from '../learning/seeded-rng';
import type { LengthUnit } from './length-units';

export interface LenObjectRange {
  readonly item: string;
  readonly unit: LengthUnit;
  /** Smallest realistic length in `unit`. */
  readonly lo: number;
  /** Largest realistic length in `unit`. */
  readonly hi: number;
}

/** Everyday objects and their true length range (exported for the sweep oracle). */
export const OBJECTS: readonly LenObjectRange[] = [
  { item: 'i:pencil', unit: 'cm', lo: 12, hi: 18 },
  { item: 'i:eraser', unit: 'cm', lo: 3, hi: 6 },
  { item: 'i:ribbon', unit: 'cm', lo: 40, hi: 60 },
  { item: 'i:leaf', unit: 'cm', lo: 6, hi: 10 },
  { item: 'i:crayon', unit: 'cm', lo: 8, hi: 12 },
  { item: 'i:book', unit: 'cm', lo: 20, hi: 30 },
  { item: 'i:ruler', unit: 'cm', lo: 15, hi: 30 },
  { item: 'i:spoon', unit: 'cm', lo: 12, hi: 18 },
  { item: 'i:toothbrush', unit: 'cm', lo: 15, hi: 19 },
  { item: 'i:phone', unit: 'cm', lo: 14, hi: 17 },
  { item: 'i:scissors', unit: 'cm', lo: 12, hi: 20 },
  { item: 'i:cup', unit: 'cm', lo: 8, hi: 12 },
  { item: 'i:plate', unit: 'cm', lo: 20, hi: 25 },
  { item: 'i:shoe', unit: 'cm', lo: 18, hi: 28 },
  { item: 'i:sock', unit: 'cm', lo: 15, hi: 25 },
  { item: 'i:key', unit: 'cm', lo: 5, hi: 7 },
  { item: 'i:stamp', unit: 'cm', lo: 2, hi: 4 },
  { item: 'i:button', unit: 'cm', lo: 1, hi: 3 },
  { item: 'i:paperclip', unit: 'cm', lo: 3, hi: 5 },
  { item: 'i:candle', unit: 'cm', lo: 10, hi: 20 },
  { item: 'i:coin', unit: 'cm', lo: 2, hi: 3 },
  { item: 'i:notebook', unit: 'dm', lo: 2, hi: 3 },
  { item: 'i:handspan', unit: 'dm', lo: 1, hi: 2 },
  { item: 'i:textbook', unit: 'dm', lo: 2, hi: 3 },
  { item: 'i:pillow', unit: 'dm', lo: 4, hi: 6 },
  { item: 'i:brick', unit: 'dm', lo: 2, hi: 3 },
  { item: 'i:lunchbox', unit: 'dm', lo: 2, hi: 3 },
  { item: 'i:desk', unit: 'm', lo: 1, hi: 2 },
  { item: 'i:door', unit: 'm', lo: 2, hi: 2 },
  { item: 'i:rope', unit: 'm', lo: 2, hi: 5 },
  { item: 'i:cloth', unit: 'm', lo: 1, hi: 3 },
  { item: 'i:road', unit: 'm', lo: 20, hi: 100 },
  { item: 'i:classroom', unit: 'm', lo: 6, hi: 10 },
  { item: 'i:bed', unit: 'm', lo: 2, hi: 2 },
  { item: 'i:tree', unit: 'm', lo: 3, hi: 10 },
  { item: 'i:ant', unit: 'mm', lo: 2, hi: 5 },
  { item: 'i:rice', unit: 'mm', lo: 4, hi: 6 },
  { item: 'i:sesame', unit: 'mm', lo: 2, hi: 3 },
  { item: 'i:pinhead', unit: 'mm', lo: 1, hi: 2 },
  { item: 'i:sand', unit: 'mm', lo: 1, hi: 2 },
];

/** One length for the object, drawn inside its range. */
export function randomObjectLength(rng: Rng, obj: LenObjectRange): number {
  return randInt(rng, obj.lo, obj.hi);
}
