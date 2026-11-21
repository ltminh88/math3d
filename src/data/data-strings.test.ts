// Render sweep: every prompt of every data item renders in both languages with no raw
// template left (review #40 on money: the UNRENDERED check must catch "<ns>.<key>"
// anywhere in the text, not just at the start).
import { describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { ref } from '../reasoning/reasoning-distractors';
import { dataItemForSkill } from './data-item-for-skill';
import { renderDataPrompt } from './data-strings';
import { promptsOf, UNRENDERED } from './data-test-prompts';

const SKILLS = [
  'tally-count',
  'table-read',
  'table-max-min',
  'table-sums',
  'table-fill-missing',
  'chance-bag',
  'chance-dice',
] as const;

describe('data strings', () => {
  it('every prompt renders in vi and en with no raw key left (200 seeds)', () => {
    for (const skillId of SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 200; seed++) {
          const item = dataItemForSkill(skillId, mulberry32(seed), tier);
          for (const prompt of promptsOf(item)) {
            setLanguage('vi');
            expect(renderDataPrompt(prompt)).not.toMatch(UNRENDERED);
            setLanguage('en');
            expect(renderDataPrompt(prompt)).not.toMatch(UNRENDERED);
          }
        }
    setLanguage('vi');
  });

  it('chance words, colours and refs render exactly', () => {
    setLanguage('vi');
    expect(renderDataPrompt(ref('chance_certain'))).toBe('Chắc chắn');
    expect(renderDataPrompt(ref('chance_possible'))).toBe('Có thể');
    expect(renderDataPrompt(ref('chance_impossible'))).toBe('Không thể');
    expect(renderDataPrompt(ref('askTableCell', { header: 'i:dog' }))).toBe(
      'Cột con chó có số nào?',
    );
    expect(renderDataPrompt(ref('askRowSum', { row: 'l:week_this' }))).toBe(
      'Cộng cả hàng Tuần này được bao nhiêu?',
    );
    expect(renderDataPrompt(ref('bagEventOne', { colour: 'c:red' }))).toBe('Lấy ra 1 viên bi đỏ.');
    setLanguage('en');
    expect(renderDataPrompt(ref('chance_certain'))).toBe('Certain');
    expect(renderDataPrompt(ref('askTableCell', { header: 'i:dog' }))).toBe(
      'What number is in the dogs column?',
    );
    expect(renderDataPrompt(ref('bagEventOne', { colour: 'c:red' }))).toBe('Draw 1 red marble.');
    setLanguage('vi');
  });
});
