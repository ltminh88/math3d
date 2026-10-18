// East-bank regions: the math meadow (flower rows, "× ÷" gate, barn) and the division forest
// (tree ring, stepping stones, mushrooms, cabin with "÷ 3" sign).
import { Group } from 'three';
import { buildTree } from '../props-house-tree';
import type { WorldBuildContext } from '../world-build-context';
import {
  addBox,
  addCylinder,
  addRegionGroup,
  addSphere,
  blockAt,
  colorAt,
  requireRegion,
} from '../world-primitives';
import { addSign } from '../world-text-sign';

const MEADOW_FLOWER_COLORS: readonly number[] = [0xf2bd55, 0xe98567, 0x74b9a7];

/** Tree offsets from the forest centre; index + 2 is the tree variant. */
const FOREST_TREES: readonly (readonly [dx: number, dz: number])[] = [
  [-8, -6],
  [-5.5, -4],
  [-8, -1],
  [-6, 2],
  [-8, 5],
  [-4.5, 6],
  [-2.5, 2.5],
  [3, -5],
  [5.5, -6.5],
  [8, -4],
  [5, -1],
  [8, 1.5],
  [5.5, 4],
  [8, 6.5],
  [3, 6.5],
  [-2.5, -6.5],
];

export function buildMathMeadow(ctx: WorldBuildContext): void {
  const meadow = addRegionGroup(ctx, 'meadow');
  addBox(ctx, meadow, 0, 0.04, 0, 18, 0.08, 14, 0x9aca6b);
  for (let row = 0; row < 3; row++) {
    const z = -4 + row * 4;
    addBox(ctx, meadow, 0, 0.1, z, 11, 0.14, 2.2, row % 2 ? 0xb59662 : 0xc7a971);
    for (let i = 0; i < 7; i++) {
      const x = -4.4 + i * 1.45;
      addSphere(ctx, meadow, x, 0.42, z, 0.28, colorAt(MEADOW_FLOWER_COLORS, (row + i) % 3));
      addCylinder(ctx, meadow, x, 0.25, z, 0.08, 0.11, 0.35, 0x5f9b51, 6);
    }
  }
  for (const x of [-2.4, 2.4]) {
    addCylinder(ctx, meadow, x, 1.6, 7, 0.16, 0.2, 3.2, 0x8c6947);
    addSphere(ctx, meadow, x, 3.35, 7, 0.35, 0xffd064);
  }
  addBox(ctx, meadow, 0, 3.1, 7, 5.6, 0.22, 0.22, 0x8c6947);
  addSign(meadow, '× ÷', 0, 3.9, 7.05, 2.6, '#ffd064', '#6b4a1c');
  blockAt(ctx, meadow, -2.4, 7, 0.3);
  blockAt(ctx, meadow, 2.4, 7, 0.3);
  for (let i = 0; i < 7; i++) {
    const hay = addSphere(ctx, meadow, -7.4 + i * 2.4, 0.22, -6.2, 0.45, 0xe5c995);
    hay.rotation.y = i * 0.8;
  }
  const barn = new Group();
  barn.position.set(6.5, 0, -1);
  addBox(ctx, barn, 0, 1.4, 0, 3, 2.8, 3.6, 0xc9624f);
  const roof = addCylinder(ctx, barn, 0, 3.2, 0, 0, 2.5, 1.4, 0x8a4a3e, 4);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 1.3;
  addBox(ctx, barn, -1.52, 1, 0, 0.1, 1.8, 1.6, 0xf6e7c4);
  meadow.add(barn);
  blockAt(ctx, meadow, 6.5, -1, 2.3);
  addSign(barn, '2 × 3', -1.6, 2.4, 0, 1.8, '#fffbea', '#8a4a3e', -Math.PI / 2);
}

export function buildForest(ctx: WorldBuildContext): void {
  const forest = addRegionGroup(ctx, 'forest');
  const [centerX, centerZ] = requireRegion('forest').center;
  addBox(ctx, forest, 0, 0.04, 0, 20, 0.08, 16, 0x6fa55b);
  addBox(ctx, forest, 0, 0.08, -2, 1.8, 0.12, 12, 0xd2b77d);
  FOREST_TREES.forEach(([dx, dz], i) => {
    buildTree(ctx, centerX + dx, centerZ + dz, 0.85 + (i % 3) * 0.2, i + 2);
  });
  for (let i = 0; i < 5; i++) {
    const z = -6 + i * 2.6;
    const x = i % 2 ? 2 : -2;
    addBox(ctx, forest, x, 0.08, z, 0.9, 0.12, 0.9, 0x8e6b4c);
    addSphere(ctx, forest, x, 0.38, z, 0.3, 0xe8bd5a);
  }
  for (let i = 0; i < 6; i++) {
    const x = -1 + (i % 3) * 1.1;
    const z = 3 + Math.floor(i / 3) * 1.2;
    addCylinder(ctx, forest, x, 0.2, z, 0.08, 0.1, 0.4, 0xf6ecd4, 6);
    addSphere(ctx, forest, x, 0.45, z, 0.24, 0xd9534a).scale.y = 0.6;
  }
  const cabin = new Group();
  cabin.position.set(0, 0, 5.5);
  addBox(ctx, cabin, 0, 1.1, 0, 3.2, 2.2, 2.4, 0x9a6b45);
  const roof = addCylinder(ctx, cabin, 0, 2.8, 0, 0, 2.5, 1.4, 0x3f7a58, 4);
  roof.rotation.y = Math.PI / 4;
  addBox(ctx, cabin, 0, 0.8, -1.22, 0.8, 1.5, 0.08, 0x5b3c28);
  forest.add(cabin);
  blockAt(ctx, forest, 0, 5.5, 2);
  addSign(forest, '÷ 3', 0, 2.2, -1.25, 1.5, '#fff4d8', '#3f7a58');
}
