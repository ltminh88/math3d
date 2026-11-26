// Wrong values per bug (boost, Phase 1B): each function returns the value a child
// makes when they hold that bug, or null when the bug cannot produce a distinct
// whole value <= LENGTH_LADDER_MAX for this conversion. Generators tag options with
// these bugs; the sweep test checks every wrong option's value against this file,
// so a bug and its value never drift apart. 'ignore-unit' is reused from Phase 0.
import type { Rng } from '../learning/seeded-rng';
import { type Candidate, optionsFrom, ref } from '../reasoning/reasoning-distractors';
import type { Misconception, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { convertLength, type LengthUnit, MM_PER_UNIT, rungsBetween } from './length-units';
import { LENGTH_LADDER_MAX } from './measurement-ranges';

/** Whole, positive, within the ladder cap, and not the answer. */
function usable(n: number | null, answer: number): number | null {
  if (n === null || !Number.isInteger(n) || n <= 0 || n > LENGTH_LADDER_MAX || n === answer)
    return null;
  return n;
}

/**
 * Converting `value` from `from` to `to`, done with the given bug.
 * - unit-direction: the inverse factor (multiply where the conversion divides).
 * - unit-factor: one x10 step instead of the full jump (far jumps only).
 * - dm-skipped: two x10 steps on a three-rung jump (m<->mm only).
 * - ignore-unit: the bare number, kept as-is.
 */
export function bugConvertValue(
  bug: Misconception,
  value: number,
  from: LengthUnit,
  to: LengthUnit,
): number | null {
  const answer = convertLength(value, from, to);
  if (answer === null) return null;
  const down = MM_PER_UNIT[from] > MM_PER_UNIT[to];
  switch (bug) {
    case 'unit-direction':
      return usable(convertLength(value, to, from), answer);
    case 'unit-factor': {
      if (rungsBetween(from, to) < 2) return null;
      const wrong = down ? value * 10 : value / 10;
      return usable(Number.isInteger(wrong) ? wrong : null, answer);
    }
    case 'dm-skipped': {
      if (rungsBetween(from, to) !== 3) return null;
      const wrong = down ? value * 100 : value / 100;
      return usable(Number.isInteger(wrong) ? wrong : null, answer);
    }
    case 'ignore-unit':
      return usable(value, answer);
    default:
      return null;
  }
}

/**
 * `big` bigUnit + `small` smallUnit written as one number in `to`, with the bug.
 * - mixed-concat: the digits glued together (1 m 5 cm -> 15 cm).
 * - mixed-drop-big: only the small part, converted to `to` (1 m 5 cm -> 5 cm).
 * - unit-factor: the big part converted one step short, then the small part added.
 */
export function bugMixedValue(
  bug: Misconception,
  big: number,
  bigUnit: LengthUnit,
  small: number,
  smallUnit: LengthUnit,
  to: LengthUnit,
): number | null {
  const totalMm = big * MM_PER_UNIT[bigUnit] + small * MM_PER_UNIT[smallUnit];
  const answer = totalMm / MM_PER_UNIT[to];
  if (!Number.isInteger(answer)) return null;
  switch (bug) {
    case 'mixed-concat':
      return usable(Number(`${big}${small}`), answer);
    case 'mixed-drop-big':
      return usable(convertLength(small, smallUnit, to), answer);
    case 'unit-factor': {
      // One x10 step for the big part (1 m -> 10 cm), small part converted fully.
      const smallFull = convertLength(small, smallUnit, to);
      if (smallFull === null) return null;
      const oneStepDown = (big * MM_PER_UNIT[bigUnit]) / 10 / MM_PER_UNIT[to] + smallFull;
      return usable(Number.isInteger(oneStepDown) ? oneStepDown : null, answer);
    }
    default:
      return null;
  }
}

/**
 * `mm` written as a mixed pair (bigUnit, smallUnit), with the bug.
 * - unit-factor: the big part divided by 10 instead of the full jump.
 * - ignore-unit: no conversion at all (0 big, the whole number small).
 */
export function bugMixedPair(
  bug: Misconception,
  mm: number,
  bigUnit: LengthUnit,
  smallUnit: LengthUnit,
): { readonly big: number; readonly small: number } | null {
  const bigMm = MM_PER_UNIT[bigUnit];
  const smallMm = MM_PER_UNIT[smallUnit];
  const big = Math.floor(mm / bigMm);
  const small = (mm % bigMm) / smallMm;
  if (!Number.isInteger(small) || small < 0) return null;
  switch (bug) {
    case 'unit-factor': {
      // Big part one step short: 105 cm -> 10 m 5 cm.
      const wrongBig = Math.floor(mm / (bigMm / 10));
      const wrongSmall = (mm % (bigMm / 10)) / smallMm;
      if (!Number.isInteger(wrongSmall) || wrongSmall < 0) return null;
      if (wrongBig === big && wrongSmall === small) return null;
      return { big: wrongBig, small: wrongSmall };
    }
    case 'ignore-unit':
      if (big === 0) return null;
      return { big: 0, small: mm / smallMm };
    default:
      return null;
  }
}

const NEAR = [1, -1, 2, -2, 10, -10, 100, -100, 3, -3];

/** "3 m", "105 cm": a quantity option label (unit is a plain symbol, never translated). */
export const lenQtyLabel = (n: number, unit: LengthUnit): PromptRef => ref('lenQty', { n, unit });

/**
 * A choice of 3-4 quantities in `unit`: the answer, bug-tagged values, then near
 * misses (all whole, > 0, <= LENGTH_LADDER_MAX). Candidates that collide with the
 * answer or each other are dropped, so every option's bug still matches its value.
 */
export function lenQtyChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  unit: LengthUnit,
  candidates: readonly Candidate<number>[],
): ReasoningStep {
  const valid = candidates.filter(
    (c) => Number.isInteger(c.value) && c.value > 0 && c.value <= LENGTH_LADDER_MAX,
  );
  const near: Candidate<number>[] = NEAR.map((d) => ({
    value: answer + d,
    misconception: 'near-miss' as const,
  })).filter((c) => c.value > 0 && c.value <= LENGTH_LADDER_MAX);
  return {
    kind: 'choice',
    prompt,
    options: optionsFrom(rng, answer, [...valid, ...near], (n) => lenQtyLabel(n, unit)),
  };
}

/**
 * A choice of 3-4 text options (signs, orders, units, mixed pairs): no near-miss
 * fill — the caller supplies every option, each tagged with its bug.
 */
export function lenTextChoiceStep<T>(
  rng: Rng,
  prompt: PromptRef,
  answer: T,
  candidates: readonly Candidate<T>[],
  toLabel: (value: T) => PromptRef,
): ReasoningStep {
  return {
    kind: 'choice',
    prompt,
    options: optionsFrom(rng, answer, candidates, toLabel, 4),
  };
}

/** Distinct bug-tagged candidates for one answer (first bug wins on a value clash). */
export function dedupeCandidates(
  candidates: readonly Candidate<number>[],
  answer: number,
): Candidate<number>[] {
  const seen = new Set<number>([answer]);
  const out: Candidate<number>[] = [];
  for (const c of candidates) {
    if (seen.has(c.value)) continue;
    seen.add(c.value);
    out.push(c);
  }
  return out;
}
