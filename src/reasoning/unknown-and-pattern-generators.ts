// Find the unknown (KNTT T1 B3, B13) and number patterns (dãy số, luyện tập). Tier 3 unknowns
// need a calculation on the other side first; tier 3 patterns hide a middle term too.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  GENERIC_NOUNS,
  numberChoiceStep,
  numberStep,
  pickName,
  pickNames,
  reasoningItem,
  ref,
} from './reasoning-distractors';
import { MAX_NUMBER, PATTERN_STEPS, TIER_RANGES } from './reasoning-ranges';
import type { ReasoningGenerator, ReasoningStep } from './reasoning-types';

const ASK_X = ref('askUnknown');

/** Phase 02: the same unknown in two wordings ("Dấu ? là số nào?" / "Tìm số còn thiếu:"). */
const unknownStory = (rng: Rng, text: string) =>
  ref(pick(rng, ['unknownEq', 'unknownEqFind'] as const), { text });

function unknownSteps(
  rng: () => number,
  tier: SkillTier,
  x: number,
  trap: number,
  part?: { text: string; value: number },
): ReasoningStep[] {
  if (tier === 1)
    return [numberChoiceStep(rng, ASK_X, x, [{ value: trap, misconception: 'wrong-inverse' }])];
  if (tier === 2 || !part) return [numberStep(ASK_X, x)];
  return [numberStep(ref('askPart', { text: part.text }), part.value), numberStep(ASK_X, x)];
}

/** `? + a = s`, `a + ? = s`, `s − ? = b`, `? − a = b`; tier 3: `? − a = b × c`. */
export const unknownAddSub: ReasoningGenerator = (rng, tier) => {
  const cap = Math.min(TIER_RANGES[tier].maxAddend + 10, MAX_NUMBER);
  if (tier === 3) {
    const b = randInt(rng, 2, 9);
    const c = randInt(rng, 2, Math.floor(60 / b));
    const a = randInt(rng, 1, MAX_NUMBER - b * c);
    const text = `? − ${a} = ${b} × ${c}`;
    const steps = unknownSteps(rng, tier, b * c + a, 0, { text: `${b} × ${c}`, value: b * c });
    return reasoningItem('unknown-add-sub', tier, unknownStory(rng, text), steps, [
      b * c,
      b * c + a,
    ]);
  }
  const s = randInt(rng, 10, cap);
  const a = randInt(rng, 1, s - 1);
  const form = randInt(rng, 0, tier === 1 ? 1 : 3);
  const [text, x, trap] = [
    [`? + ${a} = ${s}`, s - a, s + a],
    [`${a} + ? = ${s}`, s - a, s + a],
    [`${s} − ? = ${a}`, s - a, s + a],
    [`? − ${a} = ${s - a}`, s, s - 2 * a],
  ][form] as [string, number, number];
  const steps = unknownSteps(rng, tier, x, trap);
  return reasoningItem('unknown-add-sub', tier, unknownStory(rng, text), steps, [x]);
};

/** `? × n = p`, `n × ? = p`, `p : ? = q`, `? : n = q`; tier 3: `? × n = a + b`. */
export const unknownMulDiv: ReasoningGenerator = (rng, tier) => {
  const factors = TIER_RANGES[tier].factors;
  const n = pick(rng, factors);
  const q = randInt(rng, 2, tier === 1 ? 5 : Math.min(10, Math.floor(MAX_NUMBER / n)));
  const p = n * q;
  if (tier === 3) {
    const a = randInt(rng, 1, p - 1);
    const text = `? × ${n} = ${a} + ${p - a}`;
    const steps = unknownSteps(rng, tier, q, 0, { text: `${a} + ${p - a}`, value: p });
    return reasoningItem('unknown-mul-div', tier, unknownStory(rng, text), steps, [p, q]);
  }
  const form = randInt(rng, 0, 3);
  const [text, x, trap] = [
    [`? × ${n} = ${p}`, q, p - n],
    [`${n} × ? = ${p}`, q, p - n],
    [`${p} : ? = ${q}`, n, p - q],
    [`? : ${n} = ${q}`, p, q - n > 0 ? q - n : n + q],
  ][form] as [string, number, number];
  const steps = unknownSteps(rng, tier, x, trap);
  return reasoningItem('unknown-mul-div', tier, unknownStory(rng, text), steps, [x]);
};

/** Word-problem form of the same 4 add/sub unknowns (B3): the story names who has what,
 * and the missing number is a count of things, not a bare equation. Tier 3 packs the
 * remaining count as `b` boxes of `c` each, like the bare `? − a = b × c`. */
export const unknownAddSubWp: ReasoningGenerator = (rng, tier) => {
  const cap = Math.min(TIER_RANGES[tier].maxAddend + 10, MAX_NUMBER);
  if (tier === 3) {
    const b = randInt(rng, 2, 9);
    const c = randInt(rng, 2, Math.floor(60 / b));
    const a = randInt(rng, 1, MAX_NUMBER - b * c);
    const [who1, who2] = pickNames(rng);
    const item = pick(rng, GENERIC_NOUNS);
    const story = ref('unknownWpSubPack', { who1, who2, a, b, c, item });
    const steps = unknownSteps(rng, tier, b * c + a, 0, { text: `${b} × ${c}`, value: b * c });
    return reasoningItem('unknown-add-sub-wp', tier, story, steps, [b * c, b * c + a]);
  }
  const s = randInt(rng, 10, cap);
  const a = randInt(rng, 1, s - 1);
  const form = randInt(rng, 0, tier === 1 ? 1 : 3);
  const [who1, who2] = pickNames(rng);
  const item = pick(rng, GENERIC_NOUNS);
  const [key, params, x, trap] = [
    ['unknownWpAddFirst', { who1, who2, a, s, item }, s - a, s + a],
    ['unknownWpAddSecond', { who1, who2, a, s, item }, s - a, s + a],
    ['unknownWpSubSecond', { who1, who2, a, s, item }, s - a, s + a],
    ['unknownWpSubFirst', { who1, who2, a, b: s - a, item }, s, s - 2 * a],
  ][form] as [string, Record<string, number | string>, number, number];
  const steps = unknownSteps(rng, tier, x, trap);
  return reasoningItem('unknown-add-sub-wp', tier, ref(key, params), steps, [x]);
};

/** Word-problem form of the same 4 mul/div unknowns (B13): boxes, packs and fair shares.
 * Tier 3 hides the total as the sum of two children's counts, like `? × n = a + b`. */
export const unknownMulDivWp: ReasoningGenerator = (rng, tier) => {
  const factors = TIER_RANGES[tier].factors;
  const n = pick(rng, factors);
  const q = randInt(rng, 2, tier === 1 ? 5 : Math.min(10, Math.floor(MAX_NUMBER / n)));
  const p = n * q;
  if (tier === 3) {
    const a = randInt(rng, 1, p - 1);
    const [who1, who2] = pickNames(rng);
    const item = pick(rng, GENERIC_NOUNS);
    const story = ref('unknownWpMulSum', { who1, who2, a, b: p - a, n, item });
    const steps = unknownSteps(rng, tier, q, 0, { text: `${a} + ${p - a}`, value: p });
    return reasoningItem('unknown-mul-div-wp', tier, story, steps, [p, q]);
  }
  const form = randInt(rng, 0, 3);
  const who1 = pickName(rng);
  const item = pick(rng, GENERIC_NOUNS);
  const [key, params, x, trap] = [
    ['unknownWpMulBoxes', { who1, n, p, item }, q, p - n],
    ['unknownWpMulEach', { who1, n, p, item }, q, p - n],
    ['unknownWpDivBoxes', { who1, p, q, item }, n, p - q],
    ['unknownWpDivShare', { who1, n, q, item }, p, q - n > 0 ? q - n : n + q],
  ][form] as [string, Record<string, number | string>, number, number];
  const steps = unknownSteps(rng, tier, x, trap);
  return reasoningItem('unknown-mul-div-wp', tier, ref(key, params), steps, [x]);
};

/** Five terms; tier 1 hides the last, tier 2 the last two, tier 3 one in the middle and the last. */
function pattern(
  skillId: string,
  tier: SkillTier,
  terms: number[],
): ReturnType<ReasoningGenerator> {
  const hidden = tier === 1 ? [4] : tier === 2 ? [3, 4] : [2, 4];
  const shown = terms.map((t, i) => (hidden.includes(i) ? '?' : String(t))).join(', ');
  const steps = hidden.map((i) => numberStep(ref('askTerm', { pos: i + 1 }), terms[i] as number));
  return reasoningItem(skillId, tier, ref('patternNext', { terms: shown }), steps, terms);
}

export const patternAdd: ReasoningGenerator = (rng, tier) => {
  const d = pick(rng, PATTERN_STEPS[tier]);
  const start = randInt(rng, 0, MAX_NUMBER - 4 * d);
  return pattern(
    'pattern-add',
    tier,
    [0, 1, 2, 3, 4].map((i) => start + i * d),
  );
};

export const patternSub: ReasoningGenerator = (rng, tier) => {
  const d = pick(rng, PATTERN_STEPS[tier]);
  const start = randInt(rng, 4 * d, MAX_NUMBER);
  return pattern(
    'pattern-sub',
    tier,
    [0, 1, 2, 3, 4].map((i) => start - i * d),
  );
};

/** Counting along a multiplication table (B4-B12); tier 3 counts down. */
export const patternSkipCount: ReasoningGenerator = (rng, tier) => {
  const d = pick(rng, TIER_RANGES[tier].factors);
  const k = randInt(rng, 1, Math.max(1, Math.floor(MAX_NUMBER / d) - 4));
  const up = [0, 1, 2, 3, 4].map((i) => (k + i) * d);
  // Phase 02: tiers 1–2 count down too (tier 3 already did), doubling the pool.
  const down = tier === 3 || rng() < 0.5;
  return pattern('pattern-skip-count', tier, down ? up.reverse() : up);
};
