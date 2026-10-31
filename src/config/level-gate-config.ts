// Level gates: which level each gate opens, where it stands and what opens it. Kept apart from
// REGIONS, which stays byte-equal to the original bundle (golden test).
import type { AnyRegionId } from './expansion-regions';

/** What a level gate needs before it opens: the bridge quest, or a completed level. */
export type GateRequirement =
  | 'bridge'
  | 'field'
  | 'forest'
  | 'city'
  | 'tower'
  | 'garden'
  | 'valley'
  | 'workshop'
  | null;

/** A level gate standing in a region (placed after the scatter pass, so no RNG shift). */
export interface LevelGate {
  /** Level the gate opens (`src/levels/<levelId>/index.ts`). */
  readonly levelId:
    | 'field'
    | 'forest'
    | 'city'
    | 'tower'
    | 'garden'
    | 'valley'
    | 'workshop'
    | 'cave';
  readonly regionId: AnyRegionId;
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
 * e2e). All face the default camera. Chapter 2 (garden → valley → workshop → cave) opens only
 * after the tower; its gates stand in the garden by the bridge and in the expansion regions
 * (`expansion-regions.ts`) and say "Sắp ra mắt" until their level folder ships.
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
  {
    levelId: 'garden',
    regionId: 'garden',
    position: [21.8, -6],
    facing: 0,
    requires: 'tower',
    sign: '2, 4, ?',
  },
  {
    levelId: 'valley',
    regionId: 'valley',
    position: [44, -36.5],
    facing: 0,
    requires: 'garden',
    sign: '△ □',
  },
  {
    levelId: 'workshop',
    regionId: 'workshop',
    position: [50.5, 37],
    facing: 0,
    requires: 'valley',
    sign: 'cm²',
  },
  {
    levelId: 'cave',
    regionId: 'cave',
    position: [-27, 30],
    facing: 0,
    requires: 'workshop',
    sign: '?',
  },
];
