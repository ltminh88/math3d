// Far west bank (pond with stones, jetty and lily pads; gazebo on a mound) and the six large
// outer hills that frame the play area. All register collision circles.
import { Group } from 'three';
import type { WorldBuildContext } from './world-build-context';
import { addBox, addCylinder, addSphere } from './world-primitives';

/** [x, z, radius] of the outer framing hills. */
const OUTER_HILLS: readonly (readonly [x: number, z: number, radius: number])[] = [
  [-46, -34, 8],
  [-46, 34, 7],
  [66, -38, 7],
  [66, 38, 8],
  [-24, -40, 6],
  [30, 40, 6],
];

function buildPond(ctx: WorldBuildContext): void {
  const { scene } = ctx;
  const water = addCylinder(ctx, scene, -38, 0.03, -11, 4.6, 4.6, 0.08, 0x5cc6d6, 28);
  water.castShadow = false;
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const stone = addSphere(
      ctx,
      scene,
      -38 + Math.cos(angle) * 4.9,
      0.15,
      -11 + Math.sin(angle) * 4.9,
      0.35 + (i % 3) * 0.1,
      0xc9bda0,
    );
    stone.scale.y = 0.6;
  }
  addBox(ctx, scene, -36.5, 0.25, -7.6, 1.4, 0.12, 2.6, 0xa47c52);
  for (let i = 0; i < 4; i++) {
    const pad = addCylinder(
      ctx,
      scene,
      -39.5 + (i % 2) * 2.4,
      0.1,
      -12 + i,
      0.45,
      0.45,
      0.04,
      0x5aa65a,
      10,
    );
    pad.castShadow = false;
  }
  ctx.obstacles.push({ x: -38, z: -11, radius: 4.8 });
}

function buildGazebo(ctx: WorldBuildContext): void {
  const mound = addSphere(ctx, ctx.scene, -40, -1.8, 18, 5.5, 0x86c25e);
  mound.scale.y = 0.45;
  mound.castShadow = false;
  const gazebo = new Group();
  gazebo.position.set(-40, 0.6, 18);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    addCylinder(
      ctx,
      gazebo,
      Math.cos(angle) * 1.6,
      1.2,
      Math.sin(angle) * 1.6,
      0.1,
      0.1,
      2.4,
      0xf2e5bd,
    );
  }
  addCylinder(ctx, gazebo, 0, 2.8, 0, 0, 2.3, 1.2, 0xd88c55, 6);
  addCylinder(ctx, gazebo, 0, 0.1, 0, 2, 2, 0.2, 0xead5a3, 12);
  ctx.scene.add(gazebo);
  ctx.obstacles.push({ x: -40, z: 18, radius: 2.2 });
}

export function buildWestBank(ctx: WorldBuildContext): void {
  buildPond(ctx);
  buildGazebo(ctx);
  for (const [x, z, radius] of OUTER_HILLS) {
    const hill = addSphere(ctx, ctx.scene, x, -radius * 0.55, z, radius, 0x7fbd5c);
    hill.scale.y = 0.55;
    hill.castShadow = false;
    ctx.obstacles.push({ x, z, radius: radius * 0.82 });
  }
}
