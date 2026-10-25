// Variety for a forest run (QA m-3). The learning-core planner fills a short run by repeating its
// picks (on a first run: three new ÷2 facts taught blocked, then two of them again). The planner's
// own facts stay; only the repeats are swapped for other pool facts, tables not yet in the run
// first, and the run is ordered so no fact (and, where possible, no table) follows itself.
import type { FactKey } from '../../learning/fact-key';
import { type Rng, shuffle } from '../../learning/seeded-rng';

const divisorOf = (key: FactKey): string => key.split('/')[1] ?? key;

export function varyForestFacts(
  planned: readonly FactKey[],
  pool: readonly FactKey[],
  rng: Rng,
): FactKey[] {
  const unique = [...new Set(planned)];
  const spare = shuffle(
    rng,
    pool.filter((key) => !unique.includes(key)),
  );
  const run = unique.slice();
  for (let i = unique.length; i < planned.length; i++) {
    const tables = new Set(run.map(divisorOf));
    const pick = spare.findIndex((key) => !tables.has(divisorOf(key)));
    const [extra] = spare.splice(pick === -1 ? 0 : pick, 1);
    run.push(extra ?? (planned[i] as FactKey));
  }
  return spreadNeighbours(run);
}

/** Greedy order: next a different table if any, else a different fact, else whatever is left. */
function spreadNeighbours(keys: FactKey[]): FactKey[] {
  const rest = keys.slice();
  const out: FactKey[] = [];
  while (rest.length > 0) {
    const last = out[out.length - 1];
    const count = (key: FactKey) => rest.filter((k) => k === key).length;
    // A fact still left more than once goes first, so its copies can be kept apart.
    const order = rest
      .map((key, i) => ({ key, i }))
      .sort((a, b) => count(b.key) - count(a.key) || a.i - b.i);
    const pick =
      order.find(({ key }) => last === undefined || divisorOf(key) !== divisorOf(last)) ??
      order.find(({ key }) => key !== last) ??
      order[0];
    out.push(...rest.splice(pick?.i ?? 0, 1));
  }
  return out;
}
