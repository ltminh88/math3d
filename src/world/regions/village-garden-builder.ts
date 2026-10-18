// Starting area west of the river: three cottages, windmill, ring of trees and signpost;
// the vegetable garden with fence, beds and scarecrow flag just across the river.
import { Group } from 'three';
import { buildHouse, buildTree } from '../props-house-tree';
import type { WorldBuildContext } from '../world-build-context';
import { addBox, addCylinder, addSphere } from '../world-primitives';

/** [x, z, scale]; the array index doubles as the tree variant. */
const VILLAGE_TREES: readonly (readonly [x: number, z: number, scale: number])[] = [
  [-20, -14, 1.3],
  [-20, -8, 1],
  [-20, 0, 1.1],
  [-20, 13, 1.3],
  [-14, 14, 1.1],
  [-7, 16, 1.4],
  [-2, 13, 1.1],
  [1, 17, 1.2],
  [0, -16, 1.5],
  [1, -8, 1],
  [-8, -17, 1.2],
  [13, -14, 1.3],
  [18, -17, 1.5],
  [21, -10, 1.2],
  [21, 7, 1.3],
  [17, 14, 1.5],
  [12, 11, 1.2],
  [12, -7, 0.85],
];

function buildWindmill(ctx: WorldBuildContext): void {
  const mill = new Group();
  mill.position.set(-15, 0, -14);
  addCylinder(ctx, mill, 0, 2, 0, 1.2, 1.6, 4, 0xf1dfb3);
  addCylinder(ctx, mill, 0, 4.7, 0, 0, 1.8, 1.9, 0x53918d);
  ctx.windmill.position.set(0, 3.2, 1.65);
  for (let i = 0; i < 4; i++) {
    const blade = new Group();
    blade.rotation.z = (i * Math.PI) / 2;
    addBox(ctx, blade, 0, 1.6, 0, 0.18, 3, 0.18, 0x8c7049);
    addBox(ctx, blade, 0.4, 1.85, 0, 0.75, 1.7, 0.12, 0xfff1cb);
    ctx.windmill.add(blade);
  }
  addSphere(ctx, ctx.windmill, 0, 0, 0.1, 0.25, 0xeab65b);
  mill.add(ctx.windmill);
  ctx.scene.add(mill);
  ctx.obstacles.push({ x: -15, z: -14, radius: 1.8 });
}

export function buildVillage(ctx: WorldBuildContext): void {
  buildHouse(ctx, -12, -6, 0xd88c55, 1.25);
  buildHouse(ctx, -17, 6, 0x528f91, 0.9, 0.25);
  buildHouse(ctx, -4, -11, 0xbd7063, 1);
  buildWindmill(ctx);
  VILLAGE_TREES.forEach(([x, z, scale], variant) => {
    buildTree(ctx, x, z, scale, variant);
  });
  const signpost = new Group();
  signpost.position.set(0.4, 0, 3.4);
  addBox(ctx, signpost, 0, 0.7, 0, 0.17, 1.4, 0.17, 0x8c6947);
  addBox(ctx, signpost, 0, 1.45, 0, 1.5, 0.65, 0.2, 0xb78a54);
  ctx.scene.add(signpost);
}

export function buildGarden(ctx: WorldBuildContext): void {
  const { scene } = ctx;
  for (let i = 0; i < 6; i++) {
    addBox(ctx, scene, 12 + i * 1.8, 0.65, 5, 0.15, 1.3, 0.15, 0xf2e5bd);
  }
  addBox(ctx, scene, 16.5, 0.8, 5, 9.2, 0.15, 0.15, 0xf2e5bd);
  for (let bed = 0; bed < 3; bed++) {
    addBox(ctx, scene, 16 + bed * 1.6, 0.09, -7, 1, 0.12, 5.5, 0xb29362);
    for (let i = 0; i < 6; i++) {
      addSphere(ctx, scene, 16 + bed * 1.6, 0.35, -9 + i * 0.8, 0.32, 0x5aab59);
      addSphere(ctx, scene, 16 + bed * 1.6, 0.54, -9 + i * 0.8, 0.15, 0xedb958);
    }
  }
  addCylinder(ctx, scene, 17.5, 2.1, 0, 0.08, 0.08, 4.2, 0x8b7049);
  addBox(ctx, scene, 18.1, 3.6, 0, 1.2, 0.8, 0.06, 0xffc956);
  addCylinder(ctx, scene, 16, 0.12, 0, 1.5, 1.5, 0.2, 0xe8c97b, 12);
}
