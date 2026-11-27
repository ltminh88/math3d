// English books (two-modes Phase 1): the CEC descriptor equals today's
// constants, the Look descriptor pins its 29 ids and one seed unit.
import { describe, expect, it } from 'vitest';
import { unitForStage } from './content/units';
import { ENGLISH_BOOKS } from './english-books';
import { ENGLISH_SKILL_IDS } from './english-skill-entries';
import { LOOK_SKILL_IDS } from './look-skill-ids';

describe('ENGLISH_BOOKS.cec', () => {
  it('mirrors today constants: 8 stages, 8 rounds, 41 skills, pack key current', () => {
    const cec = ENGLISH_BOOKS.cec;
    expect(cec.id).toBe('cec');
    expect(cec.levelId).toBe('island');
    expect(cec.stages).toBe(8);
    expect(cec.rounds).toBe(8);
    expect(cec.skillIds).toBe(ENGLISH_SKILL_IDS);
    expect(cec.skillIds).toHaveLength(41);
    expect(cec.packKey).toBe('current');
    expect(cec.spelling).toBe('en-US');
    expect(cec.stageNames).toEqual(['A–D', 'E–H', 'I–L', 'M–P', 'Q–T', 'U–X', 'Y–Z', 'A–Z']);
    expect(cec.unitForStage(1)).toBe(unitForStage(1));
    expect(cec.unitForStage(8).skillIds).toBe(ENGLISH_SKILL_IDS);
  });
});

describe('ENGLISH_BOOKS.look', () => {
  it('pins 29 ids in order, 8 stages, pack key look, one seed unit', () => {
    const look = ENGLISH_BOOKS.look;
    expect(look.id).toBe('look');
    expect(look.levelId).toBe('look');
    expect(look.stages).toBe(8);
    expect(look.rounds).toBe(8);
    expect(look.skillIds).toBe(LOOK_SKILL_IDS);
    expect(look.skillIds).toHaveLength(29);
    expect(look.skillIds.slice(0, 3)).toEqual([
      'en-look-starter-numbers',
      'en-look-starter-colors',
      'en-look-starter-greetings',
    ]);
    expect(look.skillIds.slice(3, 15)).toEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `en-look-u${n}-words`),
    );
    expect(look.skillIds.slice(15, 27)).toEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `en-look-u${n}-pattern`),
    );
    expect(look.skillIds.slice(27)).toEqual([
      'en-look-phonics-initial',
      'en-look-phonics-short-vowels',
    ]);
    expect(look.packKey).toBe('look');
    expect(look.spelling).toBe('en-US');
    expect(look.stageNames).toEqual([
      'Starter',
      'U1–2',
      'U3–4',
      'U5–6',
      'U7–8',
      'U9–10',
      'U11–12',
      'Review',
    ]);
    const seed = look.unitForStage(1);
    expect(seed.id).toBe('look-starter');
    expect(seed.stage).toBe(1);
    expect(seed.skillIds).toEqual([
      'en-look-starter-numbers',
      'en-look-starter-colors',
      'en-look-starter-greetings',
    ]);
    expect(seed.words).toEqual([]);
    expect(() => look.unitForStage(2)).toThrow('no unit for stage 2');
  });
});
