// SGK number display (phase 07 review fix): numbers ≥ 1000 group by 3 digits with a
// narrow no-break space (U+202F) — 7 726, 77 261, 10 000. Below 1000 unchanged.
import { describe, expect, it } from 'vitest';
import { formatDigitRuns, formatNumber } from './numbers-format';

const NBSP = '\u202F';

describe('numbers format (SGK grouping)', () => {
  it('leaves numbers below 1000 alone', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
  });

  it('groups thousands with a narrow no-break space', () => {
    expect(formatNumber(1000)).toBe(`1${NBSP}000`);
    expect(formatNumber(7726)).toBe(`7${NBSP}726`);
    expect(formatNumber(77261)).toBe(`77${NBSP}261`);
    expect(formatNumber(100000)).toBe(`100${NBSP}000`);
  });

  it('groups every long run inside a display string', () => {
    expect(formatDigitRuns('70000 + 7000 + 200 + 20 + 4')).toBe(
      `70${NBSP}000 + 7${NBSP}000 + 200 + 20 + 4`,
    );
    expect(formatDigitRuns('77224, 12345')).toBe(`77${NBSP}224, 12${NBSP}345`);
    expect(formatDigitRuns('ba mươi mốt nghìn')).toBe('ba mươi mốt nghìn');
    expect(formatDigitRuns('1 2 3 4 5')).toBe('1 2 3 4 5');
  });
});
