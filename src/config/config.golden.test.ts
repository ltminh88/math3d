import { describe, expect, it } from 'vitest';
import { levelForXp } from '../game/xp-levels';
import { defaultSave } from '../save/save-storage';
import { loadGoldenTrace } from './load-golden-trace-for-tests';
import { isRegionUnlocked, REGIONS, regionAtPoint, regionById } from './regions';
import { ROADS } from './roads';
import { createSeededLcg } from './seeded-lcg';
import {
  BRIDGE_SEGMENTS,
  LEVEL_XP_THRESHOLDS,
  RIVER,
  SAVE_KEY,
  SKY_HORIZON_COLOR,
  SKY_TOP_COLOR,
  TABLES,
  WALKABLE_BOUNDS,
} from './world-constants';

interface RegionGrid {
  legend: Record<string, string>;
  rows: string[];
  unlocked: { id: string; before: boolean; after: boolean }[];
}

describe('config golden traces', () => {
  it('constants match the original bundle', () => {
    const golden = loadGoldenTrace<Record<string, unknown>>('constants.json');
    expect({
      Ha: TABLES,
      Kl: SAVE_KEY,
      yt: BRIDGE_SEGMENTS,
      Sa: LEVEL_XP_THRESHOLDS,
      Qe: RIVER,
      fe: WALKABLE_BOUNDS,
      Dt: REGIONS,
      Wr: ROADS,
      defaultSave: defaultSave(),
    }).toEqual(golden);
    expect(JSON.stringify(defaultSave())).toBe(JSON.stringify(golden.defaultSave));
    expect([SKY_TOP_COLOR, SKY_HORIZON_COLOR]).toEqual([7651302, 13954796]);
  });

  it('levelForXp reproduces levels for xp 0..800', () => {
    const golden = loadGoldenTrace<{ thresholds: number[]; levelByXp: number[] }>(
      'level-thresholds.json',
    );
    expect({
      thresholds: [...LEVEL_XP_THRESHOLDS],
      levelByXp: Array.from({ length: 801 }, (_, xp) => levelForXp(xp)),
    }).toEqual(golden);
  });

  it('regionAtPoint reproduces the x -60..80, z -50..50 grid and unlock rules', () => {
    const golden = loadGoldenTrace<RegionGrid>('region-at-point.json');
    const rows: string[] = [];
    for (let z = -50; z <= 50; z++) {
      let row = '';
      for (let x = -60; x <= 80; x++) row += golden.legend[regionAtPoint(x, z).id];
      rows.push(row);
    }
    expect(rows).toEqual(golden.rows);
    const unlocked = REGIONS.map((r) => ({
      id: r.id,
      before: isRegionUnlocked(r, false),
      after: isRegionUnlocked(r, true),
    }));
    expect(unlocked).toEqual(golden.unlocked);
  });

  it('regionById finds regions and returns undefined for unknown ids', () => {
    expect(regionById('forest')?.center).toEqual([34, 22]);
    expect(regionById('nowhere')).toBeUndefined();
  });

  it('seeded LCG reproduces the first 1000 values per seed', () => {
    const golden = loadGoldenTrace<Record<string, number[]>>('lcg-first-1000.json');
    const streams = Object.fromEntries(
      Object.keys(golden).map((seed) => {
        const next = createSeededLcg(Number(seed));
        return [seed, Array.from({ length: 1000 }, () => next())];
      }),
    );
    expect(Object.keys(golden).sort()).toEqual(['1337', '23', '7', '91']);
    expect(streams).toEqual(golden);
  });
});
