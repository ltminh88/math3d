// Shared state the static world builders write into. The legacy world class already owns these
// fields, so it passes itself (`this`) as the context; builders never reach outside it.
import type { Group, Mesh, MeshStandardMaterial, Object3D, Scene } from 'three';

/** Circular collision footprint on the ground plane (x/z), consumed by movement and scatter. */
export interface ObstacleCircle {
  x: number;
  z: number;
  radius: number;
}

/** Object bobbing (and optionally spinning) every frame; animated by the frame loop. */
export interface Floater {
  object: Object3D;
  baseY: number;
  speed: number;
  spin: number;
}

export interface WorldBuildContext {
  readonly scene: Scene;
  /** Material cache keyed by colour; insertion order drives later static-mesh merge order. */
  readonly materials: Map<number, MeshStandardMaterial>;
  /** Collision circles in build order (scatter in phase 06 tests against this list). */
  readonly obstacles: ObstacleCircle[];
  readonly floaters: Floater[];
  /** River ripple strips, animated by the frame loop. */
  readonly ripples: Mesh[];
  /** Windmill rotor group (village), spun by the frame loop. */
  readonly windmill: Group;
}
