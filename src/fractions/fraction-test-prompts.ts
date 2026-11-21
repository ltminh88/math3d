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
/**
 * A rendered prompt must never leak a raw key: no braces, no `i:` noun, and no
 * "<namespace>.<key>" anywhere in the text (review #40: the old `^fraction\.` anchor
 * only caught a raw key at the start — a mid-sentence leak slipped through).
 */
export const UNRENDERED =
  /[{}]|\bi:[a-z]|\b(?:money|reasoning|fraction|time|geometry|measurement|numbers|arithmetic|data)\.[a-z_]+/;
