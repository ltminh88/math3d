import { Scene } from 'three';
import type { GameScene, SceneContext, SceneFactory } from './game-scene-contract';
import { SceneDisposer } from './scene-disposer';

export interface SceneTransition {
  out(): Promise<void>;
  in(): Promise<void>;
}

export interface SceneManagerDeps {
  /** Builds the context for a scene from its per-scene pieces. */
  createContext: (parts: {
    scene: Scene;
    disposer: SceneDisposer;
    params: Readonly<Record<string, unknown>>;
  }) => SceneContext;
  transition: SceneTransition;
  /** Called after the old scene is gone and before the new one inits (reset input etc.). */
  onBeforeInit?: () => void;
}

interface Live {
  scene: GameScene;
  threeScene: Scene;
  disposer: SceneDisposer;
  params: Readonly<Record<string, unknown>>;
}

/**
 * One scene alive at a time. goto = fade out -> dispose + flush -> init next -> fade in.
 * Calls are serialized: a goto during a transition runs after the current one finishes.
 */
export class SceneManager {
  private readonly factories = new Map<string, SceneFactory>();
  private live: Live | null = null;
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly deps: SceneManagerDeps) {}

  register(id: string, factory: SceneFactory): void {
    this.factories.set(id, factory);
  }

  current(): GameScene | null {
    return this.live?.scene ?? null;
  }

  /** The THREE.Scene of the active game scene (what the loop renders). */
  currentThreeScene(): Scene | null {
    return this.live?.threeScene ?? null;
  }

  goto(id: string, params: Readonly<Record<string, unknown>> = {}): Promise<void> {
    const run = this.queue.then(() => this.transitionTo(id, params));
    // Keep the queue alive after a failure; the caller still sees the rejection through `run`.
    this.queue = run.catch(() => undefined);
    return run;
  }

  /** Rebuild the current scene (WebGL context restored). */
  reinit(): Promise<void> {
    const live = this.live;
    if (!live) return Promise.resolve();
    const run = this.queue.then(async () => {
      this.teardown();
      await this.create(live.scene.id, live.params);
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  /** Tear down the active scene for good (engine shutdown). */
  dispose(): void {
    this.teardown();
    this.factories.clear();
  }

  update(dt: number): boolean {
    return this.live?.scene.update(dt) === true;
  }

  private async transitionTo(id: string, params: Readonly<Record<string, unknown>>): Promise<void> {
    if (!this.factories.has(id)) throw new Error(`Unknown scene: ${id}`);
    await this.deps.transition.out();
    this.teardown();
    try {
      await this.create(id, params);
    } finally {
      await this.deps.transition.in();
    }
  }

  private teardown(): void {
    const live = this.live;
    if (!live) return;
    this.live = null;
    try {
      live.scene.dispose();
    } catch (error) {
      console.error(`[scene-manager] ${live.scene.id}.dispose() failed`, error);
    }
    live.disposer.flush();
  }

  private async create(id: string, params: Readonly<Record<string, unknown>>): Promise<void> {
    const factory = this.factories.get(id);
    if (!factory) throw new Error(`Unknown scene: ${id}`);
    this.deps.onBeforeInit?.();
    const scene = factory();
    const threeScene = new Scene();
    const disposer = new SceneDisposer();
    const live: Live = { scene, threeScene, disposer, params };
    this.live = live;
    try {
      await scene.init(this.deps.createContext({ scene: threeScene, disposer, params }));
    } catch (error) {
      this.teardown();
      throw error;
    }
  }
}
