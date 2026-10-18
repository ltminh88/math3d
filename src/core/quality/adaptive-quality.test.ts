import { describe, expect, it } from 'vitest';
import { AdaptiveQuality } from './adaptive-quality';
import { clampTierIndex, loadTierIndex, QUALITY_TIERS } from './quality-tiers';

function run(quality: AdaptiveQuality, frameMs: number, seconds: number): void {
  const frames = Math.round((seconds * 1000) / frameMs);
  for (let i = 0; i < frames; i++) quality.sample(frameMs);
}

function make(initialTier = 0) {
  const changes: number[] = [];
  const quality = new AdaptiveQuality({ initialTier, onTierChange: (t) => changes.push(t) });
  return { quality, changes };
}

describe('AdaptiveQuality', () => {
  it('does nothing during warm-up even when frames are slow', () => {
    const { quality, changes } = make();
    run(quality, 50, 3);
    expect(changes).toEqual([]);
  });

  it('steps down after a slow window and keeps stepping while slow, stopping at the lowest', () => {
    const { quality, changes } = make();
    run(quality, 50, 3 + 2 + 2 + 2 + 2);
    expect(changes).toEqual([1, 2]);
    expect(quality.tierIndex).toBe(QUALITY_TIERS.length - 1);
  });

  it('holds steady in the middle band', () => {
    const { quality, changes } = make(1);
    run(quality, 28, 12);
    expect(changes).toEqual([]);
  });

  it('steps up at most once per session', () => {
    const { quality, changes } = make(2);
    run(quality, 10, 3 + 2 + 2 + 2);
    expect(changes).toEqual([1]);
  });

  it('ignores stalls and invalid samples', () => {
    const { quality, changes } = make();
    run(quality, 16, 3);
    quality.sample(5000);
    quality.sample(Number.NaN);
    quality.sample(-4);
    run(quality, 16, 6);
    expect(changes).toEqual([]);
  });
});

describe('tier persistence helpers', () => {
  it('clamps garbage tier indexes and tolerates missing storage', () => {
    expect(clampTierIndex(99)).toBe(QUALITY_TIERS.length - 1);
    expect(clampTierIndex(-3)).toBe(0);
    expect(clampTierIndex(Number.NaN)).toBe(0);
    expect(loadTierIndex({ getItem: () => 'abc', setItem: () => {} })).toBe(0);
    expect(loadTierIndex({ getItem: () => '2', setItem: () => {} })).toBe(2);
  });
});
