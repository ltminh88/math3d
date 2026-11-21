// Test-only helpers (imported by *.test.ts): recompute data facts from an item's raw data
// (scene table/tally/bag/dice, prompt params, option labels), independently from the
// generators. Chance verdicts are enumerated from the scene, never copied from the item.
import { numbersOfItem } from '../reasoning/reasoning-test-oracles';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import type { ChanceVerdict } from './data-distractors';
import type { BagItem, DataItem } from './data-scene-types';

/** The numeric value of a step: the number answer, or the correct count choice. */
export function stepValue(step: ReasoningStep | undefined): number {
  if (step?.kind === 'number') return step.answer;
  if (step?.kind === 'choice') {
    const correct = step.options.find((o) => o.correct);
    if (correct?.label.key === 'num') return Number(correct.label.params?.n);
  }
  throw new Error('step has no numeric value');
}

export const lastValue = (item: DataItem): number => stepValue(item.steps.at(-1));

/** The correct label key of a label step (chance word or table header). */
export function stepLabel(step: ReasoningStep | undefined): string {
  if (step?.kind === 'choice') {
    const correct = step.options.find((o) => o.correct);
    if (correct) return correct.label.key;
  }
  throw new Error('step has no label value');
}

/** The table scene of an item (throws for non-table items). */
export function tableOf(item: DataItem) {
  if (item.scene?.kind !== 'data-table') throw new Error('item has no data-table scene');
  return item.scene;
}

/** The tally marks of an item (throws for non-tally items). */
export function tallyOf(item: DataItem): readonly boolean[] {
  if (item.scene?.kind !== 'tally') throw new Error('item has no tally scene');
  return item.scene.marks;
}

/** The bag scene of an item (throws for non-bag items). */
export function bagOf(item: DataItem) {
  if (item.scene?.kind !== 'bag') throw new Error('item has no bag scene');
  return item.scene;
}

/** The dice scene of an item (throws for non-dice items). */
export function diceOf(item: DataItem) {
  if (item.scene?.kind !== 'dice') throw new Error('item has no dice scene');
  return item.scene;
}

export type BagEvent =
  | { readonly kind: 'one'; readonly colour: string }
  | { readonly kind: 'two'; readonly colour: string }
  | { readonly kind: 'mixed'; readonly colour1: string; readonly colour2: string };

/**
 * Enumerate every possible draw of `pick` marbles from the bag (distributions over
 * colours, each within its count) and classify the event: certain when every draw
 * satisfies it, possible when some draw does, impossible when no draw does.
 */
export function verdictOfBag(
  items: readonly BagItem[],
  pick: number,
  event: BagEvent,
): ChanceVerdict {
  const colours = items.map((i) => i.colour);
  const counts = new Map<string, number>(items.map((i) => [i.colour, i.count]));
  let any = false;
  let all = true;
  const walk = (at: number, left: number, taken: Map<string, number>): void => {
    if (at === colours.length) {
      if (left !== 0) return;
      const holds = (() => {
        if (event.kind === 'one') return taken.get(event.colour) === 1;
        if (event.kind === 'two') return taken.get(event.colour) === 2;
        return (taken.get(event.colour1) ?? 0) >= 1 && (taken.get(event.colour2) ?? 0) >= 1;
      })();
      any = any || holds;
      all = all && holds;
      return;
    }
    const colour = colours[at] as string;
    const max = Math.min(counts.get(colour) ?? 0, left);
    for (let n = 0; n <= max; n++) {
      taken.set(colour, n);
      walk(at + 1, left - n, taken);
    }
    taken.delete(colour);
  };
  walk(0, pick, new Map());
  if (all) return 'certain';
  if (any) return 'possible';
  return 'impossible';
}

export type DiceEvent = { readonly kind: 'face'; readonly face: number } | { readonly kind: 'all' };

/** Faces 1..6 satisfying the event (0, 1 or 6): the die always shows one of them. */
export function diceSatisfying(event: DiceEvent): number {
  if (event.kind === 'all') return 6;
  return event.face >= 1 && event.face <= 6 ? 1 : 0;
}

/** The verdict for a dice event: certain when all 6 faces satisfy it, else possible/impossible. */
export function verdictOfDice(event: DiceEvent): ChanceVerdict {
  const n = diceSatisfying(event);
  if (n === 6) return 'certain';
  if (n > 0) return 'possible';
  return 'impossible';
}

/** Recompute every number of an item for the cap check: raw numbers plus scene data. */
export function allNumbers(item: DataItem): number[] {
  const out = [...numbersOfItem(item)];
  const scene = item.scene;
  if (scene?.kind === 'data-table')
    for (const row of scene.rows) for (const cell of row) if (cell !== null) out.push(cell);
  if (scene?.kind === 'tally') {
    out.push(scene.marks.length);
    out.push(scene.marks.filter(Boolean).length);
  }
  if (scene?.kind === 'bag') for (const b of scene.items) out.push(b.count, scene.pick);
  if (scene?.kind === 'dice') {
    out.push(scene.up);
    if (scene.other !== undefined) out.push(scene.other);
    for (const h of scene.hidden ?? []) out.push(h);
  }
  return out;
}
