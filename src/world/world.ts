// The 3D world: owns the scene state, builds it once, then runs the frame loop. Behaviour lives
// in the composed modules (controller, camera rig, input, ambient animation); this class wires
// them together and exposes the public API the UI and the parity harness rely on.
import {
  type DirectionalLight,
  Group,
  type Mesh,
  type MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Timer,
  Vector3,
  type WebGLRenderer,
} from 'three';
import { attachContextLossHandler } from '../core/context-loss-handler';
import type { Avatar } from '../save/save-types';
import { showBridgeSegments } from './bridge-segments';
import { type Spark, spawnSparkBurst } from './burst-sparks';
import {
  clampZoom,
  DEFAULT_DISTANCE,
  DEFAULT_PITCH,
  DEFAULT_YAW,
  updateCameraRig,
} from './camera-rig';
import { applyAvatar, type PlayerModelParts } from './characters-milo-avatar';
import { type JoystickVector, stepPlayer, tryJump } from './player-controller';
import { RedrawFlag } from './redraw-flag';
import { createSkyDome } from './sky-dome';
import type { Floater, ObstacleCircle } from './world-build-context';
import { buildWorldScene } from './world-build-pipeline';
import { animateAmbient, MAX_FRAME_DELTA } from './world-frame-loop';
import { attachWorldInput, groundPointAt } from './world-input';
import { type Interactable, InteractableRegistry } from './world-interactables';
import type { ProjectedPoint, WorldPublicApi } from './world-public-api';
import { addWorldLights, createWorldRenderer, updateSunShadow } from './world-renderer-setup';
import { projectToCanvas } from './world-screen-projection';
import { WorldSuspension } from './world-suspension';

export class World implements WorldPublicApi {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(48, 1, 0.5, 1600);
  readonly player = new Group();
  readonly milo = new Group();
  readonly bridge = new Group();
  readonly keys = new Set<string>();
  // Public only so the composed modules can take the world as their state (UI: WorldPublicApi).
  readonly materials = new Map<number, MeshStandardMaterial>();
  readonly obstacles: ObstacleCircle[] = [];
  readonly sparks: Spark[] = [];
  readonly floaters: Floater[] = [];
  readonly clouds: Group[] = [];
  readonly ripples: Mesh[] = [];
  readonly windmill = new Group();
  readonly sun: DirectionalLight;
  readonly sky: Mesh;
  // r183: Clock is deprecated; Timer needs update() each frame (see animate).
  readonly timer = new Timer();
  readonly target = new Vector3(8, 0, 0);
  readonly wanted = new Vector3();
  destination: Vector3 | undefined;
  jumpVelocity = 0;
  yaw = DEFAULT_YAW;
  pitch = DEFAULT_PITCH;
  distance = DEFAULT_DISTANCE;
  viewPitch = 0.85;
  viewDistance = 130;
  shadowSize = 0;
  viewShift = 0;
  bridgeCount = 0;
  time = 0;
  readonly lowPower: boolean;
  active = false;
  private _paused = false;
  joystick: JoystickVector = { x: 0, y: 0 };
  onFrame: ((nearMilo: boolean, crossedBridge: boolean, fps: number) => void) | undefined;
  onJump: (() => void) | undefined;
  onSceneClick: ((nearMilo: boolean) => void) | undefined;
  private readonly playerParts: PlayerModelParts;
  private readonly interactables = new InteractableRegistry();
  private readonly suspension = new WorldSuspension();
  private readonly redraw = new RedrawFlag();
  private readonly detachContextLoss: () => void;
  private readonly observer: ResizeObserver;
  private frame = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const { renderer, lowPower } = createWorldRenderer(canvas);
    this.renderer = renderer;
    this.lowPower = lowPower;
    this.sun = addWorldLights(this.scene, lowPower);
    this.sky = createSkyDome();
    this.scene.add(this.sky);
    this.playerParts = buildWorldScene(this);
    const container = canvas.parentElement;
    if (!container) throw new Error('World canvas must be attached to a container element');
    this.detachContextLoss = attachContextLossHandler(canvas, {
      // Rendering is a no-op while the context is lost; the loop keeps ticking.
      onLost: () => undefined,
      // The drawing buffer is blank after a restore, so draw one fresh frame.
      onRestored: () => this.redraw.request(),
    });
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);
    this.resize();
    attachWorldInput(canvas, this);
    // Clock started on its first getDelta (delta 0); reset() keeps that: first frame dt = 0.
    this.timer.reset();
    this.animate();
  }

  /** Freezes movement and pointer input (dialogs, map). Entering pause asks for one fresh
    frame: the pause transition itself may have changed what is shown. */
  get paused(): boolean {
    return this._paused;
  }

  set paused(value: boolean) {
    if (value && !this._paused) this.redraw.request();
    this._paused = value;
  }

  /** Ask the frame loop for one fresh frame (used while paused: parity capture, scene edits). */
  requestRedraw(): void {
    this.redraw.request();
  }

  /** Left and right leg of the player model (walk cycle). */
  get legs(): readonly Mesh[] {
    return this.playerParts.legs;
  }

  get heading(): number {
    return this.yaw;
  }

  setAvatar(avatar: Avatar): void {
    applyAvatar(this, this.playerParts, avatar);
    this.redraw.request();
  }

  setBridge(segments: number, animate = false): void {
    this.bridgeCount = segments;
    showBridgeSegments(this.bridge, segments, animate, (at) => this.burst(at));
    this.redraw.request();
  }

  resize(): void {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    // Resizing clears the drawing buffer, so draw one fresh frame (also covers
    // rotate and the resume-after-suspend path, which resizes too).
    this.redraw.request();
  }

  jump(): void {
    if (this.active && !this.paused && !this.suspended && tryJump(this)) {
      this.onJump?.();
    }
  }

  zoom(delta: number): void {
    this.distance = clampZoom(this.distance + delta);
  }

  clearInput(): void {
    this.keys.clear();
    this.joystick = { x: 0, y: 0 };
    this.destination = undefined;
  }

  resetCamera(): void {
    this.yaw = DEFAULT_YAW;
    this.pitch = DEFAULT_PITCH;
    this.distance = DEFAULT_DISTANCE;
  }

  /** Tap on the ground: talk to VLM when tapping him from up close, otherwise walk there. */
  moveToScreen(clientX: number, clientY: number): void {
    const point = groundPointAt(this.canvas, this.camera, clientX, clientY);
    if (!point) return;
    if (point.distanceTo(this.milo.position) < 2.8 && this.nearMilo()) {
      this.onSceneClick?.(true);
      return;
    }
    this.destination = point;
  }

  nearMilo(): boolean {
    const { position } = this.player;
    return Math.hypot(position.x - this.milo.position.x, position.z - this.milo.position.z) < 3.1;
  }

  burst(at: Vector3): void {
    spawnSparkBurst(this, this.sparks, at);
  }

  project(point: Vector3): ProjectedPoint {
    return projectToCanvas(this.camera, this.canvas, point);
  }

  registerInteractable(item: Interactable): () => void {
    return this.interactables.register(item);
  }

  nearestInteractable(): Interactable | undefined {
    return this.interactables.nearest(this.player.position.x, this.player.position.z);
  }

  /** A level owns the renderer: no frame loop, world input ignored. */
  get suspended(): boolean {
    return this.suspension.active;
  }

  /** Stops the frame loop (no render, input ignored) while a level owns the renderer. */
  suspend(): void {
    if (this.suspension.suspend(this)) cancelAnimationFrame(this.frame);
  }

  /** Restarts the loop after `suspend()` (pause state as before; first frame dt 0). */
  resume(): void {
    if (!this.suspension.resume(this)) return;
    this.resize();
    this.timer.reset();
    this.animate();
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.detachContextLoss();
    this.timer.dispose();
    this.renderer.dispose();
  }

  private readonly animate = (): void => {
    this.frame = requestAnimationFrame(this.animate);
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), MAX_FRAME_DELTA);
    this.time += dt;
    if (this.active && !this.paused) {
      stepPlayer(this, dt);
    }
    updateCameraRig(this, dt);
    this.sky.position.copy(this.camera.position);
    updateSunShadow(this);
    animateAmbient(this, dt);
    // While a dialog or the map is open the world is paused: do not re-render the
    // scene every frame — each software-rendered frame costs seconds on weak
    // hardware, which starves the modal UI (shop-purchase.spec.ts:143 timed out
    // this way). A redraw still happens on demand through the flag: entering
    // pause, a resize, a context restore, a scene change while paused, or a
    // parity capture (toDataURL reads black when no render happened in its task).
    if (!this.paused || this.redraw.take()) this.renderer.render(this.scene, this.camera);
    const { x, z } = this.player.position;
    this.onFrame?.(this.nearMilo(), x > 12 && Math.abs(z) < 4, 1 / Math.max(dt, 0.001));
  };
}
