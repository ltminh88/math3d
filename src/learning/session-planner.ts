import { tableOfFact } from './curriculum-tables';
import { factGroup } from './fact-group';
import { type FactKey, isSkillKey } from './fact-key';
import type { FactStat } from './learning-types';
import { type Rng, shuffle } from './seeded-rng';

export const SESSION_LENGTH = 10;
export const MAX_NEW_PER_SESSION = 3;
/** Sessions between reviews per box (kids play irregularly, so this counts sessions, not days). */
export const BOX_INTERVAL: Readonly<Record<number, number>> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };
const KNOWN_BOX = 3;
const KNOWN_SHARE = 0.7;

export interface PlanInput {
  stats: Readonly<Record<FactKey, FactStat | undefined>>;
  /** Facts the level drills: × / : facts and `sk:` skills may be mixed. */
  pool: readonly FactKey[];
  /** The level's tables in fluency order. */
  tables: readonly number[];
  sessionNo: number;
  rng: Rng;
  length?: number;
  maxNew?: number;
}

const interval = (box: number): number => BOX_INTERVAL[box] ?? 16;

/** Table is known when most of its facts have been seen and reached box 3+. */
function isKnown(table: number, input: PlanInput): boolean {
  const facts = input.pool.filter((k) => tableOfFact(k, input.tables) === table);
  if (facts.length === 0) return false;
  const solid = facts.filter(
    (k) => (input.stats[k]?.box ?? 0) >= KNOWN_BOX && (input.stats[k]?.attempts ?? 0) > 0,
  );
  return solid.length / facts.length >= KNOWN_SHARE;
}

/** No two neighbours from the same group (table, or skill family) where avoidable. */
function interleave(keys: FactKey[], tables: readonly number[]): FactKey[] {
  const rest = keys.slice();
  const out: FactKey[] = [];
  while (rest.length > 0) {
    const last = out.length > 0 ? factGroup(out[out.length - 1] as FactKey, tables) : undefined;
    const idx = rest.findIndex((k) => factGroup(k, tables) !== last);
    out.push(...rest.splice(idx === -1 ? 0 : idx, 1));
  }
  return out;
}

/**
 * ~60% due/weak, ~30% new (max 3), ~10% mastered check; shortages spill to the next source and
 * finally repeat the chosen facts. Interleaves tables once two are known, otherwise teaches them blocked;
 * skills (`sk:`) are never blocked and are spread by family.
 */
export function planSession(input: PlanInput): FactKey[] {
  const { stats, pool, tables, sessionNo, rng } = input;
  const length = input.length ?? SESSION_LENGTH;
  const maxNew = input.maxNew ?? MAX_NEW_PER_SESSION;
  const stat = (k: FactKey): FactStat | undefined => stats[k];
  const seen = pool.filter((k) => (stat(k)?.attempts ?? 0) > 0);
  const byOldest = (a: FactKey, b: FactKey) =>
    (stat(a)?.lastSeenSession ?? 0) - (stat(b)?.lastSeenSession ?? 0);
  const weakFirst = (a: FactKey, b: FactKey) =>
    (stat(a)?.box ?? 1) - (stat(b)?.box ?? 1) || byOldest(a, b);

  const due = seen
    .filter(
      (k) =>
        (stat(k)?.box ?? 1) < 5 &&
        sessionNo - (stat(k)?.lastSeenSession ?? 0) >= interval(stat(k)?.box ?? 1),
    )
    .sort(weakFirst);
  const mastered = seen.filter((k) => stat(k)?.box === 5).sort(byOldest);
  const notDue = seen.filter((k) => !due.includes(k) && !mastered.includes(k)).sort(weakFirst);

  const mixed = tables.filter((t) => isKnown(t, input)).length >= 2;
  const unseen = pool.filter((k) => !seen.includes(k));
  const blockedTable = tables.find(
    (t) => !isKnown(t, input) && unseen.some((k) => tableOfFact(k, tables) === t),
  );
  const newPool = shuffle(
    rng,
    mixed || blockedTable === undefined
      ? unseen
      : unseen.filter((k) => isSkillKey(k) || tableOfFact(k, tables) === blockedTable),
  );

  const weakQ = Math.round(length * 0.6);
  const newQ = Math.min(maxNew, Math.round(length * 0.3));
  const picked: FactKey[] = [
    ...due.slice(0, weakQ),
    ...newPool.slice(0, newQ),
    ...mastered.slice(0, length - weakQ - newQ),
  ];
  const spill = [
    ...due.slice(weakQ),
    ...newPool.slice(newQ, maxNew),
    ...mastered.slice(length - weakQ - newQ),
    ...notDue,
  ];
  for (const k of spill) {
    if (picked.length >= length) break;
    if (!picked.includes(k)) picked.push(k);
  }
  const base = picked.length > 0 ? picked.slice() : pool.slice(0, 1);
  if (base.length === 0) return [];
  const plan = picked.slice(0, length);
  for (let i = 0; plan.length < length; i++) plan.push(base[i % base.length] as FactKey);

  const shuffled = shuffle(rng, plan);
  // Skills are never taught blocked by table, so a pool with skills is always interleaved.
  return mixed || plan.some(isSkillKey) ? interleave(shuffled, tables) : shuffled;
}
