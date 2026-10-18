import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { AudioEngine } from './audio/audio-engine';
import type { SpeechNarrator } from './audio/speech-narrator';
import type { InteractionController } from './input/interaction-controller';
import type { PointerInput } from './input/pointer-input';
import type { QualityTier } from './quality/quality-tiers';
import type { SceneDisposer } from './scene-disposer';
import type { TweenManager } from './tween-manager';

/** Everything a scene may use. The engine builds one per scene and tears it down on goto(). */
export interface SceneContext {
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  /** Fresh THREE.Scene owned by this scene; disposed with it. */
  scene: Scene;
  input: PointerInput;
  /** Pickables, drop zones and uniform pick/drag/drop/tap-select events. */
  interaction: InteractionController;
  audio: AudioEngine;
  narrator: SpeechNarrator;
  tweens: TweenManager;
  /** DOM layer inside the overlay root for this scene's UI; removed on dispose. */
  ui: HTMLElement;
  disposer: SceneDisposer;
  /** Ask the loop for a render (needed in render-on-demand states). */
  requestRender: () => void;
  /** Live quality tier (changes when adaptive quality steps). */
  getQuality: () => QualityTier;
  /** Called when the viewport size/aspect changed; the engine already updated the camera. */
  onResize: (listener: (width: number, height: number) => void) => void;
  /** Parameters passed to goto(). */
  params: Readonly<Record<string, unknown>>;
  /** Game store handle supplied by the app (phase 04); the engine does not interpret it. */
  store?: unknown;
}

export interface GameScene {
  readonly id: string;
  init(ctx: SceneContext): void | Promise<void>;
  /** Advance by dt seconds. Return true to request a render this frame. */
  update(dt: number): boolean | undefined;
  /** Release scene-specific state. Tracked objects/listeners are flushed by the disposer after. */
  dispose(): void;
}

export type SceneFactory = () => GameScene;
