import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { GRID_MAX } from './geometry-ranges';
import { classify, isConvex, rightAngles } from './geometry-test-oracles';
import { makeShape, SHAPE_FACTS, type ShapeKind } from './polygon-templates';

describe('polygon templates', () => {
  for (const kind of Object.keys(SHAPE_FACTS) as ShapeKind[])
    it(`${kind}: convex, on the grid, right angles and class as declared`, () => {
      for (let seed = 0; seed < 1000; seed++) {
        const vs = makeShape(mulberry32(seed), kind);
        expect(isConvex(vs)).toBe(true);
        for (const [x, y] of vs) {
          expect(x >= 0 && x <= GRID_MAX.w && Number.isInteger(x)).toBe(true);
          expect(y >= 0 && y <= GRID_MAX.h && Number.isInteger(y)).toBe(true);
        }
        expect(rightAngles(vs), `${kind} #${seed}`).toBe(SHAPE_FACTS[kind].rightAngles);
        expect(classify(vs)).toBe(SHAPE_FACTS[kind].cls);
      }
    });
});
