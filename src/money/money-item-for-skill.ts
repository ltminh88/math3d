// One entry point for the money family (phase 14): a money-family skill id + rng + tier
// -> item. Empty until phase 14 adds the first generator; the dispatcher already
// consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { moneyExchange, moneyPickNotes, moneyRecognize, moneyTotalNotes } from './money-generators';
import type { MoneyGenerator, MoneyItem } from './money-scene-types';
import { moneyChangeBack, moneyWp } from './money-word-generators';

const GENERATORS: Readonly<Record<string, MoneyGenerator>> = {
  'money-recognize': moneyRecognize,
  'money-total-notes': moneyTotalNotes,
  'money-exchange': moneyExchange,
  'money-change-back': moneyChangeBack,
  'money-pick-notes': moneyPickNotes,
  'money-wp': moneyWp,
};

/** The money skills (catalog order) that have a generator (none yet). */
export const MONEY_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isMoneySkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a money generator. */
export function moneyItemForSkill(id: string, rng: Rng, tier: SkillTier): MoneyItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`money: no generator for skill "${id}"`);
  return generate(rng, tier);
}

/** Scene-free money skills: playable in the dialog today (no phase-17 renderer needed). */
export const MONEY_SCENE_FREE_SKILLS: readonly string[] = Object.freeze([
  'money-change-back',
  'money-wp',
]);

export const isMoneySceneFreeSkill = (id: string): boolean =>
  (MONEY_SCENE_FREE_SKILLS as readonly string[]).includes(id);
