// Valley sizes and palette shared by the diorama, the figure views and the camera. Colours follow
// the valley region of the world (pad 0xb5cf8a, pond 0x5cc0d3, ê-ke 0xf2c14e).

/** The sandy stone board every figure is drawn on (centred at the origin). */
export const BOARD = { width: 11.6, depth: 8.6, top: 0.13 } as const;

/** Pedestals for the six rebuilt shape stones, around the board. */
export const PEDESTALS: readonly (readonly [number, number])[] = [
  [-7.6, -3.4],
  [-7.6, 0],
  [-7.6, 3.4],
  [7.6, -3.4],
  [7.6, 0],
  [7.6, 3.4],
];

export const VALLEY_COLORS = {
  ground: 0xb5cf8a,
  board: 0xeadcb3,
  rim: 0xc9b48a,
  pedestal: 0xd8d2c4,
  water: 0x5cc0d3,
  eke: 0xf2c14e,
  rock: 0xa7a58c,
  ink: 0x37474f,
  log: 0xb07a45,
  tick: 0x6b4a2b,
  stone: 0x8f8d7c,
  gold: 0xffd774,
  halfA: 0x8fc7e8,
  halfB: 0xf2a7a0,
  aid: 0xe76f51,
  block: 0xd8d2c4,
} as const;

/** Pastel fills for flat shapes, by figure index. */
export const SHAPE_FILLS: readonly number[] = [0x9fd3c7, 0xf7c59f, 0xc3b1e1, 0xf6e27f];
/** Face colours of a lifted block (six faces). */
export const FACE_COLORS: readonly number[] = [
  0xf6b3d0, 0x9ad9f0, 0xffd774, 0xa7d98c, 0xc3b1e1, 0xf7c59f,
];
/** Rebuilt shape stones on the pedestals: cube, cone, cylinder, pyramid... */
export const GARDEN_STONE_COLORS: readonly number[] = [
  0x9ad9f0, 0xf6b3d0, 0xffd774, 0xa7d98c, 0xc3b1e1, 0xf7c59f,
];
