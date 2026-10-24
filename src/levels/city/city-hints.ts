// Hint rungs of the city (pure): 1 encourage, 2 split the 6-9 factor into 5 + rest (colour bands
// on the building), 3 skip count (floor by floor in a windows round), 4 a known fact: the swapped
// table when it is one of 2-5 or 10, else a near square (7 × 8 = 7 × 7 + 7) or counting back from
// ten. Reverse delivery has its own rungs that never name the right parcel: compare with the
// house number, rule out a parcel not tried yet, then the inverse division with a "?".
import type { HintRung } from '../../learning/hint-ladder';
import type { CityRoundKind, ParcelOption } from './city-round-flow';

/** Tables the child met before the city (bridge, field, forest) plus the easy ×10. */
export const KNOWN_TABLES: readonly number[] = [2, 3, 4, 5, 10];

export type CityHintKey =
  | 'hint1'
  | 'hintSplit'
  | 'hintSkip'
  | 'hintCount'
  | 'hintCommute'
  | 'hintNearSquare'
  | 'hintTen'
  | 'hintReverse1'
  | 'hintReverseCompare'
  | 'hintReverseRuleOut'
  | 'hintReverseDivide';

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
  kind?: CityRoundKind;
  /** Reverse delivery: the parcels on the road and the waiting house number. */
  parcels?: readonly ParcelOption[];
  product?: number;
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
  // Count back from ten on the factor closest to 10: 6 × 9 = 6 × 10 - 6.
  const [a, b] = t <= m ? [t, m] : [m, t];
  const back = 10 - b;
  return { ...base, key: 'hintTen', params: { a, b, back, ten: a * 10, minus: a * back } };
}

/** Reverse delivery: `tried` holds the parcel values the child already gave. */
function reverseHint(rung: HintRung, fact: Fact, tried: readonly number[]): CityHint {
  const p = fact.table * fact.other;
  const base = { rung, bands: null, steps: [] };
  if (rung <= 1) return { ...base, key: 'hintReverse1', params: { p } };
  if (rung === 2) return { ...base, key: 'hintReverseCompare', params: { p } };
  const open = (fact.parcels ?? []).filter((x) => !x.correct && !tried.includes(x.value));
  const ruleOut = open.find((x) => x.label.includes('×')) ?? open[0];
  if (rung === 3 && ruleOut) {
    const params = { label: ruleOut.label, value: ruleOut.value, p };
    return { ...base, key: 'hintReverseRuleOut', params };
  }
  return { ...base, key: 'hintReverseDivide', params: { p, t: fact.table } };
}

export function cityHint(rung: HintRung, fact: Fact, tried: readonly number[] = []): CityHint {
  const { table: t, other: m } = fact;
  if (fact.kind === 'reverse') return reverseHint(rung, fact, tried);
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
      key: fact.kind === 'deliver' ? 'hintCount' : 'hintSkip',
      params: { t, m, steps: steps.join(', ') },
      bands: null,
      steps,
    };
  }
  return knownFact(rung, fact);
}
