// Level gates: which level each gate opens, where it stands and what opens it. Kept apart from
// REGIONS, which stays byte-equal to the original bundle (golden test).
import type { RegionId } from './regions';

/** What a level gate needs before it opens: the bridge quest, or a completed level. */
export type GateRequirement = 'bridge' | 'field' | 'forest' | 'city' | null;

/** A level gate standing in a region (placed after the scatter pass, so no RNG shift). */
export interface LevelGate {
  /** Level the gate opens (`src/levels/<levelId>/index.ts`). */
  readonly levelId: 'field' | 'forest' | 'city' | 'tower';
  readonly regionId: RegionId;
  /** Gate centre on the ground plane as [x, z]. */
  readonly position: readonly [x: number, z: number];
  /** Rotation around y; 0 faces +z, towards the default camera (signs read from the start view). */
  readonly facing: number;
  readonly requires: GateRequirement;
  /** Text on the gate's sign board. */
  readonly sign: string;
}

/**
 * Level gates: beside the road ends at the meadow, forest, city and tower edges, on free ground
 * (no flower row, tree, building or scatter circle within reach; checked by the gate placement
 * e2e). All face the default camera.
 */
export const LEVEL_GATES: readonly LevelGate[] = [
  {
    levelId: 'field',
    regionId: 'meadow',
    position: [29, -14.5],
    facing: 0,
    requires: 'bridge',
    sign: '3 × 4',
  },
  {
    levelId: 'forest',
    regionId: 'forest',
    position: [37.2, 13.4],
    facing: 0,
    requires: 'field',
    sign: '12 : 3',
  },
  {
    levelId: 'city',
    regionId: 'city',
    position: [58.5, 7.6],
    facing: 0,
    requires: 'forest',
    sign: '7 × 8',
  },
  {
    levelId: 'tower',
    regionId: 'tower',
    position: [60.6, -14.2],
    facing: 0,
    requires: 'city',
    sign: '56 : 7',
  },
];
