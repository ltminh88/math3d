// The big ê-ke (set square) the child lays on a corner: its right-angle corner on the vertex, one
// leg along one arm, the other leg towards the second arm (so a right angle fits both legs and a
// wider or narrower one visibly does not). A paler spare ê-ke is the right-angle hint's aid.
import { DoubleSide, ExtrudeGeometry, Mesh, MeshStandardMaterial, type Scene, Shape } from 'three';
import { BOARD, VALLEY_COLORS as C } from './valley-layout-constants';
import type { ValleyTarget, XZ } from './valley-layout-types';

/** Right-angled set square, legs 1.5 × 1.1 (math coordinates), with the usual cut-out. */
function setSquareGeometry(): ExtrudeGeometry {
  const outer = new Shape();
  outer.moveTo(0, 0);
  outer.lineTo(1.5, 0);
  outer.lineTo(0, 1.1);
  outer.closePath();
  const hole = new Shape();
  hole.moveTo(0.28, 0.22);
  hole.lineTo(0.78, 0.22);
  hole.lineTo(0.28, 0.6);
  hole.closePath();
  outer.holes.push(hole);
  const geometry = new ExtrudeGeometry(outer, { depth: 0.08, bevelEnabled: false });
  // Lay it flat: shape x/y become board x / -z (math y up), extruded upwards.
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

export class ValleySetSquareView {
  private readonly geometry = setSquareGeometry();
  private readonly eke: Mesh;
  private readonly spare: Mesh;
  /** Corner the ê-ke lies on (target id), null when it is put away. */
  corner: string | null = null;

  constructor(scene: Scene) {
    const solid = new MeshStandardMaterial({ color: C.eke, roughness: 0.6, side: DoubleSide });
    const pale = new MeshStandardMaterial({
      color: C.eke,
      roughness: 0.6,
      side: DoubleSide,
      transparent: true,
      opacity: 0.55,
    });
    this.eke = new Mesh(this.geometry, solid);
    this.spare = new Mesh(this.geometry, pale);
    this.eke.castShadow = true;
    for (const mesh of [this.eke, this.spare]) {
      mesh.visible = false;
      scene.add(mesh);
    }
  }

  /** Lays the ê-ke on a corner target (or puts it away with null). */
  place(target: ValleyTarget | null): void {
    this.corner = target?.id ?? null;
    this.eke.visible = target !== null;
    if (!target) return;
    this.pose(this.eke, target.at, target.armAngle ?? 0, target.turn ?? 1, 1);
  }

  /** The hint's spare ê-ke, upright, at `at` (null hides it). */
  showSpare(at: XZ | null): void {
    this.spare.visible = at !== null;
    if (at) this.pose(this.spare, at, 0, 1, 0.75);
  }

  private pose(mesh: Mesh, at: XZ, armAngle: number, turn: 1 | -1, size: number): void {
    mesh.position.set(at[0], BOARD.top + 0.1, at[1]);
    mesh.rotation.set(0, armAngle, 0);
    // Turned the other way: mirror the second leg (local -z is math +y).
    mesh.scale.set(size, size, size * turn);
  }

  dispose(): void {
    this.geometry.dispose();
  }
}
