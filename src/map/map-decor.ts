// Seeded background decor for the 2D map canvases (original `ag`/`og`, bundle lines 1674-1722).
// Both lists are generated once and cached, exactly like the original module-level caches.
import { REGIONS } from '../config/regions';
import { ROADS } from '../config/roads';
import { createSeededLcg } from '../config/seeded-lcg';
import { WALKABLE_BOUNDS as BOUNDS, RIVER } from '../config/world-constants';

/** One decor blob on the ground plane: [x, z, radius]. */
export type MapDecorBlob = readonly [x: number, z: number, radius: number];

let outerBushes: MapDecorBlob[] | undefined;
let groundTufts: MapDecorBlob[] | undefined;

/** Bushes around the islands, outside the walkable banks (LCG seed 23, up to 1400). */
export function getOuterBushDecor(): readonly MapDecorBlob[] {
  if (outerBushes) {
    return outerBushes;
  }
  const next = createSeededLcg(23);
  outerBushes = [];
  for (let attempt = 0; attempt < 6000 && outerBushes.length < 1400; attempt++) {
    const x = -220 + next() * 460;
    const z = -190 + next() * 380;
    const dx = Math.max(BOUNDS.west.minX - x, x - BOUNDS.east.maxX, 0);
    const dz = Math.max(BOUNDS.minZ - z, z - BOUNDS.maxZ, 0);
    if (!(Math.hypot(dx, dz) < 2.5 || Math.abs(x - 7) < 5.5)) {
      outerBushes.push([x, z, 1.3 + next() * 1.3]);
    }
  }
  return outerBushes;
}

/** True when a ground point lies within 3 units of any road segment. */
function isNearRoad(x: number, z: number): boolean {
  return ROADS.some((road) =>
    road.some(([ax, az], index) => {
      const prev = road[index - 1];
      if (!index || !prev) {
        return false;
      }
      const [px, pz] = prev;
      const dx = ax - px;
      const dz = az - pz;
      const t = Math.max(0, Math.min(1, ((x - px) * dx + (z - pz) * dz) / (dx * dx + dz * dz)));
      return Math.hypot(x - px - dx * t, z - pz - dz * t) < 3;
    }),
  );
}

/** True when a tuft would cover the river, a region, a road, the pond or the village core. */
function isTuftBlocked(x: number, z: number): boolean {
  return (
    (x > RIVER.riverMin - 2 && x < RIVER.riverMax + 2) ||
    REGIONS.some(
      (region) =>
        region.id !== 'village' &&
        Math.abs(x - region.center[0]) < region.size[0] / 2 + 1.5 &&
        Math.abs(z - region.center[1]) < region.size[1] / 2 + 1.5,
    ) ||
    isNearRoad(x, z) ||
    Math.hypot(x + 38, z + 11) < 6 ||
    (x > -24 && x < 2 && z > -16 && z < 12)
  );
}

/** Grass tufts on the walkable banks (LCG seed 7, up to 260). */
export function getGroundTuftDecor(): readonly MapDecorBlob[] {
  if (groundTufts) {
    return groundTufts;
  }
  const next = createSeededLcg(7);
  groundTufts = [];
  for (let attempt = 0; attempt < 1400 && groundTufts.length < 260; attempt++) {
    const x = BOUNDS.west.minX + 3 + next() * (BOUNDS.east.maxX - BOUNDS.west.minX - 6);
    const z = BOUNDS.minZ + 3 + next() * (BOUNDS.maxZ - BOUNDS.minZ - 6);
    if (!isTuftBlocked(x, z)) {
      groundTufts.push([x, z, 0.9 + next() * 0.8]);
    }
  }
  return groundTufts;
}
