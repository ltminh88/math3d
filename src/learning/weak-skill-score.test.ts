// Weak-skill score (boost, Phase 4A): (1 − recent accuracy) + 0.2 per labelled bug.
// `recent` is a bitmask of the last 10 first tries, bit 0 = most recent.
import { describe, expect, it } from 'vitest';
import type { FactStat } from './learning-types';
import { labelledBugs, recentAccuracy, weakScore } from './weak-skill-score';

const stat = (partial: Partial<FactStat>): FactStat => ({
  attempts: 0,
  correct: 0,
  totalMs: 0,
  box: 1,
  lastSeenSession: 0,
  lastSeenAt: 0,
  streak: 0,
  fluent: false,
  errs: [],
  ...partial,
});

describe('recentAccuracy', () => {
  it('counts 1-bits over the recorded tries (min(attempts, 10))', () => {
    // 3 tries, 2 correct: bits 0b101 (most recent first try was wrong).
    expect(recentAccuracy(stat({ attempts: 3, recent: 0b101 }))).toBeCloseTo(2 / 3);
    expect(recentAccuracy(stat({ attempts: 3, recent: 0b111 }))).toBe(1);
    expect(recentAccuracy(stat({ attempts: 3, recent: 0b000 }))).toBe(0);
  });

  it('caps the window at the last 10 tries', () => {
    // 12 attempts, last 10 all correct.
    expect(recentAccuracy(stat({ attempts: 12, recent: 0b1111111111 }))).toBe(1);
    // 12 attempts, last 10 half correct.
    expect(recentAccuracy(stat({ attempts: 12, recent: 0b1010101010 }))).toBe(0.5);
  });

  it('falls back to correct/attempts without `recent` (seeded stats)', () => {
    expect(recentAccuracy(stat({ attempts: 10, correct: 2 }))).toBe(0.2);
    expect(recentAccuracy(stat({ attempts: 4, correct: 4 }))).toBe(1);
  });

  it('an unattempted skill reads as fully accurate', () => {
    expect(recentAccuracy(stat({}))).toBe(1);
  });
});

describe('recentCount (R133)', () => {
  it('a seeded skill stays strong after one live correct question', () => {
    // Walkthrough seed: 3/3, no `recent`. One live correct question sets a
    // 1-bit mask; the old denominator (attempts = 4) read 1/4 = 0.25, score
    // 0.75, and the focus review hijacked "Học tiếp" (B30 -> B7).
    const seededThenPlayed = { attempts: 4, correct: 4, recent: 0b1, recentCount: 1 };
    expect(recentAccuracy(stat(seededThenPlayed))).toBe(1);
    expect(weakScore(stat(seededThenPlayed))).toBe(0);
  });

  it('retries no longer drag accuracy down', () => {
    // 3 questions: one wrong-then-right (2 attempts), two clean. True
    // first-try accuracy is 2/3; the old denominator (attempts = 4) read 1/2.
    expect(
      recentAccuracy(stat({ attempts: 4, correct: 3, recent: 0b011, recentCount: 3 })),
    ).toBeCloseTo(2 / 3);
  });

  it('a full mask still caps at 10', () => {
    expect(
      recentAccuracy(stat({ attempts: 14, correct: 12, recent: 0b1111111111, recentCount: 10 })),
    ).toBe(1);
    expect(
      recentAccuracy(stat({ attempts: 14, correct: 7, recent: 0b1010101010, recentCount: 10 })),
    ).toBe(0.5);
  });

  it('a genuinely weak recent still scores weak', () => {
    expect(
      weakScore(stat({ attempts: 6, correct: 3, recent: 0b010101, recentCount: 6 })),
    ).toBeCloseTo(0.5);
  });
});

describe('labelledBugs', () => {
  it('a bug is labelled only at ≥ 2 of the last 5', () => {
    expect(labelledBugs(stat({ bugs: ['forgot-carry'] }))).toEqual([]);
    expect(labelledBugs(stat({ bugs: ['forgot-carry', 'near-miss', 'forgot-carry'] }))).toEqual([
      'forgot-carry',
    ]);
  });

  it('returns distinct labelled bugs in first-appearance order', () => {
    expect(
      labelledBugs(
        stat({
          bugs: [
            'borrow-no-decrement',
            'forgot-carry',
            'borrow-no-decrement',
            'forgot-carry',
            'near-miss',
          ],
        }),
      ),
    ).toEqual(['borrow-no-decrement', 'forgot-carry']);
  });

  it('no bugs, no labels', () => {
    expect(labelledBugs(stat({}))).toEqual([]);
    expect(labelledBugs(stat({ bugs: [] }))).toEqual([]);
  });
});

describe('weakScore', () => {
  it('a strong skill scores 0', () => {
    expect(weakScore(stat({ attempts: 5, recent: 0b11111 }))).toBe(0);
  });

  it('inaccuracy alone: 1 − accuracy', () => {
    expect(weakScore(stat({ attempts: 4, recent: 0b0101 }))).toBeCloseTo(0.5);
  });

  it('each labelled bug adds 0.2', () => {
    expect(
      weakScore(stat({ attempts: 4, recent: 0b1111, bugs: ['forgot-carry', 'forgot-carry'] })),
    ).toBeCloseTo(0.2);
    expect(
      weakScore(
        stat({
          attempts: 10,
          correct: 10,
          bugs: ['forgot-carry', 'forgot-carry', 'borrow-no-decrement', 'borrow-no-decrement'],
        }),
      ),
    ).toBeCloseTo(0.4);
  });

  it('caps at 1.4 (all wrong + two labelled bugs)', () => {
    expect(
      weakScore(
        stat({
          attempts: 5,
          recent: 0b00000,
          bugs: ['forgot-carry', 'forgot-carry', 'borrow-no-decrement', 'borrow-no-decrement'],
        }),
      ),
    ).toBeCloseTo(1.4);
  });
});
