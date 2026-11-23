// Numberfort dimensions shared by the diorama and the camera: two stone towers with blue
// cone roofs joined by a wall, three coloured number blocks in front, a flag pole on each
// tower. Palette from the world's number castle (phase 18 builder), warmed for the inside view.

export const TOWER_COUNT = 2;
export const TOWER_GAP = 8;

export const NUMBERFORT_COLORS = {
  background: 0xe8eef7,
  floor: 0xc9b18a,
  stone: 0x9aa3b8,
  stoneDark: 0x7d8698,
  roof: 0x5b6fb8,
  roofDark: 0x46609e,
  blockYellow: 0xe8c53a,
  blockTeal: 0x599989,
  blockRed: 0xd96a4f,
  flagYellow: 0xf2c94c,
  flagRed: 0xd94f3d,
  pole: 0x4a3a28,
} as const;

/** Centre of tower `i` on the ground: -4 and +4, wall between them at the back. */
export function towerCenter(i: number): { x: number; z: number } {
  return { x: (i - 0.5) * TOWER_GAP, z: -2 };
}
