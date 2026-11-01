// Clears the seeded scatter (trees, rocks, flower triplets) off the chapter 2 regions and roads
// AFTER the scatter pass. The scatter itself never sees the expansion data: feeding it to
// `isBlocked` would shift every later draw of its seeded stream (and the golden-checked layout).
// Removal only compacts instance buffers and the obstacle list, so it draws no random number and
// creates no three object (no UUID draw from `Math.random`).
import { Color, type InstancedMesh, Matrix4, type Scene } from 'three';
import { expansionRegionAt, nearExpansionRoad } from '../config/expansion-region-lookup';
import type { ObstacleCircle } from './world-build-context';

/** The instanced meshes `scatterWorld` adds, in its add order. */
export interface ScatterMeshes {
  readonly trunks: InstancedMesh;
  readonly blobs: InstancedMesh;
  readonly cones: InstancedMesh;
  readonly rocks: InstancedMesh;
  readonly blossoms: InstancedMesh;
  readonly stems: InstancedMesh;
  readonly tufts: InstancedMesh;
}

/** Same clearances the scatter uses against the original regions and roads. */
const inTreeZone = (x: number, z: number) =>
  !!expansionRegionAt(x, z, 1.4) || nearExpansionRoad(x, z, 2.4);
const inRockZone = (x: number, z: number) =>
  !!expansionRegionAt(x, z, 0.8) || nearExpansionRoad(x, z, 1.8);
const inFlowerZone = (x: number, z: number) =>
  !!expansionRegionAt(x, z) || nearExpansionRoad(x, z, 1.7);

/** The 7 instanced meshes added to `scene` from child `fromIndex` on (throws on a mismatch). */
export function scatterMeshesFrom(scene: Scene, fromIndex: number): ScatterMeshes {
  const added = scene.children.slice(fromIndex) as InstancedMesh[];
  const [trunks, blobs, cones, rocks, blossoms, stems, tufts] = added;
  if (added.length !== 7 || !added.every((m) => m.isInstancedMesh) || !tufts) {
    throw new Error('scatter layout changed: expected 7 instanced meshes');
  }
  return { trunks, blobs, cones, rocks, blossoms, stems, tufts } as ScatterMeshes;
}

const matrix = new Matrix4();
const color = new Color();

function groundAt(mesh: InstancedMesh, index: number): [number, number] {
  mesh.getMatrixAt(index, matrix);
  return [matrix.elements[12] as number, matrix.elements[14] as number];
}

/** Keeps the instances whose `keep` flag is set, in order (matrix and colour move together). */
function compact(mesh: InstancedMesh, keep: readonly boolean[]): void {
  let next = 0;
  for (let i = 0; i < mesh.count; i++) {
    if (!keep[i]) continue;
    if (next !== i) {
      mesh.getMatrixAt(i, matrix);
      mesh.setMatrixAt(next, matrix);
      if (mesh.instanceColor) {
        mesh.getColorAt(i, color);
        mesh.setColorAt(next, color);
      }
    }
    next++;
  }
  mesh.count = next;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

const flags = (mesh: InstancedMesh, test: (x: number, z: number) => boolean): boolean[] =>
  Array.from({ length: mesh.count }, (_, i) => !test(...groundAt(mesh, i)));

/** Trees go as a whole: trunk plus its 2 cones (every third tree, a pine) or 2 leaf blobs. */
function clearTrees(meshes: ScatterMeshes): void {
  const keepTrunks = flags(meshes.trunks, inTreeZone);
  const keepCones: boolean[] = [];
  const keepBlobs: boolean[] = [];
  keepTrunks.forEach((keep, index) => {
    const crown = index % 3 === 0 ? keepCones : keepBlobs;
    crown.push(keep, keep);
  });
  compact(meshes.trunks, keepTrunks);
  compact(meshes.cones, keepCones);
  compact(meshes.blobs, keepBlobs);
}

/** A flower triplet (stem, blossom, nearby tuft) goes when its stem or its tuft is in the zone. */
function clearFlowers(meshes: ScatterMeshes): void {
  const keepStems = flags(meshes.stems, inFlowerZone);
  const keepTufts = flags(meshes.tufts, inFlowerZone);
  const keep = keepStems.map((stem, i) => stem && (keepTufts[i] ?? true));
  for (const mesh of [meshes.stems, meshes.blossoms, meshes.tufts]) compact(mesh, keep);
}

/**
 * Removes scatter on the expansion footprints and roads, plus the tree collision circles there.
 * Only obstacles in [from, to) (the ones the scatter pass pushed) are considered.
 */
export function clearExpansionGround(
  meshes: ScatterMeshes,
  obstacles: ObstacleCircle[],
  from: number,
  to: number,
): void {
  clearTrees(meshes);
  compact(meshes.rocks, flags(meshes.rocks, inRockZone));
  clearFlowers(meshes);
  for (let i = to - 1; i >= from; i--) {
    const o = obstacles[i];
    if (o && inTreeZone(o.x, o.z)) obstacles.splice(i, 1);
  }
}
