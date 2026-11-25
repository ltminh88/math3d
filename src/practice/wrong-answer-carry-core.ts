// Nhóm 9 (R35) — core diagnosis for one add/sub step, shared by the plain, word
// problem, chain and find-error matchers. Nothing on the item says where the carry
// sits — it is re-derived from the operands. A wrong answer that matches the full
// digit-by-digit "forgot the carry" / "no borrow" pattern (wrongAddByForgotCarry /
// wrongSubByNoBorrow) — or is off by a power of ten while the operation really
// carries/borrows — gets a NON-assertive check-form (R38, Q2): the same number
// could be a slip, and a check reminder is never wrong. No pattern match → the
// per-type fallback. Never a claim about a specific column beyond the check-form.

import { wrongAddByForgotCarry, wrongSubByNoBorrow } from '../arithmetic/arithmetic-distractors';
import { countAddCarries, countSubBorrows } from '../arithmetic/carry-count';
import { renderNumbersPrompt } from '../numbers/numbers-strings';
import type { WrongAnswerExplanation } from './wrong-answer-explanation';

const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'tenThousands'] as const;

/** First column (0 = ones) where adding a and b generates a carry, or undefined. */
function firstCarryCol(a: number, b: number): number | undefined {
  let carry = 0;
  for (let col = 0; col < 6; col++) {
    const da = Math.floor(a / 10 ** col) % 10;
    const db = Math.floor(b / 10 ** col) % 10;
    if (da + db + carry >= 10) return col;
    carry = da + db + carry >= 10 ? 1 : 0;
  }
  return undefined;
}

/** First column (0 = ones) where subtracting b from a borrows, or undefined. */
function firstBorrowCol(a: number, b: number): number | undefined {
  let borrow = 0;
  for (let col = 0; col < 6; col++) {
    const da = Math.floor(a / 10 ** col) % 10;
    const db = Math.floor(b / 10 ** col) % 10;
    if (da - borrow < db) return col;
    borrow = da - borrow < db ? 1 : 0;
  }
  return undefined;
}

/** The place name rendered in the current language ("chục"), or undefined past ten thousands. */
function renderPlace(col: number): string | undefined {
  const place = PLACES[col];
  if (place === undefined) return undefined;
  return renderNumbersPrompt({ key: `item_${place}` });
}

/** |w − answer| is a power of ten ≥ 10 (a one-digit slip at some column). */
function isPowerOfTenDiff(w: number, answer: number): boolean {
  const d = Math.abs(w - answer);
  let p = 10;
  while (p <= d) {
    if (p === d) return true;
    p *= 10;
  }
  return false;
}

/** The column to re-check, rendered in the current language ("chục"): for add, the
 * carried 1 lands in the next column; for sub, the borrow happens in the column
 * itself. Undefined past ten thousands (no place key). */
function checkPlace(a: number, b: number, isAdd: boolean): string | undefined {
  const col = isAdd ? firstCarryCol(a, b) : firstBorrowCol(a, b);
  if (col === undefined) return undefined;
  return renderPlace(isAdd ? col + 1 : col);
}

/** Shared diagnosis for one add/sub step. R38 (Q2): a wrong answer that matches
 * the full digit-by-digit "forgot the carry" / "no borrow" pattern gets the
 * NON-assertive check-form, not a claim that the child forgot the carry — the same
 * number could be a slip, and a check reminder is never wrong. The pattern check
 * still comes first: "no borrow" can coincide with the wrong-operation value
 * (100 − 59 = 41, but subtracting without borrowing gives 159 = 100 + 59). */
export function explainCalcStep(
  a: number,
  b: number,
  isAdd: boolean,
  w: number,
  answer: number,
  opSymbol: string,
): WrongAnswerExplanation {
  const fallback: WrongAnswerExplanation = {
    key: 'carryFallback',
    params: { a, op: opSymbol, b },
  };
  if (isAdd) {
    if (w === wrongAddByForgotCarry(a, b)) {
      const place = checkPlace(a, b, true);
      if (place === undefined) return fallback;
      return { key: 'carryCheckAdd', params: { col: place } };
    }
    if (w === a - b) return { key: 'carryWrongOpAdd', params: { a, b } };
    if (isPowerOfTenDiff(w, answer) && countAddCarries(a, b) > 0) {
      const place = checkPlace(a, b, true);
      if (place === undefined) return fallback;
      return { key: 'carryCheckAdd', params: { col: place } };
    }
    return fallback;
  }
  if (w === wrongSubByNoBorrow(a, b)) {
    const place = checkPlace(a, b, false);
    if (place === undefined) return fallback;
    return { key: 'carryCheckSub', params: { col: place } };
  }
  if (w === a + b) return { key: 'carryWrongOpSub', params: { a, b } };
  if (isPowerOfTenDiff(w, answer) && countSubBorrows(a, b) > 0) {
    const place = checkPlace(a, b, false);
    if (place === undefined) return fallback;
    return { key: 'carryCheckSub', params: { col: place } };
  }
  return fallback;
}
