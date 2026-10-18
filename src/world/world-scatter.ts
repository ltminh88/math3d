// Seeded scatter of instanced trees (inside the banks + the hills beyond), then rocks and ground
// cover. One Park-Miller stream (seed 1337) feeds every pass in order; draws inside `||` chains
// are conditional on purpose, so expressions are kept in their original evaluation order.
import {
  Color,
  ConeGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  Object3D,
} from 'three';
import { createSeededLcg } from '../config/seeded-lcg';
import { WALKABLE_BOUNDS } from '../config/world-constants';
import { groundHeight } from './sky-dome';
import type { WorldBuildContext } from './world-build-context';
import { colorAt, getCachedMaterial, requireRegion } from './world-primitives';
import { isBlocked } from './world-scatter-exclusion';
import { scatterFlowersAndGrass, scatterRocks } from './world-scatter-ground-cover';

const SCATTER_SEED = 1337;
const CROWN_COLORS: readonly number[] = [0x3c9360, 0x56a45d, 0x76b351, 0x4f9a62, 0x68b058];
/** Pine cone layers as [height, radius, cone height] multiples of the tree scale. */
const PINE_LAYERS: readonly (readonly [number, number, number])[] = [
  [2.35, 1.35, 2.3],
  [3.35, 1, 1.9],
];
/** Leafy crown blobs as [x offset, height, z offset, radius] multiples of the tree scale. */
const LEAF_BLOBS: readonly (readonly [number, number, number, number])[] = [
  [0, 2.7, 0, 1.35],
  [-0.7, 2.25, 0.25, 0.9],
];

/** Tree placement as [x, z, scale, base height]. */
type TreeSpot = [x: number, z: number, scale: number, baseY: number];

/** Runs every scatter pass; tree trunks inside the banks register collision circles. */
export function scatterWorld(ctx: WorldBuildContext, lowPower: boolean): void {
  const random = createSeededLcg(SCATTER_SEED);
  const dummy = new Object3D();
  const color = new Color();
  const trees = placeBankTrees(ctx, random, lowPower);
  placeHillTrees(trees, random, lowPower);
  addTreeInstances(ctx, trees, dummy, color);
  scatterRocks(ctx, random, dummy);
  scatterFlowersAndGrass(ctx, random, dummy, color, lowPower);
}

function placeBankTrees(
  ctx: WorldBuildContext,
  random: () => number,
  lowPower: boolean,
): TreeSpot[] {
  const bounds = WALKABLE_BOUNDS;
  const trees: TreeSpot[] = [];
  const wanted = lowPower ? 150 : 230;
  for (let attempt = 0; trees.length < wanted && attempt < 6000; attempt++) {
    const x = bounds.west.minX + random() * (bounds.east.maxX - bounds.west.minX);
    const z = bounds.minZ + random() * (bounds.maxZ - bounds.minZ);
    const scale = 0.8 + random() * 0.7;
    const forest = requireRegion('forest');
    if (
      !(
        (Math.abs(x - forest.center[0]) < forest.size[0] / 2 + 1 &&
          Math.abs(z - forest.center[1]) < forest.size[1] / 2 + 1) ||
        isBlocked(ctx.obstacles, x, z, 1.4) ||
        trees.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 2.4)
      )
    ) {
      trees.push([x, z, scale, 0]);
      ctx.obstacles.push({ x, z, radius: 0.45 * scale });
    }
  }
  return trees;
}

/** Sparse-to-dense trees on the hills outside the banks (none on the river corridor). */
function placeHillTrees(trees: TreeSpot[], random: () => number, lowPower: boolean): void {
  const bounds = WALKABLE_BOUNDS;
  const wanted = lowPower ? 450 : 900;
  for (let attempt = 0, placed = 0; placed < wanted && attempt < wanted * 12; attempt++) {
    const x = -150 + random() * 310;
    const z = -140 + random() * 280;
    const outsideX = Math.max(bounds.west.minX - x, x - bounds.east.maxX, 0);
    const outsideZ = Math.max(bounds.minZ - z, z - bounds.maxZ, 0);
    const distance = Math.hypot(outsideX, outsideZ);
    if (!(distance < 1.5 || Math.abs(x - 7) < 6 || random() > (distance < 22 ? 0.95 : 0.3))) {
      trees.push([x, z, 0.9 + random() * 0.9, groundHeight(x, z) - 0.1]);
      placed++;
    }
  }
}

/** Trunks for every tree; every third tree is a two-layer pine, the rest leafy blobs. */
function addTreeInstances(
  ctx: WorldBuildContext,
  trees: TreeSpot[],
  dummy: Object3D,
  color: Color,
): void {
  const white = getCachedMaterial(ctx, 0xffffff);
  const trunks = new InstancedMesh(
    new CylinderGeometry(0.18, 0.26, 2.2, 6),
    getCachedMaterial(ctx, 0x946b43),
    trees.length,
  );
  const blobs = new InstancedMesh(new IcosahedronGeometry(1, 1), white, trees.length * 2);
  const cones = new InstancedMesh(new ConeGeometry(1, 1, 7), white, trees.length * 2);
  let blobCount = 0;
  let coneCount = 0;
  trees.forEach(([x, z, scale, baseY], index) => {
    dummy.position.set(x, baseY + 1.1 * scale, z);
    dummy.rotation.set(0, index, 0);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    trunks.setMatrixAt(index, dummy.matrix);
    const crown = colorAt(CROWN_COLORS, index % CROWN_COLORS.length);
    if (index % 3 === 0) {
      for (const [height, radius, coneHeight] of PINE_LAYERS) {
        dummy.position.set(x, baseY + height * scale, z);
        dummy.scale.set(radius * scale, coneHeight * scale, radius * scale);
        dummy.updateMatrix();
        cones.setMatrixAt(coneCount, dummy.matrix);
        cones.setColorAt(coneCount++, color.setHex(height > 3 ? 0x61ad69 : crown));
      }
    } else {
      for (const [dx, height, dz, radius] of LEAF_BLOBS) {
        dummy.position.set(x + dx * scale, baseY + height * scale, z + dz * scale);
        dummy.scale.setScalar(radius * scale);
        dummy.updateMatrix();
        blobs.setMatrixAt(blobCount, dummy.matrix);
        blobs.setColorAt(blobCount++, color.setHex(dx ? 0x81bf62 : crown));
      }
    }
  });
  blobs.count = blobCount;
  cones.count = coneCount;
  for (const mesh of [trunks, blobs, cones]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    ctx.scene.add(mesh);
  }
}
