// Daily planner (phase 11): the day's set from what the child has learned so far.
// Pool = attempted facts/skills only — never an untaught fact, never a repeat within one day,
// and fewer items when the pool is under 10 (no top-up). Due uses calendar days
// (daily-intervals.ts), not sessions: a box-1 fact seen yesterday is due today.
import { FLUENCY_ORDER } from './curriculum-tables';
import { dailyIntervalDays, dayNumber } from './daily-intervals';
import type { FactKey } from './fact-key';
import type { FactStat } from './learning-types';
import { mulberry32, shuffle } from './seeded-rng';
import { interleaveFacts } from './session-planner';

export const DAILY_UNLOCK_LEVEL = 'field';
export const DAILY_LENGTH = 10;
export const DAILY_DUE_COUNT = 6;
export const DAILY_WEAK_COUNT = 3;
export const DAILY_MASTERED_COUNT = 1;

/** Deterministic seed for (today, profile): the same day replays the same set. */
export function dailySeed(today: number, profileId: string): number {
  let hash = 5381;
  for (let i = 0; i < profileId.length; i++) hash = ((hash * 33) ^ profileId.charCodeAt(i)) >>> 0;
  return (Math.imul(today, 2654435761) ^ hash) >>> 0;
}

export interface PlanDailyInput {
  stats: Readonly<Record<FactKey, FactStat | undefined>>;
  /** Local day number (daily-intervals.ts dayNumber) the set is planned for. */
  today: number;
  /** Seed: same (seed, today, stats) plans the same set, so a replay after an interruption */
  /** resumes the same items. The caller derives it from (today, profileId). */
  seed: number;
}

export interface LevelStarsView {
  readonly stars: number;
}

/** Daily practice opens once the child has cleared field stage 1. */
export function dailyUnlocked(
  levels: Readonly<Record<string, LevelStarsView | undefined>>,
): boolean {
  return (levels[DAILY_UNLOCK_LEVEL]?.stars ?? 0) >= 1;
}

const statOf = (
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
  key: FactKey,
): FactStat | undefined => stats[key];

/** Learned pool: every fact/skill with at least one attempt. */
const learnedPool = (stats: Readonly<Record<FactKey, FactStat | undefined>>): FactKey[] =>
  (Object.keys(stats) as FactKey[]).filter((k) => (statOf(stats, k)?.attempts ?? 0) > 0);

/** Due: box < 5 and enough calendar days since it was last seen. */
const isDue = (stat: FactStat, today: number): boolean =>
  stat.box < 5 && today - dayNumber(stat.lastSeenAt) >= dailyIntervalDays(stat.box);

const weakFirst = (a: FactStat, b: FactStat): number =>
  a.box - b.box || a.lastSeenAt - b.lastSeenAt;
const oldestFirst = (a: FactStat, b: FactStat): number => a.lastSeenAt - b.lastSeenAt;

/**
 * The day's picks in priority order (before interleaving): 6 due/weak first (lowest box,
 * then oldest), 3 weakest not-due, 1 mastered check. Spill follows the same priority when a
 * bucket is short, mirroring planSession; the pool is never topped up with untaught facts.
 */
export function pickDailyItems({ stats, today, seed }: PlanDailyInput): FactKey[] {
  const rng = mulberry32(seed);
  // Shuffled first so the stable sorts below break ties deterministically by seed.
  const pool = shuffle(rng, learnedPool(stats));
  const due = pool
    .filter((k) => {
      const s = statOf(stats, k);
      return s !== undefined && isDue(s, today);
    })
    .sort((a, b) => weakFirst(statOf(stats, a) as FactStat, statOf(stats, b) as FactStat));
  const mastered = pool
    .filter((k) => (statOf(stats, k)?.box ?? 1) === 5)
    .sort((a, b) => oldestFirst(statOf(stats, a) as FactStat, statOf(stats, b) as FactStat));
  const notDue = pool
    .filter((k) => !due.includes(k) && !mastered.includes(k))
    .sort((a, b) => weakFirst(statOf(stats, a) as FactStat, statOf(stats, b) as FactStat));
  const picked: FactKey[] = [
    ...due.slice(0, DAILY_DUE_COUNT),
    ...notDue.slice(0, DAILY_WEAK_COUNT),
    ...mastered.slice(0, DAILY_MASTERED_COUNT),
  ];
  const spill = [
    ...due.slice(DAILY_DUE_COUNT),
    ...notDue.slice(DAILY_WEAK_COUNT),
    ...mastered.slice(DAILY_MASTERED_COUNT),
  ];
  for (const k of spill) {
    if (picked.length >= DAILY_LENGTH) break;
    if (!picked.includes(k)) picked.push(k);
  }
  return picked.slice(0, DAILY_LENGTH);
}

/** The day's set: picks interleaved so no two neighbours share a group where avoidable. */
export function planDailySet(input: PlanDailyInput): FactKey[] {
  return interleaveFacts(pickDailyItems(input), FLUENCY_ORDER);
}
