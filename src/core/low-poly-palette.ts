// Named flat colors for the low-poly look. Scenes refer to keys, never raw hex.
export const LOW_POLY_PALETTE = {
  grass: 0x7cc27a,
  grassDark: 0x4f9a5a,
  soil: 0x8b6b4a,
  sand: 0xf0d9a0,
  stone: 0xb9b4a8,
  stoneDark: 0x8d887d,
  stoneActive: 0xffd166,
  water: 0x6ec6e6,
  wood: 0x9c6b3f,
  leaf: 0x3a7d44,
  leafLight: 0x5cae5c,
  zone: 0xfff3c4,
  zoneActive: 0xffe08a,
  cloud: 0xffffff,
  ink: 0x2b2a28,
} as const;

export type PaletteKey = keyof typeof LOW_POLY_PALETTE;
