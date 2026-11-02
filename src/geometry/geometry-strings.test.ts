import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { GEOMETRY_SKILLS, geometryItemForSkill } from './geometry-item-for-skill';
import { renderGeometryPrompt } from './geometry-strings';
import { promptsOf, UNRENDERED } from './geometry-test-prompts';

afterEach(() => setLanguage('vi'));

describe('geometry strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of GEOMETRY_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 40; seed++)
            for (const p of promptsOf(geometryItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderGeometryPrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(UNRENDERED);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('renders KNTT wording, units and translated part nouns', () => {
    expect(renderGeometryPrompt({ key: 'q_cm2', params: { n: 49 } })).toBe('49 cm²');
    expect(renderGeometryPrompt({ key: 'decor', params: { per: 3, part: 'i:vertex' } })).toBe(
      'Bác Hà có một khối lập phương. Bác gắn 3 bông hoa ở mỗi đỉnh.',
    );
    setLanguage('en');
    expect(renderGeometryPrompt({ key: 'pickAll_square' })).toBe('Tap every square, then Done.');
  });
});
