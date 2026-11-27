// Look content schema test (two-modes Phase 4): the gate for Look references
// and item shape — mirrors content-schema.test.ts for CEC: every referenced
// id exists; every skill generates ≥ 4 distinct own items; order-words has
// one correct order (3–4 distinct words); fill-pattern has 1 blank, 2–3
// options incl. the answer; every word is American-spelled; no listen item
// without a picture (every bank word has one).
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../../learning/seeded-rng';
import { generateItem, poolFor } from '../../engine/item-generators';
import { kindsForSkill } from '../../engine/item-planner';
import type { EnglishSkillId, EnglishUnit } from '../../english-types';
import { LOOK_SKILL_IDS } from '../../look-skill-ids';
import { LOOK_PATTERN_SENTENCE_LIST, LOOK_PATTERN_SENTENCES, lookBlankWord } from './look-patterns';
import { LOOK_PHONICS_INITIAL, LOOK_PHONICS_SHORT_VOWELS } from './look-phonics';
import { LOOK_UNITS, LOOK_WORD_BANK, lookUnitForStage } from './look-units';

/** British spellings that must never appear in Look content (Q2: American). */
const BRITISH = [
  'colour',
  'favourite',
  'mum',
  'trousers',
  'sweets',
  'football',
  'grey',
  'centre',
  'jumper',
  'pyjamas',
];
const wordsOf = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);

/**
 * A blank counts when it is a bank word, its plural, or the last word of a
 * bank phrase ("soccer" in "play soccer"); "feet" is the irregular plural
 * of "foot".
 */
const bankHasBlank = (blank: string): boolean => {
  const lower = blank.toLowerCase();
  if (LOOK_WORD_BANK.some((w) => w.word.toLowerCase() === lower)) return true;
  if (lower === 'feet') return LOOK_WORD_BANK.some((w) => w.word === 'foot');
  if (LOOK_WORD_BANK.some((w) => w.word.toLowerCase() === lower.replace(/s$/, ''))) return true;
  return LOOK_WORD_BANK.some((w) => w.word.toLowerCase().endsWith(` ${lower}`));
};

describe('word bank', () => {
  it('has unique names, each with a gloss and a picture', () => {
    expect(LOOK_WORD_BANK.length).toBeGreaterThan(100);
    expect(new Set(LOOK_WORD_BANK.map((w) => w.word)).size).toBe(LOOK_WORD_BANK.length);
    for (const word of LOOK_WORD_BANK) {
      // Lowercase except TV, which stays capitalised ("TV", "watch TV").
      expect(word.word.replaceAll('TV', 'tv')).toBe(word.word.toLowerCase());
      expect(word.gloss.trim().length).toBeGreaterThan(0);
      expect(word.picture).not.toBeNull();
      expect(word.picture?.trim().length).toBeGreaterThan(0);
    }
  });

  it('has no British spellings; the American words are spelled American', () => {
    const text = [
      ...LOOK_WORD_BANK.map((w) => w.word),
      ...LOOK_PATTERN_SENTENCE_LIST.map((s) => [...s.words, s.question].join(' ')),
    ].join(' ');
    const seen = new Set(wordsOf(text));
    for (const british of BRITISH) expect(seen.has(british), british).toBe(false);
    for (const american of ['color', 'soccer', 'pants', 'candy', 'mom', 'eraser']) {
      expect(seen.has(american), american).toBe(true);
    }
  });
});

describe('patterns', () => {
  it('have 6 sentences of 3–4 distinct words each, with a question', () => {
    for (const [n, sentences] of Object.entries(LOOK_PATTERN_SENTENCES)) {
      expect(sentences.length, `u${n}`).toBe(6);
      for (const sentence of sentences) {
        expect(sentence.words.length).toBeGreaterThanOrEqual(3);
        expect(sentence.words.length).toBeLessThanOrEqual(4);
        expect(new Set(sentence.words.map((w) => w.toLowerCase())).size).toBe(
          sentence.words.length,
        );
        expect(sentence.question.trim().endsWith('?')).toBe(true);
      }
    }
  });

  it('every blank is a bank word, its plural, or a phrase-final word', () => {
    for (const sentence of LOOK_PATTERN_SENTENCE_LIST) {
      expect(bankHasBlank(lookBlankWord(sentence)), sentence.words.join(' ')).toBe(true);
    }
  });

  it('no question contains the blank word', () => {
    for (const sentence of LOOK_PATTERN_SENTENCE_LIST) {
      expect(wordsOf(sentence.question)).not.toContain(lookBlankWord(sentence).toLowerCase());
    }
  });

  it('have ≥ 4 distinct blank words per unit, so fill-pattern has 2–3 options', () => {
    for (const sentences of Object.values(LOOK_PATTERN_SENTENCES)) {
      expect(new Set(sentences.map((s) => lookBlankWord(s))).size).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('phonics', () => {
  it('initial key words cover a–z exactly once; CVC words keep the vowel second', () => {
    expect(LOOK_PHONICS_INITIAL.map((w) => w.word[0])).toEqual(
      'abcdefghijklmnopqrstuvwxyz'.split(''),
    );
    for (const word of LOOK_PHONICS_SHORT_VOWELS) {
      expect(['a', 'e', 'i', 'o', 'u']).toContain(word.word[1]);
    }
  });
});

describe('units', () => {
  it('cover stages 1–8 exactly once, with valid skill ids, and all 29 skills', () => {
    expect(LOOK_UNITS.map((u) => u.stage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    const covered = new Set(LOOK_UNITS.flatMap((u) => u.skillIds));
    for (const skillId of LOOK_SKILL_IDS) {
      expect(covered.has(skillId), `${skillId} is in no unit`).toBe(true);
    }
    for (const unit of LOOK_UNITS) {
      expect(unit.skillIds.length).toBeGreaterThan(0);
      for (const skillId of unit.skillIds) expect(LOOK_SKILL_IDS).toContain(skillId);
      expect(new Set(unit.words.map((w) => w.word)).size).toBe(unit.words.length);
    }
  });

  it('lookUnitForStage returns the stage unit and throws outside 1–8', () => {
    for (const stage of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(lookUnitForStage(stage).stage).toBe(stage);
    }
    expect(() => lookUnitForStage(0)).toThrow('no unit for stage 0');
    expect(() => lookUnitForStage(9)).toThrow('no unit for stage 9');
  });

  it('every word skill pool in every unit has ≥ 4 words with distinct pictures', () => {
    for (const unit of LOOK_UNITS) {
      for (const skillId of unit.skillIds) {
        if (skillId.endsWith('-pattern')) continue;
        const pool = poolFor(skillId, unit);
        expect(pool.length, `${skillId} pool in stage ${unit.stage}`).toBeGreaterThanOrEqual(4);
        expect(new Set(pool.map((w) => w.picture)).size, `${skillId} pictures`).toBe(pool.length);
      }
    }
  });

  it('every skill in every unit generates ≥ 4 distinct own items', () => {
    const distinct = (unit: EnglishUnit, skillId: EnglishSkillId): number => {
      const seen = new Set<string>();
      for (const kind of kindsForSkill(skillId)) {
        for (let seed = 0; seed < 50; seed++) {
          seen.add(JSON.stringify(generateItem(skillId, kind, 1, unit, mulberry32(seed))));
        }
      }
      return seen.size;
    };
    for (const unit of LOOK_UNITS) {
      for (const skillId of unit.skillIds) {
        expect(distinct(unit, skillId), `${skillId} in stage ${unit.stage}`).toBeGreaterThanOrEqual(
          4,
        );
      }
    }
  });

  it('no generated listen item falls back to the placeholder picture', () => {
    for (const unit of LOOK_UNITS) {
      for (const skillId of unit.skillIds) {
        if (!kindsForSkill(skillId).includes('listen-pick-picture')) continue;
        for (let seed = 0; seed < 20; seed++) {
          const item = generateItem(skillId, 'listen-pick-picture', 1, unit, mulberry32(seed));
          if (item.kind !== 'listen-pick-picture') continue;
          for (const choice of item.choices) expect(choice.picture).not.toBe('🖼️');
        }
      }
    }
  });

  it('Look fills have 2–3 options incl. the answer at every tier', () => {
    for (const unit of LOOK_UNITS) {
      for (const skillId of unit.skillIds) {
        if (!skillId.endsWith('-pattern')) continue;
        for (const tier of [1, 2, 3] as const) {
          for (let seed = 0; seed < 10; seed++) {
            const item = generateItem(skillId, 'fill-pattern', tier, unit, mulberry32(seed));
            if (item.kind !== 'fill-pattern') continue;
            expect(item.options.length).toBeGreaterThanOrEqual(2);
            expect(item.options.length).toBeLessThanOrEqual(3);
            expect(item.options).toContain(item.sentence[item.blankIndex]);
          }
        }
      }
    }
  });
});
