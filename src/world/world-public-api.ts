// Public surface of the 3D world: what the UI drives and reads, plus the fields the parity
// harness inspects through `window.__parity` (scene, camera, renderer, player, lowPower).
import type { Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import type { Avatar } from '../save/save-types';
import type { JoystickVector } from './player-controller';

/** Screen projection of a world point (canvas CSS pixels). */
export interface ProjectedPoint {
  x: number;
  y: number;
  /** In front of the camera and within 80 px of the canvas. */
  visible: boolean;
  /** Camera-to-point distance in world units. */
  distance: number;
}

export interface WorldPublicApi {
  /** Playing (true) or title-screen idle orbit (false). */
  active: boolean;
  /** Freezes movement and pointer input (dialogs, map). */
  paused: boolean;
  /** Lower-cased `KeyboardEvent.key` values currently held. */
  readonly keys: Set<string>;
  joystick: JoystickVector;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly lowPower: boolean;
  readonly player: Object3D;
  readonly milo: Object3D;
  /** Camera yaw in radians. */
  readonly heading: number;
  /** Every frame: near VLM, on the east bank past the bridge, frames per second. */
  onFrame: ((nearMilo: boolean, crossedBridge: boolean, fps: number) => void) | undefined;
  onJump: (() => void) | undefined;
  /** Tap on VLM while standing next to him (always called with `true`). */
  onSceneClick: ((nearMilo: boolean) => void) | undefined;
  setAvatar(avatar: Avatar): void;
  setBridge(segments: number, animate?: boolean): void;
  resetCamera(): void;
  zoom(delta: number): void;
  jump(): void;
  clearInput(): void;
  moveToScreen(clientX: number, clientY: number): void;
  nearMilo(): boolean;
  project(point: Vector3): ProjectedPoint;
  burst(at: Vector3): void;
  dispose(): void;
}
