// Phase 25b (issue #46): the workshop camera scales its distance from the bench by
// the zoom factor and clamps it to 0.6×–1.6×. It has no fitted distance: the camera
// sits at a fixed offset from the point it looks at, so zoom scales that offset.
import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { WorkshopCamera } from './workshop-camera';
import { BENCH_TOP } from './workshop-layout';

/** workshop-camera.ts aim at rest (module-private look/aim, reduced motion). */
const AIM = new Vector3(0, BENCH_TOP + 0.6, -0.6);

const distance = (view: WorkshopCamera): number => {
  const p = view.camera.position;
  return Math.hypot(p.x - AIM.x, p.y - AIM.y, p.z - AIM.z);
};

describe('WorkshopCamera zoom (phase 25b)', () => {
  it('scales the camera offset by the zoom factor', () => {
    const view = new WorkshopCamera(true);
    const base = distance(view);
    view.setZoomFactor(0.8);
    expect(distance(view)).toBeCloseTo(base * 0.8, 6);
    view.setZoomFactor(1.25);
    expect(distance(view)).toBeCloseTo(base * 1.25, 6);
  });

  it('clamps the factor to 0.6×–1.6×', () => {
    const view = new WorkshopCamera(true);
    const base = distance(view);
    view.setZoomFactor(0.5);
    expect(view.zoomFactor).toBe(0.6);
    expect(distance(view)).toBeCloseTo(base * 0.6, 6);
    view.setZoomFactor(2);
    expect(view.zoomFactor).toBe(1.6);
    expect(distance(view)).toBeCloseTo(base * 1.6, 6);
  });

  it('resetZoom returns to the unzoomed offset', () => {
    const view = new WorkshopCamera(true);
    const base = distance(view);
    view.setZoomFactor(1.4);
    view.resetZoom();
    expect(view.zoomFactor).toBe(1);
    expect(distance(view)).toBeCloseTo(base, 6);
  });

  it('keeps the zoom while the camera leans to another station', () => {
    const view = new WorkshopCamera(true);
    view.setZoomFactor(0.7);
    view.focus('thermometer');
    expect(view.zoomFactor).toBe(0.7);
    view.resetZoom();
    expect(view.zoomFactor).toBe(1);
  });
});
