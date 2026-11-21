import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { TIME_SKILLS, timeItemForSkill } from './time-item-for-skill';
import { renderTimePrompt } from './time-strings';
import { promptsOf, UNRENDERED } from './time-test-prompts';

afterEach(() => setLanguage('vi'));

describe('time strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of TIME_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 40; seed++)
            for (const p of promptsOf(timeItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderTimePrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(UNRENDERED);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('renders KNTT wording, digital times, Roman numerals and weekdays', () => {
    expect(renderTimePrompt({ key: 'digital', params: { h: 8, mm: '05' } })).toBe('8:05');
    expect(renderTimePrompt({ key: 'digital', params: { h: 20, mm: '15' } })).toBe('20:15');
    expect(renderTimePrompt({ key: 'roman', params: { r: 'VIII' } })).toBe('VIII');
    expect(renderTimePrompt({ key: 'hour', params: { h: 8 } })).toBe('8 giờ');
    expect(renderTimePrompt({ key: 'wd_1' })).toBe('thứ Hai');
    expect(renderTimePrompt({ key: 'wd_0' })).toBe('Chủ nhật');
    expect(
      renderTimePrompt({
        key: 'seq',
        params: { a: '8:15', b: '9:30', c: '10:00' },
      }),
    ).toBe('8:15, 9:30, 10:00');
    setLanguage('en');
    expect(renderTimePrompt({ key: 'wd_1' })).toBe('Monday');
    expect(renderTimePrompt({ key: 'hour', params: { h: 8 } })).toBe("8 o'clock");
    expect(
      renderTimePrompt({
        key: 'askWeekday',
        params: { d: 15 },
      }),
    ).toBe('What day of the week is the 15th?');
  });
});
