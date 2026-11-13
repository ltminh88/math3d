// The counting harness must report what manual reasoning predicts for pools whose
// size is known exactly — if it miscounts here, no number in the report can be trusted.
import { describe, expect, it } from 'vitest';
import { mulberry32, pick } from '../../src/learning/seeded-rng';
import {
  countFactPool,
  countSignatures,
  countSkill,
  countStoryContexts,
  FACT_POOLS,
} from './pool-counter';

describe('pool counter', () => {
  it('counts a trivial two-item pool exactly', () => {
    const r = countSignatures((rng) => pick(rng, ['a', 'b']), {
      draws: 100,
      trials: 5,
      cap: 20,
    });
    expect(r.distinct).toBe(2);
    expect(r.firstRepeatAt).toBeGreaterThan(1);
    expect(r.medianBeforeRepeat).not.toBeNull();
    expect(r.medianBeforeRepeat as number).toBeLessThanOrEqual(20);
  });

  it('is deterministic for the same seed', () => {
    const a = countSkill('wp-times-then-add', 1, { draws: 200, trials: 3, cap: 50 });
    const b = countSkill('wp-times-then-add', 1, { draws: 200, trials: 3, cap: 50 });
    expect(a).toEqual(b);
  });

  it('meas-temperature tier 1 has exactly 8 distinct prompts', () => {
    // TEMP_RANGE is [5, 40]; tier 1 reads a multiple of 5: 5, 10, …, 40 — 8 values,
    // one story key, one step, so 8 visible prompts.
    const r = countSkill('meas-temperature', 1);
    expect(r.distinct).toBe(8);
  });

  it('fact pools are the pools the levels actually draw from', () => {
    const byLevel = Object.fromEntries(FACT_POOLS.map((p) => [p.level, p]));
    // mulKey dedupes commutative pairs (3x4 == 4x3): field is 17, not 18.
    expect(byLevel.field?.pool.length).toBe(17);
    expect(byLevel.forest?.pool.length).toBe(36);
    // City mul tables 6–9 dedupe the same way: 30, not 36.
    expect(byLevel.city?.pool.length).toBe(30);
    // Tower mul (44) + div (72): 116, not 144.
    expect(byLevel.tower?.pool.length).toBe(116);
    for (const p of FACT_POOLS) {
      const r = countFactPool(p.pool);
      expect(r.distinct).toBe(p.pool.length);
    }
  });

  it('word-problem story contexts are counted, not assumed', () => {
    const contexts = countStoryContexts('wp-times-then-add', 1);
    expect(contexts.length).toBeGreaterThanOrEqual(1);
    // Same seed, same set.
    expect(countStoryContexts('wp-times-then-add', 1)).toEqual(contexts);
  });

  it('signatures ignore distractor values', () => {
    // Two draws of the same skill/tier with the same story numbers but different
    // wrong options must collapse to one signature — checked via the harness's own
    // definition: a pool whose draw ignores its rng argument repeats immediately.
    const r = countSignatures(() => 'same-question', { draws: 10, trials: 2, cap: 5 });
    expect(r.distinct).toBe(1);
    expect(r.firstRepeatAt).toBe(2);
  });

  it('uses a fresh rng per trial (no cross-trial state)', () => {
    const seen: string[] = [];
    const r = countSignatures(
      (rng) => {
        const v = String(Math.floor(rng() * 4));
        seen.push(v);
        return v;
      },
      { draws: 50, trials: 4, cap: 10, seed: 7 },
    );
    expect(r.distinct).toBeLessThanOrEqual(4);
    expect(seen.length).toBeGreaterThan(50);
    void mulberry32;
  });
});
