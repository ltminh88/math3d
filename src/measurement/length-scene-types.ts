// Length-ladder scene (boost, Phase 2B): the m -> dm -> cm -> mm staircase the
// dialog draws above a length item. `highlight` marks the conversion the item
// asks about; `arrows` says which way the child converts (x10 down the ladder,
// :10 up). Without them the whole ladder shows, unmarked.
import type { ReasoningItem } from '../reasoning/reasoning-types';
import { LENGTH_LADDER, type LengthUnit } from './length-units';

export interface LengthScene {
  readonly kind: 'length-ladder';
  readonly highlight?: readonly [LengthUnit, LengthUnit];
  readonly arrows?: '×10' | ':10';
}

/** A length item always carries its ladder picture. */
export type LengthItem = ReasoningItem & { readonly scene: LengthScene };

/** The whole ladder, unmarked (compare / order / choose-unit items). */
export const plainLadderScene = (): LengthScene => ({ kind: 'length-ladder' });

/** The ladder for one conversion: the pair is highlighted, arrows in the travel direction. */
export function ladderScene(from: LengthUnit, to: LengthUnit): LengthScene {
  const down = LENGTH_LADDER.indexOf(from) < LENGTH_LADDER.indexOf(to);
  return { kind: 'length-ladder', highlight: [from, to], arrows: down ? '×10' : ':10' };
}

/** Attach a ladder picture to a generated item. */
export function lengthItem(item: ReasoningItem, scene: LengthScene): LengthItem {
  return { ...item, scene };
}
