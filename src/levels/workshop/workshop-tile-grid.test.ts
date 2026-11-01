import { describe, expect, it } from 'vitest';
import type { GeoScene, Point } from '../../geometry/geo-scene-types';
import { fenceSides, WorkshopFenceWalk } from './workshop-fence-walk';
import { TILE_LIMIT, tileTargets, WorkshopTileGrid } from './workshop-tile-grid';

const rect = (width: number, height: number, extra: Partial<GeoScene> = {}): GeoScene =>
  ({
    kind: 'rect',
    width,
    height,
    unit: 'cm',
    showWidth: true,
    showHeight: true,
    minUnitPx: 32,
    ...extra,
  }) as GeoScene;

describe('workshop tile grid model', () => {
  const L: Point[] = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [0, 2],
  ];

  it('places and removes tiles only on the shape', () => {
    const grid = new WorkshopTileGrid(L);
    expect(grid.toggle(1, 0)).toBe(true);
    expect(grid.toggle(1, 1)).toBe(false);
    expect(grid.placed).toBe(1);
    grid.toggle(1, 0);
    expect(grid.placed).toBe(0);
    expect(grid.has(1, 0)).toBe(false);
  });

  it('"đặt một hàng" fills the next row that is not full, top to bottom', () => {
    const grid = new WorkshopTileGrid(L);
    grid.toggle(0, 0);
    expect(grid.placeRow()).toEqual([
      [1, 0],
      [2, 0],
    ]);
    expect(grid.placeRow()).toEqual([[0, 1]]);
    expect(grid.placeRow()).toEqual([[0, 2]]);
    expect(grid.full).toBe(true);
    expect(grid.placeRow()).toEqual([]);
    expect(grid.placed).toBe(5);
  });

  it('a rectangle is its own grid of w x h cells', () => {
    const [cells] = tileTargets(rect(4, 3), 1) ?? [];
    expect(cells).toHaveLength(12);
  });

  it('tiles only small shapes: cells groups, and tier-1 whole rectangles up to the limit', () => {
    expect(TILE_LIMIT).toBe(20);
    expect(tileTargets(rect(5, 4), 1)).not.toBeNull();
    expect(tileTargets(rect(7, 3), 1)).toBeNull();
    expect(tileTargets(rect(4, 3), 2)).toBeNull();
    expect(tileTargets(rect(4, 3, { cut: 1 } as Partial<GeoScene>), 1)).toBeNull();
    const cells = {
      kind: 'cells',
      groups: [
        { label: 'A', cells: L },
        { label: 'B', cells: L.slice(0, 3) },
      ],
      minUnitPx: 28,
    } as GeoScene;
    expect(tileTargets(cells, 3)?.map((g) => g.length)).toEqual([5, 3]);
    expect(tileTargets({ kind: 'jug', capacity: 100, marks: 10, level: 3 } as never, 1)).toBeNull();
  });
});

describe('workshop fence walk', () => {
  it('a rectangle has four sides; hidden heights show as unknown', () => {
    expect(fenceSides(rect(5, 3))).toEqual([
      { length: 5, known: true, wall: false },
      { length: 3, known: true, wall: false },
      { length: 5, known: true, wall: false },
      { length: 3, known: true, wall: false },
    ]);
    const hidden = fenceSides(rect(5, 3, { showHeight: false } as Partial<GeoScene>));
    expect(hidden.map((s) => s.known)).toEqual([true, false, true, false]);
  });

  it('a side-polygon keeps its sides; a wall side is not fenced', () => {
    const poly = { kind: 'side-polygon', sides: [4, 6, 7], hidden: [2], minUnitPx: 24 } as never;
    expect(fenceSides(poly).map((s) => [s.length, s.known])).toEqual([
      [4, true],
      [6, true],
      [7, false],
    ]);
    const walled = fenceSides(rect(9, 4, { wall: true, unit: 'm' } as Partial<GeoScene>));
    expect(walled.map((s) => s.wall)).toEqual([true, false, false, false]);
  });

  it('walks each fence side once, in tap order or with "đi tiếp", and shows the sum so far', () => {
    const walk = new WorkshopFenceWalk(fenceSides(rect(5, 3)));
    expect(walk.walk(1)).toBe(true);
    expect(walk.walk(1)).toBe(false);
    // "Đi tiếp" carries on round the fence from the last side walked.
    expect(walk.walkNext()).toBe(2);
    expect(walk.expression()).toBe('3 + 5');
    walk.walkNext();
    expect(walk.complete).toBe(false);
    walk.walkNext();
    expect(walk.walked).toEqual([1, 2, 3, 0]);
    expect(walk.complete).toBe(true);
    expect(walk.walkNext()).toBe(-1);
    // The sum itself stays the child's job.
    expect(walk.expression()).toBe('3 + 5 + 3 + 5');
  });

  it('skips the wall and writes ? for an unknown side', () => {
    const walk = new WorkshopFenceWalk(fenceSides(rect(9, 4, { wall: true } as Partial<GeoScene>)));
    expect(walk.walk(0)).toBe(false);
    expect(walk.walkNext()).toBe(1);
    const hidden = new WorkshopFenceWalk(
      fenceSides(rect(5, 3, { showHeight: false } as Partial<GeoScene>)),
    );
    hidden.walkNext();
    hidden.walkNext();
    expect(hidden.expression()).toBe('5 + ?');
  });
});
