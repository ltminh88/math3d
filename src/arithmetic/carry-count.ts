// Carry counting (phase 09): how many digit positions carry (add) or borrow (sub),
// and whether a borrow propagates through a zero digit. Pure, no imports — the tier
// axis of the arithmetic family is carries, so this is the shared tier-selection helper.
const digitsOf = (n: number): number[] => String(n).split('').reverse().map(Number);

/** Carry count of a + b: positions where the digit sum plus the incoming carry reaches 10. */
export function countAddCarries(a: number, b: number): number {
  const da = digitsOf(a);
  const db = digitsOf(b);
  let carry = 0;
  let count = 0;
  for (let i = 0; i < Math.max(da.length, db.length); i++) {
    const s = (da[i] ?? 0) + (db[i] ?? 0) + carry;
    if (s >= 10) {
      count++;
      carry = 1;
    } else {
      carry = 0;
    }
  }
  return count;
}

/** Borrow count of a − b (a >= b): positions where the digit minus the incoming borrow goes below 0. */
export function countSubBorrows(a: number, b: number): number {
  const da = digitsOf(a);
  const db = digitsOf(b);
  let borrow = 0;
  let count = 0;
  for (let i = 0; i < Math.max(da.length, db.length); i++) {
    if ((da[i] ?? 0) - borrow - (db[i] ?? 0) < 0) {
      count++;
      borrow = 1;
    } else {
      borrow = 0;
    }
  }
  return count;
}

/** True when a borrow in a − b (a >= b) propagates through a zero digit of `a`. */
export function hasBorrowAcrossZero(a: number, b: number): boolean {
  const da = digitsOf(a);
  const db = digitsOf(b);
  let borrow = 0;
  for (let i = 0; i < Math.max(da.length, db.length); i++) {
    if (borrow === 1 && (da[i] ?? 0) === 0) return true;
    if ((da[i] ?? 0) - borrow - (db[i] ?? 0) < 0) borrow = 1;
    else borrow = 0;
  }
  return false;
}

/** Carry count of a × b (b a single digit): positions where digit × b plus the incoming carry reaches 10. */
export function countMulCarries(a: number, b: number): number {
  const da = digitsOf(a);
  let carry = 0;
  let count = 0;
  for (const d of da) {
    const v = d * b + carry;
    if (v >= 10) {
      count++;
      carry = Math.floor(v / 10);
    } else {
      carry = 0;
    }
  }
  return count;
}
