// World-wide constants recovered verbatim from the original bundle (values never retuned).

/** Multiplication tables offered by the game; `0` in a save means "all tables". */
export const TABLES: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10];

/** localStorage key of the v1 save (user-facing contract, never rename). */
export const SAVE_KEY = 'aigame3d_multiplication_save';

/** Number of bridge segments; the quest completes when all are built. */
export const BRIDGE_SEGMENTS = 6;

/** XP needed to reach level 1..5 (index = level - 1). */
export const LEVEL_XP_THRESHOLDS: readonly number[] = [0, 100, 250, 450, 700];

export interface RiverBounds {
  readonly riverMin: number;
  readonly riverMax: number;
  readonly bridgeWidth: number;
}

/** River band along the x axis that splits the west bank (village) from the east bank. */
export const RIVER: RiverBounds = {
  riverMin: 4,
  riverMax: 10,
  bridgeWidth: 3.4,
};

export interface WalkableBounds {
  readonly west: { readonly minX: number; readonly maxX: number };
  readonly east: { readonly minX: number; readonly maxX: number };
  readonly minZ: number;
  readonly maxZ: number;
  readonly margin: number;
}

/** Walkable ground on each bank of the river. */
export const WALKABLE_BOUNDS: WalkableBounds = {
  west: {
    minX: -50,
    maxX: RIVER.riverMin,
  },
  east: {
    minX: RIVER.riverMax,
    maxX: 70,
  },
  minZ: -44,
  maxZ: 44,
  margin: 2.2,
};

/** Sky dome gradient: zenith colour (original 7651302). */
export const SKY_TOP_COLOR = 0x74bfe6;

/** Sky dome horizon, clear colour and fog colour (original 13954796). */
export const SKY_HORIZON_COLOR = 0xd4eeec;
