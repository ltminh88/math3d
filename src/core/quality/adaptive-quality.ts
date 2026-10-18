import { clampTierIndex } from './quality-tiers';

export interface AdaptiveQualityOptions {
  initialTier: number;
  onTierChange: (tierIndex: number) => void;
  /** Ignore this much play time at the start (shader compiles, asset upload). */
  warmupMs?: number;
  windowMs?: number;
  /** Average frame time above this steps quality down. */
  slowFrameMs?: number;
  /** Average frame time below this allows one step up. */
  fastFrameMs?: number;
  /** Frames longer than this are tab stalls/hitches, not load; excluded from averages. */
  ignoreAboveMs?: number;
}

/**
 * Frame-time driven tier controller. Time is the sum of the samples fed in, so it is
 * deterministic: feed it the real frame intervals and it decides in 2 s windows after a 3 s
 * warm-up. It may step up at most once per session so it cannot oscillate.
 */
export class AdaptiveQuality {
  private tier: number;
  private elapsed = 0;
  private windowSum = 0;
  private windowCount = 0;
  private windowElapsed = 0;
  private stepUps = 0;
  private readonly warmupMs: number;
  private readonly windowMs: number;
  private readonly slowFrameMs: number;
  private readonly fastFrameMs: number;
  private readonly ignoreAboveMs: number;

  constructor(private readonly options: AdaptiveQualityOptions) {
    this.tier = clampTierIndex(options.initialTier);
    this.warmupMs = options.warmupMs ?? 3000;
    this.windowMs = options.windowMs ?? 2000;
    this.slowFrameMs = options.slowFrameMs ?? 36;
    this.fastFrameMs = options.fastFrameMs ?? 20;
    this.ignoreAboveMs = options.ignoreAboveMs ?? 250;
  }

  get tierIndex(): number {
    return this.tier;
  }

  /** Feed one rendered frame interval in milliseconds. */
  sample(frameMs: number): void {
    if (!Number.isFinite(frameMs) || frameMs <= 0) return;
    if (frameMs > this.ignoreAboveMs) {
      this.restartWindow();
      return;
    }
    this.elapsed += frameMs;
    if (this.elapsed <= this.warmupMs) return;
    this.windowSum += frameMs;
    this.windowCount += 1;
    this.windowElapsed += frameMs;
    if (this.windowElapsed < this.windowMs) return;
    const average = this.windowSum / this.windowCount;
    this.restartWindow();
    this.evaluate(average);
  }

  private restartWindow(): void {
    this.windowSum = 0;
    this.windowCount = 0;
    this.windowElapsed = 0;
  }

  private evaluate(averageMs: number): void {
    if (averageMs > this.slowFrameMs) this.moveTo(this.tier + 1);
    else if (averageMs < this.fastFrameMs && this.stepUps === 0 && this.tier > 0) {
      this.stepUps += 1;
      this.moveTo(this.tier - 1);
    }
  }

  private moveTo(next: number): void {
    const clamped = clampTierIndex(next);
    if (clamped === this.tier) return;
    this.tier = clamped;
    this.options.onTierChange(clamped);
  }
}
