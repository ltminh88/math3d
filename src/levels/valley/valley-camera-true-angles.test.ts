// The board is judged by eye: a right angle drawn on it must look right-angled on screen at every
// aspect ratio (the four e2e viewports, panel beside or below the board) and every view turn.
import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { BOARD } from './valley-layout-constants';
import { type FreeArea, ValleyCamera } from './valley-camera';

const AREAS: Record<string, FreeArea> = {
  desktop: { width: 1280, height: 720, coverTop: 90, coverRight: 440, coverBottom: 0 },
  phone: { width: 412, height: 839, coverTop: 150, coverRight: 0, coverBottom: 360 },
  'tablet-portrait': { width: 834, height: 1194, coverTop: 120, coverRight: 0, coverBottom: 480 },
  'tablet-landscape': { width: 1194, height: 834, coverTop: 100, coverRight: 420, coverBottom: 0 },
};

/** On-screen angle (degrees) at board point `o` between `a` and `b`. */
function screenAngle(view: ValleyCamera, area: FreeArea, pts: [number, number][]): number {
  const [o, a, b] = pts.map(([x, z]) => {
    const p = new Vector3(x, BOARD.top, z).project(view.camera);
    return [((p.x + 1) / 2) * area.width, ((1 - p.y) / 2) * area.height] as const;
  }) as [readonly [number, number], readonly [number, number], readonly [number, number]];
  const u = [a[0] - o[0], a[1] - o[1]];
  const v = [b[0] - o[0], b[1] - o[1]];
  const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** A 90° corner at `at`, its arms turned by `deg`, 1.5 units long. */
function corner(at: [number, number], deg: number): [number, number][] {
  const r = (deg * Math.PI) / 180;
  const arm = (t: number): [number, number] => [
    at[0] + 1.5 * Math.cos(t),
    at[1] - 1.5 * Math.sin(t),
  ];
  return [at, arm(r), arm(r + Math.PI / 2)];
}

describe('valley board view keeps right angles true on screen', () => {
  for (const [name, area] of Object.entries(AREAS)) {
    it(`${name}: every corner on the board stays 90° ± 1° for every view turn`, () => {
      const view = new ValleyCamera(true);
      view.setArea(area);
      view.frame(5, 3.5);
      for (let step = 0; step < 8; step++) {
        for (const at of [
          [0, 0],
          [-4, 2.5],
          [3.5, -2.5],
        ] as [number, number][])
          for (const deg of [0, 30, 45, 70])
            expect(Math.abs(screenAngle(view, area, corner(at, deg)) - 90)).toBeLessThan(1);
        view.rotate(1);
      }
    });
  }

  it('solids rounds keep the 3/4 view (blocks read as 3D)', () => {
    const view = new ValleyCamera(true);
    view.setArea(AREAS.desktop as FreeArea);
    view.frame(5, 3.5);
    view.setFlat(false);
    const down = new Vector3();
    view.camera.getWorldDirection(down);
    expect(down.y).toBeGreaterThan(-0.99);
    view.setFlat(true);
    view.camera.getWorldDirection(down);
    expect(down.y).toBeCloseTo(-1, 5);
  });
});
