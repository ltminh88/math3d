import { describe, expect, it } from 'vitest';
import { loadGoldenTrace } from '../config/load-golden-trace-for-tests';
import { TABLES } from '../config/world-constants';
import { hintText } from './hint-text';

// Phase 12 replaced the recovered fact picker (pickNextFact/buildQuestion) and per-direction
// answer stats with the learning core (learning-quiz-adapter.ts, quiz-answer-batch.ts), so their
// golden traces (picker-seed-*.json, stats-update.json trace) no longer describe runtime code and
// are kept only as the record of the original. The 30-entry reload cap of stats-update.json is
// still asserted as legacy v1 compatibility in src/save/save-storage.golden.test.ts. The hint
// ladder is unchanged and stays golden-exact.
describe('quiz golden traces', () => {
  it('hintText reproduces the ladder for every fact', () => {
    const golden = loadGoldenTrace<unknown[]>('hint-ladder.json');
    const rows: unknown[] = [];
    for (const a of TABLES) {
      for (let b = 1; b <= 10; b++) {
        const q = { a, b, answer: a * b };
        rows.push({ id: `m${a}_${b}`, hints: [1, 2, 3].map((level) => hintText(q, level)) });
      }
    }
    expect(rows).toEqual(golden);
    expect(hintText({ a: 3, b: 4, answer: 12 }, 0)).toBe(hintText({ a: 3, b: 4, answer: 12 }, 3));
  });
});
