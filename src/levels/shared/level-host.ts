// Runs one level at a time on the world's renderer: suspend the world loop, start the level
// scene, drive it from the host's own frame loop, and on exit dispose everything, close the run
// (commit + UI unmount) and resume the world. One renderer, one WebGL context (iPad memory).
// Browser wiring lives in level-host-ports.ts; this class only depends on the ports below.
import type { Camera, Scene } from 'three';
import { SceneDisposer } from '../../core/scene-disposer';
import type { LevelContext, LevelDefinition, LevelResult, LevelSession } from './level-types';

/** Largest simulated level step, same as the world's (a hitch never jumps the simulation). */
export const LEVEL_MAX_FRAME_DELTA = 0.05;

export type LevelRunContext = Omit<LevelContext, 'exit' | 'disposer' | 'definition'>;

/** One run's services; `close` unmounts its UI and commits the result (once). */
export interface LevelRun {
  readonly context: LevelRunContext;
  close(result: LevelResult): void;
}

export interface LevelHostPorts {
  readonly world: { suspend(): void; resume(): void };
  readonly renderer: {
    render(scene: Scene, camera: Camera): void;
    setSize(width: number, height: number, updateStyle: boolean): void;
  };
  requestFrame(callback: (timeMs: number) => void): number;
  cancelFrame(handle: number): void;
  /** Calls `onResize` with the canvas CSS size now and on every change; returns the stop. */
  watchResize(onResize: (width: number, height: number) => void): () => void;
  openRun(
    definition: LevelDefinition,
    disposer: SceneDisposer,
    exit: (result: LevelResult) => void,
  ): LevelRun;
}

export type EnterOutcome = 'entered' | 'busy' | 'failed';

interface ActiveRun {
  session: LevelSession | undefined;
  stopResize: () => void;
  frame: number;
  ended: boolean;
}

export class LevelHost {
  private busy = false;

  constructor(private readonly ports: LevelHostPorts) {}

  /** A level is loading or running (world input and HUD belong to it). */
  get running(): boolean {
    return this.busy;
  }

  async enter(definition: LevelDefinition): Promise<EnterOutcome> {
    if (this.busy) return 'busy';
    this.busy = true;
    let module: Awaited<ReturnType<LevelDefinition['load']>>;
    try {
      module = await definition.load();
    } catch (error) {
      console.error(`Level "${definition.id}" failed to load`, error);
      this.busy = false;
      return 'failed';
    }
    const { ports } = this;
    ports.world.suspend();
    const disposer = new SceneDisposer();
    const active: ActiveRun = { session: undefined, stopResize: () => {}, frame: 0, ended: false };
    let run: LevelRun | undefined;
    const exit = (result: LevelResult): void => {
      if (run) this.finish(active, disposer, run, result);
    };
    try {
      run = ports.openRun(definition, disposer, exit);
    } catch (error) {
      console.error(`Level "${definition.id}" could not open its run`, error);
      ports.world.resume();
      this.busy = false;
      return 'failed';
    }
    try {
      active.session = await module.start({ ...run.context, definition, disposer, exit });
    } catch (error) {
      console.error(`Level "${definition.id}" failed to start`, error);
      exit({ completed: false });
      return 'failed';
    }
    const session = active.session;
    disposer.track(session.scene);
    if (active.ended) {
      // The level exited during start: its run is closed already, only the scene is left.
      session.dispose?.();
      disposer.flush();
      return 'entered';
    }
    active.stopResize = ports.watchResize((width, height) => {
      ports.renderer.setSize(width, height, false);
      session.resize?.(width, height);
    });
    this.loop(active, session, exit);
    return 'entered';
  }

  private loop(active: ActiveRun, session: LevelSession, exit: (r: LevelResult) => void): void {
    const startedAt: { first?: number; last?: number } = {};
    const frame = (timeMs: number): void => {
      if (active.ended) return;
      const first = startedAt.first ?? timeMs;
      const dt = Math.min((timeMs - (startedAt.last ?? timeMs)) / 1000, LEVEL_MAX_FRAME_DELTA);
      startedAt.first = first;
      startedAt.last = timeMs;
      try {
        session.update(dt, (timeMs - first) / 1000);
        this.ports.renderer.render(session.scene, session.camera);
      } catch (error) {
        console.error('Level frame failed; leaving the level', error);
        exit({ completed: false });
        return;
      }
      active.frame = this.ports.requestFrame(frame);
    };
    active.frame = this.ports.requestFrame(frame);
  }

  private finish(active: ActiveRun, disposer: SceneDisposer, run: LevelRun, result: LevelResult) {
    if (active.ended) return;
    active.ended = true;
    this.ports.cancelFrame(active.frame);
    active.stopResize();
    try {
      active.session?.dispose?.();
    } catch (error) {
      console.error('Level dispose failed', error);
    }
    disposer.flush();
    try {
      run.close(result);
    } finally {
      this.ports.world.resume();
      this.busy = false;
    }
  }
}
