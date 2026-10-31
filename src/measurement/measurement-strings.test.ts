import { afterEach, describe, expect, it } from 'vitest';
import { promptsOf, UNRENDERED } from '../geometry/geometry-test-prompts';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { MEASUREMENT_SKILLS, measurementItemForSkill } from './measurement-item-for-skill';
import { renderMeasurementPrompt } from './measurement-strings';

afterEach(() => setLanguage('vi'));

describe('measurement strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of MEASUREMENT_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 40; seed++)
            for (const p of promptsOf(measurementItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderMeasurementPrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(UNRENDERED);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('translates nouns and falls back to the shared unit labels', () => {
    const story = { key: 'compareCmMm', params: { a: 3, b: 25, x: 'i:pencil', y: 'i:eraser' } };
    expect(renderMeasurementPrompt(story)).toBe('Đo được: bút chì dài 3 cm, cục tẩy dài 25 mm.');
    expect(renderMeasurementPrompt({ key: 'u_cm2' })).toBe('cm²');
    setLanguage('en');
    expect(renderMeasurementPrompt({ key: 'q_degC', params: { n: 37 } })).toBe('37°C');
  });
});
