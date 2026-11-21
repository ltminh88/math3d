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

export const UNRENDERED = /[{}]|^money\.|\bi:[a-z]/;
