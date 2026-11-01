// Workshop room layout and palette (world units). Colours follow the world's measurement workshop
// (src/world/regions/measurement-workshop-builder.ts): shed 0xd99a6c, roof 0x9c5a3c, wood 0x8c6947,
// ink 0x5a4632, ruler 0xf2d36b, gold pans 0xd9b45a, metal 0xb0b6bf.
import type { WorkshopStation } from './workshop-stations';

export const WORKSHOP_COLORS = {
  grass: 0x9fc88a,
  floor: 0xc9a77c,
  wall: 0xd99a6c,
  beam: 0x9c5a3c,
  roof: 0x9c5a3c,
  window: 0xbfe3ef,
  oak: 0x8c6947,
  oakDark: 0x6b4a2f,
  box: 0xc98b5a,
  tin: 0x8fb3a8,
  ruler: 0xf2d36b,
  board: 0xefe3c4,
  tile: 0xe8a25b,
  ink: 0x5a4632,
  metal: 0xb0b6bf,
  gold: 0xd9b45a,
  plate: 0xfffcf0,
  mercury: 0xe8562f,
  water: 0x7cc3e8,
  glass: 0xdff3fb,
} as const;

/** Height of the workbench top. */
export const BENCH_TOP = 1.2;

/** [x, z] of each tool on the bench (the thermometer hangs on the back wall above its x). */
export const STATION_SPOTS: Readonly<Record<WorkshopStation, readonly [number, number]>> = {
  ruler: [0, 1.05],
  fence: [0, -0.35],
  tiles: [0, -0.35],
  balance: [-3, -0.2],
  jug: [3, -0.2],
  thermometer: [2.2, -3.2],
};

/** The tile board: room for 6 x 5 tiles. */
export const TILE_BOARD = { width: 2.4, depth: 2, cols: 6, rows: 5 } as const;
