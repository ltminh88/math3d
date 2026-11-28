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
  it('counts 1-bits over the recorded tries (recentCount)', () => {
    // 3 tries, 2 correct: bits 0b101 (most recent first try was wrong).
    expect(
      recentAccuracy(stat({ attempts: 3, correct: 2, recent: 0b101, recentCount: 3 })),
    ).toBeCloseTo(2 / 3);
    expect(recentAccuracy(stat({ attempts: 3, correct: 3, recent: 0b111, recentCount: 3 }))).toBe(
      1,
    );
    expect(recentAccuracy(stat({ attempts: 3, correct: 0, recent: 0b000, recentCount: 3 }))).toBe(
      0,
    );
  });

  it('caps the window at the last 10 tries', () => {
    // 12 attempts, last 10 all correct.
    expect(
      recentAccuracy(stat({ attempts: 12, correct: 12, recent: 0b1111111111, recentCount: 10 })),
    ).toBe(1);
    // 12 attempts, last 10 half correct.
    expect(
      recentAccuracy(stat({ attempts: 12, correct: 6, recent: 0b1010101010, recentCount: 10 })),
    ).toBe(0.5);
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

describe('missing recentCount (R134)', () => {
  it('a pre-Phase-0 record does not trust the mask: 38/40 reads 0.95', () => {
    // Real profile: played since October, `recent` only since Phase 0 (26/11),
    // so the mask holds just 2 tries while attempts counts 40. The old
    // fallback read 2/10 = 0.2 (score 0.8) and dragged "Học tiếp" back to an
    // old lesson for a skill the child already masters.
    const old = { attempts: 40, correct: 38, recent: 0b11 };
    expect(recentAccuracy(stat(old))).toBeCloseTo(0.95);
    expect(weakScore(stat(old))).toBeCloseTo(0.05);
  });

  it('a genuinely weak pre-Phase-0 record still scores weak', () => {
    // Same shape, but the overall ratio is weak too: no whitewashing.
    const old = { attempts: 10, correct: 2, recent: 0b1010101010 };
    expect(recentAccuracy(stat(old))).toBeCloseTo(0.2);
    expect(weakScore(stat(old))).toBeCloseTo(0.8);
  });
});

describe('stale mask bits and tiny samples (R135)', () => {
  it('one new wrong answer does not read 1.0 (legacy mask 0b11 -> 0b110)', () => {
    // The mask still holds 2 correct bits from before `recentCount` existed;
    // the first question after the build is wrong, so the mask is 0b110 and
    // recentCount = 1. The old min(popcount, 1) / 1 read 1.0; the new code
    // uses correct/attempts below 3 recorded tries.
    const legacy = { attempts: 40, correct: 38, recent: 0b110, recentCount: 1 };
    expect(recentAccuracy(stat(legacy))).toBeCloseTo(0.95);
    expect(weakScore(stat(legacy))).toBeCloseTo(0.05);
  });

  it('recentCount 1 uses correct/attempts, not the mask', () => {
    // One wrong answer on a weak overall record: 1/5, not 0/1 from the mask.
    expect(
      recentAccuracy(stat({ attempts: 5, correct: 1, recent: 0b0, recentCount: 1 })),
    ).toBeCloseTo(0.2);
    // And one wrong answer on a strong overall record does not make it weak.
    expect(
      recentAccuracy(stat({ attempts: 40, correct: 39, recent: 0b0, recentCount: 1 })),
    ).toBeCloseTo(39 / 40);
  });

  it('recentCount 2 still uses correct/attempts', () => {
    expect(
      recentAccuracy(stat({ attempts: 10, correct: 9, recent: 0b11, recentCount: 2 })),
    ).toBeCloseTo(0.9);
  });

  it('from 3 recorded tries the mask counts only the n lowest bits', () => {
    // Legacy mask 0b11, then 3 new questions: wrong, correct, correct.
    // Mask is 0b11011; the 3 lowest bits (0b011) are the 3 newest tries.
    // The old min(popcount, 3) / 3 read 1.0 (4 correct bits in the mask).
    expect(
      recentAccuracy(stat({ attempts: 43, correct: 40, recent: 0b11011, recentCount: 3 })),
    ).toBeCloseTo(2 / 3);
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
    expect(weakScore(stat({ attempts: 5, correct: 5, recent: 0b11111, recentCount: 5 }))).toBe(0);
  });

  it('inaccuracy alone: 1 − accuracy', () => {
    expect(
      weakScore(stat({ attempts: 4, correct: 2, recent: 0b0101, recentCount: 4 })),
    ).toBeCloseTo(0.5);
  });

  it('each labelled bug adds 0.2', () => {
    expect(
      weakScore(
        stat({
          attempts: 4,
          correct: 4,
          recent: 0b1111,
          recentCount: 4,
          bugs: ['forgot-carry', 'forgot-carry'],
        }),
      ),
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
          correct: 0,
          recent: 0b00000,
          recentCount: 5,
          bugs: ['forgot-carry', 'forgot-carry', 'borrow-no-decrement', 'borrow-no-decrement'],
        }),
      ),
    ).toBeCloseTo(1.4);
  });
});
