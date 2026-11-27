// Sub bug values (boost, Phase 1A — split from add-sub-bug-catalogue.ts, R103.2):
// the sub-only bugs. The shared digit helpers and the two operation-shared
// bugs live in the add file and are reused here.
import type { AddSubBug } from './add-sub-bug-catalogue';
import {
  digitsOf,
  fromDigits,
  misalignedColumns,
  secondRegroupDropped,
} from './add-sub-bug-catalogue-add';
import { wrongSubByNoBorrow } from './arithmetic-distractors';

/** Subtract, but the borrow-in is never subtracted from the lending digit. */
export const borrowNoDecrement = (a: number, b: number): number => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const n = Math.max(da.length, db.length);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    // A borrow would add 10 to the digit, but +10 vanishes under mod 10, and
    // the lender is never decremented, so no borrow ever propagates: each
    // column is just (da − db) mod 10 (R103 nit: the old `borrowIn ? 10 : 0`
    // term and the borrow tracking itself were dead code).
    out.push(((((da[i] ?? 0) - (db[i] ?? 0)) % 10) + 10) % 10);
  }
  return fromDigits(out);
};

/**
 * Subtract, but when a borrow-in hits a zero digit of the minuend the digit is
 * written as the subtrahend digit and the borrow is absorbed (no borrow out).
 */
export const zeroBorrowSkip = (a: number, b: number): number => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const n = Math.max(da.length, db.length);
  const out: number[] = [];
  let borrowIn = false;
  for (let i = 0; i < n; i++) {
    const daDigit = da[i] ?? 0;
    const dbDigit = db[i] ?? 0;
    if (borrowIn && daDigit === 0) {
      out.push(dbDigit);
      borrowIn = false;
      continue;
    }
    const raw: number = daDigit - dbDigit - (borrowIn ? 1 : 0);
    out.push(((raw % 10) + 10) % 10);
    borrowIn = raw < 0;
  }
  return fromDigits(out);
};

/** Subtract digit by digit; a zero minuend digit stays zero. */
export const zeroMinusNZero = (a: number, b: number): number => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const n = Math.max(da.length, db.length);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const daDigit = da[i] ?? 0;
    out.push(daDigit === 0 ? 0 : Math.abs(daDigit - (db[i] ?? 0)));
  }
  return fromDigits(out);
};

/**
 * The wrong value a sub bug produces for `a − b`. An add bug returns the
 * correct value (so bugsFor filters it out).
 */
export const subBugValue = (bug: AddSubBug, a: number, b: number): number => {
  switch (bug) {
    case 'smaller-from-larger':
      return wrongSubByNoBorrow(a, b);
    case 'borrow-no-decrement':
      return borrowNoDecrement(a, b);
    case 'zero-borrow-skip':
      return zeroBorrowSkip(a, b);
    case 'zero-minus-n-zero':
      return zeroMinusNZero(a, b);
    case 'misaligned-columns':
      return misalignedColumns(a, b, '−');
    case 'second-regroup-dropped':
      return secondRegroupDropped(a, b, '−');
    default:
      return a - b;
  }
};
