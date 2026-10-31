import { tableOfFact } from './curriculum-tables';
import { type FactKey, parseKey } from './fact-key';
import { type SkillFamily, skillEntry } from './skill-catalog';

export type FactGroup = number | SkillFamily;

/**
 * What a planner groups a key under: the table (first of `tables` that is a factor) for × / :
 * facts, the catalog family for `sk:` skills, undefined for anything else.
 */
export function factGroup(key: FactKey, tables: readonly number[]): FactGroup | undefined {
  const parsed = parseKey(key);
  if (parsed?.op === 'skill') return skillEntry(parsed.id)?.family;
  return parsed ? tableOfFact(key, tables) : undefined;
}
