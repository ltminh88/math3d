// Stage plan for the cave (phase 10, pure, seeded): which format mix a stage drills and which
// skills it may use. Stage 1 is today's run; later stages are emphases over the skills the
// child has already attempted — the cave never introduces a skill the child has not met in
// its home level or a reasoning round. Tiers always come from the Leitner box, never from
// the stage number. Stages 2–5 re-select from the attempted pool weakest-first; the session
// planner still runs first (same call order as stage 1) but its picks do not drive the stage
// mix, so the emphasis counts below are exact. The logic emphasis of stage 3 is bounded by
// the pool: choose-all and tf-explain have one skill each, so both logic skills are present
// (as in every run) with word problems as the second reasoning format.
import { type FactKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  arrangeNoRepeat,
  buildCaveChambers,
  CAVE_SKILLS,
  type CaveChamber,
  type CaveFormat,
  caveFormatOf,
  caveSkillPool,
  MAX_PER_FORMAT,
  planCaveSkills,
} from './cave-chamber-formats';
import { CHAMBER_COUNT } from './cave-layout';

/** Target chamber counts per format, per stage (stage 1 keeps today's mix). */
export const CAVE_STAGE_TARGETS: Readonly<
  Record<number, Readonly<Partial<Record<CaveFormat, number>>>>
> = {
  2: { word: 2, remainder: 1, 'choose-all': 1, 'tf-explain': 1, 'geo-meas': 1 },
  3: { 'choose-all': 1, 'tf-explain': 1, word: 2, remainder: 1, 'geo-meas': 1 },
  4: { 'geo-meas': 2, word: 1, remainder: 1, 'choose-all': 1, 'tf-explain': 1 },
  5: { word: 1, remainder: 1, 'choose-all': 1, 'tf-explain': 1, 'geo-meas': 1 },
};

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

/** Stage 1 plays today's pool; later stages play only skills the child has attempted. */
export function stagePool(stats: Stats, stage: number): readonly string[] {
  if (stage <= 1) return CAVE_SKILLS;
  return CAVE_SKILLS.filter((id) => (stats[skillKey(id)]?.attempts ?? 0) > 0);
}

const boxOf = (stats: Stats, id: string): number => stats[skillKey(id)]?.box ?? 1;

/** The stage pool weakest box first, ties in catalog order (deterministic). */
function rankedPool(stats: Stats, stage: number): string[] {
  return [...stagePool(stats, stage)].sort(
    (a, b) => boxOf(stats, a) - boxOf(stats, b) || CAVE_SKILLS.indexOf(a) - CAVE_SKILLS.indexOf(b),
  );
}

/**
 * The stage's skill ids from its pool: each format up to its stage target, then a weakest-first
 * top-up (at most two chambers per format, no skill twice). Returns fewer than `length` ids
 * when the pool is too small; the caller falls back to today's plan.
 */
export function planCaveStageSkills(stats: Stats, length: number, stage: number): string[] {
  const ranked = rankedPool(stats, stage);
  const targets = CAVE_STAGE_TARGETS[stage] ?? {};
  const picked: string[] = [];
  const count = (format: CaveFormat): number =>
    picked.filter((id) => caveFormatOf(id) === format).length;
  for (const format of Object.keys(targets) as CaveFormat[]) {
    for (const id of ranked) {
      if (count(format) >= (targets[format] ?? 0)) break;
      if (caveFormatOf(id) === format && !picked.includes(id)) picked.push(id);
    }
  }
  for (const id of ranked) {
    if (picked.length >= length) break;
    if (!picked.includes(id) && count(caveFormatOf(id)) < MAX_PER_FORMAT) picked.push(id);
  }
  if (picked.length < length) return picked;
  const sorted = [...picked].sort(
    (a, b) => boxOf(stats, a) - boxOf(stats, b) || CAVE_SKILLS.indexOf(a) - CAVE_SKILLS.indexOf(b),
  );
  return arrangeNoRepeat(sorted);
}

export interface CaveRun {
  chambers: CaveChamber[];
  total: number;
}

/**
 * The cave's chambers for a stage. Stage 1 calls today's planner, so a fixed seed plans
 * exactly today's run. Later stages plan from the attempted pool; when the pool is too small
 * to fill the run (only when a later stage is forced on a profile that has not finished
 * stage 1 — in real play stage 2 opens only after stage 1, so the pool holds at least 7
 * attempted skills) the run falls back to today's plan.
 */
export function planCaveRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): CaveRun {
  const stats = learning.stats();
  const { rng } = learning;
  const rounds = Math.min(definition.rounds, CHAMBER_COUNT);
  const planned = learning.planSession(caveSkillPool(), rounds);
  let ids: string[];
  if (stage <= 1) {
    ids = planCaveSkills(planned, stats, rng, rounds);
  } else {
    ids = planCaveStageSkills(stats, rounds, stage);
    if (ids.length < rounds) ids = planCaveSkills(planned, stats, rng, rounds);
  }
  const chambers = buildCaveChambers(ids, stats, rng);
  return { chambers, total: chambers.length };
}
