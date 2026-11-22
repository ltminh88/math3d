// Phase 24 new items (10): the same low-poly vertex-colour parts as the original
// twelve. VLM already wears a cone hat, so his wizard hat is a bigger, taller cone
// that covers it (base y 1.96, above the brim top 1.88); his glasses sit just off
// the face (z 0.52) so the rings stay outside the head sphere.
import { box, cylinder, type Part, ring, sphere } from './vertex-color-parts';

const GOLD = 0xffd064;
const WOOD = 0x8c6947;
const DARK_WOOD = 0x6b4a1c;
const RED = 0xe8562f;
const CREAM = 0xfff1cb;
const PINK = 0xf18e81;
const BLOSSOM = 0xf6b8c1;
const YELLOW = 0xffce58;
const LEAF = 0x5aab59;
const TEAL = 0x3b7f8c;

// --- VLM (anchors: head = brim top, neck, back) -------------------------------------------
export const vlmWizardHat = (): Part[] => [
  // Taller cone than his own hat (old cone ends y 2.625, r 0.08): base r 0.62 clears
  // the old cone (r 0.47 at y 1.96) and the whole hat sits above the brim (top 1.88).
  cylinder(0.08, 0.62, 1.0, TEAL, [0, 0.58, 0]),
  ring(0.6, 0.045, GOLD, [0, 0.12, 0]),
  sphere(0.07, YELLOW, [0.32, 0.45, 0.38]),
  sphere(0.06, YELLOW, [-0.35, 0.7, 0.2]),
  sphere(0.06, GOLD, [0, 1.1, 0]),
];

export const vlmRoundGlasses = (): Part[] => [
  // Vertical tori (rotation [0,0,0] keeps them facing forward); z 0.52 puts the
  // inner rim just outside the head sphere (r 0.48 at eye height).
  ring(0.17, 0.035, DARK_WOOD, [-0.2, -0.28, 0.52], [0, 0, 0]),
  ring(0.17, 0.035, DARK_WOOD, [0.2, -0.28, 0.52], [0, 0, 0]),
  box(0.12, 0.04, 0.04, DARK_WOOD, [0, -0.28, 0.52]),
];

export const vlmStarPendant = (): Part[] => [
  // Gold chain around the neck (inner edge 0.47 clears the robe, r 0.46 at y 1.22)
  // with a star hanging on a string in front of the chest.
  ring(0.5, 0.03, GOLD, [0, 0.02, 0]),
  box(0.04, 0.24, 0.03, GOLD, [0, -0.09, 0.53], [0.15, 0, 0]),
  box(0.22, 0.07, 0.05, YELLOW, [0, -0.18, 0.56]),
  box(0.07, 0.22, 0.05, YELLOW, [0, -0.18, 0.56], [0, 0, Math.PI / 4]),
];

export const vlmBookBag = (): Part[] => [
  // Satchel on the back: front face z -0.64 clears the robe (r 0.54 at y 0.82).
  box(0.52, 0.62, 0.2, 0x8c5a2b, [0, 0.02, -0.12]),
  box(0.54, 0.2, 0.04, DARK_WOOD, [0, 0.28, -0.24]),
  box(0.3, 0.22, 0.06, 0x6fc3d6, [0, -0.12, -0.25]),
  box(0.34, 0.1, 0.14, CREAM, [0, 0.36, -0.12]),
];

// --- Player avatar (anchors: head = above the hair, neck, back) ----------------------------
export const avatarStrawHat = (): Part[] => [
  // Wide brim above the hair (hair top y 2.21); the dome sits high so its lower
  // ring stays outside the hair dome.
  cylinder(0.58, 0.58, 0.05, 0xe9d66b, [0, 0.14, 0]),
  sphere(0.3, 0xe9d66b, [0, 0.26, 0], [1, 0.6, 1]),
  ring(0.32, 0.04, RED, [0, 0.18, 0]),
];

export const avatarFlowerLei = (): Part[] => [
  // Flower ring around the neck (inner edge 0.45 clears the shirt corners, 0.42).
  ring(0.5, 0.05, LEAF, [0, 0, 0]),
  ...Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return sphere(0.09, i % 2 ? YELLOW : PINK, [
      Math.cos(angle) * 0.5,
      0.02,
      Math.sin(angle) * 0.5,
    ]);
  }),
];

export const avatarRaincoat = (): Part[] => [
  // Yellow panel behind the backpack (backpack back z -0.51) + hood + buttons.
  box(0.85, 1.05, 0.06, YELLOW, [0, -0.08, -0.14]),
  sphere(0.26, YELLOW, [0, 0.72, -0.05], [1, 0.8, 1]),
  sphere(0.05, RED, [-0.2, -0.3, -0.19]),
  sphere(0.05, RED, [0.2, -0.3, -0.19]),
];

// --- Village decor (anchor: the decor slot on the ground) ----------------------------------
export const decorPeachTree = (): Part[] => [
  cylinder(0.16, 0.24, 1.3, WOOD, [0, 0.65, 0]),
  sphere(0.75, BLOSSOM, [0, 1.75, 0], [1, 0.85, 1]),
  sphere(0.55, PINK, [0.55, 1.4, 0.2]),
  sphere(0.5, BLOSSOM, [-0.5, 1.5, -0.15]),
  sphere(0.1, CREAM, [0.4, 2.1, 0.3]),
  sphere(0.1, CREAM, [-0.6, 1.9, 0.2]),
  sphere(0.1, CREAM, [0.1, 1.6, 0.6]),
];

export const decorChickenCoop = (): Part[] => [
  box(1.3, 0.9, 1.1, 0xd6a05a, [0, 0.45, 0]),
  cylinder(0, 0.85, 0.65, RED, [0, 1.22, 0], [0, Math.PI / 4, 0], 4),
  box(0.4, 0.55, 0.06, DARK_WOOD, [0, 0.28, 0.56]),
  box(1.6, 0.22, 0.06, WOOD, [0, 0.11, 0.95]),
  box(0.07, 0.35, 0.07, WOOD, [-0.7, 0.17, 0.95]),
  box(0.07, 0.35, 0.07, WOOD, [0.7, 0.17, 0.95]),
  sphere(0.16, CREAM, [0.95, 0.16, 0.5]),
  sphere(0.09, CREAM, [0.95, 0.36, 0.55]),
  box(0.08, 0.05, 0.05, RED, [0.95, 0.34, 0.66]),
];

export const decorRainbowArch = (): Part[] => [
  // Three concentric vertical tori; the lower halves sit below the ground, so only
  // the arch shows. Clouds puff at both feet.
  ring(1.5, 0.13, RED, [0, 0, 0], [0, 0, 0]),
  ring(1.24, 0.13, YELLOW, [0, 0, 0], [0, 0, 0]),
  ring(0.98, 0.13, LEAF, [0, 0, 0], [0, 0, 0]),
  sphere(0.3, CREAM, [-1.5, 0.1, 0]),
  sphere(0.3, CREAM, [1.5, 0.1, 0]),
];
