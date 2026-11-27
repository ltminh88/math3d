// Look stage units (two-modes Phase 4): the 8 stages of the Q1 plan —
// Starter, U1–2 … U11–12, review. A unit's `items` stays empty, like CEC:
// the generator builds items from the unit's words and the pattern banks.
// Stage 8 reviews everything with the whole bank and all 29 skills.
import type { EnglishSkillId, EnglishUnit, EnglishWord } from '../../english-types';
import { LOOK_SKILL_IDS } from '../../look-skill-ids';
import {
  LOOK_STARTER_COLORS,
  LOOK_STARTER_GREETINGS,
  LOOK_STARTER_NUMBERS,
  LOOK_STARTER_WORDS,
} from './look-word-bank-starter';
import { LOOK_U1_WORDS, LOOK_U2_WORDS, LOOK_U3_WORDS, LOOK_U4_WORDS } from './look-word-bank-u1-u4';
import { LOOK_U5_WORDS, LOOK_U6_WORDS, LOOK_U7_WORDS, LOOK_U8_WORDS } from './look-word-bank-u5-u8';
import {
  LOOK_U9_WORDS,
  LOOK_U10_WORDS,
  LOOK_U11_WORDS,
  LOOK_U12_WORDS,
} from './look-word-bank-u9-u12';

function uniqueWords(words: readonly EnglishWord[]): EnglishWord[] {
  return [...new Map(words.map((w) => [w.word, w])).values()];
}

function unit(
  stage: number,
  title: string,
  skillIds: readonly EnglishSkillId[],
  words: readonly EnglishWord[],
): EnglishUnit {
  return {
    id: `look-unit-${stage}`,
    stage,
    title,
    skillIds,
    words: uniqueWords(words),
    items: [],
  };
}

/** The words each words-skill serves (the generator filters the unit by these). */
export const LOOK_SKILL_WORDS: Readonly<Record<string, readonly EnglishWord[]>> = {
  'en-look-starter-numbers': LOOK_STARTER_NUMBERS,
  'en-look-starter-colors': LOOK_STARTER_COLORS,
  'en-look-starter-greetings': LOOK_STARTER_GREETINGS,
  'en-look-u1-words': LOOK_U1_WORDS,
  'en-look-u2-words': LOOK_U2_WORDS,
  'en-look-u3-words': LOOK_U3_WORDS,
  'en-look-u4-words': LOOK_U4_WORDS,
  'en-look-u5-words': LOOK_U5_WORDS,
  'en-look-u6-words': LOOK_U6_WORDS,
  'en-look-u7-words': LOOK_U7_WORDS,
  'en-look-u8-words': LOOK_U8_WORDS,
  'en-look-u9-words': LOOK_U9_WORDS,
  'en-look-u10-words': LOOK_U10_WORDS,
  'en-look-u11-words': LOOK_U11_WORDS,
  'en-look-u12-words': LOOK_U12_WORDS,
};

/** All Look unit words, in stage order (Starter, U1 … U12). */
export const LOOK_WORD_BANK: readonly EnglishWord[] = uniqueWords([
  ...LOOK_STARTER_WORDS,
  ...LOOK_U1_WORDS,
  ...LOOK_U2_WORDS,
  ...LOOK_U3_WORDS,
  ...LOOK_U4_WORDS,
  ...LOOK_U5_WORDS,
  ...LOOK_U6_WORDS,
  ...LOOK_U7_WORDS,
  ...LOOK_U8_WORDS,
  ...LOOK_U9_WORDS,
  ...LOOK_U10_WORDS,
  ...LOOK_U11_WORDS,
  ...LOOK_U12_WORDS,
]);

/** Look bank word by name (`undefined` when the name is not in the bank). */
export const lookWordByName = (name: string): EnglishWord | undefined =>
  LOOK_WORD_BANK.find((w) => w.word === name);

/** The 8 Look stage units, in stage order. */
export const LOOK_UNITS: readonly EnglishUnit[] = [
  unit(1, 'Starter', LOOK_SKILL_IDS.slice(0, 3), LOOK_STARTER_WORDS),
  unit(
    2,
    'U1–2',
    [
      'en-look-u1-words',
      'en-look-u1-pattern',
      'en-look-u2-words',
      'en-look-u2-pattern',
      'en-look-phonics-initial',
    ],
    [...LOOK_U1_WORDS, ...LOOK_U2_WORDS],
  ),
  unit(
    3,
    'U3–4',
    [
      'en-look-u3-words',
      'en-look-u3-pattern',
      'en-look-u4-words',
      'en-look-u4-pattern',
      'en-look-phonics-initial',
    ],
    [...LOOK_U3_WORDS, ...LOOK_U4_WORDS],
  ),
  unit(
    4,
    'U5–6',
    [
      'en-look-u5-words',
      'en-look-u5-pattern',
      'en-look-u6-words',
      'en-look-u6-pattern',
      'en-look-phonics-initial',
    ],
    [...LOOK_U5_WORDS, ...LOOK_U6_WORDS],
  ),
  unit(
    5,
    'U7–8',
    [
      'en-look-u7-words',
      'en-look-u7-pattern',
      'en-look-u8-words',
      'en-look-u8-pattern',
      'en-look-phonics-short-vowels',
    ],
    [...LOOK_U7_WORDS, ...LOOK_U8_WORDS],
  ),
  unit(
    6,
    'U9–10',
    [
      'en-look-u9-words',
      'en-look-u9-pattern',
      'en-look-u10-words',
      'en-look-u10-pattern',
      'en-look-phonics-short-vowels',
    ],
    [...LOOK_U9_WORDS, ...LOOK_U10_WORDS],
  ),
  unit(
    7,
    'U11–12',
    [
      'en-look-u11-words',
      'en-look-u11-pattern',
      'en-look-u12-words',
      'en-look-u12-pattern',
      'en-look-phonics-short-vowels',
    ],
    [...LOOK_U11_WORDS, ...LOOK_U12_WORDS],
  ),
  unit(8, 'Review', LOOK_SKILL_IDS, LOOK_WORD_BANK),
];

/** The Look unit for a stage (1–8); throws for any other stage. */
export function lookUnitForStage(stage: number): EnglishUnit {
  const found = LOOK_UNITS.find((u) => u.stage === stage);
  if (!found) throw new Error(`look unitForStage: no unit for stage ${stage}`);
  return found;
}

/**
 * The earliest unit that teaches a skill — its home stage (stage 8 reviews
 * every skill, so this always finds one). Daily practice uses it to build one
 * item for a learned Look skill without knowing which stage taught it.
 */
export function lookUnitForSkill(skillId: EnglishSkillId): EnglishUnit {
  return LOOK_UNITS.find((u) => u.skillIds.includes(skillId)) ?? lookUnitForStage(8);
}
