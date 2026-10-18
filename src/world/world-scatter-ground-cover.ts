// Rocks, then flower + leaf + grass-tuft triplets, drawn from the shared scatter stream after the
// trees (see world-scatter.ts). Instance counts are fixed; rejected spots simply redraw.
import {
  type Color,
  ConeGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  type Object3D,
} from 'three';
import { WALKABLE_BOUNDS } from '../config/world-constants';
import type { WorldBuildContext } from './world-build-context';
import { colorAt, getCachedMaterial } from './world-primitives';
import { insideBanks, isBlocked, nearRoad } from './world-scatter-exclusion';

const ROCK_COUNT = 70;
const FLOWER_COLORS: readonly number[] = [0xffe4a3, 0xf5f0d7, 0xe9a98e, 0xbdabe0, 0xf6b3d0];

export function scatterRocks(ctx: WorldBuildContext, random: () => number, dummy: Object3D): void {
  const bounds = WALKABLE_BOUNDS;
  const rocks = new InstancedMesh(
    new DodecahedronGeometry(1, 0),
    getCachedMaterial(ctx, 0xb9ac8e),
    ROCK_COUNT,
  );
  let placed = 0;
  while (placed < ROCK_COUNT) {
    const x = bounds.west.minX + random() * 120;
    const z = bounds.minZ + random() * 88;
    if (isBlocked(ctx.obstacles, x, z, 0.8)) {
      continue;
    }
    const size = 0.25 + random() * 0.5;
    dummy.position.set(x, size * 0.3, z);
    dummy.rotation.set(random(), random() * 6, 0);
    dummy.scale.set(size * 1.3, size * 0.7, size);
    dummy.updateMatrix();
    rocks.setMatrixAt(placed++, dummy.matrix);
  }
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  ctx.scene.add(rocks);
}

/** Keeps the village main road and the north path clear of ground cover. */
function onVillagePaths(x: number, z: number): boolean {
  return (x > -24 && x < 3 && Math.abs(z - 1) < 2) || (Math.abs(x + 10) < 2 && z < 7 && z > -15);
}

export function scatterFlowersAndGrass(
  ctx: WorldBuildContext,
  random: () => number,
  dummy: Object3D,
  color: Color,
  lowPower: boolean,
): void {
  const bounds = WALKABLE_BOUNDS;
  const count = lowPower ? 700 : 1300;
  const blossoms = new InstancedMesh(
    new IcosahedronGeometry(0.11, 0),
    getCachedMaterial(ctx, 0xffffff),
    count,
  );
  const stems = new InstancedMesh(
    new ConeGeometry(0.1, 0.35, 3),
    getCachedMaterial(ctx, 0x61a450),
    count,
  );
  const tufts = new InstancedMesh(
    new ConeGeometry(0.16, 0.5, 4),
    getCachedMaterial(ctx, 0x6fb553),
    count,
  );
  for (let placed = 0; placed < count; ) {
    const x = bounds.west.minX + random() * 120;
    const z = bounds.minZ + random() * 88;
    if (!(!insideBanks(x, z, 0.6) || onVillagePaths(x, z) || nearRoad(x, z, 1.7))) {
      dummy.rotation.set(0, random() * 6, 0);
      dummy.scale.setScalar(1);
      dummy.position.set(x, 0.19, z);
      dummy.updateMatrix();
      stems.setMatrixAt(placed, dummy.matrix);
      dummy.position.y = 0.39;
      dummy.updateMatrix();
      blossoms.setMatrixAt(placed, dummy.matrix);
      blossoms.setColorAt(placed, color.setHex(colorAt(FLOWER_COLORS, placed % 5)));
      dummy.position.set(x + (random() - 0.5) * 3, 0.22, z + (random() - 0.5) * 3);
      dummy.scale.setScalar(0.7 + random() * 0.6);
      dummy.updateMatrix();
      tufts.setMatrixAt(placed, dummy.matrix);
      placed++;
    }
  }
  for (const mesh of [blossoms, stems, tufts]) {
    mesh.receiveShadow = true;
    ctx.scene.add(mesh);
  }
}
