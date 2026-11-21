import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { FRACTION_SKILLS, fractionItemForSkill } from './fraction-item-for-skill';
import { renderFractionPrompt } from './fraction-strings';
import { promptsOf, UNRENDERED } from './fraction-test-prompts';

afterEach(() => setLanguage('vi'));

describe('fraction strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of FRACTION_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 200; seed++)
            for (const p of promptsOf(fractionItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderFractionPrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(UNRENDERED);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('renders KNTT wording and fraction words', () => {
    expect(renderFractionPrompt({ key: 'frac', params: { n: 1, d: 3 } })).toBe('1/3');
    expect(renderFractionPrompt({ key: 'word_4' })).toBe('một phần tư');
    expect(
      renderFractionPrompt({
        key: 'setCircleStory',
        params: { count: 8, item: 'i:marble', n: 2 },
      }),
    ).toBe('Có 8 viên bi. Đã khoanh 1/2 số đó.');
    setLanguage('en');
    expect(renderFractionPrompt({ key: 'word_4' })).toBe('one quarter');
    expect(
      renderFractionPrompt({
        key: 'setCircleStory',
        params: { count: 8, item: 'i:marble', n: 2 },
      }),
    ).toBe('There are 8 marbles. 1/2 of them are circled.');
  });
});
