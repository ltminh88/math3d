import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { MONEY_SKILLS, moneyItemForSkill } from './money-item-for-skill';
import { formatMoney, renderMoneyPrompt } from './money-strings';
import { promptsOf, UNRENDERED } from './money-test-prompts';

afterEach(() => setLanguage('vi'));

describe('money strings', () => {
  it('every prompt of every item renders fully in vi and en', () => {
    for (const lang of ['vi', 'en'] as const) {
      setLanguage(lang);
      for (const id of MONEY_SKILLS)
        for (const tier of [1, 2, 3] as SkillTier[])
          for (let seed = 0; seed < 200; seed++)
            for (const p of promptsOf(moneyItemForSkill(id, mulberry32(seed), tier))) {
              const text = renderMoneyPrompt(p);
              expect(text, `${lang} ${p.key}`).not.toMatch(UNRENDERED);
              expect(text.length).toBeGreaterThan(0);
            }
    }
  });

  it('formats amounts SGK-style and renders the vnd label', () => {
    expect(formatMoney(1000)).toBe('1 000');
    expect(formatMoney(10000)).toBe('10 000');
    expect(formatMoney(200000)).toBe('200 000');
    expect(formatMoney(500)).toBe('500');
    expect(renderMoneyPrompt({ key: 'vnd', params: { s: formatMoney(10000) } })).toBe(
      '10 000 đồng',
    );
    expect(renderMoneyPrompt({ key: 'askRecognize' })).toBe('Tờ tiền này là bao nhiêu đồng?');
    setLanguage('en');
    expect(renderMoneyPrompt({ key: 'vnd', params: { s: formatMoney(10000) } })).toBe(
      '10 000 dong',
    );
    expect(renderMoneyPrompt({ key: 'askRecognize' })).toBe('How many dong is this banknote?');
  });
});
