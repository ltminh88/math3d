import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { REASONING_SKILLS, reasoningItemForSkill } from './reasoning-item-for-skill';
import { renderPrompt } from './reasoning-strings';
import type { PromptRef, ReasoningItem } from './reasoning-types';

afterEach(() => setLanguage('vi'));

function prompts(item: ReasoningItem): PromptRef[] {
  const out: PromptRef[] = [item.story];
  for (const s of item.steps) {
    out.push(s.prompt);
    if (s.kind === 'choice' || s.kind === 'multi') out.push(...s.options.map((o) => o.label));
    if (s.kind === 'verdict') out.push(s.statement, ...(s.fix ? [s.fix.prompt] : []));
  }
  return out;
}

describe('reasoning strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of REASONING_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 40; seed++)
            for (const p of prompts(reasoningItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderPrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(/[{}]|^reasoning\.|\bi:[a-z]/);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('translates item nouns', () => {
    const story = { key: 'divRemFloor', params: { total: 29, per: 4, item: 'i:candy' } };
    expect(renderPrompt(story)).toBe('Có 29 cái kẹo, xếp đều vào các hộp, mỗi hộp 4 cái kẹo.');
    setLanguage('en');
    expect(renderPrompt(story)).toBe('There are 29 sweets, packed 4 to a box.');
  });
});
