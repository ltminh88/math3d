import { type Camera, type Object3D, Plane, Raycaster, Vector2, Vector3 } from 'three';
import type { GroundPoint } from './interaction-types';

export interface Pickable {
  id: string;
  /** Usually an invisible hit-proxy mesh sized for fingers; descendants are tested too. */
  object: Object3D;
}

const raycaster = new Raycaster();
const ndcVector = new Vector2();
const hitPoint = new Vector3();

/** Raycasts only against registered pickables (never the whole scene). */
export class RaycastPicker {
  private pickables: Pickable[] = [];

  set(pickables: readonly Pickable[]): void {
    this.pickables = [...pickables];
  }

  clear(): void {
    this.pickables = [];
  }

  /** Nearest pickable id under the NDC point, or null. */
  pick(ndc: { x: number; y: number }, camera: Camera): string | null {
    if (this.pickables.length === 0) return null;
    ndcVector.set(ndc.x, ndc.y);
    raycaster.setFromCamera(ndcVector, camera);
    let bestId: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const pickable of this.pickables) {
      const hits = raycaster.intersectObject(pickable.object, true);
      const first = hits[0];
      if (first && first.distance < bestDistance) {
        bestDistance = first.distance;
        bestId = pickable.id;
      }
    }
    return bestId;
  }
}

/** Project an NDC point onto the horizontal plane y = planeY. Null when the ray misses it. */
export function projectToGround(
  ndc: { x: number; y: number },
  camera: Camera,
  planeY = 0,
): GroundPoint | null {
  ndcVector.set(ndc.x, ndc.y);
  raycaster.setFromCamera(ndcVector, camera);
  const plane = new Plane(new Vector3(0, 1, 0), -planeY);
  const hit = raycaster.ray.intersectPlane(plane, hitPoint);
  return hit ? { x: hit.x, z: hit.z } : null;
}
