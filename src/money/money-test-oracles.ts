// Test-only helpers (imported by *.test.ts): recompute money facts from an item's raw data
// (scene notes, formatted prompt params, option labels), independently from the generators.
import { numbersOfItem } from '../reasoning/reasoning-test-oracles';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { DENOMINATIONS } from './money-ranges';
import type { MoneyItem } from './money-scene-types';

/** "50 000" -> 50000 (SGK grouping stripped). */
export function parseMoney(s: string): number {
  // \s covers the shared formatter's narrow no-break space (U+202F) as well as
  // a plain space, so both groupings parse back to the same number.
  return Number(s.replace(/\s/g, ''));
}

/** The numeric value of a step: the number answer, or the correct amount/count choice. */
export function stepValue(step: ReasoningStep | undefined): number {
  if (step?.kind === 'number') return step.answer;
  if (step?.kind === 'choice') {
    const correct = step.options.find((o) => o.correct);
    if (correct?.label.key === 'vnd') return parseMoney(String(correct.label.params?.s));
    if (correct?.label.key === 'num') return Number(correct.label.params?.n);
  }
  throw new Error('step has no numeric value');
}

export const lastValue = (item: MoneyItem): number => stepValue(item.steps.at(-1));

/** Note values on the table (scene), or [] for a scene-free item. */
export function notesOf(item: MoneyItem): readonly number[] {
  return item.scene?.kind === 'notes' ? item.scene.notes.map((n) => n.value) : [];
}

/** The pick-notes target, parsed from the step prompt's formatted `{target}` param. */
export function targetOfPick(item: MoneyItem): number {
  const step = item.steps[0];
  if (step?.kind !== 'multi') throw new Error('pick-notes item has no multi step');
  return parseMoney(String(step.prompt.params?.target));
}

/** Letters of the correct options of a multi step. */
export function correctLetters(item: MoneyItem): readonly string[] {
  const step = item.steps[0];
  if (step?.kind !== 'multi') throw new Error('item has no multi step');
  return step.options.filter((o) => o.correct).map((o) => String(o.label.params?.l));
}

/** Greedy-free brute force: the smallest number of `notes` summing to `target`, and how
 * many subsets of that size do it (0 when no subset sums to the target). */
export function bruteForceMinNotes(
  notes: readonly number[],
  target: number,
): { min: number; count: number } {
  let min = Number.POSITIVE_INFINITY;
  let count = 0;
  for (let mask = 1; mask < 1 << notes.length; mask++) {
    let sum = 0;
    let size = 0;
    for (let i = 0; i < notes.length; i++) {
      if (mask & (1 << i)) {
        sum += notes[i] as number;
        size++;
      }
    }
    if (sum !== target) continue;
    if (size < min) {
      min = size;
      count = 1;
    } else if (size === min) {
      count++;
    }
  }
  return { min, count };
}

/** Smallest denomination strictly above `n` (the paid note), recomputed from the table. */
export const smallestAbove = (n: number): number | undefined => DENOMINATIONS.find((d) => d > n);

/** Recompute every number of an item for the cap check: raw numbers plus formatted money
 * strings ("50 000" -> 50000) from prompt params. */
export function allNumbers(item: MoneyItem): number[] {
  const out = [...numbersOfItem(item)];
  for (const note of notesOf(item)) out.push(note);
  const collect = (params: Record<string, string | number> | undefined): void => {
    for (const v of Object.values(params ?? {})) {
      if (typeof v === 'string' && /^[\d\s]+$/.test(v)) out.push(parseMoney(v));
    }
  };
  collect(item.story.params);
  for (const step of item.steps) {
    collect(step.prompt.params);
    if (step.kind === 'choice' || step.kind === 'multi')
      for (const o of step.options) collect(o.label.params);
  }
  return out;
}
