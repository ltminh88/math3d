// Arithmetic strings (phase 09): every prompt of every item renders fully in vi and en.
// RED-first: the strings table and the render function do not exist yet.
import { afterEach, describe, expect, it } from 'vitest';
import { promptsOf } from '../geometry/geometry-test-prompts';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { ARITHMETIC_SKILLS, arithmeticItemForSkill } from './arithmetic-item-for-skill';
import { renderArithmeticPrompt } from './arithmetic-strings';

const UNRENDERED = /[{}]|^(arithmetic|reasoning|geometry)\.|\bi:[a-z]/;

afterEach(() => setLanguage('vi'));

describe('arithmetic strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of ARITHMETIC_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 40; seed++)
            for (const p of promptsOf(arithmeticItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderArithmeticPrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(UNRENDERED);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('renders SGK grouping for big numbers (narrow no-break space)', () => {
    expect(renderArithmeticPrompt({ key: 'addCalc', params: { a: 45678, b: 12345 } })).toBe(
      'Tính: 45 678 + 12 345.',
    );
    expect(renderArithmeticPrompt({ key: 'askSum' })).toBe('Tổng bằng bao nhiêu?');
    setLanguage('en');
    expect(renderArithmeticPrompt({ key: 'addCalc', params: { a: 45678, b: 12345 } })).toBe(
      'Work out: 45 678 + 12 345.',
    );
    expect(renderArithmeticPrompt({ key: 'askSum' })).toBe('What is the sum?');
  });

  it('renders word-problem nouns (no raw i: keys)', () => {
    expect(
      renderArithmeticPrompt({
        key: 'wpAddHave',
        params: { name: 'Mai', item: 'i:marble', a: 245, b: 132 },
      }),
    ).toBe('Mai có 245 viên bi. Mai mua thêm 132 viên bi.');
  });
});
