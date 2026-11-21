// Fraction scenes (phase 12): plain data the phase-16 dialog renderer draws — a shape split
// into parts with some shaded, a set of objects with some marked, or several shapes to pick
// from. Scenes carry part sizes, never pixels, so tests run in node.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeScene } from '../practice/practice-scene';
import type { ReasoningItem } from '../reasoning/reasoning-types';

/** A letter label shown next to a figure (A, B, ...) that options refer to. */
export interface Labeled {
  readonly label: string;
}

/** One shape split into parts: circle sectors, bar columns or grid cells. */
export interface FractionShapeBody {
  readonly shape: 'circle' | 'bar' | 'grid';
  readonly parts: number;
  /** 0-based indices of the shaded parts (always one part for unit fractions). */
  readonly shaded: readonly number[];
  /** False = the parts have unequal sizes (the core trap: no 1/n can be read off it). */
  readonly equal: boolean;
  /** Relative part sizes when !equal (length === parts; circle/bar only). */
  readonly sizes?: readonly number[];
  /** Grid columns (parts = rows × cols; grid only). */
  readonly cols?: number;
}

/** A shape to look at: `kind` names the phase-16 renderer that draws it. */
export interface FractionShapeScene extends PracticeScene, FractionShapeBody {
  readonly kind: 'fraction-shape';
  readonly minUnitPx: number;
}

/** A set of `count` objects, `marked` of them circled (layout: `cols` per row). */
export interface FractionSetScene extends PracticeScene {
  readonly kind: 'fraction-set';
  readonly count: number;
  readonly marked: readonly number[];
  readonly cols: number;
  readonly minUnitPx: number;
}

/** 3-4 shapes to pick from, labelled A-D. */
export interface FractionPickScene extends PracticeScene {
  readonly kind: 'fraction-pick';
  readonly figures: readonly (Labeled & FractionShapeBody)[];
  readonly minUnitPx: number;
}

export type FractionScene = FractionShapeScene | FractionSetScene | FractionPickScene;

/** A fraction item: a ReasoningItem, with a scene exactly when the question shows a picture. */
export interface FractionItem extends ReasoningItem {
  readonly scene?: FractionScene;
}

export type FractionGenerator = (rng: Rng, tier: SkillTier) => FractionItem;
