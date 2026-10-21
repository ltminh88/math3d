// Builds one low-poly mesh from many coloured primitives: every part is baked into a single
// vertex-coloured geometry, so a cosmetic or the shop stall costs one draw call (two with its
// shadow) instead of one per part. All of them share one material, created once, never disposed.
import {
  BoxGeometry,
  BufferAttribute,
  type BufferGeometry,
  Color,
  CylinderGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  TorusGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WORLD_LIGHTING } from '../world/world-lighting-tuning';

export type Vec3 = readonly [x: number, y: number, z: number];

export interface Part {
  readonly geometry: BufferGeometry;
  readonly color: number;
  readonly at?: Vec3;
  readonly rotation?: Vec3;
  readonly scale?: Vec3;
}

export const box = (w: number, h: number, d: number, color: number, at?: Vec3, rotation?: Vec3) =>
  ({ geometry: new BoxGeometry(w, h, d), color, at, rotation }) satisfies Part;

/** Icosahedron detail 1, the recovered "sphere"; `scale` squashes it (wings, water). */
export const sphere = (radius: number, color: number, at?: Vec3, scale?: Vec3) =>
  ({ geometry: new IcosahedronGeometry(radius, 1), color, at, scale }) satisfies Part;

export const cylinder = (
  top: number,
  bottom: number,
  height: number,
  color: number,
  at?: Vec3,
  rotation?: Vec3,
  segments = 8,
) => ({ geometry: new CylinderGeometry(top, bottom, height, segments), color, at, rotation });

/** Ring lying flat (around a neck or a hat) unless `rotation` says otherwise. */
export const ring = (radius: number, tube: number, color: number, at?: Vec3, rotation?: Vec3) =>
  ({
    geometry: new TorusGeometry(radius, tube, 6, 14),
    color,
    at,
    rotation: rotation ?? [Math.PI / 2, 0, 0],
  }) satisfies Part;

let sharedMaterial: MeshStandardMaterial | undefined;

/** The one material of every vertex-coloured shop mesh (same roughness as the world props). */
export function vertexColorMaterial(): MeshStandardMaterial {
  sharedMaterial ??= new MeshStandardMaterial({
    vertexColors: true,
    roughness: WORLD_LIGHTING.roughness.primitive,
    metalness: 0,
  });
  return sharedMaterial;
}

function bakePart(part: Part): BufferGeometry {
  const source = part.geometry;
  const geometry = source.index ? source.toNonIndexed() : source.clone();
  source.dispose();
  geometry.deleteAttribute('uv');
  const [rx, ry, rz] = part.rotation ?? [0, 0, 0];
  const matrix = new Matrix4().compose(
    new Vector3(...(part.at ?? [0, 0, 0])),
    new Quaternion().setFromEuler(new Euler(rx, ry, rz)),
    new Vector3(...(part.scale ?? [1, 1, 1])),
  );
  geometry.applyMatrix4(matrix);
  const color = new Color(part.color);
  const count = geometry.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3);
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
}

/** Merges `parts` into one geometry (the part geometries are disposed). */
export function mergeParts(parts: readonly Part[]): BufferGeometry {
  const baked = parts.map(bakePart);
  const merged = mergeGeometries(baked);
  for (const geometry of baked) geometry.dispose();
  if (!merged) throw new Error('mergeParts: parts have incompatible attributes');
  return merged;
}

/** One shadow-casting mesh named `name` made of `parts`. */
export function partsMesh(name: string, parts: readonly Part[]): Mesh {
  const mesh = new Mesh(mergeParts(parts), vertexColorMaterial());
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
