// Mesh primitives shared by every static builder: colour-cached materials, flat-shaded
// low-poly shapes and the collision registry. Argument order mirrors the original bundle.
import {
  BoxGeometry,
  type BufferGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from 'three';
import { regionById } from '../config/regions';
import type { WorldBuildContext } from './world-build-context';

/** Returns the shared material for `color`, creating (and caching) it on first use. */
export function getCachedMaterial(ctx: WorldBuildContext, color: number): MeshStandardMaterial {
  let material = ctx.materials.get(color);
  if (!material) {
    material = new MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 });
    ctx.materials.set(color, material);
  }
  return material;
}

/** Adds a shadow-casting/receiving mesh at (x, y, z) inside `parent`. */
export function addMesh(
  ctx: WorldBuildContext,
  parent: Object3D,
  geometry: BufferGeometry,
  color: number,
  x: number,
  y: number,
  z: number,
): Mesh {
  const mesh = new Mesh(geometry, getCachedMaterial(ctx, color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function addBox(
  ctx: WorldBuildContext,
  parent: Object3D,
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number,
  color: number,
): Mesh {
  return addMesh(ctx, parent, new BoxGeometry(width, height, depth), color, x, y, z);
}

/** "Sphere" is an icosahedron with detail 1 (80 faces) — the original low-poly look. */
export function addSphere(
  ctx: WorldBuildContext,
  parent: Object3D,
  x: number,
  y: number,
  z: number,
  radius: number,
  color: number,
): Mesh {
  return addMesh(ctx, parent, new IcosahedronGeometry(radius, 1), color, x, y, z);
}

/** Cylinder (or cone when one radius is 0) with `radialSegments` sides (default 8). */
export function addCylinder(
  ctx: WorldBuildContext,
  parent: Object3D,
  x: number,
  y: number,
  z: number,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  color: number,
  radialSegments = 8,
): Mesh {
  const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  return addMesh(ctx, parent, geometry, color, x, y, z);
}

/** Registers a collision circle at an offset from a (region) group's position. */
export function blockAt(
  ctx: WorldBuildContext,
  group: Object3D,
  offsetX: number,
  offsetZ: number,
  radius: number,
): void {
  ctx.obstacles.push({
    x: group.position.x + offsetX,
    z: group.position.z + offsetZ,
    radius,
  });
}

/** Creates a group centred on the region and adds it to the scene. */
export function addRegionGroup(ctx: WorldBuildContext, regionId: string): Group {
  const region = requireRegion(regionId);
  const group = new Group();
  group.position.set(region.center[0], 0, region.center[1]);
  ctx.scene.add(group);
  return group;
}

export function requireRegion(regionId: string): NonNullable<ReturnType<typeof regionById>> {
  const region = regionById(regionId);
  if (!region) throw new Error(`Unknown region: ${regionId}`);
  return region;
}

/** Palette lookup for indices the original computed inline (always in range there). */
export function colorAt(palette: readonly number[], index: number): number {
  const color = palette[index];
  if (color === undefined) throw new Error(`Palette index out of range: ${index}`);
  return color;
}
