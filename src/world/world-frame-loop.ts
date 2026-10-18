// Per-frame ambient animation after the camera is placed: windmill, dropping bridge planks,
// drifting clouds, bobbing floaters, Milo's beacon, sparks and river ripples (in this order).
import type { Group, Mesh, Object3D, Scene } from 'three';
import { type Spark, updateSparks } from './burst-sparks';
import type { Floater } from './world-build-context';

/** Largest simulated step: long frames (tab switch, hitch) never jump the simulation. */
export const MAX_FRAME_DELTA = 0.05;

export interface AmbientAnimationState {
  readonly scene: Scene;
  readonly windmill: Group;
  readonly bridge: Group;
  readonly milo: Object3D;
  readonly clouds: readonly Group[];
  readonly floaters: readonly Floater[];
  readonly ripples: readonly Mesh[];
  readonly sparks: Spark[];
  /** Seconds since start (already advanced for this frame). */
  readonly time: number;
}

export function animateAmbient(state: AmbientAnimationState, dt: number): void {
  const { time } = state;
  state.windmill.rotation.z -= dt * 0.25;
  for (const segment of state.bridge.children) {
    segment.position.y = Math.max(0, segment.position.y - dt * 5);
  }
  state.clouds.forEach((cloud, index) => {
    cloud.position.x += dt * 0.35;
    if (cloud.position.x > 210) {
      cloud.position.x = -190;
    }
    cloud.position.y += Math.sin(time * 0.2 + index) * 0.002;
  });
  for (const floater of state.floaters) {
    floater.object.position.y = floater.baseY + Math.sin(time * floater.speed) * 0.25;
    floater.object.rotation.y += dt * floater.spin;
  }
  for (const child of state.milo.children) {
    if (child.userData.beacon) {
      child.position.y = 3 + Math.sin(time * 2) * 0.15;
    }
  }
  updateSparks(state.scene, state.sparks, dt);
  for (const ripple of state.ripples) {
    ripple.position.z += dt * 0.25;
    if (ripple.position.z > 43) {
      ripple.position.z = -43;
    }
  }
}
