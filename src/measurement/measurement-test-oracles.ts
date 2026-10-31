// Test-only: the answer unit expected per story key, and an independent area count.
import { expect } from 'vitest';
import type { Unit } from '../geometry/geo-scene-types';

export const UNIT: Record<string, Unit | null> = {
  rulerCm: 'cm',
  rulerMm: 'mm',
  rulerShift: 'mm',
  cmToMm: 'mm',
  mmToCm: 'cm',
  compareCmMm: null,
  diffCmMm: 'mm',
  balanceRead: 'g',
  heavier: 'g',
  balanceShare: 'g',
  jugRead: 'ml',
  jugMarks: 'ml',
  jugPour: 'ml',
  tempRead: 'degC',
  tempHottest: null,
  tempColdest: null,
  tempDrop: 'degC',
  perimSum: 'cm',
  perimMissing: 'cm',
  rectPerim: 'cm',
  rectPerimBack: 'cm',
  squarePerim: 'cm',
  wireSquare: 'cm',
  areaCount: 'cm2',
  areaUnit: 'cm2',
  areaDiff: 'cm2',
  rectArea: 'cm2',
  rectCut: 'cm2',
  squareArea: 'cm2',
  squareFromRect: 'cm',
  fence: 'm',
  fenceGate: 'm',
  fenceWall: 'm',
};

/** Unique, edge-connected cells; returns the area in cm². */
export function area(cells: readonly (readonly [number, number])[]): number {
  const keys = new Set(cells.map(([x, y]) => `${x},${y}`));
  expect(keys.size).toBe(cells.length);
  const seen = new Set([`${cells[0]?.[0]},${cells[0]?.[1]}`]);
  const queue = [cells[0] as readonly [number, number]];
  while (queue.length) {
    const [x, y] = queue.pop() as readonly [number, number];
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const k = `${x + dx},${y + dy}`;
      if (keys.has(k) && !seen.has(k)) {
        seen.add(k);
        queue.push([x + dx, y + dy]);
      }
    }
  }
  expect(seen.size).toBe(keys.size);
  return keys.size;
}
