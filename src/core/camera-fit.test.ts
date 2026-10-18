import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { computeCameraPose, fitCamera, minWorldSizeForPixels } from './camera-fit';

const BOUNDS = { width: 20, depth: 12, height: 3 };

function cornersInView(aspect: number): boolean {
  const camera = new PerspectiveCamera(40, aspect, 0.1, 200);
  fitCamera(camera, BOUNDS, aspect);
  for (const x of [-10, 10]) {
    for (const y of [0, 3]) {
      for (const z of [-6, 6]) {
        const p = new Vector3(x, y, z).project(camera);
        if (Math.abs(p.x) > 1 || Math.abs(p.y) > 1) return false;
      }
    }
  }
  return true;
}

describe('camera fit', () => {
  it.each([
    ['16:9', 16 / 9],
    ['4:3', 4 / 3],
    ['portrait 9:19.5', 9 / 19.5],
  ])('keeps every playfield corner on screen at %s', (_name, aspect) => {
    expect(cornersInView(aspect)).toBe(true);
  });

  it('backs the camera off further in portrait than landscape', () => {
    const wide = computeCameraPose(BOUNDS, 40, 16 / 9);
    const tall = computeCameraPose(BOUNDS, 40, 9 / 19.5);
    expect(tall.position.z).toBeGreaterThan(wide.position.z);
  });

  it('sizes hit proxies from the pixel target', () => {
    // 48px of a 960px-tall viewport is 5% of the visible world height at that distance.
    const size = minWorldSizeForPixels(48, 20, 40, 960);
    const visible = 2 * 20 * Math.tan((40 * Math.PI) / 360);
    expect(size).toBeCloseTo(visible * 0.05);
    expect(minWorldSizeForPixels(48, 20, 40, 0)).toBe(0);
  });
});
