// Contract between the level host and level modules (phases 14 field, 15 forest). A level folder
// `src/levels/<id>/index.ts` default-exports a LevelDefinition; its `load()` dynamic-imports the
// scene code, so each level is its own chunk and the main bundle only carries the definitions.
import type { Camera, Scene, WebGLRenderer } from 'three';
import type { SynthAudio } from '../../audio/synth-audio';
import type { GateRequirement, RegionId } from '../../config/regions';
import type { InteractionController } from '../../core/input/interaction-controller';
import type { SceneDisposer } from '../../core/scene-disposer';
import type { defineStrings } from '../../i18n/i18n';
import type { FactKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import type { Rng } from '../../learning/seeded-rng';
import type { QuestionOutcome } from '../../learning/session-recorder';

export type { GateRequirement as LevelRequirement } from '../../config/regions';

export interface LevelDefinition {
  /** Folder name under `src/levels/` and the store's `LevelProgress.levelId`. */
  readonly id: 'field' | 'forest';
  readonly regionId: RegionId;
  /** Multiplication tables the level drills (fluency order is applied by the planner). */
  readonly tables: readonly number[];
  /** Rounds per run. */
  readonly rounds: number;
  /** Must equal the gate's requirement in `LEVEL_GATES` (checked at registration). */
  readonly requires: GateRequirement;
  /** Loads the scene code (keep it a dynamic `import()` so the level stays code-split). */
  load(): Promise<LevelModule>;
}

/** What a level reports when it ends. Answers are recorded as they happen (`learning.record`). */
export interface LevelResult {
  /** All rounds played: the level counts as completed (stars, completedAt, one-time bonus). */
  completed: boolean;
}

/** Learning services bound to this run (planner pool, Leitner stats, session recorder). */
export interface LevelLearning {
  /** Committed fact stats of the active profile (read-only). */
  stats(): Readonly<Record<FactKey, FactStat>>;
  /** Session number this run is recorded under. */
  readonly sessionNo: number;
  /** Plans the facts for this run from `pool` over the level's tables. */
  planSession(pool: readonly FactKey[], length?: number): FactKey[];
  /** Records one finished question; XP/coins follow `src/learning/scoring.ts`. */
  record(outcome: QuestionOutcome): void;
  /** Random source for the run (seeded in parity builds through Math.random). */
  readonly rng: Rng;
}

/** Input helpers on the shared canvas; everything created here is disposed on exit. */
export interface LevelInput {
  /** Drag + tap-select + keyboard facade for `camera` (WCAG 2.5.7 alternatives built in). */
  createInteraction(camera: Camera): InteractionController;
}

export interface LevelContext {
  readonly definition: LevelDefinition;
  /**
   * The world's renderer (one WebGL context); the host renders `session.scene` with it. Leave its
   * global state alone (clear colour, tone mapping, exposure, shadowMap, pixel ratio, autoClear,
   * render target, viewport): set a look through the scene (`scene.background`, lights) instead.
   * If a level must change it, it restores it in `dispose()`; the host also restores a snapshot.
   */
  readonly renderer: WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  /**
   * Overlay root for the level's DOM (HUD, number pad, its own dialogs); removed on exit. It has
   * focus when `start` runs. Do not use `src/ui/dialog.ts` (`openDialog`) inside a level: the
   * shared dialog stays closed while a level runs and belongs to the world.
   */
  readonly ui: HTMLElement;
  readonly audio: SynthAudio;
  readonly learning: LevelLearning;
  readonly input: LevelInput;
  readonly defineStrings: typeof defineStrings;
  /** Polite screen-reader announcement. */
  announce(message: string): void;
  /**
   * Tracks objects, listeners and cleanups; flushed after `session.dispose()`. Listen for keys on
   * `document` with `{ signal: ctx.disposer.signal }`: the world's own `document` handler runs
   * first and ignores keys while the level runs. A handler on an element (`ctx.ui`, a button)
   * runs before it, so a key that ends the level there reaches the world after resume (E would
   * re-enter the gate) unless it calls `event.stopPropagation()`.
   */
  readonly disposer: SceneDisposer;
  readonly reducedMotion: boolean;
  /** Ends the run: stops the loop, disposes the scene, commits the result, resumes the world. */
  exit(result: LevelResult): void;
}

/** A running level. The host owns the loop: `update` then `renderer.render(scene, camera)`. */
export interface LevelSession {
  readonly scene: Scene;
  readonly camera: Camera;
  /** Seconds since the previous frame (clamped) and since the run started. */
  update(dt: number, time: number): void;
  /** Canvas size changed (CSS pixels); the renderer is already resized. */
  resize?(width: number, height: number): void;
  /** Level-specific teardown; the host then disposes `scene` and the context's disposer. */
  dispose?(): void;
}

export interface LevelModule {
  start(ctx: LevelContext): LevelSession | Promise<LevelSession>;
}
