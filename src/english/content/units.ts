// Stage units (Phase 2A): the 8 island stages, each with its own word pool
// and skill pool. Stages 1–7 teach one letter block plus two topics and one
// pattern (stage 1 keeps the Phase 0 seed skills); stage 8 reviews A–Z with
// the whole bank and all 41 skills. The "+R" review in the plan is realised
// by the topic words: they reach back into earlier blocks, so earlier words
// reappear in listen and match items. A unit's `items` stays empty — the
// generator builds items from the unit's words and the pattern banks.

import { ENGLISH_SKILL_IDS } from '../english-skill-entries';
import type { EnglishSkillId, EnglishUnit, EnglishWord } from '../english-types';
import { ENGLISH_TOPIC_WORDS } from './topics';
import { ENGLISH_WORD_BANK, wordByName } from './word-bank';
import { WORD_BANK_A_D } from './word-bank-a-d';
import { WORD_BANK_E_H } from './word-bank-e-h';
import { WORD_BANK_I_L } from './word-bank-i-l';
import { WORD_BANK_M_P } from './word-bank-m-p';
import { WORD_BANK_Q_T } from './word-bank-q-t';
import { WORD_BANK_U_X } from './word-bank-u-x';
import { WORD_BANK_Y_Z } from './word-bank-y-z';

function uniqueWords(words: readonly EnglishWord[]): EnglishWord[] {
  return [...new Map(words.map((w) => [w.word, w])).values()];
}

function topicWords(...topics: (keyof typeof ENGLISH_TOPIC_WORDS)[]): EnglishWord[] {
  return topics.flatMap((t) =>
    ENGLISH_TOPIC_WORDS[t].map((name) => {
      const word = wordByName(name);
      if (!word) throw new Error(`units: topic ${t} references unknown word ${name}`);
      return word;
    }),
  );
}

function unit(
  stage: number,
  title: string,
  skillIds: readonly EnglishSkillId[],
  words: readonly EnglishWord[],
): EnglishUnit {
  return { id: `unit-${stage}`, stage, title, skillIds, words: uniqueWords(words), items: [] };
}

/** The 8 stage units, in stage order. */
export const ENGLISH_UNITS: readonly EnglishUnit[] = [
  unit(
    1,
    'A–D',
    ['en-letters-a-d', 'en-sounds-a-d', 'en-words-a-d', 'en-pattern-this-is', 'en-pattern-i-like'],
    WORD_BANK_A_D,
  ),
  unit(
    2,
    'E–H',
    [
      'en-letters-e-h',
      'en-sounds-e-h',
      'en-words-e-h',
      'en-topic-animals',
      'en-topic-food',
      'en-pattern-i-have',
    ],
    [...WORD_BANK_E_H, ...topicWords('animals', 'food')],
  ),
  unit(
    3,
    'I–L',
    [
      'en-letters-i-l',
      'en-sounds-i-l',
      'en-words-i-l',
      'en-topic-body',
      'en-topic-school',
      'en-pattern-i-can',
    ],
    [...WORD_BANK_I_L, ...topicWords('body', 'school')],
  ),
  unit(
    4,
    'M–P',
    [
      'en-letters-m-p',
      'en-sounds-m-p',
      'en-words-m-p',
      'en-topic-clothes',
      'en-topic-home',
      'en-pattern-i-see',
    ],
    [...WORD_BANK_M_P, ...topicWords('clothes', 'home')],
  ),
  unit(
    5,
    'Q–T',
    [
      'en-letters-q-t',
      'en-sounds-q-t',
      'en-words-q-t',
      'en-topic-weather',
      'en-topic-actions',
      'en-pattern-what-is',
    ],
    [...WORD_BANK_Q_T, ...topicWords('weather', 'actions')],
  ),
  unit(
    6,
    'U–X',
    [
      'en-letters-u-x',
      'en-sounds-u-x',
      'en-words-u-x',
      'en-topic-toys',
      'en-topic-transport',
      'en-pattern-my-favourite',
    ],
    [...WORD_BANK_U_X, ...topicWords('toys', 'transport')],
  ),
  unit(
    7,
    'Y–Z',
    ['en-letters-y-z', 'en-sounds-y-z', 'en-words-y-z', 'en-topic-colors', 'en-topic-family'],
    [...WORD_BANK_Y_Z, ...topicWords('colors', 'family')],
  ),
  unit(8, 'A–Z', ENGLISH_SKILL_IDS, ENGLISH_WORD_BANK),
];

/** The unit for a stage (1–8); throws for any other stage. */
export function unitForStage(stage: number): EnglishUnit {
  const found = ENGLISH_UNITS.find((u) => u.stage === stage);
  if (!found) throw new Error(`unitForStage: no unit for stage ${stage}`);
  return found;
}

/**
 * The earliest unit that teaches a skill — its home stage (stage 8 reviews
 * every skill, so this always finds one). Daily practice uses it to build one
 * item for a learned skill without knowing which stage taught it.
 */
export function unitForSkill(skillId: EnglishSkillId): EnglishUnit {
  return ENGLISH_UNITS.find((u) => u.skillIds.includes(skillId)) ?? unitForStage(8);
}
