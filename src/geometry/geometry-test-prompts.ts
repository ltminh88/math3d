// Test-only: every prompt of an item (story, step prompts, option labels, statements, fixes).
import type { PromptRef, ReasoningItem } from '../reasoning/reasoning-types';

export function promptsOf(item: ReasoningItem): PromptRef[] {
  const out: PromptRef[] = [item.story];
  for (const s of item.steps) {
    out.push(s.prompt);
    if (s.kind === 'choice' || s.kind === 'multi') out.push(...s.options.map((o) => o.label));
    if (s.kind === 'verdict') out.push(s.statement, ...(s.fix ? [s.fix.prompt] : []));
  }
  return out;
}

/** A rendered prompt with no leftover {param}, raw namespaced key or untranslated noun. */
export const UNRENDERED = /[{}]|^(geometry|measurement)\.|\bi:[a-z]/;
