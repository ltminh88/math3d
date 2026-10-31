// Geometry and measurement items: a ReasoningItem plus a scene descriptor that levels 06/07 draw.
// Scenes are plain data (grid units, centimetres, grams...), never three.js objects, so tests run
// in node. Every number a child reads in a scene (side labels, ruler, weights, °C) is <= 100.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningItem } from '../reasoning/reasoning-types';

/** Unit of the final answer (`cm2` = cm², `degC` = °C). */
export type Unit = 'cm' | 'cm2' | 'mm' | 'm' | 'g' | 'kg' | 'ml' | 'l' | 'degC';

export type Point = readonly [x: number, y: number];

/** A letter label shown next to a figure (A, B, ...) that options refer to. */
export interface Labeled {
  readonly label: string;
}

export type SceneBody =
  /** Segment AB of `length` cm; points sit at `at` cm from A. */
  | {
      readonly kind: 'segment';
      readonly length: number;
      readonly points: readonly (Labeled & { at: number })[];
    }
  /** Circle; `angleDeg` null is the centre. `segments` join point labels. */
  | {
      readonly kind: 'circle';
      readonly radius: number;
      readonly points: readonly (Labeled & { angleDeg: number | null })[];
      readonly segments: readonly (readonly [string, string])[];
    }
  /** `count` equal circles in a row, touching; `radius` labelled on the first. */
  | { readonly kind: 'circle-row'; readonly radius: number; readonly count: number }
  /** Angles to judge; `rotationDeg` turns the whole angle (0 = one arm horizontal). */
  | {
      readonly kind: 'angles';
      readonly angles: readonly (Labeled & { degrees: number; rotationDeg: number })[];
    }
  /** Polygons on a grid (vertices in grid units, drawn turned by `rotationDeg`). */
  | {
      readonly kind: 'shapes';
      readonly shapes: readonly (Labeled & { vertices: readonly Point[]; rotationDeg: number })[];
    }
  /** Outline split by segments [x1, y1, x2, y2] (grid units); count `ask` shapes in it. */
  | {
      readonly kind: 'figure';
      readonly ask: 'rectangle' | 'triangle';
      readonly segments: readonly (readonly [number, number, number, number])[];
    }
  /** Solids by edge lengths in cm. */
  | { readonly kind: 'solids'; readonly solids: readonly (Labeled & { dims: readonly number[] })[] }
  /** Ruler 0..`maxCm` with mm ticks; an object lies from `fromMm` to `toMm`. */
  | {
      readonly kind: 'ruler';
      readonly maxCm: number;
      readonly fromMm: number;
      readonly toMm: number;
    }
  /** Balance: `count` × item on the left, gram weights on the right, level. */
  | {
      readonly kind: 'balance';
      readonly item: string;
      readonly count: number;
      readonly weights: readonly number[];
    }
  /** Jug of `capacity` ml split in `marks` equal marks; water up to `level` marks. */
  | {
      readonly kind: 'jug';
      readonly capacity: number;
      readonly marks: number;
      readonly level: number;
    }
  /** Thermometers 0-100 °C with a tick every `minorStep` degrees. */
  | {
      readonly kind: 'thermometers';
      readonly minorStep: number;
      readonly readings: readonly (Labeled & { value: number })[];
    }
  /** Polygon with labelled sides (cm, not to scale); `hidden` sides show "?". */
  | {
      readonly kind: 'side-polygon';
      readonly sides: readonly number[];
      readonly hidden: readonly number[];
    }
  /** Rectangle (square when equal); optional corner square cut, gate, wall side (unit `unit`). */
  | {
      readonly kind: 'rect';
      readonly width: number;
      readonly height: number;
      readonly unit: 'cm' | 'm';
      readonly showWidth: boolean;
      readonly showHeight: boolean;
      readonly cut?: number;
      readonly gate?: number;
      readonly wall?: boolean;
    }
  /** Shapes made of 1 cm² cells (grid units); each group is drawn in its own grid. */
  | {
      readonly kind: 'cells';
      readonly groups: readonly (Labeled & { cells: readonly Point[] })[];
    };

export type SceneKind = SceneBody['kind'];

/** Layout hint for 06/07: one scene unit is drawn at least this many CSS px (phone + tablet). */
export type GeoScene = SceneBody & { readonly minUnitPx: number };

export interface GeoItem extends ReasoningItem {
  readonly scene: GeoScene;
  /** Unit of the final answer; null for counts and shape names. */
  readonly unit: Unit | null;
}

export type GeoGenerator = (rng: Rng, tier: SkillTier) => GeoItem;
