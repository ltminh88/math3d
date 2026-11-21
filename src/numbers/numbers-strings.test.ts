// Numbers strings (phase 07): every prompt of every item renders fully in vi and en.
// RED-first: the strings table and the render function do not exist yet.
import { afterEach, describe, expect, it } from 'vitest';
import { promptsOf } from '../geometry/geometry-test-prompts';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { NUMBER_SKILLS, numberItemForSkill } from './number-item-for-skill';
import { renderNumbersPrompt } from './numbers-strings';

const UNRENDERED = /[{}]|^(numbers|reasoning|geometry)\.|\bi:[a-z]/;

afterEach(() => setLanguage('vi'));

describe('numbers strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of NUMBER_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 40; seed++)
            for (const p of promptsOf(numberItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderNumbersPrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(UNRENDERED);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('renders KNTT wording for place value and the sign options', () => {
    expect(renderNumbersPrompt({ key: 'matchParts3', params: { a: 3, b: 4, c: 5 } })).toBe(
      'Số gồm 3 trăm 4 chục 5 đơn vị. Viết số đó.',
    );
    expect(renderNumbersPrompt({ key: 'signGt' })).toBe('>');
    setLanguage('en');
    expect(renderNumbersPrompt({ key: 'matchParts3', params: { a: 3, b: 4, c: 5 } })).toBe(
      'The number has 3 hundreds, 4 tens and 5 ones. Write it.',
    );
  });
});
