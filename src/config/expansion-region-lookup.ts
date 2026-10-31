// Lookups over both region lists: the original REGIONS (golden, untouched) plus the chapter 2
// regions. Expansion footprints win inside them; everywhere else the original answer stands.
import { type AnyRegion, EXPANSION_REGIONS, type ExpansionRegion } from './expansion-regions';
import { EXPANSION_ROADS } from './expansion-roads';
import { REGIONS, regionAtPoint } from './regions';

/** Original regions first (village is index 0), then the chapter 2 regions. */
export const allRegions = (): readonly AnyRegion[] => [...REGIONS, ...EXPANSION_REGIONS];

export const anyRegionById = (id: string | undefined): AnyRegion | undefined =>
  allRegions().find((region) => region.id === id);

/** Expansion region whose footprint grown by `margin` holds (x, z). */
export function expansionRegionAt(x: number, z: number, margin = 0): ExpansionRegion | undefined {
  return EXPANSION_REGIONS.find(
    (region) =>
      Math.abs(x - region.center[0]) <= region.size[0] / 2 + margin &&
      Math.abs(z - region.center[1]) <= region.size[1] / 2 + margin,
  );
}

/** Area under a ground point (HUD badge): expansion footprint (+1, like the original), else REGIONS. */
export const areaAt = (x: number, z: number): AnyRegion =>
  expansionRegionAt(x, z, 1) ?? regionAtPoint(x, z);

/** Start regions are always open; the rest once the bridge quest is complete. */
export const isAreaUnlocked = (region: AnyRegion, bridgeComplete: boolean): boolean =>
  region.unlock === 'start' || bridgeComplete;

/** True when (x, z) lies within `distance` of an expansion road segment. */
export function nearExpansionRoad(x: number, z: number, distance: number): boolean {
  return EXPANSION_ROADS.some((road) =>
    road.some((to, index) => {
      const from = road[index - 1];
      if (!from) return false;
      const dx = to[0] - from[0];
      const dz = to[1] - from[1];
      const t = Math.min(
        1,
        Math.max(0, ((x - from[0]) * dx + (z - from[1]) * dz) / (dx * dx + dz * dz)),
      );
      return Math.hypot(x - from[0] - dx * t, z - from[1] - dz * t) < distance;
    }),
  );
}
