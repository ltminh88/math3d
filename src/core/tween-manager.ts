export type Easing = (t: number) => number;

export const EASE = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
} as const satisfies Record<string, Easing>;

export interface TweenOptions {
  /** Seconds. */
  duration: number;
  delay?: number;
  ease?: Easing;
  /** Called every frame with the eased progress 0..1. */
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

export interface TweenHandle {
  cancel(): void;
}

interface ActiveTween extends TweenOptions {
  elapsed: number;
  cancelled: boolean;
}

export class TweenManager {
  private tweens: ActiveTween[] = [];

  add(options: TweenOptions): TweenHandle {
    const tween: ActiveTween = { ...options, elapsed: -(options.delay ?? 0), cancelled: false };
    this.tweens.push(tween);
    return {
      cancel: () => {
        tween.cancelled = true;
      },
    };
  }

  hasActive(): boolean {
    return this.tweens.some((tween) => !tween.cancelled);
  }

  /** Advance all tweens by dt seconds; finished and cancelled tweens are dropped. */
  update(dt: number): void {
    const finished: ActiveTween[] = [];
    for (const tween of this.tweens) {
      if (tween.cancelled) continue;
      tween.elapsed += dt;
      if (tween.elapsed < 0) continue;
      const raw = tween.duration <= 0 ? 1 : Math.min(tween.elapsed / tween.duration, 1);
      tween.onUpdate((tween.ease ?? EASE.linear)(raw));
      if (raw >= 1) finished.push(tween);
    }
    this.tweens = this.tweens.filter((tween) => !tween.cancelled && !finished.includes(tween));
    for (const tween of finished) tween.onComplete?.();
  }

  clear(): void {
    for (const tween of this.tweens) tween.cancelled = true;
    this.tweens = [];
  }
}
