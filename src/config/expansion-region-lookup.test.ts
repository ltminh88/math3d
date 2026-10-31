import { describe, expect, it } from 'vitest';
import {
  allRegions,
  areaAt,
  expansionRegionAt,
  isAreaUnlocked,
  nearExpansionRoad,
} from './expansion-region-lookup';
import { EXPANSION_REGIONS } from './expansion-regions';
import { EXPANSION_ROADS } from './expansion-roads';
import { LEVEL_GATES } from './level-gate-config';
import { loadGoldenTrace } from './load-golden-trace-for-tests';
import { REGIONS } from './regions';
import { ROADS } from './roads';
import { WALKABLE_BOUNDS } from './world-constants';

interface RegionGrid {
  legend: Record<string, string>;
  x: [number, number, number];
  z: [number, number, number];
  rows: string[];
}

const overlaps = (
  a: { center: readonly number[]; size: readonly number[] },
  b: { center: readonly number[]; size: readonly number[] },
  pad = 0,
) =>
  Math.abs((a.center[0] ?? 0) - (b.center[0] ?? 0)) <
    ((a.size[0] ?? 0) + (b.size[0] ?? 0)) / 2 + pad &&
  Math.abs((a.center[1] ?? 0) - (b.center[1] ?? 0)) <
    ((a.size[1] ?? 0) + (b.size[1] ?? 0)) / 2 + pad;

describe('expansion regions', () => {
  it('lists the original regions untouched, then valley, workshop, cave', () => {
    expect(allRegions().map((r) => r.id)).toEqual([
      ...REGIONS.map((r) => r.id),
      'valley',
      'workshop',
      'cave',
    ]);
  });

  it('stay inside the walkable banks and clear of every original footprint (+2)', () => {
    for (const region of EXPANSION_REGIONS) {
      const [cx, cz] = region.center;
      const [w, d] = region.size;
      const west = cx < 4;
      const minX = west ? WALKABLE_BOUNDS.west.minX : WALKABLE_BOUNDS.east.minX;
      const maxX = west ? WALKABLE_BOUNDS.west.maxX : WALKABLE_BOUNDS.east.maxX;
      expect(cx - w / 2).toBeGreaterThanOrEqual(minX);
      expect(cx + w / 2).toBeLessThanOrEqual(maxX);
      expect(cz - d / 2).toBeGreaterThanOrEqual(WALKABLE_BOUNDS.minZ);
      expect(cz + d / 2).toBeLessThanOrEqual(WALKABLE_BOUNDS.maxZ);
      for (const original of REGIONS.slice(1)) expect(overlaps(region, original, 2)).toBe(false);
    }
  });

  it('roads start on an original road and end at their region', () => {
    for (const [i, road] of EXPANSION_ROADS.entries()) {
      const start = road[0] as readonly [number, number];
      const end = road.at(-1) as readonly [number, number];
      const onOriginal = ROADS.some((r) =>
        r.some((to, k) => {
          const from = r[k - 1];
          if (!from) return false;
          const cross =
            (to[0] - from[0]) * (start[1] - from[1]) - (to[1] - from[1]) * (start[0] - from[0]);
          return Math.abs(cross) / Math.hypot(to[0] - from[0], to[1] - from[1]) < 0.05;
        }),
      );
      expect(onOriginal).toBe(true);
      expect(expansionRegionAt(end[0], end[1], 1)?.id).toBe(EXPANSION_REGIONS[i]?.id);
    }
    expect(nearExpansionRoad(46, 20, 1.6)).toBe(true);
    expect(nearExpansionRoad(40, 20, 1.6)).toBe(false);
  });

  it('areaAt: expansion ids inside the footprints (+1), the original golden answer elsewhere', () => {
    const golden = loadGoldenTrace<RegionGrid>('region-at-point.json');
    const ids = Object.fromEntries(Object.entries(golden.legend).map(([id, c]) => [c, id]));
    const [x0, , xs] = golden.x;
    const [z0, , zs] = golden.z;
    let expansionHits = 0;
    golden.rows.forEach((row, zi) => {
      [...row].forEach((code, xi) => {
        const x = x0 + xi * xs;
        const z = z0 + zi * zs;
        const expansion = expansionRegionAt(x, z, 1);
        if (expansion) expansionHits++;
        expect(areaAt(x, z).id).toBe(expansion ? expansion.id : ids[code]);
      });
    });
    expect(expansionHits).toBeGreaterThan(400);
    expect(areaAt(40, -37).id).toBe('valley');
    expect(areaAt(45, 38).id).toBe('workshop');
    expect(areaAt(-32, 32).id).toBe('cave');
  });

  it('open once the bridge quest is complete', () => {
    for (const region of EXPANSION_REGIONS) {
      expect(isAreaUnlocked(region, false)).toBe(false);
      expect(isAreaUnlocked(region, true)).toBe(true);
    }
  });

  it('every chapter 2 gate stands inside its region', () => {
    const chapter2 = LEVEL_GATES.filter((g) => ['valley', 'workshop', 'cave'].includes(g.levelId));
    expect(chapter2).toHaveLength(3);
    for (const gate of chapter2) {
      expect(expansionRegionAt(gate.position[0], gate.position[1])?.id).toBe(gate.regionId);
    }
  });
});
