// Xưởng Đo Đạc (chapter 2, south-east bank): a work shed, a giant ruler as a fence (cm ticks) and
// a balance scale. Built into the expansion scratch group, then baked.
import type { Group } from 'three';
import type { WorldBuildContext } from '../world-build-context';
import { addBox, addCylinder, blockAt } from '../world-primitives';
import { expansionRegionGroup } from './expansion-region-group';

const WOOD = 0x8c6947;
const INK = 0x5a4632;

function buildShed(ctx: WorldBuildContext, workshop: Group): void {
  addBox(ctx, workshop, -5, 1.3, 2, 4.4, 2.6, 3, 0xd99a6c);
  const roof = addCylinder(ctx, workshop, -5, 3.3, 2, 0, 3.3, 1.4, 0x9c5a3c, 4);
  roof.rotation.y = Math.PI / 4;
  addBox(ctx, workshop, -5, 0.8, 3.52, 1, 1.6, 0.06, 0x6b4a2f);
  blockAt(ctx, workshop, -5, 2, 2.6);
}

/** 10 units of ruler on two posts: a tick per unit, longer ones every 5. */
function buildRulerFence(ctx: WorldBuildContext, workshop: Group): void {
  addBox(ctx, workshop, 3, 0.9, 4.6, 10, 0.9, 0.2, 0xf2d36b);
  for (let i = 0; i <= 10; i++) {
    const long = i % 5 === 0;
    addBox(ctx, workshop, -2 + i, long ? 1.08 : 1.17, 4.71, 0.07, long ? 0.5 : 0.32, 0.02, INK);
  }
  for (const x of [-2, 8]) addBox(ctx, workshop, x, 0.6, 4.6, 0.25, 1.2, 0.25, WOOD);
  for (let x = -2; x <= 8; x += 2.5) blockAt(ctx, workshop, x, 4.6, 0.6);
}

function buildBalanceScale(ctx: WorldBuildContext, workshop: Group): void {
  const [x, z] = [8.2, -3.4];
  addCylinder(ctx, workshop, x, 0.15, z, 0.6, 0.7, 0.3, WOOD, 10);
  addCylinder(ctx, workshop, x, 1.4, z, 0.1, 0.1, 2.4, 0xb0b6bf, 8);
  addBox(ctx, workshop, x, 2.55, z, 2.6, 0.12, 0.12, 0xb0b6bf);
  for (const side of [-1.2, 1.2]) {
    addBox(ctx, workshop, x + side, 2.1, z, 0.03, 0.9, 0.03, INK);
    addCylinder(ctx, workshop, x + side, 1.62, z, 0.55, 0.45, 0.08, 0xd9b45a, 12);
  }
  blockAt(ctx, workshop, x, z, 1.4);
}

export function buildMeasurementWorkshop(ctx: WorldBuildContext, root: Group): void {
  const workshop = expansionRegionGroup(root, 'workshop');
  buildShed(ctx, workshop);
  buildRulerFence(ctx, workshop);
  buildBalanceScale(ctx, workshop);
}
