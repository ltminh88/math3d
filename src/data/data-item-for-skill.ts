// One entry point for the data family (phase 15): a data-family skill id + rng + tier -> item.
// Every data skill needs its picture (table, tally, bag, die), so none is scene-free.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { chanceBag, chanceDice } from './chance-generators';
import type { DataGenerator, DataItem } from './data-scene-types';
import {
  tableFillMissing,
  tableMaxMin,
  tableRead,
  tableSums,
  tallyCount,
} from './table-generators';

const GENERATORS: Readonly<Record<string, DataGenerator>> = {
  'tally-count': tallyCount,
  'table-read': tableRead,
  'table-max-min': tableMaxMin,
  'table-sums': tableSums,
  'table-fill-missing': tableFillMissing,
  'chance-bag': chanceBag,
  'chance-dice': chanceDice,
};

/** The data skills (catalog order) that have a generator. */
export const DATA_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isDataSkill = (id: string): boolean => id in GENERATORS;

/**
 * Skills whose items never carry a scene: none — every data item needs its picture, so
 * B73/B74 show "Sắp có" until the phase-17 renderer lands.
 */
export const DATA_SCENE_FREE_SKILLS: readonly string[] = Object.freeze([]);

/** True when the skill's items never need a picture (always false for data). */
export const isDataSceneFreeSkill = (id: string): boolean => DATA_SCENE_FREE_SKILLS.includes(id);

/** Pure and deterministic for a seeded `rng`; throws for skills without a data generator. */
export function dataItemForSkill(id: string, rng: Rng, tier: SkillTier): DataItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`data: no generator for skill "${id}"`);
  return generate(rng, tier);
}
