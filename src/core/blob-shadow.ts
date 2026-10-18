import { CircleGeometry, DoubleSide, InstancedMesh, Matrix4, MeshBasicMaterial } from 'three';
import { getCustomMaterial, getGeometry } from './shared-asset-cache';

export interface BlobShadows {
  mesh: InstancedMesh;
  /** Place instance `index` at ground (x, z) with the given radius. */
  set(index: number, x: number, z: number, radius: number): void;
  /** Number of instances drawn (0..capacity). */
  setCount(count: number): void;
}

const matrix = new Matrix4();

/** Cheap fake shadows: one instanced draw call of dark flat discs just above the ground. */
export function createBlobShadows(capacity: number, groundY = 0.02): BlobShadows {
  const geometry = getGeometry('blob-disc', () => new CircleGeometry(1, 16).rotateX(-Math.PI / 2));
  const material = getCustomMaterial(
    'blob-shadow',
    () =>
      new MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: DoubleSide,
      }),
  );
  const mesh = new InstancedMesh(geometry, material, capacity);
  mesh.count = 0;
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  return {
    mesh,
    set(index, x, z, radius) {
      matrix.makeScale(radius, 1, radius).setPosition(x, groundY, z);
      mesh.setMatrixAt(index, matrix);
      mesh.instanceMatrix.needsUpdate = true;
    },
    setCount(count) {
      mesh.count = Math.max(0, Math.min(capacity, count));
    },
  };
}
