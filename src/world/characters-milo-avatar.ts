// Low-poly player (boy/girl avatar) and VLM the guide, built from the shared primitives.
import type { Group, Mesh } from 'three';
import type { Avatar } from '../save/save-types';
import type { WorldBuildContext } from './world-build-context';
import { addBox, addCylinder, addSphere, getCachedMaterial } from './world-primitives';

const SKIN = 0xffd5ae;
const HAIR = 0x513c32;
const BOY_SHIRT = 0xebae42;
const GIRL_SHIRT = 0x9774b8;

/** Player parts the avatar switch and the walk cycle touch. */
export interface PlayerModelParts {
  shirt: Mesh;
  hair: Mesh;
  ponytail: Mesh;
  /** Left and right leg (each carries its shoe), swung by the walk cycle. */
  legs: Mesh[];
}

export function buildPlayerModel(ctx: WorldBuildContext, player: Group): PlayerModelParts {
  const shirt = addBox(ctx, player, 0, 0.93, 0, 0.7, 0.8, 0.47, BOY_SHIRT);
  addSphere(ctx, player, 0, 1.67, 0, 0.45, SKIN);
  const hair = addSphere(ctx, player, 0, 1.93, -0.035, 0.43, HAIR);
  hair.scale.y = 0.65;
  const ponytail = addSphere(ctx, player, 0, 1.66, -0.39, 0.25, HAIR);
  ponytail.visible = false;
  const legs: Mesh[] = [];
  for (const side of [-0.16, 0.16]) {
    addSphere(ctx, player, side, 1.72, 0.394, 0.042, 0x273c35);
    const leg = addBox(ctx, player, side, 0.3, 0, 0.25, 0.55, 0.28, 0x425f70);
    addBox(ctx, leg, 0, -0.19, 0.08, 0.29, 0.16, 0.4, 0xfaf2d6);
    legs.push(leg);
  }
  addBox(ctx, player, -0.48, 0.94, 0, 0.2, 0.65, 0.23, SKIN);
  addBox(ctx, player, 0.48, 0.94, 0, 0.2, 0.65, 0.23, SKIN);
  addBox(ctx, player, 0, 1, -0.36, 0.52, 0.65, 0.3, 0x599989);
  addBox(ctx, player, 0, 1, -0.54, 0.32, 0.25, 0.1, 0xf0cd76);
  return { shirt, hair, ponytail, legs };
}

/** VLM in robe and pointed hat with a staff; the floating orb is tagged `userData.beacon`. */
export function buildMiloModel(ctx: WorldBuildContext, milo: Group): void {
  addCylinder(ctx, milo, 0, 0.65, 0, 0.45, 0.7, 1.25, 0x537e7e);
  addSphere(ctx, milo, 0, 1.58, 0, 0.48, 0xffd4ab);
  addCylinder(ctx, milo, 0, 2.15, 0, 0.08, 0.58, 0.95, 0x447676);
  addCylinder(ctx, milo, 0, 1.82, 0, 0.75, 0.75, 0.12, 0x447676);
  for (const side of [-0.16, 0.16]) {
    addSphere(ctx, milo, side, 1.6, 0.44, 0.045, 0x293d38);
  }
  addSphere(ctx, milo, 0, 1.28, 0.33, 0.22, 0xf6f0d9);
  addBox(ctx, milo, 0.7, 0.9, 0, 0.09, 1.8, 0.09, 0x9f7248);
  addSphere(ctx, milo, 0.7, 1.9, 0, 0.19, 0xffd26a);
  const beacon = addSphere(ctx, milo, 0, 3, 0, 0.19, 0xffcf5d);
  beacon.userData.beacon = true;
}

/** Girl: purple shirt + ponytail; anything else falls back to the boy look. */
export function applyAvatar(ctx: WorldBuildContext, parts: PlayerModelParts, avatar: Avatar): void {
  parts.shirt.material = getCachedMaterial(ctx, avatar === 'girl' ? GIRL_SHIRT : BOY_SHIRT);
  parts.ponytail.visible = avatar === 'girl';
}
