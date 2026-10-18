export interface FrameSummary {
  frames: number;
  avgFps: number;
  avgMs: number;
  p95Ms: number;
  maxMs: number;
  /** Share of frames slower than the 25 ms gate (0..1). */
  slowShare: number;
}

/** Nearest-rank percentile of an ascending-sorted list. */
export function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return 0;
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))] ?? 0;
}

export class FrameStats {
  private readonly samples: number[] = [];

  add(frameMs: number): void {
    if (Number.isFinite(frameMs) && frameMs > 0) this.samples.push(frameMs);
  }

  reset(): void {
    this.samples.length = 0;
  }

  summary(gateMs = 25): FrameSummary {
    const sorted = [...this.samples].sort((a, b) => a - b);
    const total = sorted.reduce((sum, v) => sum + v, 0);
    const avgMs = sorted.length ? total / sorted.length : 0;
    return {
      frames: sorted.length,
      avgFps: avgMs > 0 ? 1000 / avgMs : 0,
      avgMs,
      p95Ms: percentile(sorted, 95),
      maxMs: sorted.at(-1) ?? 0,
      slowShare: sorted.length ? sorted.filter((v) => v > gateMs).length / sorted.length : 0,
    };
  }
}
