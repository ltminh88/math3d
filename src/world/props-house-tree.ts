// Reusable props: cottage with roof, chimney, door, window and flower box; low-poly tree.
import { Group } from 'three';
import type { WorldBuildContext } from './world-build-context';
import { addBox, addCylinder, addSphere, colorAt } from './world-primitives';

const TREE_CROWN_COLORS: readonly number[] = [0x3c9360, 0x56a45d, 0x76b351];

/** Cottage at (x, z) with a pyramid roof of `roofColor`; registers a collision circle. */
export function buildHouse(
  ctx: WorldBuildContext,
  x: number,
  z: number,
  roofColor: number,
  scale = 1,
  rotationY = 0,
): void {
  const house = new Group();
  house.position.set(x, 0, z);
  house.scale.setScalar(scale);
  house.rotation.y = rotationY;
  addBox(ctx, house, 0, 1.5, 0, 3.6, 3, 3, 0xfff0ce);
  const roof = addCylinder(ctx, house, 0, 3.5, 0, 0, 3.1, 2, roofColor, 4);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.95;
  addBox(ctx, house, -0.85, 4.15, -0.65, 0.5, 1.5, 0.6, 0xe9c6a0);
  addBox(ctx, house, -0.35, 0.95, 1.53, 0.9, 1.9, 0.15, 0x835b41);
  addBox(ctx, house, 1, 1.55, 1.53, 0.8, 0.8, 0.12, 0x4d95a3);
  addBox(ctx, house, 1, 1.55, 1.61, 0.08, 0.84, 0.07, 0xffffff);
  addBox(ctx, house, 1, 1.55, 1.61, 0.84, 0.08, 0.07, 0xffffff);
  addBox(ctx, house, 1, 1.02, 1.7, 1.1, 0.22, 0.4, 0x9e6a44);
  for (let i = 0; i < 4; i++) {
    addSphere(ctx, house, 0.63 + i * 0.25, 1.23, 1.7, 0.18, i % 2 ? 0xffce58 : 0xf18e81);
  }
  addBox(ctx, house, 0, 0.12, 1.85, 2.3, 0.25, 0.8, 0xd6c4a1);
  ctx.scene.add(house);
  ctx.obstacles.push({ x, z, radius: 2.35 * scale });
}

/**
 * Tree at (x, z). `variant % 3 === 0` is a two-tier conifer, otherwise a round crown of three
 * spheres (with four fruits when `variant % 4 === 0`). Registers a collision circle.
 */
export function buildTree(
  ctx: WorldBuildContext,
  x: number,
  z: number,
  scale: number,
  variant = 0,
): void {
  const tree = new Group();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);
  addCylinder(ctx, tree, 0, 1.1, 0, 0.18, 0.26, 2.2, 0x946b43);
  if (variant % 3 === 0) {
    addCylinder(ctx, tree, 0, 2.35, 0, 0, 1.35, 2.3, colorAt(TREE_CROWN_COLORS, variant % 3));
    addCylinder(ctx, tree, 0, 3.35, 0, 0, 1, 1.9, 0x61ad69);
  } else {
    addSphere(ctx, tree, 0, 2.7, 0, 1.35, colorAt(TREE_CROWN_COLORS, variant % 3));
    addSphere(ctx, tree, -0.7, 2.25, 0.25, 0.9, colorAt(TREE_CROWN_COLORS, (variant + 1) % 3));
    addSphere(ctx, tree, 0.6, 2.7, 0.3, 0.8, 0x81bf62);
    if (variant % 4 === 0) {
      for (let i = 0; i < 4; i++) {
        addSphere(ctx, tree, Math.cos(i * 2) * 0.8, 2.4 + Math.sin(i) * 0.4, 0.85, 0.17, 0xf3a444);
      }
    }
  }
  ctx.scene.add(tree);
  ctx.obstacles.push({ x, z, radius: 0.45 * scale });
}
