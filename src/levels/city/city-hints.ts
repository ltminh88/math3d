// Hint rungs of the city (pure): 1 encourage, 2 split the 6-9 factor into 5 + rest (colour bands
// on the building), 3 skip count floor by floor, 4 a known fact: the swapped table when it is
// one of 2-5 or 10, else a near square (7 × 8 = 7 × 7 + 7) or counting back from ten.
import type { HintRung } from '../../learning/hint-ladder';

/** Tables the child met before the city (bridge, field, forest) plus the easy ×10. */
export const KNOWN_TABLES: readonly number[] = [2, 3, 4, 5, 10];

export type CityHintKey =
  | 'hint1'
  | 'hintSplit'
  | 'hintSkip'
  | 'hintCommute'
  | 'hintNearSquare'
  | 'hintTen';

export interface CityHint {
  readonly rung: HintRung;
  readonly key: CityHintKey;
  readonly params: Readonly<Record<string, number | string>>;
  /** Rung 2: windows of each floor in two colours, 5 then the rest. */
  readonly bands: { first: number; rest: number } | null;
  /** Rung 3: running totals per floor, the last one left as "?". */
  readonly steps: readonly string[];
}

interface Fact {
  /** The 6-9 factor (windows per floor). */
  table: number;
  /** The other factor (floors). */
  other: number;
}

/** Skip counting by `table` once per floor: "8, 16, 24, ?". */
export function skipSteps({ table, other }: Fact): string[] {
  return Array.from({ length: other }, (_, i) => (i === other - 1 ? '?' : String(table * (i + 1))));
}

function knownFact(rung: HintRung, { table: t, other: m }: Fact): CityHint {
  const base = { rung, bands: null, steps: [] };
  if (KNOWN_TABLES.includes(m)) return { ...base, key: 'hintCommute', params: { t, m } };
  if (Math.abs(t - m) === 1) {
    const s = Math.min(t, m);
    return { ...base, key: 'hintNearSquare', params: { t, m, s, square: s * s } };
  }
  const back = 10 - m;
  return { ...base, key: 'hintTen', params: { t, m, back, ten: t * 10, minus: t * back } };
}

export function cityHint(rung: HintRung, fact: Fact): CityHint {
  const { table: t, other: m } = fact;
  if (rung <= 1) return { rung, key: 'hint1', params: {}, bands: null, steps: [] };
  if (rung === 2) {
    const rest = t - 5;
    return {
      rung,
      key: 'hintSplit',
      params: { t, rest, m, five: 5 * m, part: rest * m },
      bands: { first: 5, rest },
      steps: [],
    };
  }
  if (rung === 3) {
    const steps = skipSteps(fact);
    return {
      rung,
      key: 'hintSkip',
      params: { t, m, steps: steps.join(', ') },
      bands: null,
      steps,
    };
  }
  return knownFact(rung, fact);
}
