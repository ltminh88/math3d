import { describe, expect, it } from 'vitest';
import { FrameStats, percentile } from './frame-stats';

describe('FrameStats', () => {
  it('computes average fps, p95 and slow share', () => {
    const stats = new FrameStats();
    for (let i = 0; i < 95; i++) stats.add(16);
    for (let i = 0; i < 5; i++) stats.add(40);
    const s = stats.summary();
    expect(s.frames).toBe(100);
    expect(s.p95Ms).toBe(16);
    expect(s.maxMs).toBe(40);
    expect(s.slowShare).toBeCloseTo(0.05);
    expect(s.avgFps).toBeCloseTo(1000 / 17.2, 1);
  });

  it('handles empty input and ignores junk samples', () => {
    const stats = new FrameStats();
    stats.add(Number.NaN);
    stats.add(-1);
    expect(stats.summary()).toMatchObject({ frames: 0, avgFps: 0, p95Ms: 0 });
    expect(percentile([], 95)).toBe(0);
  });
});
