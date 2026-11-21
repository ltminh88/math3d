// Vietnamese note denominations and money ranges (B68, phase 14). Totals in the lesson
// stay ≤ 100 000; recognize also shows the 200 000 and 500 000 notes. Coins (100/200/500
// đồng) are not in this lesson. Amounts are plain numbers here; the SGK thousands
// grouping ("10 000") is applied only when rendering text — see formatMoney in
// money-strings.ts.
export const DENOMINATIONS: readonly number[] = Object.freeze([
  1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000,
]);

/** Largest total a B68 item asks for (phase file). */
export const TOTAL_MAX = 100000;

/** Largest note value shown (recognize T3). */
export const RECOGNIZE_MAX = 500000;

/** Smallest tappable note card, px (same as fractions/time). */
export const MIN_UNIT_PX = 24;

export const isDenomination = (n: number): boolean => DENOMINATIONS.includes(n);

/** Smallest note strictly above `n` (the note a shopper pays with), or undefined. */
export const smallestNoteAbove = (n: number): number | undefined =>
  DENOMINATIONS.find((d) => d > n);

/** Greedy fewest-notes decomposition of `amount` (canonical [1,2,5] system). */
export function greedyNotes(amount: number): readonly number[] {
  const notes: number[] = [];
  let rest = amount;
  for (const d of [...DENOMINATIONS].reverse()) {
    while (rest >= d) {
      notes.push(d);
      rest -= d;
    }
  }
  return notes;
}
