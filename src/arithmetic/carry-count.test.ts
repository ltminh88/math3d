// Carry counting (phase 09): how many digit positions carry (add) or borrow (sub),
// and whether a borrow propagates through a zero digit. RED-first: carry-count.ts
// does not exist yet.
import { describe, expect, it } from 'vitest';
import { countAddCarries, countSubBorrows, hasBorrowAcrossZero } from './carry-count';

describe('countAddCarries', () => {
  it('counts positions where the digit sum plus the incoming carry reaches 10', () => {
    expect(countAddCarries(123, 456)).toBe(0);
    expect(countAddCarries(456, 378)).toBe(2); // 6+8, 5+7+1
    expect(countAddCarries(999, 1)).toBe(3);
    expect(countAddCarries(500, 500)).toBe(1); // 5+5 only
    expect(countAddCarries(1000, 999)).toBe(0);
    expect(countAddCarries(0, 0)).toBe(0);
  });
});

describe('countSubBorrows', () => {
  it('counts positions where the digit minus the incoming borrow goes below 0', () => {
    expect(countSubBorrows(876, 234)).toBe(0);
    expect(countSubBorrows(503, 187)).toBe(2); // 3-7, 0-8-1
    expect(countSubBorrows(1000, 1)).toBe(3);
    expect(countSubBorrows(400, 100)).toBe(0);
    expect(countSubBorrows(500, 500)).toBe(0);
  });
});

describe('hasBorrowAcrossZero', () => {
  it('is true when a borrow propagates through a zero digit of the minuend', () => {
    expect(hasBorrowAcrossZero(1000, 247)).toBe(true);
    expect(hasBorrowAcrossZero(4000, 137)).toBe(true);
    expect(hasBorrowAcrossZero(5020, 137)).toBe(true); // the hundreds zero is crossed
    expect(hasBorrowAcrossZero(503, 187)).toBe(true); // the tens zero is crossed
    expect(hasBorrowAcrossZero(100, 1)).toBe(true);
  });

  it('is false when every borrow stops at a non-zero digit', () => {
    expect(hasBorrowAcrossZero(876, 234)).toBe(false);
    expect(hasBorrowAcrossZero(420, 35)).toBe(false);
    expect(hasBorrowAcrossZero(500, 500)).toBe(false);
  });
});
