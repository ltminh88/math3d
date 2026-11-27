// Format generators (boost, Phase 1A): the five new add/sub formats. Every pair
// comes from the ladder picker at the tier's ladder step, every wrong option
// from the bug catalogue when a bug applies (a near-miss slip only fills a gap).
import { pick, type Rng, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { NumberScene } from '../numbers/numbers-scene-types';
import { pickName } from '../reasoning/reasoning-distractors';
import type { ChoiceOption, ReasoningGenerator, ReasoningStep } from '../reasoning/reasoning-types';
import { barModelWp } from './add-sub-bar-model-word-problems';
import { type AddSubBug, type AddSubOp, bugsFor } from './add-sub-bug-catalogue';
import { ladderOfSkillTier, pickLadderPair } from './add-sub-pair-pickers';
import { arithmeticItem, numberChoiceStepCapped, ref, wrongBySlip } from './arithmetic-distractors';
import { RANGE_1000 } from './arithmetic-ranges';

const CAP = RANGE_1000;

const correctOf = (a: number, b: number, op: AddSubOp): number => (op === '+' ? a + b : a - b);

/** One pair from the tier's ladder step, with the operation picked at random. */
const formatPair = (rng: Rng, tier: SkillTier): { a: number; b: number; op: AddSubOp } => {
  const ladder = ladderOfSkillTier(rng, tier);
  const op: AddSubOp = rng() < 0.5 ? '+' : '−';
  const [a, b] = pickLadderPair(rng, op, ladder);
  return { a, b, op };
};

/** A pair with a bug trap when one exists, retrying a few times for it. */
const formatPairWithTrap = (
  rng: Rng,
  tier: SkillTier,
): { a: number; b: number; op: AddSubOp; bugs: readonly { bug: AddSubBug; value: number }[] } => {
  let pair = formatPair(rng, tier);
  let bugs = bugsFor(pair.a, pair.b, pair.op).filter((f) => f.value <= CAP);
  for (let t = 0; t < 50 && bugs.length === 0; t++) {
    pair = formatPair(rng, tier);
    bugs = bugsFor(pair.a, pair.b, pair.op).filter((f) => f.value <= CAP);
  }
  return { ...pair, bugs };
};

/** Pick the right answer out of four: the correct value plus up to three bug values. */
export const bugChoice: ReasoningGenerator = (rng, tier) => {
  let best:
    | { a: number; b: number; op: AddSubOp; bugs: readonly { bug: AddSubBug; value: number }[] }
    | undefined;
  for (let t = 0; t < 200; t++) {
    const pair = formatPair(rng, tier);
    const bugs = bugsFor(pair.a, pair.b, pair.op).filter((f) => f.value <= CAP);
    if (!best || bugs.length > best.bugs.length) best = { ...pair, bugs };
    if (bugs.length >= 3) break;
  }
  const { a, b, op, bugs } = best ?? { a: 100, b: 100, op: '+' as AddSubOp, bugs: [] };
  const correct = correctOf(a, b, op);
  const candidates = bugs.slice(0, 3).map((f) => ({ value: f.value, misconception: f.bug }));
  return arithmeticItem(
    'add-sub-bug-choice',
    tier,
    ref(op === '+' ? 'addCalc' : 'subCalc', { a, b }),
    [numberChoiceStepCapped(rng, ref('askChooseResult'), correct, candidates, CAP)],
  );
};

/** Đúng/Sai on a worked result: the false value is a bug value when one applies. */
export const trueFalse: ReasoningGenerator = (rng, tier) => {
  const { a, b, op } = formatPair(rng, tier);
  const isAdd = op === '+';
  const correct = correctOf(a, b, op);
  const truth = rng() < 0.5;
  let shown = correct;
  if (!truth) {
    const bugs = bugsFor(a, b, op).filter((f) => f.value <= CAP);
    shown = bugs.length > 0 ? pick(rng, bugs).value : wrongBySlip(correct, rng);
    if (shown === correct || shown > CAP) shown = wrongBySlip(correct, rng);
    if (shown === correct || shown > CAP) shown = correct > 0 ? correct - 1 : 1;
  }
  const name = pickName(rng);
  const step: ReasoningStep = {
    kind: 'verdict',
    prompt: ref('isNameTrue', { name }),
    statement: ref('stmtEq', { text: `${a} ${op} ${b}`, value: shown }),
    answer: truth,
    ...(truth ? {} : { fix: { prompt: ref('askCorrect'), answer: correct } }),
  };
  return arithmeticItem(
    'add-sub-true-false',
    tier,
    ref(isAdd ? 'errorAdd' : 'errorSub', { name, a, b, shown }),
    [step],
    truth ? [] : [correct],
  );
};

const nearest100 = (n: number): number => Math.round(n / 100) * 100;

/**
 * Estimate or compare: either the nearest hundred (a bug's hundred is the trap)
 * or < = > against a bug value (the bug value is the "=" trap). The sign shape
 * only runs when a bug applies; the hundred shape always can.
 */
export const compareEstimate: ReasoningGenerator = (rng, tier) => {
  const { a, b, op, bugs } = formatPairWithTrap(rng, tier);
  const correct = correctOf(a, b, op);
  if (bugs.length > 0 && rng() < 0.5) {
    const hit = pick(rng, bugs);
    const c = hit.value;
    const signKey = correct < c ? 'cmpLt' : correct === c ? 'cmpEq' : 'cmpGt';
    const mk = (key: 'cmpLt' | 'cmpEq' | 'cmpGt', i: number): ChoiceOption => {
      const base = { id: `o${i}`, label: ref(key), correct: key === signKey };
      if (key === signKey) return base;
      return {
        ...base,
        misconception: key === 'cmpEq' ? hit.bug : ('wrong-sign' as const),
      };
    };
    const options = shuffle(rng, [mk('cmpLt', 0), mk('cmpEq', 1), mk('cmpGt', 2)]);
    return arithmeticItem('add-sub-compare-estimate', tier, ref('compareCalc', { a, op, b, c }), [
      { kind: 'choice', prompt: ref('askCompareSign'), options },
    ]);
  }
  const correctHundred = nearest100(correct);
  const seen = new Set<number>([correctHundred]);
  const candidates: { value: number; misconception: AddSubBug | 'near-miss' }[] = [];
  for (const f of bugs) {
    const hundred = nearest100(f.value);
    if (seen.has(hundred)) continue;
    seen.add(hundred);
    candidates.push({ value: hundred, misconception: f.bug });
  }
  // Hundred-step fillers so the options are always hundreds, never a ±1 slip.
  for (const d of [100, -100, 200, -200]) {
    const hundred = correctHundred + d;
    if (hundred < 0 || hundred > CAP || seen.has(hundred)) continue;
    seen.add(hundred);
    candidates.push({ value: hundred, misconception: 'near-miss' });
  }
  return arithmeticItem('add-sub-compare-estimate', tier, ref('estimateCalc', { a, op, b }), [
    numberChoiceStepCapped(rng, ref('askNearestHundred'), correctHundred, candidates, CAP, 3),
  ]);
};

/** Number-line jumps of 100/10/1: the scene shows the jumps, the last landing is '?'. */
export const numberLine: ReasoningGenerator = (rng, tier) => {
  const { a, b, op } = formatPair(rng, tier);
  const isAdd = op === '+';
  const parts = [Math.floor(b / 100) * 100, Math.floor((b % 100) / 10) * 10, b % 10].filter(
    (part) => part > 0,
  );
  const jumps: { from: number; by: number }[] = [];
  let landing = a;
  for (const part of parts) {
    const by = isAdd ? part : -part;
    jumps.push({ from: landing, by });
    landing += by;
  }
  const correct = landing;
  const marks = [a, ...jumps.map((j) => j.from + j.by)];
  const bugs = bugsFor(a, b, op).filter((f) => f.value <= CAP);
  const candidates = bugs.map((f) => ({ value: f.value, misconception: f.bug }));
  const jumpsText = jumps.map((j) => (j.by >= 0 ? `+${j.by}` : `${j.by}`)).join(', ');
  const scene: NumberScene = {
    kind: 'number-line',
    start: a,
    step: isAdd ? 1 : -1,
    marks,
    missing: [marks.length - 1],
    jumps,
  };
  return arithmeticItem(
    'add-sub-number-line',
    tier,
    ref('numberLineJumps', { start: a, jumps: jumpsText }),
    [numberChoiceStepCapped(rng, ref('askLanding'), correct, candidates, CAP)],
    [],
    scene,
  );
};

export const ADD_SUB_FORMAT_GENERATORS: Record<string, ReasoningGenerator> = {
  'add-sub-bug-choice': bugChoice,
  'add-sub-true-false': trueFalse,
  'add-sub-compare-estimate': compareEstimate,
  'add-sub-number-line': numberLine,
  'add-sub-bar-model-wp': barModelWp,
};
