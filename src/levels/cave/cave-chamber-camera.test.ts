// Phase 25b (issue #46): the cave camera scales its auto-fit distance by the zoom
// factor, clamps it to 0.6×–1.6×, and keeps the free-area view offset untouched.
import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CaveChamberCamera } from './cave-chamber-camera';
import { chamberCenter } from './cave-layout';

/** cave-chamber-camera.ts LOOK_Y (module-private). */
const LOOK_Y = 1.1;

const target = (): Vector3 => {
  const { x, z } = chamberCenter(0);
  return new Vector3(x, LOOK_Y, z);
};

const distance = (view: CaveChamberCamera): number => {
  const p = view.camera.position;
  const t = target();
  return Math.hypot(p.x - t.x, p.y - t.y, p.z - t.z);
};

const fitted = (): CaveChamberCamera => {
  const view = new CaveChamberCamera(true);
  view.setArea({ width: 800, height: 600, coverRight: 0, coverBottom: 0 });
  view.goTo(0);
  return view;
};

describe('CaveChamberCamera zoom (phase 25b)', () => {
  it('scales the auto-fit distance by the zoom factor', () => {
    const view = fitted();
    const base = distance(view);
    view.setZoomFactor(0.8);
    expect(distance(view)).toBeCloseTo(base * 0.8, 6);
    view.setZoomFactor(1.25);
    expect(distance(view)).toBeCloseTo(base * 1.25, 6);
  });

  it('clamps the factor to 0.6×–1.6×', () => {
    const view = fitted();
    const base = distance(view);
    view.setZoomFactor(0.5);
    expect(view.zoomFactor).toBe(0.6);
    expect(distance(view)).toBeCloseTo(base * 0.6, 6);
    view.setZoomFactor(2);
    expect(view.zoomFactor).toBe(1.6);
    expect(distance(view)).toBeCloseTo(base * 1.6, 6);
  });

  it('keeps the free-area view offset when zooming', () => {
    const view = fitted();
    const before = { ...view.camera.view };
    view.setZoomFactor(0.7);
    const after = view.camera.view;
    expect(after?.enabled).toBe(true);
    expect(after?.offsetX).toBe(before?.offsetX);
    expect(after?.offsetY).toBe(before?.offsetY);
    expect(after?.fullWidth).toBe(before?.fullWidth);
    expect(after?.fullHeight).toBe(before?.fullHeight);
  });

  it('resetZoom returns to the unzoomed distance', () => {
    const view = fitted();
    const base = distance(view);
    view.setZoomFactor(1.4);
    view.resetZoom();
    expect(view.zoomFactor).toBe(1);
    expect(distance(view)).toBeCloseTo(base, 6);
  });

  it('keeps the zoom while walking to the next chamber', () => {
    const view = fitted();
    view.setZoomFactor(0.7);
    view.goTo(1);
    expect(view.zoomFactor).toBe(0.7);
    view.resetZoom();
    expect(view.zoomFactor).toBe(1);
  });
});
