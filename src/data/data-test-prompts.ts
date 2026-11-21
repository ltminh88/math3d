// Prompt rendering checks for data items: every prompt an item shows must render in both
// languages with no raw template left.
import type { PromptRef } from '../reasoning/reasoning-types';
import type { DataItem } from './data-scene-types';

export function promptsOf(item: DataItem): PromptRef[] {
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
 * A rendered prompt must never leak a raw key: no braces, no `i:`/`c:`/`l:` ref, and no
 * "<namespace>.<key>" anywhere in the text (review #40 on money: the old `^money\.`
 * anchor only caught a raw key at the start — a mid-sentence leak slipped through).
 */
export const UNRENDERED =
  /[{}]|\b[icl]:[a-z]|\b(?:money|reasoning|fraction|time|geometry|measurement|numbers|arithmetic|data)\.[a-z_]+/;
