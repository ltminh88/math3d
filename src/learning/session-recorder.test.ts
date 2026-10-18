import { describe, expect, it } from 'vitest';
import { newFactStat } from './leitner-box';
import { createSessionRecorder, type QuestionOutcome } from './session-recorder';

const make = (stats = {}) => {
  let t = 1000;
  return createSessionRecorder({
    profileId: 'p1',
    levelId: 'bridge',
    sessionNo: 3,
    getStat: (k) => (stats as Record<string, ReturnType<typeof newFactStat>>)[k],
    now: () => (t += 10),
    newId: () => 'batch-1',
  });
};
const clean = (factKey: string, ms = 4000): QuestionOutcome => ({
  factKey,
  ms,
  correct: true,
  firstTry: true,
  usedHint: false,
  wrongAnswers: [],
});

describe('session recorder', () => {
  it('builds a sync-shaped delta with additive counters', () => {
    const r = make();
    r.recordQuestion(clean('mul:2x3'));
    r.recordQuestion({
      factKey: 'mul:2x3',
      ms: 9000,
      correct: true,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [5],
    });
    const { delta, local } = r.finish();
    expect(delta).toMatchObject({ batchId: 'batch-1', profileId: 'p1', v: 1, xp: 15, coins: 10 });
    expect(delta.facts['mul:2x3']).toMatchObject({ a: 3, c: 2, ms: 13000, box: 1 });
    expect(local['mul:2x3']?.errs).toEqual([5]);
    expect(delta.levels.bridge).toEqual({ stars: 1, bestScore: 15 });
  });

  it('uses the stored box as the starting point', () => {
    const r = make({ 'mul:5x5': { ...newFactStat(), box: 3, attempts: 4 } });
    r.recordQuestion(clean('mul:5x5'));
    expect(r.finish().delta.facts['mul:5x5']?.box).toBe(4);
  });

  it('counts a revealed question as one wrong attempt with no reward', () => {
    const r = make();
    r.recordQuestion({
      factKey: 'mul:2x4',
      ms: 6000,
      correct: false,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [],
    });
    const { delta } = r.finish();
    expect(delta.facts['mul:2x4']).toMatchObject({ a: 1, c: 0 });
    expect(delta.xp).toBe(0);
    expect(delta.coins).toBe(0);
  });

  it('drops a fact at most one box per question, however many wrong attempts', () => {
    const r = make({ 'mul:6x7': { ...newFactStat(), box: 5, attempts: 9 } });
    r.recordQuestion({
      factKey: 'mul:6x7',
      ms: 12000,
      correct: true,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [40, 48],
    });
    const { delta, local } = r.finish();
    expect(delta.facts['mul:6x7']).toMatchObject({ a: 3, c: 1, box: 4 });
    expect(local['mul:6x7']?.errs).toEqual([40, 48]);

    const r2 = make({ 'mul:6x7': { ...newFactStat(), box: 5, attempts: 9 } });
    r2.recordQuestion({
      factKey: 'mul:6x7',
      ms: 12000,
      correct: false,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [40, 48, 36],
    });
    expect(r2.finish().delta.facts['mul:6x7']).toMatchObject({ a: 3, c: 0, box: 4 });
  });

  it('a later question in the same session can drop the fact one more box', () => {
    const r = make({ 'mul:6x7': { ...newFactStat(), box: 3, attempts: 9 } });
    const miss: QuestionOutcome = {
      factKey: 'mul:6x7',
      ms: 5000,
      correct: true,
      firstTry: false,
      usedHint: false,
      wrongAnswers: [40, 41],
    };
    r.recordQuestion(miss);
    r.recordQuestion(miss);
    expect(r.finish().delta.facts['mul:6x7']?.box).toBe(1);
  });

  it('awards stars on clean play and omits the level when abandoned', () => {
    const r = make();
    for (let i = 0; i < 10; i++) r.recordQuestion(clean('mul:2x2'));
    expect(r.finish().delta.levels.bridge?.stars).toBe(3);
    const r2 = make();
    r2.recordQuestion(clean('mul:2x2'));
    expect(r2.finish(false).delta.levels).toEqual({});
  });
});
