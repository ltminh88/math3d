// Daily focus slots (boost, Phase 4A): the 6/3/1 daily mix when the pool holds at
// least FOCUS_MIN_POOL focus skills — 6 focus (weakest first, ≤ 2 per skill,
// add/sub interleaved with length) + 3 due review (any family) + 1 mastered.
// The caller (daily-planner.ts) merges the result with its spill/English-cap tail.
// A focus slot uses the skill's own key, so the item is generated at the skill's
// ladder tier; a skill's second slot uses a bug-targeting format key (find-error /
// true-false) when the skill has a labelled bug — both formats draw their wrong
// values from the bug catalogue, so the labelled bug is in play.
// Pure and deterministic per (seed, today, stats): the only rng use is the
// find-error/true-false pick, drawn from the caller's seeded rng.
import type { FactKey } from './fact-key';
import { focusGroupOf, isFocusSkillKey } from './focus-skills';
import type { FactStat } from './learning-types';
import { pick, type Rng } from './seeded-rng';
import { labelledBugs, weakScore } from './weak-skill-score';

/** Focus branch runs when at least this many focus skills are in the pool. */
export const FOCUS_MIN_POOL = 3;
/** Focus slots in one daily set. */
export const FOCUS_SLOT_COUNT = 6;
/** Due-review slots in a focus day. */
export const FOCUS_REVIEW_COUNT = 3;
/** Mastered-check slots in a focus day. */
export const FOCUS_MASTERED_COUNT = 1;
/** One skill contributes at most this many items to a focus day. */
export const MAX_ITEMS_PER_FOCUS_SKILL = 2;

/** Bug-targeting formats for a labelled add/sub bug (both draw wrong values */
/** from the bug catalogue). The pick is seeded, so the day stays deterministic. */
const BUG_FORMAT_IDS: readonly string[] = ['add-sub-find-error', 'add-sub-true-false'];

export interface PlanFocusDayInput {
  /** Shuffled, English-filtered pool (the planner's `pool`). */
  pool: readonly FactKey[];
  /** Due keys, weakest first (the planner's `due`). */
  due: readonly FactKey[];
  /** Weakest not-due keys (the planner's `notDue`). */
  notDue: readonly FactKey[];
  /** Mastered keys, oldest first (the planner's `mastered`). */
  mastered: readonly FactKey[];
  stats: Readonly<Record<FactKey, FactStat | undefined>>;
  rng: Rng;
}

export interface PlanFocusDayResult {
  picked: FactKey[];
  /** Remaining pool keys in priority order, for the planner's spill tail. */
  spill: FactKey[];
}

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

/** Focus skills weakest first: score desc, then box asc, oldest, key (deterministic). */
const rankFocus = (keys: readonly FactKey[], stats: Stats): FactKey[] =>
  [...keys].sort((a, b) => {
    const sa = stats[a];
    const sb = stats[b];
    return (
      weakScore(sb ?? { attempts: 0, correct: 0 }) - weakScore(sa ?? { attempts: 0, correct: 0 }) ||
      (sa?.box ?? 1) - (sb?.box ?? 1) ||
      (sa?.lastSeenAt ?? 0) - (sb?.lastSeenAt ?? 0) ||
      (a < b ? -1 : a > b ? 1 : 0)
    );
  });

export function planFocusDay({
  pool,
  due,
  notDue,
  mastered,
  stats,
  rng,
}: PlanFocusDayInput): PlanFocusDayResult {
  const ranked = rankFocus(pool.filter(isFocusSkillKey), stats);
  // Two queues, weakest first; a skill goes to the back after one slot, so its
  // second slot waits until the other skills in its group had their first.
  const queues: Record<'add-sub' | 'length', FactKey[]> = {
    'add-sub': ranked.filter((k) => focusGroupOf(k.slice(3)) === 'add-sub'),
    length: ranked.filter((k) => focusGroupOf(k.slice(3)) === 'length'),
  };
  let turn: 'add-sub' | 'length' =
    ranked[0] !== undefined && focusGroupOf(ranked[0].slice(3)) === 'length' ? 'length' : 'add-sub';
  const used = new Map<FactKey, number>();
  const focusSlots: FactKey[] = [];
  while (focusSlots.length < FOCUS_SLOT_COUNT) {
    // Take from the current group's queue, else the other group's; the skill
    // goes back to the queue it came from (a second slot waits its turn).
    let source = queues[turn];
    let key = source.shift();
    if (key === undefined) {
      source = turn === 'add-sub' ? queues.length : queues['add-sub'];
      key = source.shift();
    }
    if (key === undefined) break;
    const slotsUsed = used.get(key) ?? 0;
    let slot = key;
    if (
      slotsUsed === 1 &&
      focusGroupOf(key.slice(3)) === 'add-sub' &&
      labelledBugs(stats[key] ?? {}).length > 0
    ) {
      // Second slot of a skill with a labelled bug: a bug-targeting format key.
      // The format key is capped at 2 in the day, like any other key.
      const format = `sk:${pick(rng, BUG_FORMAT_IDS)}` as FactKey;
      slot = (used.get(format) ?? 0) < MAX_ITEMS_PER_FOCUS_SKILL ? format : key;
    }
    focusSlots.push(slot);
    used.set(key, slotsUsed + 1);
    if (slot !== key) used.set(slot, (used.get(slot) ?? 0) + 1);
    if (slotsUsed + 1 < MAX_ITEMS_PER_FOCUS_SKILL) source.push(key);
    turn = turn === 'add-sub' ? 'length' : 'add-sub';
  }
  const picked = [...focusSlots];
  const taken = new Set<FactKey>(picked);
  // 3 due review: due first (any family), then weakest not-due; 1 mastered.
  for (const k of [...due, ...notDue]) {
    if (picked.length >= FOCUS_SLOT_COUNT + FOCUS_REVIEW_COUNT) break;
    if (!taken.has(k)) {
      picked.push(k);
      taken.add(k);
    }
  }
  for (const k of mastered) {
    if (picked.length >= FOCUS_SLOT_COUNT + FOCUS_REVIEW_COUNT + FOCUS_MASTERED_COUNT) break;
    if (!taken.has(k)) {
      picked.push(k);
      taken.add(k);
    }
  }
  // Spill: remaining focus keys first (weakest first), then today's priority order.
  const spill: FactKey[] = [];
  const seen = new Set<FactKey>(taken);
  for (const k of [...ranked, ...due, ...notDue, ...mastered]) {
    if (!seen.has(k)) {
      spill.push(k);
      seen.add(k);
    }
  }
  return { picked, spill };
}
