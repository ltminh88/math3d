// Prompt rendering checks for money items: every prompt an item shows must render in both
// languages with no raw template left.
import type { PromptRef } from '../reasoning/reasoning-types';
import type { MoneyItem } from './money-scene-types';

export function promptsOf(item: MoneyItem): PromptRef[] {
  const out: PromptRef[] = [item.story];
  for (const step of item.steps) {
    out.push(step.prompt);
    if (step.kind === 'choice' || step.kind === 'multi')
      for (const o of step.options) out.push(o.label);
    if (step.kind === 'verdict') out.push(step.statement);
  }
  return out;
}

/**
 * A rendered prompt must never leak a raw key: no braces, no `i:` noun, and no
 * "<namespace>.<key>" anywhere in the text (review #40: the old `^money\.` anchor only
 * caught a raw key at the start — "money.item_marble" mid-sentence slipped through).
 */
export const UNRENDERED =
  /[{}]|\bi:[a-z]|\b(?:money|reasoning|fraction|time|geometry|measurement|numbers|arithmetic|data)\.[a-z_]+/;
