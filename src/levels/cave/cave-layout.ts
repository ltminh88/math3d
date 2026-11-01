// Cave dimensions shared by the diorama, the crystals and the chamber camera: seven chambers in a
// gently winding row, each with a crystal on a rock pedestal, then the treasure chest at the end.
// Palette from the world's puzzle cave (phase 03 builder), darkened for the inside.

export const CHAMBER_COUNT = 7;
export const CHAMBER_GAP = 6;
export const PEDESTAL_HEIGHT = 0.7;
export const CRYSTAL_Y = PEDESTAL_HEIGHT + 0.75;
/** Index of the treasure room (after the last chamber). */
export const TREASURE_INDEX = CHAMBER_COUNT;

export const CAVE_COLORS = {
  background: 0x15131b,
  floor: 0x3b3631,
  rock: 0x8f8a80,
  rockDark: 0x5f5a52,
  boulder: 0x9d978b,
  pedestal: 0x6f6a61,
  wood: 0x6b4a2f,
  torch: 0xffd064,
  glow: 0xffb347,
  crystalDim: 0x2f3b55,
  crystalLit: 0x8fe8ff,
  chest: 0x9a6232,
  chestBand: 0xf0c45d,
} as const;

/** Centre of chamber `i` on the ground (the treasure room for `TREASURE_INDEX`). */
export function chamberCenter(i: number): { x: number; z: number } {
  return { x: i * CHAMBER_GAP, z: i % 2 === 0 ? 0 : -1.4 };
}
