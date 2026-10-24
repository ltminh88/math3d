// Tower dimensions shared by the diorama, the floor lights/stones and the climbing camera.
// Seven stacked floors on the recovered plinth, a gold roof and the beacon on top.

export const FLOOR_COUNT = 7;
export const FLOOR_HEIGHT = 1.6;
/** Top of the plinth, where the ground floor starts. */
export const BASE_Y = 0.3;
export const TOP_Y = BASE_Y + FLOOR_COUNT * FLOOR_HEIGHT;
export const ROOF_HEIGHT = 2.2;
export const BEACON_Y = TOP_Y + ROOF_HEIGHT + 0.6;

/** Recovered tower palette (world `buildTower`, region colour #9b92cf). */
export const TOWER_COLORS = {
  ground: 0xa7c97a,
  plinth: 0xd8c494,
  body: 0x7773a8,
  bodyLight: 0x9b92cf,
  cornice: 0xf0e2c0,
  roof: 0xf0c45d,
  door: 0x4b3f6b,
  beacon: 0xffdc73,
  bandDim: 0x55507f,
  bandLit: 0xffd774,
} as const;
export const STONE_COLORS: readonly number[] = [0x9ad9f0, 0xf6b3d0, 0xffd774];

export const floorBottom = (floor: number): number => BASE_Y + floor * FLOOR_HEIGHT;
export const floorMid = (floor: number): number => floorBottom(floor) + FLOOR_HEIGHT / 2;
/** Floors taper a little towards the top. */
export const floorRadius = (floor: number): number => 2.9 - floor * 0.12;
