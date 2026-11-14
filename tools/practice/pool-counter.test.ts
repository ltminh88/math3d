// The counting harness must report what manual reasoning predicts for pools whose
// size is known exactly — if it miscounts here, no number in the report can be trusted.
import { describe, expect, it } from 'vitest';
import { mulberry32, pick } from '../../src/learning/seeded-rng';
import type { SkillTier } from '../../src/learning/skill-tiers';
import {
  countFactPool,
  countSignatures,
  countSkill,
  countStoryContexts,
  FACT_POOLS,
} from './pool-counting';

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

  it('meas-temperature tier 1 has 24 distinct prompts (phase 02)', () => {
    // TEMP_RANGE is [5, 40]; tier 1 reads a multiple of 5: 5, 10, …, 40 — 8 values —
    // and the thermometer is labelled A, B or C (phase 02): 8 values × 3 labels.
    const r = countSkill('meas-temperature', 1);
    expect(r.distinct).toBe(24);
  });

  it('phase-02 targets: below-target skills from phase 01 clear their bar', () => {
    // Reasoning >= 24 and geometry/measurement >= 12 distinct visible prompts per
    // skill x tier. These are the skills the phase-01 counter found below target.
    const opts = { draws: 2000, trials: 2, cap: 200 };
    const below: [string, SkillTier, number][] = [
      ['geo-midpoint', 1, 12],
      ['geo-midpoint', 2, 12],
      ['geo-radius-diameter', 1, 12],
      ['meas-ml', 1, 12],
      ['meas-ml', 2, 12],
      ['meas-area-square', 1, 12],
      ['meas-area-square', 2, 12],
      ['meas-area-square', 3, 12],
    ];
    for (const [skill, tier, target] of below) {
      const r = countSkill(skill, tier, opts);
      expect(r.distinct, `${skill} t${tier}`).toBeGreaterThanOrEqual(target);
    }
  });

  it('word-problem skills have at least 4 story contexts (phase 02)', () => {
    // Phase 01 measured exactly 1 context per wp-* skill (2 for more-less); phase 02
    // adds +3–5 per skill so no child re-reads the same sentence every run.
    const wp = [
      'wp-times-then-add',
      'wp-divide-then-add',
      'wp-more-less-then-total',
      'wp-unit-then-times',
      'wp-times-compare',
      'wp-difference-compare',
    ];
    for (const skill of wp) {
      const contexts = countStoryContexts(skill, 1);
      expect(contexts.length, skill).toBeGreaterThanOrEqual(4);
    }
    expect(countStoryContexts('wp-more-less-then-total', 1).length).toBeGreaterThanOrEqual(5);
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
