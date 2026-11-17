// Missing-factor hint ladder (phase 03): no rung ever states the hidden factor. Rung 2
// names only the known factor and the total, rung 3 tells the child what to count, rung 4
// turns the plot and asks for a recount.
import { describe, expect, it } from 'vitest';
import { missingHintPlan } from './field-hints';
import type { FieldRound } from './field-round-flow';

const round = (missingFactor: number): FieldRound => ({
  factKey: 'mul:3x4',
  rows: 3,
  cols: 4,
  total: 12,
  type: 'missing',
  shownOrder: [3, 4],
  missingFactor,
  options: [],
});

describe('missingHintPlan', () => {
  it('no rung states the hidden factor, whichever side is hidden', () => {
    for (const missing of [3, 4]) {
      for (const rung of [1, 2, 3, 4] as const) {
        const plan = missingHintPlan(rung, round(missing));
        expect(plan.text).not.toContain(String(missing));
      }
    }
  });

  it('rung 2 names the known factor and the total, and asks for the hidden one', () => {
    expect(missingHintPlan(2, round(4)).text).toContain('3 hàng');
    expect(missingHintPlan(2, round(3)).text).toContain('4 cây');
  });

  it('rung 3 tells the child what to count (plants in a row, or rows)', () => {
    expect(missingHintPlan(3, round(4)).text).toContain('một hàng');
    expect(missingHintPlan(3, round(3)).text).toContain('mấy hàng');
  });

  it('rung 4 turns a non-square plot and highlights the rows', () => {
    const plan = missingHintPlan(4, round(4));
    expect(plan.rotate).toBe(true);
    expect(plan.highlightRows).toBe(true);
    expect(plan.skipLabels).toEqual([]);
  });
});
