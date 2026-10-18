import { describe, expect, it } from 'vitest';
import { type DropZone, distanceToZone, findSnapZone, MIN_SNAP_RADIUS } from './drop-zone';

const circle = (id: string, x: number, z: number, accepts = true): DropZone => ({
  id,
  center: { x, z },
  shape: { kind: 'circle', radius: 1 },
  accepts: () => accepts,
});
const box = (id: string, x: number, z: number): DropZone => ({
  id,
  center: { x, z },
  shape: { kind: 'box', halfWidth: 2, halfDepth: 1 },
  accepts: () => true,
});

describe('distanceToZone', () => {
  it('is 0 inside and edge distance outside a circle', () => {
    expect(distanceToZone(circle('a', 0, 0), { x: 0.5, z: 0 })).toBe(0);
    expect(distanceToZone(circle('a', 0, 0), { x: 3, z: 0 })).toBeCloseTo(2);
  });

  it('measures to the nearest box edge/corner', () => {
    expect(distanceToZone(box('b', 0, 0), { x: 1, z: 0.5 })).toBe(0);
    expect(distanceToZone(box('b', 0, 0), { x: 5, z: 0 })).toBeCloseTo(3);
    expect(distanceToZone(box('b', 0, 0), { x: 5, z: 5 })).toBeCloseTo(5);
  });
});

describe('findSnapZone', () => {
  it('snaps to the nearest accepting zone within radius', () => {
    const zones = [circle('far', 10, 0), circle('near', 2.5, 0)];
    expect(findSnapZone(zones, { x: 3, z: 0 }, 'stone', 1)?.id).toBe('near');
  });

  it('returns null outside the radius or when nothing accepts', () => {
    expect(findSnapZone([circle('a', 10, 0)], { x: 0, z: 0 }, 's', 1)).toBeNull();
    expect(findSnapZone([circle('a', 0, 0, false)], { x: 0, z: 0 }, 's', 1)).toBeNull();
  });

  it('never uses a radius below the minimum', () => {
    // Edge distance 0.8 is within MIN_SNAP_RADIUS even if the caller asks for 0.1.
    const zone = circle('a', 0, 0);
    expect(findSnapZone([zone], { x: 1 + MIN_SNAP_RADIUS, z: 0 }, 's', 0.1)?.id).toBe('a');
  });

  it('breaks edge ties by center distance', () => {
    const inner = circle('inner', 0, 0);
    const wide: DropZone = { ...circle('wide', 0, 0), shape: { kind: 'circle', radius: 3 } };
    // Point inside both (edge 0): closer center is equal, first one wins deterministically.
    expect(findSnapZone([inner, wide], { x: 0, z: 0 }, 's')?.id).toBe('inner');
  });
});
