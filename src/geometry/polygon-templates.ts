// Convex polygons on the grid (integer vertices inside GRID_MAX, counter-clockwise, y up), each
// kind with a known number of right angles and a KNTT B19 class. Random sizes never create an
// extra right angle (the triangle and the house avoid the one case that would).
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { Point } from './geo-scene-types';
import { GRID_MAX } from './geometry-ranges';

export type ShapeKind =
  | 'rect'
  | 'square'
  | 'rightTriangle'
  | 'triangle'
  | 'parallelogram'
  | 'rightTrapezoid'
  | 'trapezoid'
  | 'rhombus'
  | 'house';

export type ShapeClass = 'triangle' | 'quad' | 'rect' | 'square' | 'other';

export const SHAPE_FACTS: Readonly<Record<ShapeKind, { rightAngles: number; cls: ShapeClass }>> = {
  rect: { rightAngles: 4, cls: 'rect' },
  square: { rightAngles: 4, cls: 'square' },
  rightTriangle: { rightAngles: 1, cls: 'triangle' },
  triangle: { rightAngles: 0, cls: 'triangle' },
  parallelogram: { rightAngles: 0, cls: 'quad' },
  rightTrapezoid: { rightAngles: 2, cls: 'quad' },
  trapezoid: { rightAngles: 0, cls: 'quad' },
  rhombus: { rightAngles: 0, cls: 'quad' },
  house: { rightAngles: 2, cls: 'other' },
};

const { w: W, h: H } = GRID_MAX;
const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

export function makeShape(rng: Rng, kind: ShapeKind): Point[] {
  switch (kind) {
    case 'rect': {
      const w = randInt(rng, 2, W);
      const h = pick(
        rng,
        range(2, H).filter((v) => v !== w),
      );
      return [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ];
    }
    case 'square': {
      const s = randInt(rng, 2, H);
      return [
        [0, 0],
        [s, 0],
        [s, s],
        [0, s],
      ];
    }
    case 'rightTriangle': {
      const w = randInt(rng, 2, W);
      const h = randInt(rng, 2, H);
      return [
        [0, 0],
        [w, 0],
        [0, h],
      ];
    }
    case 'triangle': {
      const w = randInt(rng, 3, W);
      const x = randInt(rng, 1, w - 1);
      // The apex is a right angle exactly when x(w - x) = h²; skip that height.
      const h = pick(
        rng,
        range(2, H).filter((v) => v * v !== x * (w - x)),
      );
      return [
        [0, 0],
        [w, 0],
        [x, h],
      ];
    }
    case 'parallelogram': {
      const d = randInt(rng, 1, 2);
      const w = randInt(rng, 2, W - d);
      const h = randInt(rng, 2, H);
      return [
        [0, 0],
        [w, 0],
        [w + d, h],
        [d, h],
      ];
    }
    case 'rightTrapezoid': {
      const w = randInt(rng, 3, W);
      const d = randInt(rng, 1, w - 1);
      const h = randInt(rng, 2, H);
      return [
        [0, 0],
        [w, 0],
        [w - d, h],
        [0, h],
      ];
    }
    case 'trapezoid': {
      const d = randInt(rng, 1, 2);
      const w = randInt(rng, 2 * d + 1, W);
      const h = randInt(rng, 2, H);
      return [
        [0, 0],
        [w, 0],
        [w - d, h],
        [d, h],
      ];
    }
    case 'rhombus':
      // Sides of length 5 from the 3-4-5 triangle keep every vertex on the grid.
      return rng() < 0.5
        ? [
            [0, 0],
            [5, 0],
            [8, 4],
            [3, 4],
          ]
        : [
            [3, 0],
            [8, 0],
            [5, 4],
            [0, 4],
          ];
    case 'house': {
      const half = randInt(rng, 1, W / 2);
      const h = randInt(rng, 1, 3);
      // The roof top is a right angle exactly when its height equals the half width.
      const k = pick(
        rng,
        range(1, H - h).filter((v) => v !== half),
      );
      return [
        [0, 0],
        [2 * half, 0],
        [2 * half, h],
        [half, h + k],
        [0, h],
      ];
    }
  }
}
