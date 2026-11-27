// Run simulators (anti-repeat Phase 1): replay the game's own dealers with
// seeded rngs and count exact repeats per run. The sims call the pure
// planners, never the UI: `lessonSeed` is copied here (one FNV hash) because
// importing `lesson-practice.ts` drags the DOM in; daily uses `planDailySet`
// directly; level rounds mirror `planReasoningRound` with `force: true`.

import { dailyIntervalDays } from '../../src/learning/daily-intervals';
import { dailySeed, planDailySet } from '../../src/learning/daily-planner';
import { type FactKey, isSkillKey, parseKey, skillKey } from '../../src/learning/fact-key';
import type { FactStat } from '../../src/learning/learning-types';
import { planLessonRun, plannableKeys } from '../../src/learning/lesson-planner';
import { mulberry32, type Rng } from '../../src/learning/seeded-rng';
import { type SkillTier, skillTierOf } from '../../src/learning/skill-tiers';
import { chooseReasoningSkill } from '../../src/levels/shared/reasoning-round-slot';
import { itemForSkill } from '../../src/practice/item-for-skill';
import type { ReasoningItem } from '../../src/reasoning/reasoning-types';
import { itemSignature } from './pool-counting';
import { advanceAttempts, type RunRecord, recordRuns, syntheticStats } from './repeat-metrics';

/** The game's run-draw rng: the run seed xored with the golden-ratio constant
 * (`practice-run.ts`), so planning and drawing never share a stream. */
const DRAW_XOR = 0x9e3779b9;
/** Synthetic profile id for every sim. */
export const SIM_PROFILE = 'repeat-meter';

/** `lessonSeed` from `src/ui/lesson-practice.ts`, copied: importing that file
 * drags the DOM in. FNV-1a over `profile:lesson:N:attempts:T`. */
export function lessonSeedFor(lessonN: number, profileId: string, totalAttempts: number): number {
  let h = 0x811c9dc5;
  const s = `${profileId}:lesson:${lessonN}:attempts:${totalAttempts}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Draws one item for a skill (Phase 3 passes the fresh draw here). */
export type DrawItem = (skillId: string, tier: SkillTier, rng: Rng) => ReasoningItem;
const defaultDraw: DrawItem = (skillId, tier, rng) => itemForSkill(skillId, rng, tier);

/** A table fact IS the question; a skill key draws an item through the hook. */
function signatureOfKey(
  key: FactKey,
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
  rng: Rng,
  draw: DrawItem,
): string {
  if (!isSkillKey(key)) return key;
  const parsed = parseKey(key);
  const id = parsed?.op === 'skill' ? parsed.id : '';
  return itemSignature(draw(id, skillTierOf(stats[key]), rng));
}

function cloneStats(
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
): Record<FactKey, FactStat> {
  const out: Record<FactKey, FactStat> = {};
  for (const [k, v] of Object.entries(stats)) if (v) out[k as FactKey] = { ...v };
  return out;
}

/**
 * Replays one lesson `runs` times. Stats advance by the run's attempts, so the
 * seed moves exactly like a replay in the game. Returns one record per run.
 */
export function simulateLessonRuns(
  lessonN: number,
  runs: number,
  opts: { profileId?: string; draw?: DrawItem; stats?: Record<FactKey, FactStat> } = {},
): RunRecord[] {
  const { profileId = SIM_PROFILE, draw = defaultDraw } = opts;
  const stats = cloneStats(opts.stats ?? syntheticStats(plannableKeys(lessonN)));
  const lessonKeys = plannableKeys(lessonN);
  const allSigs: string[][] = [];
  for (let r = 0; r < runs; r++) {
    const totalAttempts = lessonKeys.reduce((sum, k) => sum + (stats[k]?.attempts ?? 0), 0);
    const seed = lessonSeedFor(lessonN, profileId, totalAttempts);
    const keys = planLessonRun(lessonN, stats, mulberry32(seed));
    const runRng = mulberry32(seed ^ DRAW_XOR);
    allSigs.push(keys.map((k) => signatureOfKey(k, stats, runRng, draw)));
    advanceAttempts(stats, keys);
  }
  return recordRuns(allSigs);
}

/**
 * Simulates `days` of daily practice from `stats`. Each played key is marked
 * seen today (noon UTC, so the day number is stable across timezones), so the
 * due rotation moves like in the game. Returns one record per day.
 */
export function simulateDailyDays(
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
  days: number,
  opts: { profileId?: string; startDay?: number; draw?: DrawItem } = {},
): RunRecord[] {
  const { profileId = SIM_PROFILE, startDay = 20000, draw = defaultDraw } = opts;
  const simStats = cloneStats(stats);
  const allSigs: string[][] = [];
  for (let d = 0; d < days; d++) {
    const today = startDay + d;
    const seed = dailySeed(today, profileId);
    const keys = planDailySet({ stats: simStats, today, seed });
    const runRng = mulberry32(seed ^ DRAW_XOR);
    allSigs.push(keys.map((k) => signatureOfKey(k, simStats, runRng, draw)));
    for (const k of keys) {
      const s = simStats[k];
      if (s) {
        s.attempts += 1;
        s.lastSeenAt = today * 86_400_000 + 12 * 3_600_000;
      }
    }
  }
  return recordRuns(allSigs);
}

/** Synthetic daily profile: every skill attempted, boxes spread 1–5, all due
 * on day 0 (last seen exactly one interval ago). */
export function syntheticDailyStats(
  skillIds: readonly string[],
  startDay: number,
): Record<FactKey, FactStat> {
  const stats = syntheticStats(skillIds.map((id) => skillKey(id)));
  for (const s of Object.values(stats)) {
    s.lastSeenAt = (startDay - dailyIntervalDays(s.box)) * 86_400_000 + 12 * 3_600_000;
  }
  return stats;
}

/**
 * Simulates `rounds` reasoning rounds over `skills` (least-attempted first,
 * like `chooseReasoningSkill`). One item per round. Returns one record per round.
 */
export function simulateLevelRounds(
  skills: readonly string[],
  rounds: number,
  seed: number,
  opts: { draw?: DrawItem; stats?: Record<FactKey, FactStat> } = {},
): RunRecord[] {
  const { draw = defaultDraw } = opts;
  const stats = cloneStats(opts.stats ?? syntheticStats(skills.map((id) => skillKey(id))));
  const rng = mulberry32(seed);
  const allSigs: string[][] = [];
  for (let i = 0; i < rounds; i++) {
    const skillId = chooseReasoningSkill(stats, skills);
    const item = draw(skillId, skillTierOf(stats[skillKey(skillId)]), rng);
    allSigs.push([itemSignature(item)]);
    advanceAttempts(stats, [skillKey(skillId)]);
  }
  return recordRuns(allSigs);
}
