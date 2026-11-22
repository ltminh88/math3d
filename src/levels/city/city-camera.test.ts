// QA M-6 / p-2: on a phone VLM's line covers the top of the canvas; the camera frames the building
// (10 floors x 9 windows) and the street below it and above the panel.
import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { buildingFrame, CityCamera, type FreeArea, STREET_FRAME } from './city-camera';
import {
  BUILDING_Z,
  buildingHeight,
  buildingWidth,
  FACADE_Z,
  HOUSE_X,
  HOUSE_Z,
  MAX_FLOORS,
  MAX_WINDOWS_PER_FLOOR,
} from './city-layout';

/** Pixel 7 portrait: VLM's line ends at 134 px, the panel starts at 470 px. */
const PHONE: FreeArea = { width: 412, height: 839, coverTop: 134, coverRight: 0, coverBottom: 369 };
/** Phone turned sideways: the panel on the right (42%), VLM's line on top. */
const LANDSCAPE: FreeArea = {
  width: 839,
  height: 412,
  coverTop: 52,
  coverRight: 352,
  coverBottom: 0,
};

function screenOf(camera: CityCamera, area: FreeArea, at: Vector3) {
  const p = at.clone().project(camera.camera);
  return { x: ((p.x + 1) / 2) * area.width, y: ((1 - p.y) / 2) * area.height };
}

function expectInside(camera: CityCamera, area: FreeArea, points: Vector3[]) {
  for (const at of points) {
    const { x, y } = screenOf(camera, area, at);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(area.width - area.coverRight);
    expect(y).toBeGreaterThanOrEqual(area.coverTop);
    expect(y).toBeLessThanOrEqual(area.height - area.coverBottom);
  }
}

describe('city camera zoom (phase 25b)', () => {
  const distance = (view: CityCamera): number => {
    const p = view.camera.position;
    const t = STREET_FRAME.target;
    return Math.hypot(p.x - t.x, p.y - t.y, p.z - t.z);
  };
  const fitted = (): CityCamera => {
    const view = new CityCamera();
    view.setFrame(STREET_FRAME);
    view.setArea(PHONE);
    return view;
  };

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
});
describe('city camera framing', () => {
  it('a 10-floor building of 9 windows fits between VLM and the panel on a phone', () => {
    const width = buildingWidth(MAX_WINDOWS_PER_FLOOR);
    const height = buildingHeight(MAX_FLOORS);
    const view = new CityCamera();
    view.setFrame(buildingFrame(width, height));
    view.setArea(PHONE);
    const roof = height + 0.2;
    expectInside(view, PHONE, [
      new Vector3(-width / 2, roof, FACADE_Z),
      new Vector3(width / 2, roof, FACADE_Z),
      new Vector3(-width / 2, 0, FACADE_Z),
      new Vector3(width / 2, 0, BUILDING_Z),
    ]);
  });

  it('the houses and their number badges stay clear of VLM and the panel', () => {
    for (const area of [PHONE, LANDSCAPE]) {
      const view = new CityCamera();
      view.setFrame(STREET_FRAME);
      view.setArea(area);
      // Badge above each roof, door at the ground.
      const points = HOUSE_X.flatMap((x) => [
        new Vector3(x, 4.2, -0.6),
        new Vector3(x, 0, HOUSE_Z + 1),
      ]);
      expectInside(view, area, points);
    }
  });
});
