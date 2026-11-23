// Level gates: which level each gate opens, where it stands and what opens it. Kept apart from
// REGIONS, which stays byte-equal to the original bundle (golden test).
import type { AnyRegionId } from './expansion-regions';

/** What a level gate needs before it opens: the bridge quest, or a completed level. */
// NOTE (phase 18, blocked on reviewer): 'cave' joins this union together with the 'cave' row
// of LEVEL_LOCK_KEYS in level-gates.ts and the lockReasonCave/lockedCave strings — the map is
// typed Record<Requirement, ...>, so the union cannot grow without that row.
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
  // NOTE (phase 18, blocked on reviewer): 'market' | 'numberfort' join this union together
  // with their LEVEL_GATES entries once the reviewer approves the gate strings
  // (gateMarket/gateNumberfort, lockReasonCave/lockedCave in level-host-strings.ts and the
  // 'cave' row of LEVEL_LOCK_KEYS in level-gates.ts) — without them `gateNameOf` has no
  // entry for the new ids and typecheck fails.
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
 * (`expansion-regions.ts`) and say "Sắp ra mắt" until their level folder ships. Chapter 3
 * (market, numberfort) opens only after the cave, same rule.
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
  // NOTE (phase 18, blocked on reviewer): market gate (-35,-30, sign '₫') and numberfort gate
  // (61.5,-2, sign '100 000'), both requires 'cave', are added here once the gate strings
  // above are approved. Probe: market centre (-32,-30) 12x8, numberfort centre (61,-2) 12x10.
];
