// Family prompt registry (phase 07): prompt renderers self-register through
// `import.meta.glob`, so a later family adds one `*-prompt-renderer.ts` file in
// its own folder and nothing else changes. The map is built once at import time;
// a duplicate family fails fast. Reasoning is the default: a family with no
// registered renderer renders through the reasoning namespace — the same default
// the step card uses. Phase 06 reuses this registry for its lesson runs.

import type { SkillFamily } from '../learning/skill-entry';
import { renderPrompt as renderReasoningPrompt } from '../reasoning/reasoning-strings';
import type { PromptRef } from '../reasoning/reasoning-types';

export interface FamilyPromptRenderer {
  readonly families: readonly SkillFamily[];
  readonly renderPrompt: (prompt: PromptRef) => string;
}

type PromptModule = { promptRenderer: FamilyPromptRenderer };

const modules = import.meta.glob('../*/*-prompt-renderer.ts', {
  eager: true,
}) as Record<string, PromptModule>;

const renderers = new Map<SkillFamily, (prompt: PromptRef) => string>();
for (const [path, mod] of Object.entries(modules)) {
  const renderer = mod.promptRenderer;
  if (!renderer) throw new Error(`family prompt: ${path} does not export promptRenderer`);
  for (const family of renderer.families) {
    if (renderers.has(family))
      throw new Error(`family prompt: duplicate renderer for "${family}" in ${path}`);
    renderers.set(family, renderer.renderPrompt);
  }
}

/** The families with a registered prompt renderer (reasoning is the default). */
export function registeredPromptFamilies(): readonly SkillFamily[] {
  return [...renderers.keys()];
}

/** The prompt renderer for a family: its registered one, or reasoning by default. */
export function renderPromptFor(family: SkillFamily | undefined): (prompt: PromptRef) => string {
  const found = family === undefined ? undefined : renderers.get(family);
  return found ?? renderReasoningPrompt;
}
