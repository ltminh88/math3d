// Length strings (boost, Phase 1B): every prompt of every length item renders
// fully in vi and en — no leftover {param}, no raw namespaced key, no
// untranslated noun.
import { afterEach, describe, expect, it } from 'vitest';
import { promptsOf, UNRENDERED } from '../geometry/geometry-test-prompts';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { LENGTH_SKILLS, lengthItemForSkill } from './length-item-for-skill';
import { renderMeasurementPrompt } from './measurement-strings';

afterEach(() => setLanguage('vi'));

describe('length strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of LENGTH_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 40; seed++)
            for (const p of promptsOf(lengthItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderMeasurementPrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(UNRENDERED);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('renders quantities and mixed values with their units', () => {
    expect(renderMeasurementPrompt({ key: 'lenQty', params: { n: 3, unit: 'm' } })).toBe('3 m');
    expect(
      renderMeasurementPrompt({
        key: 'lenMixed',
        params: { a: 1, ua: 'm', b: 5, ub: 'cm' },
      }),
    ).toBe('1 m 5 cm');
    expect(
      renderMeasurementPrompt({
        key: 'lenLadder',
        params: { chain: '1 m = 10 dm = ?' },
      }),
    ).toBe('Điền số còn thiếu: 1 m = 10 dm = ?');
  });
});
