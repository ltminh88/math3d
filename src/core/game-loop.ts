export const MAX_DELTA_SECONDS = 0.05;

/**
 * Converts rAF timestamps to clamped delta seconds. The first frame after creation/reset has
 * dt 0, and a long gap (backgrounded tab, breakpoint) is clamped so physics never jumps.
 */
export class FrameClock {
  private last: number | null = null;

  /** Returns { dt: clamped seconds, rawMs: real interval in ms (0 on the first frame) }. */
  step(nowMs: number): { dt: number; rawMs: number } {
    const rawMs = this.last === null ? 0 : Math.max(0, nowMs - this.last);
    this.last = nowMs;
    return { dt: Math.min(rawMs / 1000, MAX_DELTA_SECONDS), rawMs };
  }

  reset(): void {
    this.last = null;
  }
}

/** WebGLRenderer satisfies this; tests pass a fake. */
export interface AnimationDriver {
  setAnimationLoop(callback: ((time: number) => void) | null): void;
}

export interface GameLoopHandlers {
  /** Advance simulation by dt seconds. Return true if something changed and needs a render. */
  update: (dt: number) => boolean | undefined;
  render: () => void;
  /** Real frame interval (ms) of each rendered frame; feeds adaptive quality. */
  onRenderedFrame?: (rawMs: number) => void;
}

export interface VisibilitySource {
  readonly hidden: boolean;
  addEventListener(type: 'visibilitychange', listener: () => void): void;
  removeEventListener(type: 'visibilitychange', listener: () => void): void;
}

/**
 * setAnimationLoop wrapper: dt clamp, pauses while the tab is hidden, and renders only when dirty
 * (requestRender / update() returned true) unless continuous mode is on.
 */
export class GameLoop {
  private readonly clock = new FrameClock();
  private dirty = true;
  private continuous = false;
  private running = false;
  private readonly onVisibility = () => this.syncVisibility();

  constructor(
    private readonly driver: AnimationDriver,
    private readonly handlers: GameLoopHandlers,
    private readonly visibility?: VisibilitySource,
  ) {
    visibility?.addEventListener('visibilitychange', this.onVisibility);
  }

  requestRender(): void {
    this.dirty = true;
  }

  /** Render every frame (levels with ongoing animation, the benchmark). */
  setContinuous(continuous: boolean): void {
    this.continuous = continuous;
    if (continuous) this.dirty = true;
  }

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running || this.visibility?.hidden) return;
    this.running = true;
    this.clock.reset();
    this.dirty = true;
    this.driver.setAnimationLoop((time) => this.tick(time));
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    this.driver.setAnimationLoop(null);
  }

  /** Public for tests: one frame at timestamp `nowMs`. */
  tick(nowMs: number): void {
    const { dt, rawMs } = this.clock.step(nowMs);
    if (this.handlers.update(dt)) this.dirty = true;
    if (!this.continuous && !this.dirty) return;
    this.dirty = false;
    this.handlers.render();
    if (rawMs > 0) this.handlers.onRenderedFrame?.(rawMs);
  }

  private syncVisibility(): void {
    if (this.visibility?.hidden) {
      if (this.running) {
        this.stop();
        this.resumeWhenVisible = true;
      }
    } else if (this.resumeWhenVisible) {
      this.resumeWhenVisible = false;
      this.start();
    }
  }

  private resumeWhenVisible = false;

  dispose(): void {
    this.stop();
    this.visibility?.removeEventListener('visibilitychange', this.onVisibility);
  }
}
