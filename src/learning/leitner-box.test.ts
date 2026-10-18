import { describe, expect, it } from 'vitest';
import { type Attempt, applyAttempt, newFactStat } from './leitner-box';

const base: Attempt = {
  correct: true,
  firstTry: true,
  usedHint: false,
  ms: 5000,
  sessionNo: 4,
  at: 1000,
};

describe('applyAttempt', () => {
  it('advances on a clean first-try correct under 8 s and counts additively', () => {
    const s = applyAttempt(newFactStat(), base);
    expect(s).toMatchObject({
      box: 2,
      attempts: 1,
      correct: 1,
      totalMs: 5000,
      streak: 1,
      fluent: false,
      lastSeenSession: 4,
      lastSeenAt: 1000,
    });
  });

  it('stays put when slow, hinted, or not first try', () => {
    const at2 = { ...newFactStat(), box: 2 };
    expect(applyAttempt(at2, { ...base, ms: 8000 }).box).toBe(2);
    expect(applyAttempt(at2, { ...base, usedHint: true }).box).toBe(2);
    expect(applyAttempt(at2, { ...base, firstTry: false }).box).toBe(2);
    expect(applyAttempt(at2, { ...base, usedHint: true }).streak).toBe(0);
  });

  it('drops a box on a wrong answer with a floor of 1 and keeps the last 3 errors', () => {
    let s = { ...newFactStat(), box: 3, streak: 4, fluent: true };
    s = applyAttempt(s, { ...base, correct: false, wrongAnswer: 10 });
    expect(s).toMatchObject({
      box: 2,
      streak: 0,
      fluent: false,
      attempts: 1,
      correct: 0,
      errs: [10],
    });
    for (const w of [11, 12, 13, 14])
      s = applyAttempt(s, { ...base, correct: false, wrongAnswer: w });
    expect(s.box).toBe(1);
    expect(s.errs).toEqual([12, 13, 14]);
  });

  it('caps at box 5 and sets fluent only under 3 s', () => {
    const top = { ...newFactStat(), box: 5 };
    expect(applyAttempt(top, { ...base, ms: 2999 })).toMatchObject({ box: 5, fluent: true });
    expect(applyAttempt(top, { ...base, ms: 3000 }).fluent).toBe(false);
  });

  it('does not mutate the input', () => {
    const s = newFactStat();
    applyAttempt(s, { ...base, correct: false, wrongAnswer: 9 });
    expect(s.errs).toEqual([]);
    expect(s.attempts).toBe(0);
  });
});
