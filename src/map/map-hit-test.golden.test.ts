import { describe, expect, it } from 'vitest';
import { loadGoldenTrace } from '../config/load-golden-trace-for-tests';
import {
  computeMinimapView,
  computeWorldMapView,
  fitWorldMapView,
  regionAtMapPoint,
  screenToWorld,
} from './map-view-transform';

interface HitTestMode {
  name: string;
  width: number;
  height: number;
  fitDefault: Record<string, number>;
  view: Record<string, number>;
  rows: string[];
}

interface HitTestGolden {
  legend: Record<string, string>;
  grid: number;
  modes: HitTestMode[];
}

describe('map hit-test golden', () => {
  const golden = loadGoldenTrace<HitTestGolden>('map-hit-test.json');

  it.each(golden.modes.map((mode) => [mode.name, mode] as const))(
    '%s: view fit and 40x40 canvas grid -> region match the original',
    (_name, mode) => {
      const { width, height } = mode;
      const view = computeWorldMapView(width, height);
      expect({ ...fitWorldMapView(width, height) }).toEqual(mode.fitDefault);
      expect({ ...view }).toEqual(mode.view);
      const rows: string[] = [];
      for (let row = 0; row < golden.grid; row++) {
        let line = '';
        for (let col = 0; col < golden.grid; col++) {
          const sx = ((col + 0.5) * width) / golden.grid;
          const sy = ((row + 0.5) * height) / golden.grid;
          const point = screenToWorld(view, width, height, sx, sy);
          const id = regionAtMapPoint(point.x, point.z)?.id;
          line += (id && golden.legend[id]) ?? '.';
        }
        rows.push(line);
      }
      expect(rows).toEqual(mode.rows);
    },
  );

  it('uses inclusive footprint edges and open west-bank bounds', () => {
    expect(regionAtMapPoint(17 + 6, -2 + 8)?.id).toBe('garden');
    expect(regionAtMapPoint(-50, 0)).toBeUndefined();
    expect(regionAtMapPoint(-49.9, 0)?.id).toBe('village');
    expect(regionAtMapPoint(5, 0)).toBeUndefined();
  });

  it('minimap view follows the player, 70 world units across', () => {
    expect(computeMinimapView(140, 3, -4, 0.5)).toEqual({ cx: 3, cz: -4, scale: 2, rotation: 0.5 });
  });
});
