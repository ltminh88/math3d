// One entry point for the arithmetic family (phase 09): an arithmetic-family skill id + rng
// + tier -> item. The dispatcher already consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import { ADD_SUB_COLUMN_GENERATORS } from './add-sub-column-generator';
import { ADD_SUB_GENERATORS } from './add-sub-generators';
import { WORD_PROBLEM_GENERATORS } from './add-sub-word-problems';
import { ARITHMETIC_ENTRIES } from './arithmetic-skill-entries';
import { DIV_GENERATORS } from './div-generators';
import { MUL_DIV_FIND_ERROR_GENERATORS } from './mul-div-find-error';
import { LARGE_DIV_GENERATORS, LARGE_MUL_GENERATORS } from './mul-div-large-generators';
import { LARGE_WP_GENERATORS } from './mul-div-large-word-problems';
import { MUL_DIV_WP_GENERATORS } from './mul-div-word-problems';
import { MUL_GENERATORS } from './mul-generators';

export type ArithmeticGenerator = (rng: Rng, tier: SkillTier) => PracticeItem;

const GENERATORS: Readonly<Record<string, ArithmeticGenerator>> = {
  ...ADD_SUB_GENERATORS,
  ...ADD_SUB_COLUMN_GENERATORS,
  ...WORD_PROBLEM_GENERATORS,
  ...MUL_GENERATORS,
  ...DIV_GENERATORS,
  ...LARGE_MUL_GENERATORS,
  ...LARGE_DIV_GENERATORS,
  ...LARGE_WP_GENERATORS,
  ...MUL_DIV_WP_GENERATORS,
  ...MUL_DIV_FIND_ERROR_GENERATORS,
};

/** The arithmetic skills, in catalog order (the entries list is the order). */
export const ARITHMETIC_SKILLS: readonly string[] = ARITHMETIC_ENTRIES.map((e) => e.id);

export const isArithmeticSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without an arithmetic generator. */
export function arithmeticItemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`arithmetic: no generator for skill "${id}"`);
  return generate(rng, tier);
}
