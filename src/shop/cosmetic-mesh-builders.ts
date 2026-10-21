// Low-poly parts of each cosmetic, in the recovered palette, relative to the anchor the item
// hangs from (characters-milo-avatar anchors; the village decor slot for decorations). VLM's hat
// is a cone from y 1.675 (r 0.58) to 2.625; his brim (r 0.75) sits at 1.82. The player's hair
// tops out near 2.2; his backpack ends at z -0.59.
import { box, cylinder, type Part, ring, sphere } from './vertex-color-parts';

const GOLD = 0xffd064;
const WOOD = 0x8c6947;
const RED = 0xe8562f;
const CREAM = 0xfff1cb;
const PINK = 0xf18e81;
const YELLOW = 0xffce58;
const LEAF = 0x5aab59;

const around = (
  count: number,
  radius: number,
  y: number,
  part: (x: number, z: number, i: number) => Part,
) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return part(Math.cos(angle) * radius, Math.sin(angle) * radius, i);
  }).map((p) => ({ ...p, at: [p.at?.[0] ?? 0, y + (p.at?.[1] ?? 0), p.at?.[2] ?? 0] as const }));

// --- VLM (anchors: head = brim top, neck, back) -------------------------------------------
export const vlmStarBand = (): Part[] => [
  ring(0.47, 0.055, GOLD, [0, 0.07, 0]),
  sphere(0.11, YELLOW, [0, 0.12, 0.5], [1, 1, 0.5]),
  sphere(0.07, CREAM, [0.3, 0.1, 0.38], [1, 1, 0.5]),
  sphere(0.07, CREAM, [-0.3, 0.1, 0.38], [1, 1, 0.5]),
];

export const vlmRedScarf = (): Part[] => [
  ring(0.44, 0.1, RED),
  box(0.2, 0.5, 0.08, RED, [0.24, -0.25, 0.42], [0.15, 0, 0.2]),
  box(0.21, 0.08, 0.09, CREAM, [0.27, -0.47, 0.44], [0.15, 0, 0.2]),
];

export const vlmFlowerGarland = (): Part[] => [
  ring(0.64, 0.05, LEAF, [0, 0.02, 0]),
  ...around(8, 0.64, 0.07, (x, z, i) => sphere(0.1, i % 2 ? YELLOW : PINK, [x, 0, z])),
];

export const vlmStarryCape = (): Part[] => [
  box(1.05, 1.25, 0.06, 0x6c5aa8, [0, 0, 0], [-0.12, 0, 0]),
  box(1.15, 0.12, 0.12, GOLD, [0, 0.62, 0.05]),
  sphere(0.08, YELLOW, [-0.25, 0.15, -0.05], [1, 1, 0.4]),
  sphere(0.07, YELLOW, [0.22, -0.2, -0.08], [1, 1, 0.4]),
  sphere(0.06, CREAM, [0.05, 0.3, -0.04], [1, 1, 0.4]),
];

// --- Player avatar (anchors: head = above the hair, neck, back) ----------------------------
export const avatarBlueCap = (): Part[] => [
  cylinder(0.36, 0.45, 0.2, 0x4d95a3, [0, 0, 0]),
  sphere(0.06, CREAM, [0, 0.12, 0]),
  box(0.55, 0.05, 0.36, 0x3b7f8c, [0, -0.08, 0.42]),
];

export const avatarStripedScarf = (): Part[] => [
  ring(0.33, 0.1, 0x599989),
  ring(0.335, 0.104, CREAM, [0, 0.02, 0], [Math.PI / 2, 0, Math.PI / 7]),
  box(0.18, 0.42, 0.08, 0x599989, [-0.2, -0.22, 0.38], [0.2, 0, -0.15]),
];

export const avatarGoldCrown = (): Part[] => [
  cylinder(0.34, 0.3, 0.22, GOLD, [0, 0.06, 0], undefined, 10),
  ...around(5, 0.31, 0.24, (x, z) => sphere(0.07, GOLD, [x, 0, z])),
  sphere(0.07, RED, [0, 0.07, 0.31]),
];

export const avatarButterflyWings = (): Part[] => [
  sphere(0.5, PINK, [-0.42, 0.12, 0], [0.75, 1, 0.12]),
  sphere(0.5, PINK, [0.42, 0.12, 0], [0.75, 1, 0.12]),
  sphere(0.3, YELLOW, [-0.36, -0.36, 0], [0.8, 1, 0.14]),
  sphere(0.3, YELLOW, [0.36, -0.36, 0], [0.8, 1, 0.14]),
  cylinder(0.06, 0.06, 0.6, 0x9774b8, [0, 0, 0]),
];

// --- Village decor (anchor: the decor slot on the ground) ----------------------------------
export const decorFlowerPots = (): Part[] =>
  [-0.7, 0, 0.7].flatMap((x, i) => [
    cylinder(0.26, 0.2, 0.42, 0xc8794d, [x, 0.21, i === 1 ? -0.3 : 0]),
    sphere(0.3, LEAF, [x, 0.56, i === 1 ? -0.3 : 0]),
    sphere(0.12, i === 1 ? YELLOW : PINK, [x, 0.8, i === 1 ? -0.2 : 0.1]),
  ]);

export const decorStarLantern = (): Part[] => [
  cylinder(0.06, 0.08, 2.4, WOOD, [0, 1.2, 0]),
  box(0.7, 0.06, 0.06, WOOD, [0.32, 2.35, 0]),
  ...Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2;
    return cylinder(
      0,
      0.16,
      0.42,
      i % 2 ? YELLOW : RED,
      [0.62 + Math.sin(angle) * 0.2, 2 + Math.cos(angle) * 0.2, 0],
      [0, 0, -angle],
      4,
    );
  }),
  sphere(0.17, YELLOW, [0.62, 2, 0], [1, 1, 0.5]),
];

export const decorPaperLanterns = (): Part[] => [
  cylinder(0.07, 0.09, 2.3, WOOD, [-1.3, 1.15, 0]),
  cylinder(0.07, 0.09, 2.3, WOOD, [1.3, 1.15, 0]),
  box(2.6, 0.04, 0.04, 0x6b4a1c, [0, 2.15, 0]),
  ...[-0.9, -0.3, 0.3, 0.9].flatMap((x, i) => [
    sphere(0.2, i % 2 ? YELLOW : RED, [x, 1.88, 0], [1, 1.25, 1]),
    box(0.12, 0.05, 0.12, GOLD, [x, 2.1, 0]),
  ]),
];

export const decorFountain = (): Part[] => [
  cylinder(1, 1.1, 0.42, 0xd6c4a1, [0, 0.21, 0], undefined, 12),
  cylinder(0.85, 0.85, 0.06, 0x6fc3d6, [0, 0.4, 0], undefined, 12),
  cylinder(0.14, 0.2, 0.9, 0xe9dcc0, [0, 0.8, 0]),
  cylinder(0.42, 0.18, 0.16, 0xd6c4a1, [0, 1.25, 0], undefined, 10),
  sphere(0.2, 0x9bd8e6, [0, 1.45, 0], [1, 1.3, 1]),
];
