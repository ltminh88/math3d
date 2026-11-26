// Compare / order / choose-the-unit generators (boost, Phase 1B). Order items use
// a choice step until 2B lands the `order` step kind — the options are full
// orderings, so the item is playable today and the scene can arrive later.
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { type Candidate, reasoningItem, ref } from '../reasoning/reasoning-distractors';
import type { Misconception, ReasoningItem } from '../reasoning/reasoning-types';
import { lenTextChoiceStep } from './length-bug-catalogue';
import { formatQty, LENGTH_LADDER, type LengthUnit, MM_PER_UNIT } from './length-units';

type Qty = { readonly n: number; readonly unit: LengthUnit; readonly mm: number };

const qty = (n: number, unit: LengthUnit): Qty => ({ n, unit, mm: n * MM_PER_UNIT[unit] });

/** Two different units; L0-1 stays adjacent, higher rungs roam the ladder. */
function twoUnits(rng: Rng, ladder: number): readonly [LengthUnit, LengthUnit] {
  if (ladder < 2) {
    const i = randInt(rng, 0, LENGTH_LADDER.length - 2);
    return [LENGTH_LADDER[i] as LengthUnit, LENGTH_LADDER[i + 1] as LengthUnit];
  }
  const [a, b] = shuffle(rng, LENGTH_LADDER) as [LengthUnit, LengthUnit];
  return [a, b];
}

/** meas-len-compare: < = > across units. */
export const measLenCompare = (rng: Rng, tier: SkillTier, ladder: number): ReasoningItem => {
  const [ua, ub] = twoUnits(rng, ladder);
  const stepA = MM_PER_UNIT[ua];
  const aMm = randInt(rng, Math.ceil(20 / stepA), Math.floor(1000 / stepA)) * stepA;
  const a = qty(aMm / stepA, ua);
  // Equal a quarter of the time (only when the value divides into the other unit);
  // otherwise a nearby value in the other unit — always a whole multiple of it,
  // so the shown number is never fractional.
  const stepB = MM_PER_UNIT[ub];
  const equal = rng() < 0.25 && aMm % stepB === 0;
  let bMm: number;
  if (equal) {
    bMm = aMm;
  } else {
    const near = [1, 2, 3, 5]
      .flatMap((k) => [aMm + k * stepB, aMm - k * stepB])
      .filter((v) => v >= 10 && v <= 1000 && v !== aMm && v % stepB === 0);
    bMm =
      near.length > 0
        ? pick(rng, near)
        : ([stepB, stepB * 2, stepB * 10].find((v) => v <= 1000 && v !== aMm) ?? aMm);
  }
  const b = qty(bMm / stepB, ub);
  const sign = a.mm === b.mm ? '=' : a.mm > b.mm ? '>' : '<';
  const wrongSigns = (['<', '=', '>'] as const).filter((s) => s !== sign);
  const bareOrder = a.n === b.n ? '=' : a.n > b.n ? '>' : '<';
  const candidates: Candidate<string>[] = wrongSigns.map((s) => ({
    value: s,
    misconception: (s === '='
      ? 'near-miss'
      : bareOrder === s
        ? 'ignore-unit'
        : 'unit-direction') as Misconception,
  }));
  return reasoningItem('meas-len-compare', tier, ref('lenCompare', { a: a.n, ua, b: b.n, ub }), [
    lenTextChoiceStep(rng, ref('lenPickSign'), sign, candidates, (s) => ref('lenSign', { s })),
  ]);
};

/** Three quantities, smallest first; the wrong orders name the bug. */
export const measLenOrder = (rng: Rng, tier: SkillTier, ladder: number): ReasoningItem => {
  const pool: readonly LengthUnit[] = ladder < 2 ? ['dm', 'cm', 'mm'] : ['m', 'dm', 'cm', 'mm'];
  const mms = new Set<number>();
  while (mms.size < 3) mms.add(randInt(rng, 1, 100) * 10);
  const used = new Set<LengthUnit>();
  const quantities = [...mms].map((mm) => {
    const dividing = pool.filter((u) => mm % MM_PER_UNIT[u] === 0);
    const fresh = dividing.filter((u) => !used.has(u));
    const unit = pick(rng, fresh.length > 0 ? fresh : dividing);
    used.add(unit);
    return qty(mm / MM_PER_UNIT[unit], unit);
  });
  const shown = shuffle(rng, quantities);
  const seqOf = (qs: readonly Qty[]): string => qs.map((q) => formatQty(q.n, q.unit)).join(', ');
  const labelFor = (qs: readonly Qty[]): { a: string; b: string; c: string } => ({
    a: formatQty(qs[0]?.n ?? 0, qs[0]?.unit ?? 'cm'),
    b: formatQty(qs[1]?.n ?? 0, qs[1]?.unit ?? 'cm'),
    c: formatQty(qs[2]?.n ?? 0, qs[2]?.unit ?? 'cm'),
  });
  const correct = [...quantities].sort((x, y) => x.mm - y.mm);
  const reversed = [...correct].reverse();
  const bare = [...quantities].sort((x, y) => x.n - y.n);
  const wrongs: { qs: readonly Qty[]; bug: Misconception }[] = [];
  const addWrong = (qs: readonly Qty[], bug: Misconception): void => {
    if (seqOf(qs) !== seqOf(correct) && !wrongs.some((w) => seqOf(w.qs) === seqOf(qs)))
      wrongs.push({ qs, bug });
  };
  addWrong(reversed, 'unit-direction');
  addWrong(bare, 'ignore-unit');
  if (wrongs.length < 2) {
    // Bare order agreed with the true order: swap the first two as a near miss.
    const swapped = [correct[1], correct[0], correct[2]] as [Qty, Qty, Qty];
    addWrong(swapped, 'near-miss');
  }
  const options = wrongs.slice(0, 2).map((w) => ({
    value: seqOf(w.qs),
    misconception: w.bug,
  }));
  return reasoningItem('meas-len-order', tier, ref('lenOrder', labelFor(shown)), [
    lenTextChoiceStep(rng, ref('lenPickOrder'), seqOf(correct), options, (s) => {
      const qs = [correct, ...wrongs.map((w) => w.qs)].find((o) => seqOf(o) === s) ?? correct;
      return ref('lenSeq3', labelFor(qs));
    }),
  ]);
};

interface LenObject {
  readonly item: string;
  readonly unit: LengthUnit;
  readonly n: number;
}

/** Everyday objects and their true length (exported for the sweep oracle). */
export const OBJECTS: readonly LenObject[] = [
  { item: 'i:pencil', unit: 'cm', n: 15 },
  { item: 'i:eraser', unit: 'cm', n: 4 },
  { item: 'i:ribbon', unit: 'cm', n: 50 },
  { item: 'i:leaf', unit: 'cm', n: 8 },
  { item: 'i:crayon', unit: 'cm', n: 10 },
  { item: 'i:book', unit: 'cm', n: 25 },
  { item: 'i:ruler', unit: 'cm', n: 30 },
  { item: 'i:notebook', unit: 'dm', n: 2 },
  { item: 'i:handspan', unit: 'dm', n: 2 },
  { item: 'i:desk', unit: 'm', n: 1 },
  { item: 'i:door', unit: 'm', n: 2 },
  { item: 'i:rope', unit: 'm', n: 3 },
  { item: 'i:cloth', unit: 'm', n: 2 },
  { item: 'i:road', unit: 'm', n: 50 },
  { item: 'i:ant', unit: 'mm', n: 3 },
  { item: 'i:rice', unit: 'mm', n: 5 },
];

/** meas-len-choose-unit: an everyday object, pick its unit (mm objects at L2+). */
export const measLenChooseUnit = (rng: Rng, tier: SkillTier, ladder: number): ReasoningItem => {
  const pool = ladder >= 2 ? OBJECTS : OBJECTS.filter((o) => o.unit !== 'mm');
  const obj = pick(rng, pool);
  const wrong = (['m', 'dm', 'cm', 'mm'] as const).filter((u) => u !== obj.unit);
  return reasoningItem(
    'meas-len-choose-unit',
    tier,
    ref('lenChooseObj', { item: obj.item, n: obj.n }),
    [
      lenTextChoiceStep(
        rng,
        ref('lenPickUnit'),
        obj.unit,
        wrong.map((u) => ({ value: u, misconception: 'wrong-unit' as const })),
        (u) => ref('lenUnit', { unit: u }),
      ),
    ],
  );
};
