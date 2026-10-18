// Orbit camera around a smoothed focus point. Playing: follows the player at the user-chosen
// yaw / pitch / distance. Title screen: slow idle orbit around (8, 0, 0), pulled back further on
// portrait screens and shifted left (setViewOffset) on wide ones to leave room for the menu.
import { MathUtils, type Object3D, type PerspectiveCamera, type Vector3 } from 'three';

export const DEFAULT_YAW = 0.57;
export const DEFAULT_PITCH = 0.95;
export const DEFAULT_DISTANCE = 42;

export interface CameraRigState {
  readonly camera: PerspectiveCamera;
  readonly canvas: HTMLCanvasElement;
  readonly player: Object3D;
  readonly active: boolean;
  /** Smoothed focus point and the point it eases towards. */
  readonly target: Vector3;
  readonly wanted: Vector3;
  yaw: number;
  pitch: number;
  distance: number;
  /** Eased values actually applied to the camera. */
  viewPitch: number;
  viewDistance: number;
  viewShift: number;
}

export function clampZoom(distance: number): number {
  return MathUtils.clamp(distance, 16, 110);
}

/** Keeps the orbit pitch between a low and a near-top-down view. */
export function clampPitch(pitch: number): number {
  return MathUtils.clamp(pitch, 0.5, 1.35);
}

/** Eases focus, distance, pitch and view shift by `dt`, then places and aims the camera. */
export function updateCameraRig(state: CameraRigState, dt: number): void {
  const { camera } = state;
  if (state.active) {
    state.wanted.copy(state.player.position).setY(0);
  } else {
    state.wanted.set(8, 0, 0);
    state.yaw += dt * 0.03;
  }
  state.target.lerp(state.wanted, 1 - Math.exp(-dt * 3));
  const ease = 1 - Math.exp(-dt * 2.2);
  const idleDistance = camera.aspect < 0.85 ? 175 : 120;
  state.viewDistance +=
    ((state.active ? state.distance : idleDistance) - state.viewDistance) * ease;
  state.viewPitch += ((state.active ? state.pitch : 0.72) - state.viewPitch) * ease;
  state.viewShift += ((!state.active && camera.aspect > 1.25 ? 0.16 : 0) - state.viewShift) * ease;
  const { clientWidth: width, clientHeight: height } = state.canvas;
  if (state.viewShift > 0.001) {
    camera.setViewOffset(width, height, -state.viewShift * width, 0, width, height);
  } else if (camera.view?.enabled) {
    camera.clearViewOffset();
  }
  const distance = state.viewDistance;
  const pitch = state.viewPitch;
  camera.position.set(
    state.target.x + Math.sin(state.yaw) * Math.cos(pitch) * distance,
    state.target.y + Math.sin(pitch) * distance,
    state.target.z + Math.cos(state.yaw) * Math.cos(pitch) * distance,
  );
  camera.lookAt(state.target);
}
