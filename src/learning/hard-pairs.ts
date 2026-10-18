import { type FactKey, mulKey } from './fact-key';

/** Classic confusions: kids who know one product often answer with the other. */
const HARD_PAIRS: ReadonlyArray<readonly [FactKey, FactKey]> = [
  [mulKey(6, 7), mulKey(6, 8)],
  [mulKey(7, 8), mulKey(6, 9)],
  [mulKey(6, 8), mulKey(7, 7)],
  [mulKey(7, 9), mulKey(8, 8)],
  [mulKey(8, 9), mulKey(7, 9)],
  [mulKey(3, 7), mulKey(3, 8)],
  [mulKey(3, 8), mulKey(3, 9)],
  [mulKey(4, 7), mulKey(4, 8)],
  [mulKey(4, 8), mulKey(4, 9)],
  [mulKey(4, 6), mulKey(4, 7)],
  [mulKey(3, 4), mulKey(3, 6)],
  [mulKey(2, 8), mulKey(4, 5)],
];

function productOf(key: FactKey): number {
  const [min, max] = key.slice(4).split('x').map(Number) as [number, number];
  return min * max;
}

/** Products of the facts commonly confused with `key` (empty when it is not a known hard fact). */
export function hardPartnerProducts(key: FactKey): number[] {
  const out: number[] = [];
  for (const [x, y] of HARD_PAIRS) {
    if (x === key) out.push(productOf(y));
    else if (y === key) out.push(productOf(x));
  }
  return out;
}
