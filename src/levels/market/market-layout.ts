// Market dimensions shared by the diorama and the camera: three stalls in a row under striped
// awnings, crates between them, a lantern pole at each end. Palette from the world's tiny
// market (phase 18 builder), warmed for the inside view.

export const STALL_COUNT = 3;
export const STALL_GAP = 4.2;

export const MARKET_COLORS = {
  background: 0xf6e8c8,
  floor: 0xd9b98a,
  stallWood: 0x8a5a32,
  stallWoodDark: 0x6b4222,
  awningRed: 0xd94f3d,
  awningCream: 0xfff3d6,
  crate: 0xb98a4e,
  crateDark: 0x9a6f3a,
  lantern: 0xffb347,
  lanternPole: 0x4a3a28,
  cloth: 0x4f8a5b,
  clothBlue: 0x4f6f9e,
} as const;

/** Centre of stall `i` on the ground. */
export function stallCenter(i: number): { x: number; z: number } {
  return { x: (i - 1) * STALL_GAP, z: 0 };
}
