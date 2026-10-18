import { divKey, type FactKey, mulKey } from './fact-key';

export type LevelId = 'bridge' | 'field' | 'forest';

/** Region unlock order: each level opens when the previous one has been completed once. */
export const LEVEL_ORDER: readonly LevelId[] = ['bridge', 'field', 'forest'];

/** Tables are introduced in fluency order: 2, 5, 10 first, then 3, 4, then 6-9. */
export const FLUENCY_ORDER: readonly number[] = [2, 5, 10, 3, 4, 6, 7, 8, 9];

const LEVEL_TABLES: Record<LevelId, readonly number[]> = {
  bridge: [2, 5],
  field: [3, 4],
  forest: [2, 3, 4, 5],
};

/** Second factors drawn for every table (1x is trivial, so it is not drilled). */
const MULTIPLIERS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function levelTables(levelId: LevelId): number[] {
  return [...LEVEL_TABLES[levelId]].sort(
    (a, b) => FLUENCY_ORDER.indexOf(a) - FLUENCY_ORDER.indexOf(b),
  );
}

/** Multiplication facts for the tables (deduplicated: 2x5 belongs to both table 2 and table 5). */
export function mulFactsForTables(tables: readonly number[]): FactKey[] {
  const keys = new Set<FactKey>();
  for (const t of tables) for (const m of MULTIPLIERS) keys.add(mulKey(t, m));
  return [...keys];
}

/** Inverse divisions: dividend / table = multiplier. */
export function divFactsForTables(tables: readonly number[]): FactKey[] {
  const keys = new Set<FactKey>();
  for (const t of tables) for (const m of MULTIPLIERS) keys.add(divKey(t * m, t));
  return [...keys];
}

/** The fact pool a level drills. Forest also asks sharing (division) facts. */
export function levelFactPool(levelId: LevelId): FactKey[] {
  const tables = levelTables(levelId);
  const pool = mulFactsForTables(tables);
  return levelId === 'forest' ? [...pool, ...divFactsForTables(tables)] : pool;
}

/** Which table a fact is practised under: the first of `tables` (fluency order) that is one of its factors. */
export function tableOfFact(key: FactKey, tables: readonly number[]): number | undefined {
  const m = /^mul:(\d+)x(\d+)$/.exec(key);
  const d = /^div:(\d+)\/(\d+)$/.exec(key);
  const factors = m
    ? [Number(m[1]), Number(m[2])]
    : d
      ? [Number(d[2]), Number(d[1]) / Number(d[2])]
      : [];
  return tables.find((t) => factors.includes(t));
}
