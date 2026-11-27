// Bar-model word problems (boost, Phase 1A; fallback R108 in Phase 2A):
// the 20-try pair loops must never keep a degenerate pair — when every
// draw fails, a fixed fallback forces the pair apart.
import { describe, expect, it } from 'vitest';
import type { Rng } from '../learning/seeded-rng';
import type { PracticeItem } from '../practice/practice-scene';
import { ADD_SUB_FORMAT_GENERATORS } from './add-sub-format-generators';

/** An Rng that cycles the given draws forever. */
const scriptedRng = (draws: number[]): Rng => {
  let i = 0;
  return () => draws[i++ % draws.length] as number;
};

const generate = (rng: Rng): PracticeItem => {
  const gen = ADD_SUB_FORMAT_GENERATORS['add-sub-bar-model-wp'];
  if (!gen) throw new Error('no generator for add-sub-bar-model-wp');
  return gen(rng, 1) as PracticeItem;
};

const params = (item: PracticeItem) => item.story.params as Record<string, number | string>;

describe('bar-model fallback (R108)', () => {
  it('unknown part: 20 equal pairs fall back to a positive unknown', () => {
    // name, noun, branch (< 0.5 → unknown part), then 20 ladder draws,
    // each returning [100, 100]: minuend 100, subtrahend 100, ladder 0
    // matches — so the loop never breaks on its own.
    const draws = [0.1, 0.1, 0.1];
    for (let t = 0; t < 20; t++) draws.push(0, 0.99);
    const item = generate(scriptedRng(draws));
    expect(item.story.key).toBe('barModelPart');
    const p = params(item);
    expect((p.total as number) - (p.a as number)).toBeGreaterThan(0);
  });

  it('unknown total: 20 equal pairs fall back to different parts', () => {
    // name, noun, branch (>= 0.5 → unknown total), then 20 ladder draws,
    // each returning [10, 10]: ladder 0 matches, parts equal.
    const draws = [0.1, 0.1, 0.9];
    for (let t = 0; t < 20; t++) draws.push(0, 0);
    const item = generate(scriptedRng(draws));
    expect(item.story.key).toBe('barModelTotal');
    const p = params(item);
    expect(p.a).not.toBe(p.b);
    expect((p.a as number) + (p.b as number)).toBeLessThanOrEqual(1000);
  });
});
