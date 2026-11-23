// KNTT B47: Roman numerals I..XX — read a numeral, write a numeral, fill a sequence.
// Tiers raise the traps: tier 1 stays within X, tier 2 reaches XX, tier 3 leans on the
// subtractive numerals (IV, IX, XIV, XIX) and the IX/XI swap. No scenes: the items are
// plain text, so they render in the dialog at every tier.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import { numberStep, optionsFrom, ref } from '../reasoning/reasoning-distractors';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { numberItem } from './numbers-distractors';
import { toRoman } from './roman-numerals';

/** Additive misread: IV read as I+V = 6, IX as 11, XIV as 16. */
const ADD_MISREAD: Record<number, number> = { 4: 6, 9: 11, 14: 16 };
/** Dropped leading X: XIX read as IX = 9. */
const DROP_MISREAD: Record<number, number> = { 19: 9 };

/** Wrong values for `n`: the misreads first, then near misses — always within I..XX. */
function romanDistractors(n: number): number[] {
  const pool = [ADD_MISREAD[n], DROP_MISREAD[n], n - 1, n + 1, n - 2, n + 2].filter(
    (v): v is number => v !== undefined && v >= 1 && v <= 20 && v !== n,
  );
  return [...new Set(pool)].slice(0, 3);
}

/** A number `n` (tier 1: within X; tier 2: up to XX; tier 3: the subtractive traps). */
function pickRoman(rng: Rng, tier: SkillTier): number {
  if (tier === 1) return randInt(rng, 1, 10);
  if (tier === 2) return randInt(rng, 11, 20);
  if (rng() < 0.5) return pick(rng, [4, 9, 14, 19]);
  return randInt(rng, 1, 20);
}

/** MCQ with Arabic-number options for the Roman numeral of `n`. */
function romanNumberStep(rng: Rng, n: number): ReasoningStep {
  return {
    kind: 'choice',
    prompt: ref('askRound'),
    options: optionsFrom(
      rng,
      n,
      romanDistractors(n).map((value) => ({ value, misconception: 'near-miss' as const })),
      (v) => ref('num', { n: v }),
    ),
  };
}

/** MCQ with Roman-numeral options for the number `n`. */
function romanTextStep(rng: Rng, n: number): ReasoningStep {
  return {
    kind: 'choice',
    prompt: ref('askRoman'),
    options: optionsFrom(
      rng,
      toRoman(n),
      romanDistractors(n).map((value) => ({
        value: toRoman(value),
        misconception: 'near-miss' as const,
      })),
      (r) => ref('romanText', { r }),
    ),
  };
}

/** "Số La Mã {roman} bằng bao nhiêu?" — pick the Arabic value. */
export const romanToNumber = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'roman-to-number';
  const n = pickRoman(rng, tier);
  return numberItem(skillId, tier, ref('romanToNumber', { roman: toRoman(n) }), [
    romanNumberStep(rng, n),
  ]);
};

/** "Số {n} viết bằng số La Mã là gì?" — pick the numeral. */
export const numberToRoman = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'number-to-roman';
  const n = pickRoman(rng, tier);
  return numberItem(skillId, tier, ref('numberToRoman', { n }), [romanTextStep(rng, n)]);
};

/** A run of four numerals with one gap: pick the missing numeral, or its Arabic value. */
export const romanSequence = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'roman-sequence';
  const s = tier === 1 ? 1 : tier === 2 ? -1 : pick(rng, [1, -1] as const);
  const a = s === 1 ? randInt(rng, 1, 16) : randInt(rng, 5, 20);
  const seq = [a, a + s, a + 2 * s, a + 3 * s];
  // The gap is never at the ends, so both neighbours anchor the missing value.
  const missing = pick(rng, [1, 2]);
  const shown = seq.map((v, i) => (i === missing ? '?' : toRoman(v))).join(', ');
  const story = ref('romanSequence', { seq: shown });
  const want = seq[missing] as number;
  if (pick(rng, ['choice', 'pad']) === 'pad')
    // The pad asks for the Arabic value, so the question says so explicitly
    // ("viết bằng số thường") — a Roman sequence must not leave the child guessing
    // which script to type (review feedback on PR #55).
    return numberItem(skillId, tier, story, [numberStep(ref('askMissingArabic'), want)]);
  return numberItem(skillId, tier, story, [romanTextStep(rng, want)]);
};
