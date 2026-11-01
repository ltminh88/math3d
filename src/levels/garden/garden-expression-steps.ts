// Seed-bag rounds teach the order of operations: before any value, the child taps the part to
// do first (inside the brackets, else × or :). The other pairs of neighbouring numbers are the
// wrong first moves: left to right, or the brackets ignored. Pure; the item keeps its generator
// steps after a "first part" choice and the value of that part.
import type { Rng } from '../../learning/seeded-rng';
import { expressionChoiceStep, numberStep, ref } from '../../reasoning/reasoning-distractors';
import type { Misconception, ReasoningItem } from '../../reasoning/reasoning-types';

export interface FirstOperation {
  /** The part done first, as it reads in the expression (`28 + 12`). */
  part: string;
  /** Other neighbouring pairs a child might compute first. */
  others: { text: string; misconception: Misconception }[];
}

const TOKEN = /\d+|[+−×:()]/g;

/** `(28 + 12) × 2 − 15` → part `28 + 12`, others `12 × 2`, `2 − 15`. */
export function firstOperation(text: string): FirstOperation {
  const tokens: string[] = text.match(TOKEN) ?? [];
  const open = tokens.indexOf('(');
  const flat = tokens.filter((t) => t !== '(' && t !== ')');
  const pairs: string[] = [];
  for (let i = 1; i + 1 < flat.length; i += 2)
    pairs.push(`${flat[i - 1]} ${flat[i]} ${flat[i + 1]}`);
  let part: string;
  if (open >= 0) {
    const close = tokens.indexOf(')', open);
    part = tokens.slice(open + 1, close).join(' ');
  } else {
    part = pairs.find((p) => /[×:]/.test(p)) ?? pairs[0] ?? text;
  }
  const others = pairs
    .filter((p) => p !== part)
    .map((p) => ({
      text: p,
      misconception: (open >= 0 && /[×:]/.test(p)
        ? 'ignore-brackets'
        : 'left-to-right') as Misconception,
    }));
  return { part, others };
}

/** An `exprValue` item with "which part first?" and the value of that part in front. */
export function withFirstOpStep(item: ReasoningItem, rng: Rng): ReasoningItem {
  if (item.story.key !== 'exprValue') return item;
  const { part, others } = firstOperation(String(item.story.params?.text ?? ''));
  if (others.length === 0) return item;
  const candidates = others.map((o) => ({ value: o.text, misconception: o.misconception }));
  const choose = expressionChoiceStep(rng, ref('gardenFirstOp'), part, candidates);
  const partValue = numberStep(ref('askPart', { text: part }), item.work[0] as number);
  const rest = item.steps.filter((s) => s.prompt.key !== 'askPart');
  return { ...item, steps: [choose, partValue, ...rest] };
}
