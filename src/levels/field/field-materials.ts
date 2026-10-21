// Per-run material cache in the world's recovered look (flat colour, primitive roughness) plus the
// meadow palette. Everything is disposed with the scene (the level disposer traverses it).
import { Color, type InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';

/** Colours read from the meadow builder (src/world/regions/meadow-forest-builder.ts). */
export const FIELD_COLORS = {
  grass: 0x9aca6b,
  soil: 0xb59662,
  soilLight: 0xc7a971,
  soilDark: 0x8c6947,
  plotBase: 0x6f5236,
  wood: 0x8c6947,
  lantern: 0xffd064,
  hay: 0xe5c995,
  stem: 0x5f9b51,
  leaf: 0x74b9a7,
  flowers: [0xf2bd55, 0xe98567, 0x74b9a7] as const,
  barn: 0xc9624f,
  barnRoof: 0x8a4a3e,
  cream: 0xf6e7c4,
  straw: 0xd9c48a,
  sprout: 0x6aa95c,
  focus: 0xffd064,
  rowA: 0xf2bd55,
  rowB: 0x74b9a7,
} as const;

export type MaterialCache = (color: number) => MeshStandardMaterial;

export function createMaterialCache(): MaterialCache {
  const cache = new Map<number, MeshStandardMaterial>();
  return (color) => {
    let material = cache.get(color);
    if (!material) {
      material = new MeshStandardMaterial({
        color,
        roughness: WORLD_LIGHTING.roughness.primitive,
        metalness: 0,
      });
      cache.set(color, material);
    }
    return material;
  };
}

const dummy = new Object3D();
const tint = new Color();

/** Writes one instance transform (position, uniform-ish scale, rotation) and optional colour. */
export function setInstance(
  mesh: InstancedMesh,
  index: number,
  pose: {
    x: number;
    y: number;
    z: number;
    sx?: number;
    sy?: number;
    sz?: number;
    rx?: number;
    ry?: number;
    rz?: number;
  },
  color?: number,
): void {
  dummy.position.set(pose.x, pose.y, pose.z);
  dummy.rotation.set(pose.rx ?? 0, pose.ry ?? 0, pose.rz ?? 0);
  dummy.scale.set(pose.sx ?? 1, pose.sy ?? pose.sx ?? 1, pose.sz ?? pose.sx ?? 1);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
  if (color !== undefined) mesh.setColorAt(index, tint.setHex(color));
}

/** Marks instance buffers dirty after a batch of `setInstance` calls. */
export function commitInstances(mesh: InstancedMesh): void {
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

/** Shadow flags like the world's `addMesh`. */
export function shade<T extends Object3D>(object: T): T {
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}
