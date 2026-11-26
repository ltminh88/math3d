// Content schema test (Phase 2A): the gate for references and item shape.
// - every referenced id exists (topic words in the bank, unit skills in the
//   41-skill catalog, stages 1–8 exactly once);
// - every skill in every unit can generate ≥ 4 distinct own items;
// - order-words sentences have one correct order (3–6 distinct words);
// - fill-pattern: 1 blank, 2–4 options (≥ 4 distinct blank words per pattern);
// - no listen item without a picture (every bank word has one, and no
//   generated listen choice falls back to the 🖼️ placeholder).
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import { generateItem, poolFor } from '../engine/item-generators';
import { kindsForSkill } from '../engine/item-planner';
import { ENGLISH_SKILL_IDS } from '../english-skill-entries';
import type { EnglishSkillId, EnglishUnit } from '../english-types';
import { ENGLISH_PATTERN_SENTENCES } from './patterns';
import { SEED_UNIT_1 } from './seed-unit-1';
import { ENGLISH_TOPIC_WORDS } from './topics';
import { ENGLISH_UNITS, unitForStage } from './units';
import { ENGLISH_WORD_BANK } from './word-bank';

const byName = new Map(ENGLISH_WORD_BANK.map((w) => [w.word, w]));

describe('word bank', () => {
  it('has unique lowercase names, each with a picture', () => {
    expect(ENGLISH_WORD_BANK.length).toBeGreaterThan(100);
    expect(new Set(ENGLISH_WORD_BANK.map((w) => w.word)).size).toBe(ENGLISH_WORD_BANK.length);
    for (const word of ENGLISH_WORD_BANK) {
      expect(word.word).toMatch(/^[a-z]/);
      expect(word.gloss.trim().length).toBeGreaterThan(0);
      expect(word.picture).not.toBeNull();
      expect(word.picture?.trim().length).toBeGreaterThan(0);
    }
  });

  it('keeps the Phase 0 seed words with the same gloss and picture', () => {
    for (const seed of SEED_UNIT_1.words) {
      const bank = byName.get(seed.word);
      expect(bank).toBeDefined();
      expect(bank?.gloss).toBe(seed.gloss);
      expect(bank?.picture).toBe(seed.picture);
    }
  });
});

describe('topics', () => {
  it('reference only bank words, ≥ 4 words each, no repeats', () => {
    for (const [topic, names] of Object.entries(ENGLISH_TOPIC_WORDS)) {
      expect(names.length).toBeGreaterThanOrEqual(4);
      expect(new Set(names).size).toBe(names.length);
      for (const name of names) {
        expect(byName.has(name), `${topic} references unknown word ${name}`).toBe(true);
      }
    }
  });
});

describe('patterns', () => {
  it('have ≥ 6 sentences of 3–6 distinct words each', () => {
    for (const sentences of Object.values(ENGLISH_PATTERN_SENTENCES)) {
      expect(sentences.length).toBeGreaterThanOrEqual(6);
      for (const sentence of sentences) {
        expect(sentence.length).toBeGreaterThanOrEqual(3);
        expect(sentence.length).toBeLessThanOrEqual(6);
        expect(new Set(sentence).size).toBe(sentence.length);
      }
    }
  });

  it('every sentence contains a bank word, so the gloss line is never empty', () => {
    const singular = (word: string): string =>
      word.endsWith('s') ? word.slice(0, -1) : word;
    for (const sentences of Object.values(ENGLISH_PATTERN_SENTENCES)) {
      for (const sentence of sentences) {
        expect(
          sentence.some((w) => byName.has(w) || byName.has(singular(w))),
          sentence.join(' '),
        ).toBe(true);
      }
    }
  });

  it('have ≥ 4 distinct blank words, so fill-pattern has 2–4 options', () => {
    for (const sentences of Object.values(ENGLISH_PATTERN_SENTENCES)) {
      const blanks = new Set(sentences.map((s) => s[s.length - 1]));
      expect(blanks.size).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('units', () => {
  it('cover stages 1–8 exactly once, with valid skill ids', () => {
    expect(ENGLISH_UNITS.map((u) => u.stage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const unit of ENGLISH_UNITS) {
      expect(unit.skillIds.length).toBeGreaterThan(0);
      for (const skillId of unit.skillIds) {
        expect(ENGLISH_SKILL_IDS).toContain(skillId);
      }
      expect(new Set(unit.words.map((w) => w.word)).size).toBe(unit.words.length);
    }
  });

  it('cover every one of the 41 skills in at least one stage', () => {
    const covered = new Set(ENGLISH_UNITS.flatMap((u) => u.skillIds));
    for (const skillId of ENGLISH_SKILL_IDS) {
      expect(covered.has(skillId), `${skillId} is in no unit`).toBe(true);
    }
  });

  it('unitForStage returns the stage unit and throws outside 1–8', () => {
    for (const stage of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(unitForStage(stage).stage).toBe(stage);
    }
    expect(() => unitForStage(0)).toThrow('no unit for stage 0');
    expect(() => unitForStage(9)).toThrow('no unit for stage 9');
  });

  it('every word skill pool in every unit has ≥ 4 words', () => {
    for (const unit of ENGLISH_UNITS) {
      for (const skillId of unit.skillIds) {
        if (skillId.startsWith('en-pattern-')) continue;
        const pool = poolFor(skillId, unit);
        expect(pool.length, `${skillId} pool in stage ${unit.stage}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('every skill in every unit generates ≥ 4 distinct own items', () => {
    const distinct = (unit: EnglishUnit, skillId: EnglishSkillId): number => {
      const seen = new Set<string>();
      for (const kind of kindsForSkill(skillId)) {
        for (let seed = 0; seed < 50; seed++) {
          const item = generateItem(skillId, kind, 1, unit, mulberry32(seed));
          seen.add(JSON.stringify(item));
        }
      }
      return seen.size;
    };
    for (const unit of ENGLISH_UNITS) {
      for (const skillId of unit.skillIds) {
        expect(
          distinct(unit, skillId),
          `${skillId} in stage ${unit.stage} has < 4 distinct items`,
        ).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('no generated listen item falls back to the placeholder picture', () => {
    for (const unit of ENGLISH_UNITS) {
      for (const skillId of unit.skillIds) {
        if (!kindsForSkill(skillId).includes('listen-pick-picture')) continue;
        for (let seed = 0; seed < 20; seed++) {
          const item = generateItem(skillId, 'listen-pick-picture', 1, unit, mulberry32(seed));
          if (item.kind !== 'listen-pick-picture') continue;
          for (const choice of item.choices) {
            expect(choice.picture).not.toBe('🖼️');
          }
        }
      }
    }
  });
});
