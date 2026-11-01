// Hang Đố Vui (chapter 2, west bank): a rock mound with a dark mouth lit by two lanterns and a
// warm inner glow, plus a few boulders. Rock goes to the solid root, the light to the glow root
// (baked unlit, so it reads as lit at any time of the scene).
import { DodecahedronGeometry, type Group } from 'three';
import type { WorldBuildContext } from '../world-build-context';
import { addCylinder, addMesh, addSphere, blockAt } from '../world-primitives';
import { expansionRegionGroup } from './expansion-region-group';

const ROCK = 0x8f8a80;

export function buildPuzzleCave(ctx: WorldBuildContext, solid: Group, glow: Group): void {
  const cave = expansionRegionGroup(solid, 'cave');
  const light = expansionRegionGroup(glow, 'cave');
  const mound = addSphere(ctx, cave, -1, 0, 2.5, 4.2, ROCK);
  mound.scale.y = 0.7;
  blockAt(ctx, cave, -1, 2.5, 4);
  // Mouth: a dark disc on the mound's south face (towards the default camera).
  const mouth = addCylinder(ctx, cave, -1, 0.95, 6.35, 1.2, 1.2, 0.1, 0x2b2622, 16);
  mouth.rotation.x = Math.PI / 2 - 0.25;
  const inner = addCylinder(ctx, light, -1, 0.78, 6.44, 0.62, 0.62, 0.06, 0xffb347, 14);
  inner.rotation.x = Math.PI / 2 - 0.25;
  for (const side of [-1.6, 1.6]) {
    addCylinder(ctx, cave, -1 + side, 0.6, 6.7, 0.07, 0.09, 1.2, 0x6b4a2f, 6);
    addSphere(ctx, light, -1 + side, 1.32, 6.7, 0.22, 0xffd064);
  }
  for (const [x, z, r] of [
    [-5, -3, 0.9],
    [3.5, 4, 0.7],
    [-4.5, 5, 0.8],
  ] as const) {
    addMesh(ctx, cave, new DodecahedronGeometry(r, 0), 0x9d978b, x, r * 0.45, z);
    blockAt(ctx, cave, x, z, r);
  }
}
