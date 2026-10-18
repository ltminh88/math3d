// Placement tests shared by the scatter passes: road proximity, walkable banks, region footprints
// and collision circles. Pure predicates (no RNG), so call order around them never matters.
import { MathUtils } from 'three';
import { REGIONS } from '../config/regions';
import { ROADS } from '../config/roads';
import { WALKABLE_BOUNDS } from '../config/world-constants';
import type { ObstacleCircle } from './world-build-context';

/** True when (x, z) lies within `distance` of any road polyline segment. */
export function nearRoad(x: number, z: number, distance: number): boolean {
  return ROADS.some((road) =>
    road.some((point, index) => {
      const previous = road[index - 1];
      if (!index || !previous) {
        return false;
      }
      const [x0, z0] = previous;
      const [x1, z1] = point;
      const dx = x1 - x0;
      const dz = z1 - z0;
      const t = MathUtils.clamp(((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz), 0, 1);
      return Math.hypot(x - x0 - dx * t, z - z0 - dz * t) < distance;
    }),
  );
}

/** True when (x, z) is on either walkable bank, at least `inset` from its edges. */
export function insideBanks(x: number, z: number, inset: number): boolean {
  const bounds = WALKABLE_BOUNDS;
  return (
    z > bounds.minZ + inset &&
    z < bounds.maxZ - inset &&
    ((x > bounds.west.minX + inset && x < bounds.west.maxX - inset) ||
      (x > bounds.east.minX + inset && x < bounds.east.maxX - inset))
  );
}

/** True inside any region footprint grown by `padding`. Quirk kept: the forest never counts. */
export function insideRegion(x: number, z: number, padding: number): boolean {
  return REGIONS.some(
    (region) =>
      region.id !== 'forest' &&
      Math.abs(x - region.center[0]) < region.size[0] / 2 + padding &&
      Math.abs(z - region.center[1]) < region.size[1] / 2 + padding,
  );
}

/** Off the banks, on a region, near a road or touching a collision circle. */
export function isBlocked(
  obstacles: readonly ObstacleCircle[],
  x: number,
  z: number,
  clearance: number,
): boolean {
  return (
    !insideBanks(x, z, clearance) ||
    insideRegion(x, z, clearance) ||
    nearRoad(x, z, clearance + 1) ||
    obstacles.some((o) => Math.hypot(x - o.x, z - o.z) < o.radius + clearance)
  );
}
