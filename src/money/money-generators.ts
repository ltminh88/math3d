// Money generators (note skills, phase 14): recognize a note, total notes, exchange one
// note for smaller ones, pick notes for an amount. Scenes are plain-data 'notes' cards;
// the phase-17 renderer draws them.
import { pick, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { type Candidate, ref } from '../reasoning/reasoning-distractors';
import {
  countChoiceStep,
  LETTERS,
  letterOptions,
  moneyChoiceStep,
  moneySceneItem,
  multiPickStep,
  notesScene,
} from './money-distractors';
import { DENOMINATIONS, TOTAL_MAX } from './money-ranges';
import type { MoneyGenerator } from './money-scene-types';
import { formatMoney } from './money-strings';

const sum = (ns: readonly number[]): number => ns.reduce((a, b) => a + b, 0);

const RECOGNIZE_BY_TIER: Record<SkillTier, readonly number[]> = {
  1: [1000, 2000, 5000, 10000],
  2: [10000, 20000, 50000],
  3: [100000, 200000, 500000],
};

export const moneyRecognize: MoneyGenerator = (rng, tier) => {
  const value = pick(rng, RECOGNIZE_BY_TIER[tier]);
  const idx = DENOMINATIONS.indexOf(value);
  const candidates: Candidate<number>[] = [];
  if (value * 10 <= 500000) candidates.push({ value: value * 10, misconception: 'extra-zero' });
  const tenth = value / 10;
  if (Number.isInteger(tenth) && tenth >= 1000)
    candidates.push({ value: tenth, misconception: 'extra-zero' });
  const prev = DENOMINATIONS[idx - 1];
  if (prev !== undefined) candidates.push({ value: prev, misconception: 'wrong-note' });
  const next = DENOMINATIONS[idx + 1];
  if (next !== undefined) candidates.push({ value: next, misconception: 'wrong-note' });
  const step = moneyChoiceStep(rng, ref('askRecognize'), value, candidates, 500000);
  return moneySceneItem(
    'money-recognize',
    tier,
    ref('recognizeStory'),
    [step],
    notesScene([{ value }]),
    [value],
  );
};

const TOTAL_POOL: Record<SkillTier, readonly number[]> = {
  1: [1000, 2000, 5000],
  2: [1000, 2000, 5000, 10000, 20000],
  3: [5000, 10000, 20000, 50000, 100000],
};

export const moneyTotalNotes: MoneyGenerator = (rng, tier) => {
  const count = tier === 1 ? 2 : tier === 2 ? 3 : pick(rng, [3, 4] as const);
  const pool = TOTAL_POOL[tier];
  const notes: number[] = [];
  let remaining = TOTAL_MAX;
  for (let k = 0; k < count; k++) {
    const maxPick = remaining - (count - k - 1) * 1000;
    const avail = pool.filter((d) => d <= maxPick);
    const v = pick(rng, avail.length > 0 ? avail : [1000]);
    notes.push(v);
    remaining -= v;
  }
  const total = sum(notes);
  const min = Math.min(...notes);
  const candidates: Candidate<number>[] = [
    { value: total - min, misconception: 'missed-note' },
    { value: total + min, misconception: 'double-counted' },
  ];
  const step = moneyChoiceStep(rng, ref('askTotal'), total, candidates);
  return moneySceneItem(
    'money-total-notes',
    tier,
    ref('totalStory'),
    [step],
    notesScene(notes.map((value) => ({ value }))),
    [total],
  );
};

/** (big, small) pairs with big / small in {2, 5, 10}. */
const EXCHANGE_BY_TIER: Record<SkillTier, readonly (readonly [number, number])[]> = {
  1: [
    [5000, 1000],
    [10000, 1000],
    [10000, 2000],
    [10000, 5000],
  ],
  2: [
    [20000, 2000],
    [20000, 10000],
    [50000, 5000],
    [50000, 10000],
  ],
  3: [
    [100000, 10000],
    [100000, 20000],
    [100000, 50000],
    [200000, 20000],
    [200000, 100000],
    [500000, 50000],
    [500000, 100000],
  ],
};

export const moneyExchange: MoneyGenerator = (rng, tier) => {
  const [big, small] = pick(rng, EXCHANGE_BY_TIER[tier]) as readonly [number, number];
  const count = big / small;
  const candidates: Candidate<number>[] = [];
  if (count * 2 <= 100) candidates.push({ value: count * 2, misconception: 'wrong-exchange' });
  if (count % 2 === 0) candidates.push({ value: count / 2, misconception: 'wrong-exchange' });
  const step = countChoiceStep(
    rng,
    ref('askExchange', { small: formatMoney(small) }),
    count,
    candidates,
  );
  return moneySceneItem(
    'money-exchange',
    tier,
    ref('exchangeStory', { big: formatMoney(big), small: formatMoney(small) }),
    [step],
    notesScene([{ value: big }]),
    [count],
  );
};

/** Notes shown per tier (answer notes + distractors), and the answer size range. */
const PICK_SHOWN: Record<SkillTier, number> = { 1: 3, 2: 4, 3: 5 };

/** True when exactly one subset of `notes` sums to `target` and it has `size` notes. */
function uniqueMinimal(notes: readonly number[], target: number, size: number): boolean {
  let min = Number.POSITIVE_INFINITY;
  let count = 0;
  for (let mask = 1; mask < 1 << notes.length; mask++) {
    let s = 0;
    let n = 0;
    for (let i = 0; i < notes.length; i++) {
      if (mask & (1 << i)) {
        s += notes[i] as number;
        n++;
      }
    }
    if (s !== target) continue;
    if (n < min) {
      min = n;
      count = 1;
    } else if (n === min) {
      count++;
    }
  }
  return min === size && count === 1;
}

export const moneyPickNotes: MoneyGenerator = (rng, tier) => {
  const shown = PICK_SHOWN[tier];
  const answerSize = tier === 1 ? 2 : (pick(rng, tier === 2 ? [2, 3] : [2, 3, 4]) as number);
  // Answer notes: distinct denominations, so a value identifies its card unambiguously.
  const answerPool = shuffle(rng, [50000, 20000, 10000, 5000, 2000, 1000]);
  const answer = answerPool.slice(0, answerSize);
  const target = answer.reduce((a, b) => a + b, 0);
  // Distractors: denominations outside the answer, re-rolled until the minimal set is
  // unique (brute-forced here; the test oracle re-checks independently).
  const distractorPool = DENOMINATIONS.filter((d) => !answer.includes(d) && d <= 50000);
  let notes: number[] = [];
  for (let attempt = 0; attempt < 50; attempt++) {
    const distractors = shuffle(rng, distractorPool).slice(0, shown - answerSize);
    const candidate = shuffle(rng, [...answer, ...distractors]);
    if (uniqueMinimal(candidate, target, answerSize)) {
      notes = candidate;
      break;
    }
  }
  if (notes.length === 0) {
    // Fallback: fill to `shown` notes without the uniqueness check (the sweep re-checks;
    // the 50 attempts above make this near-impossible to reach).
    const distractors = shuffle(rng, distractorPool).slice(0, shown - answerSize);
    notes = shuffle(rng, [...answer, ...distractors]);
  }
  const answerSet = new Set(answer);
  const sceneNotes = notes.map((value, i) => ({ value, label: LETTERS[i] as string }));
  const options = letterOptions(notes.map((v) => ({ correct: answerSet.has(v) })));
  const step = multiPickStep(
    ref(tier === 3 ? 'askPickFewest' : 'askPick', { target: formatMoney(target) }),
    options,
  );
  return moneySceneItem(
    'money-pick-notes',
    tier,
    ref('pickStory'),
    [step],
    notesScene(sceneNotes),
    [target],
  );
};
