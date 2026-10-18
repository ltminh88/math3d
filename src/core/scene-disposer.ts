import type { BufferGeometry, Material, Mesh, Object3D, Texture } from 'three';
import { isShared } from './shared-asset-cache';

type Cleanup = () => void;

/**
 * Collects everything a scene allocates (objects, listeners, cleanups) so scene teardown is one
 * flush() call. Geometries/materials owned by the shared cache are left alone.
 */
export class SceneDisposer {
  private readonly objects: Object3D[] = [];
  private readonly cleanups: Cleanup[] = [];
  private readonly abort = new AbortController();

  /** Track an object tree for removal + disposal of its per-scene resources. */
  track<T extends Object3D>(object: T): T {
    this.objects.push(object);
    return object;
  }

  /** AbortSignal to pass as `{ signal }` to addEventListener; aborted on flush. */
  get signal(): AbortSignal {
    return this.abort.signal;
  }

  onDispose(cleanup: Cleanup): void {
    this.cleanups.push(cleanup);
  }

  flush(): void {
    this.abort.abort();
    for (const cleanup of this.cleanups.splice(0).reverse()) {
      try {
        cleanup();
      } catch (error) {
        console.error('[scene-disposer] cleanup failed', error);
      }
    }
    for (const object of this.objects.splice(0)) {
      object.removeFromParent();
      object.traverse((node) => disposeNode(node));
    }
  }
}

function disposeNode(node: Object3D): void {
  const mesh = node as Partial<Mesh>;
  const geometry: BufferGeometry | undefined = mesh.geometry;
  if (geometry && !isShared(geometry)) geometry.dispose();
  const material = mesh.material;
  const list: Material[] = Array.isArray(material) ? material : material ? [material] : [];
  for (const m of list) {
    if (isShared(m)) continue;
    for (const value of Object.values(m)) {
      if (isTexture(value)) value.dispose();
    }
    m.dispose();
  }
  const instanced = node as { dispose?: () => void; isInstancedMesh?: boolean };
  if (instanced.isInstancedMesh) instanced.dispose?.();
}

function isTexture(value: unknown): value is Texture {
  return typeof value === 'object' && value !== null && (value as Texture).isTexture === true;
}
