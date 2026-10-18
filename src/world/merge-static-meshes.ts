// Draw-call reduction: every static, single-material mesh that uses a cached material is baked
// into one world-space geometry per (material, castShadow) bucket. Animated subtrees are skipped.
import {
  type BufferGeometry,
  InstancedMesh,
  type Material,
  Mesh,
  type Object3D,
  type Scene,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const KEPT_ATTRIBUTES = ['position', 'normal', 'uv'];

interface MergeBucket {
  material: Material;
  cast: boolean;
  geometries: BufferGeometry[];
  meshes: Mesh[];
}

/**
 * Merges static meshes of `scene` whose material is one of `cachedMaterials`, leaving any mesh
 * inside an `animated` root alone. Buckets with a single mesh are left as they are.
 */
export function mergeStaticMeshes(
  scene: Scene,
  cachedMaterials: Iterable<Material>,
  animated: Iterable<Object3D>,
): void {
  const animatedRoots = new Set(animated);
  const isAnimated = (object: Object3D | null): boolean =>
    !!object && (animatedRoots.has(object) || isAnimated(object.parent));
  const mergeable = new Set(cachedMaterials);
  const buckets = new Map<string, MergeBucket>();
  scene.updateMatrixWorld(true);
  scene.traverse((object) => {
    if (
      !(object instanceof Mesh) ||
      object instanceof InstancedMesh ||
      Array.isArray(object.material) ||
      !mergeable.has(object.material) ||
      isAnimated(object)
    ) {
      return;
    }
    const mesh: Mesh = object;
    const material = mesh.material as Material;
    const key = `${material.uuid}:${mesh.castShadow}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { material, cast: mesh.castShadow, geometries: [], meshes: [] };
      buckets.set(key, bucket);
    }
    const source = mesh.geometry;
    const geometry = (source.index ? source.toNonIndexed() : source.clone()).applyMatrix4(
      mesh.matrixWorld,
    );
    for (const name of Object.keys(geometry.attributes)) {
      if (!KEPT_ATTRIBUTES.includes(name)) {
        geometry.deleteAttribute(name);
      }
    }
    geometry.clearGroups();
    bucket.geometries.push(geometry);
    bucket.meshes.push(mesh);
  });
  for (const bucket of buckets.values()) {
    mergeBucket(scene, bucket);
  }
}

function mergeBucket(scene: Scene, { material, cast, geometries, meshes }: MergeBucket): void {
  if (meshes.length < 2) {
    for (const geometry of geometries) geometry.dispose();
    return;
  }
  const merged = mergeGeometries(geometries);
  for (const geometry of geometries) geometry.dispose();
  if (!merged) {
    return;
  }
  const mesh = new Mesh(merged, material);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  scene.add(mesh);
  for (const original of meshes) {
    original.removeFromParent();
    original.geometry.dispose();
  }
}
