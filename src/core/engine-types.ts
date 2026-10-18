import type { PerspectiveCamera, WebGLRenderer } from 'three';
import type { AudioEngine } from './audio/audio-engine';
import type { AudioSettingsStore } from './audio/audio-settings';
import type { SpeechNarrator } from './audio/speech-narrator';
import type { GameLoop } from './game-loop';
import type { InteractionController } from './input/interaction-controller';
import type { PointerInput } from './input/pointer-input';
import type { QualityTier } from './quality/quality-tiers';
import type { SceneManager } from './scene-manager';
import type { TweenManager } from './tween-manager';

export interface EngineOptions {
  /** Canvas host (#app). */
  host: HTMLElement;
  /** Overlay root (#ui). */
  uiRoot: HTMLElement;
  /** Persistence for mute/volume; defaults to localStorage. */
  audioStore?: AudioSettingsStore;
  /** The user's read-aloud setting (wired to the settings store by the app). Default: on. */
  isReadAloudEnabled?: () => boolean;
  /** Opaque store handle forwarded to scenes as ctx.store. */
  store?: unknown;
}

export interface Engine {
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  scenes: SceneManager;
  loop: GameLoop;
  tweens: TweenManager;
  audio: AudioEngine;
  narrator: SpeechNarrator<SpeechSynthesisVoice>;
  input: PointerInput;
  interaction: InteractionController;
  getQuality(): QualityTier;
  /** Pause/resume adaptive tier stepping (the perf bench holds one tier while measuring). */
  setAdaptiveQuality(enabled: boolean): void;
  dispose(): void;
}
