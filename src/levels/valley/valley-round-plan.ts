// Which geometry skills the six rounds ask (pure). The planner's pick (spaced repetition, weak
// skills first) leads; the list is topped up with the weakest unseen-in-plan skills and laid
// out so the five round kinds take turns. A child who never played the valley only meets the
// first three kinds (midpoint, circle, right angle): fewer new ideas in one run.
import { GEOMETRY_SKILLS } from '../../geometry/geometry-item-for-skill';
import { type FactKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { type SkillTier, skillTierOf } from '../../learning/skill-tiers';

export type ValleyKind = 'midpoint' | 'circle' | 'right-angle' | 'classify' | 'solids';

export const VALLEY_KIND: Readonly<Record<string, ValleyKind>> = {
  'geo-midpoint': 'midpoint',
  'geo-circle-parts': 'circle',
  'geo-radius-diameter': 'circle',
  'geo-right-angle': 'right-angle',
  'geo-count-right-angles': 'right-angle',
  'geo-shape-classify': 'classify',
  'geo-shape-count': 'classify',
  'geo-solid-identify': 'solids',
  'geo-solid-parts': 'solids',
};

const FIRST_RUN_KINDS: readonly ValleyKind[] = ['midpoint', 'circle', 'right-angle'];

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

export interface ValleyRoundSpec {
  readonly skillId: string;
  readonly tier: SkillTier;
}

const seen = (stats: Stats, id: string) => (stats[skillKey(id)]?.attempts ?? 0) > 0;

/** `sk:` keys the planner may pick from for this child. */
export function valleyFactPool(stats: Stats): FactKey[] {
  const firstRun = !GEOMETRY_SKILLS.some((id) => seen(stats, id));
  const kinds = firstRun ? FIRST_RUN_KINDS : null;
  return GEOMETRY_SKILLS.filter(
    (id) => !kinds || kinds.includes(VALLEY_KIND[id] as ValleyKind),
  ).map(skillKey);
}

/** `rounds` skills with their tiers: planner order first, kinds rotated, every kind once if it can. */
export function planValleyRounds(
  planned: readonly FactKey[],
  stats: Stats,
  rounds: number,
): ValleyRoundSpec[] {
  const pool = valleyFactPool(stats).map((k) => k.slice(3));
  const box = (id: string) => stats[skillKey(id)]?.box ?? 1;
  const tries = (id: string) => stats[skillKey(id)]?.attempts ?? 0;
  const lead = [...new Set(planned.map((k) => k.slice(3)))].filter((id) => pool.includes(id));
  const rest = pool
    .filter((id) => !lead.includes(id))
    .sort((a, b) => box(a) - box(b) || tries(a) - tries(b));
  const priority = [...lead, ...rest];
  const used = new Map<string, number>();
  const kindUsed = new Map<ValleyKind, number>();
  const out: ValleyRoundSpec[] = [];
  let last: ValleyKind | undefined;
  for (let r = 0; r < rounds && priority.length > 0; r++) {
    // Lowest cost wins: a new kind before a repeated one, never the same kind twice in a row
    // (when another kind is left), an unused skill before a repeat, then planner priority.
    const cost = (id: string, rank: number) => {
      const kind = VALLEY_KIND[id] as ValleyKind;
      return (
        (kind === last ? 1000 : 0) +
        (kindUsed.get(kind) ?? 0) * 100 +
        (used.get(id) ?? 0) * 10 +
        rank / 100
      );
    };
    const best = priority.reduce((a, b) =>
      cost(b, priority.indexOf(b)) < cost(a, priority.indexOf(a)) ? b : a,
    );
    const kind = VALLEY_KIND[best] as ValleyKind;
    used.set(best, (used.get(best) ?? 0) + 1);
    kindUsed.set(kind, (kindUsed.get(kind) ?? 0) + 1);
    last = kind;
    out.push({ skillId: best, tier: skillTierOf(stats[skillKey(best)]) });
  }
  return out;
}
