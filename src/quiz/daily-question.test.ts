// Daily questions (phase 11): one 3-choice question per learned × / : fact.
// Multiplication reuses the quiz dialog's builder; division mirrors it (a : b with
// a = dividend, b = divisor, answer = quotient). Skill keys use the step kit, not this.
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../learning/learning-types';
import { newFactStat } from '../learning/leitner-box';
import { mulberry32 } from '../learning/seeded-rng';
import { buildDailyQuestion } from './daily-question';

const stat = (box: number, attempts = 2): FactStat => ({
  ...newFactStat(),
  attempts,
  correct: attempts,
  box,
});

describe('buildDailyQuestion', () => {
  it('builds a 3-choice multiplication question with the answer among the options', () => {
    const q = buildDailyQuestion('mul:3x4', stat(2), mulberry32(1));
    expect(q.factKey).toBe('mul:3x4');
    expect(q.answer).toBe(12);
    expect(q.options).toHaveLength(3);
    expect(new Set(q.options.map((o) => o.value)).size).toBe(3);
    expect(q.options.map((o) => o.value)).toContain(12);
    for (const o of q.options) expect(o.value).toBeGreaterThanOrEqual(1);
    for (const o of q.options) expect(o.value).toBeLessThanOrEqual(100);
  });

  it('builds a division question: a = dividend, b = divisor, answer = quotient', () => {
    const q = buildDailyQuestion('div:12/3', stat(2), mulberry32(2));
    expect(q.factKey).toBe('div:12/3');
    expect(q.a).toBe(12);
    expect(q.b).toBe(3);
    expect(q.answer).toBe(4);
    expect(q.options).toHaveLength(3);
    expect(new Set(q.options.map((o) => o.value)).size).toBe(3);
    expect(q.options.map((o) => o.value)).toContain(4);
  });

  it('is deterministic for a seeded rng', () => {
    const a = buildDailyQuestion('div:20/4', stat(1), mulberry32(9));
    const b = buildDailyQuestion('div:20/4', stat(1), mulberry32(9));
    expect(a).toEqual(b);
    expect(a.answer).toBe(5);
  });

  it('marks a box-1 fact as a review', () => {
    expect(buildDailyQuestion('mul:3x4', stat(1), mulberry32(1)).review).toBe(true);
    expect(buildDailyQuestion('mul:3x4', stat(3), mulberry32(1)).review).toBe(false);
  });

  it('refuses skill keys (they use the step kit)', () => {
    expect(() => buildDailyQuestion('sk:wp-times-then-add', stat(2), mulberry32(1))).toThrow();
  });
});
