// Family prompt registry (phase 07): every family with a generator has a prompt
// renderer, so no prompt ever shows as a raw key in the shared dialog. The test
// renders one fixed-seed item per skill and tier through its family's renderer
// and asserts no prompt comes back as its own key ("numbers.askNumber").

import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { SKILL_CATALOG } from '../learning/skill-catalog';
import type { SkillTier } from '../learning/skill-tiers';
import type { PromptRef, ReasoningItem, ReasoningStep } from '../reasoning/reasoning-types';
import { registeredPromptFamilies, renderPromptFor } from './family-prompt-registry';
import { familyOfSkill, itemForSkill } from './item-for-skill';

/** Every prompt a rendered item shows: story, each step, option labels, verdict fix. */
function promptsOf(item: ReasoningItem): PromptRef[] {
  const out: PromptRef[] = [item.story];
  for (const step of item.steps) out.push(...promptsOfStep(step));
  return out;
}

function promptsOfStep(step: ReasoningStep): PromptRef[] {
  if (step.kind === 'number') return [step.prompt];
  if (step.kind === 'choice' || step.kind === 'multi')
    return [step.prompt, ...step.options.map((o) => o.label)];
  return [step.prompt, step.statement, ...(step.fix ? [step.fix.prompt] : [])];
}

describe('family prompt registry', () => {
  it('registers geometry, measurement, number, fraction, time and money', () => {
    expect([...registeredPromptFamilies()].sort()).toEqual([
      'fraction',
      'geometry',
      'measurement',
      'money',
      'number',
      'time',
    ]);
  });

  it('falls back to the same reasoning renderer for unregistered families', () => {
    expect(renderPromptFor('arithmetic')).toBe(renderPromptFor('word-problem'));
    expect(renderPromptFor('arithmetic')).toBe(renderPromptFor(undefined));
  });

  it('renders every prompt of every generated item (no raw key)', () => {
    const tiers: SkillTier[] = [1, 2, 3];
    let checked = 0;
    for (const entry of SKILL_CATALOG) {
      for (const tier of tiers) {
        let item: ReasoningItem;
        try {
          item = itemForSkill(entry.id, mulberry32(1000 + tier), tier);
        } catch {
          continue; // No generator yet — a later family phase adds one + its renderer.
        }
        const render = renderPromptFor(familyOfSkill(entry.id));
        for (const prompt of promptsOf(item)) {
          const shown = render(prompt);
          expect(shown, `${entry.id} t${tier} ${prompt.key} rendered as raw key`).not.toContain(
            prompt.key,
          );
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
