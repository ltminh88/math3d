// R9 new items (10): one more per body spot for VLM and the avatar (head/neck/back
// each) plus four village decorations. Same low-poly vertex-colour parts as the
// phase-24 items. VLM's staff stands on his back, clear of the robe; the moon pin
// sits on the side of his hat cone; the avatar's beanie covers the hair dome.
import { TorusGeometry } from 'three';
import { box, cylinder, type Part, ring, sphere } from './vertex-color-parts';

const GOLD = 0xffd064;
const WOOD = 0x8c6947;
const DARK_WOOD = 0x6b4a1c;
const RED = 0xe8562f;
const CREAM = 0xfff1cb;
const PINK = 0xf18e81;
const YELLOW = 0xffce58;
const LEAF = 0x5aab59;
const TEAL = 0x3b7f8c;
const FROG = 0x7a9b6e;

// --- VLM (anchors: head = brim top, neck, back) -------------------------------------------
export const vlmStarStaff = (): Part[] => [
  // Staff slung upright on the back (x 0.45 keeps it clear of the robe, r ≤ 0.7):
  // top star clears the head sphere, bottom stays above the ground.
  cylinder(0.05, 0.06, 1.5, WOOD, [0.45, 0.1, -0.2], [0, 0, 0.08]),
  cylinder(0.07, 0.07, 0.08, GOLD, [0.48, 0.55, -0.2], [0, 0, 0.08]),
  box(0.22, 0.07, 0.05, YELLOW, [0.51, 0.88, -0.2]),
  box(0.07, 0.22, 0.05, YELLOW, [0.51, 0.88, -0.2], [0, 0, Math.PI / 4]),
  sphere(0.09, TEAL, [0.45, -0.35, -0.2]),
];

export const vlmMoonPin = (): Part[] => [
  // Crescent pinned to the side of the hat cone (cone r 0.31 at this height; the
  // crescent's nearest point is 0.35 from the axis, so it never sinks in).
  {
    geometry: new TorusGeometry(0.13, 0.04, 6, 14, Math.PI * 1.25),
    color: GOLD,
    at: [0.52, 0.3, 0.12],
  },
  sphere(0.05, YELLOW, [0.38, 0.48, 0.2]),
];

export const vlmRainbowRibbon = (): Part[] => [
  // Neck ring (inner edge 0.48 clears the robe, r 0.46) with a bow and two tails
  // in front of the chest, clear of the beard.
  ring(0.52, 0.04, RED, [0, 0.02, 0]),
  box(0.22, 0.16, 0.05, PINK, [-0.14, -0.05, 0.55], [0, 0, 0.5]),
  box(0.22, 0.16, 0.05, YELLOW, [0.14, -0.05, 0.55], [0, 0, -0.5]),
  sphere(0.07, RED, [0, -0.05, 0.56]),
  box(0.06, 0.25, 0.03, TEAL, [-0.06, -0.22, 0.55]),
  box(0.06, 0.22, 0.03, YELLOW, [0.06, -0.2, 0.55]),
];

// --- Player avatar (anchors: head = above the hair, neck, back) ----------------------------
export const avatarKnitBeanie = (): Part[] => [
  // Beanie over the hair dome (hair top y 2.21; the brim ring's inner edge 0.39
  // clears the hair cross-section, 0.36, at its height).
  cylinder(0.4, 0.44, 0.22, RED, [0, 0.08, 0]),
  ring(0.42, 0.03, CREAM, [0, -0.02, 0]),
  sphere(0.3, RED, [0, 0.2, 0], [1, 0.6, 1]),
  sphere(0.09, CREAM, [0, 0.32, 0]),
];

export const avatarRedBow = (): Part[] => [
  // Bow tie at the front of the neck (ring inner edge 0.46 clears the shirt
  // corners, 0.42; the wings sit in front of the shirt, clear of the head).
  ring(0.5, 0.04, RED, [0, 0, 0]),
  box(0.2, 0.14, 0.05, RED, [-0.13, -0.04, 0.42], [0, 0, 0.5]),
  box(0.2, 0.14, 0.05, RED, [0.13, -0.04, 0.42], [0, 0, -0.5]),
  sphere(0.06, RED, [0, -0.04, 0.44]),
  box(0.05, 0.2, 0.03, RED, [-0.05, -0.18, 0.4]),
  box(0.05, 0.18, 0.03, RED, [0.05, -0.17, 0.4]),
];

export const avatarBackpack = (): Part[] => [
  // Backpack behind the player's own pack (its back face is z -0.51; this one
  // starts at -0.67, so it never sinks into it).
  box(0.5, 0.6, 0.18, TEAL, [0, 0, -0.12]),
  box(0.52, 0.16, 0.2, 0x2f6b78, [0, 0.24, -0.12]),
  box(0.24, 0.2, 0.04, YELLOW, [0, -0.05, -0.22]),
  box(0.1, 0.18, 0.12, RED, [-0.28, -0.12, -0.12]),
  box(0.1, 0.18, 0.12, RED, [0.28, -0.12, -0.12]),
  box(0.16, 0.04, 0.04, WOOD, [0, 0.34, -0.12]),
];

// --- Village decor (anchor: the decor slot on the ground) ----------------------------------
export const decorWindmill = (): Part[] => [
  // Tapered tower with a cone roof; the four blades spin in front of the tower
  // face (hub front z 0.73, tower r 0.5 at hub height).
  cylinder(0.5, 0.7, 2.6, CREAM, [0, 1.3, 0], undefined, 8),
  cylinder(0.08, 0.55, 0.7, RED, [0, 2.95, 0], undefined, 8),
  cylinder(0.12, 0.12, 0.25, WOOD, [0, 2.6, 0.6], [Math.PI / 2, 0, 0]),
  box(0.18, 2.2, 0.04, CREAM, [0, 2.6, 0.7]),
  box(2.2, 0.18, 0.04, CREAM, [0, 2.6, 0.7]),
  box(0.4, 0.7, 0.06, DARK_WOOD, [0, 0.35, 0.68]),
  sphere(0.12, TEAL, [0, 1.9, 0.58]),
];

export const decorNumberSign = (): Part[] => [
  // Signboard on two posts; the digit 3 is built from five red boxes on the
  // board face, like the numbers the child writes.
  cylinder(0.07, 0.09, 1.6, WOOD, [-0.7, 0.8, 0]),
  cylinder(0.07, 0.09, 1.6, WOOD, [0.7, 0.8, 0]),
  box(1.8, 1.1, 0.08, CREAM, [0, 1.9, 0]),
  box(1.9, 0.12, 0.1, WOOD, [0, 2.48, 0]),
  box(1.9, 0.12, 0.1, WOOD, [0, 1.32, 0]),
  box(0.5, 0.12, 0.04, RED, [0, 2.25, 0.06]),
  box(0.12, 0.3, 0.04, RED, [0.22, 2.05, 0.06]),
  box(0.5, 0.12, 0.04, RED, [0, 1.9, 0.06]),
  box(0.12, 0.3, 0.04, RED, [0.22, 1.7, 0.06]),
  box(0.5, 0.12, 0.04, RED, [0, 1.55, 0.06]),
  box(2.0, 0.08, 0.3, RED, [0, 2.62, 0]),
];

export const decorBerryBush = (): Part[] => [
  // Low bush of three leaf balls with five red berries sitting on the surface.
  cylinder(0.08, 0.1, 0.3, WOOD, [0, 0.15, 0]),
  sphere(0.7, LEAF, [0, 0.55, 0], [1, 0.8, 1]),
  sphere(0.5, LEAF, [0.5, 0.4, 0.2]),
  sphere(0.45, LEAF, [-0.45, 0.45, -0.1]),
  sphere(0.09, RED, [0.3, 0.9, 0.45]),
  sphere(0.09, RED, [-0.35, 0.75, 0.4]),
  sphere(0.09, RED, [0.6, 0.6, 0.35]),
  sphere(0.09, RED, [0, 0.65, 0.6]),
  sphere(0.09, RED, [-0.6, 0.55, 0.25]),
];

export const decorStoneFrog = (): Part[] => [
  // Stone frog facing the stall: squashed body, head with two eyes, front legs.
  sphere(0.5, FROG, [0, 0.33, 0], [1, 0.65, 1.2]),
  sphere(0.3, FROG, [0, 0.55, 0.35], [1, 0.7, 1]),
  sphere(0.1, CREAM, [-0.14, 0.78, 0.4]),
  sphere(0.1, CREAM, [0.14, 0.78, 0.4]),
  sphere(0.05, 0x222222, [-0.14, 0.8, 0.48]),
  sphere(0.05, 0x222222, [0.14, 0.8, 0.48]),
  sphere(0.22, FROG, [-0.45, 0.18, -0.2], [0.7, 0.8, 1]),
  sphere(0.22, FROG, [0.45, 0.18, -0.2], [0.7, 0.8, 1]),
  box(0.12, 0.25, 0.12, FROG, [-0.2, 0.12, 0.45]),
  box(0.12, 0.25, 0.12, FROG, [0.2, 0.12, 0.45]),
  box(0.3, 0.03, 0.03, 0x222222, [0, 0.48, 0.64]),
];
