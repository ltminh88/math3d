// Which rounds a garden run plays: three kinds (flower-row patterns, the watering-can balance for
// an unknown, seed-bag expressions) over eight `sk:` skills. The planner's pick keeps its order
// inside each kind; the kinds rotate so no two rounds in a row are alike. The tier follows the
// skill's Leitner box (a skill never seen starts at tier 1). Pure and seeded.
import { type FactKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import type { Rng } from '../../learning/seeded-rng';
import { type SkillTier, skillTierOf } from '../../learning/skill-tiers';
import { numberOptions } from '../../reasoning/reasoning-distractors';
import { reasoningItemForSkill } from '../../reasoning/reasoning-item-for-skill';
import type { ReasoningItem, ReasoningStep } from '../../reasoning/reasoning-types';
import { withFirstOpStep } from './garden-expression-steps';

export type GardenKind = 'pattern' | 'balance' | 'bag';

const SKILLS_BY_KIND: Readonly<Record<GardenKind, readonly string[]>> = {
  pattern: ['pattern-add', 'pattern-sub', 'pattern-skip-count'],
  balance: ['unknown-add-sub', 'unknown-mul-div'],
  bag: ['expr-order', 'expr-brackets', 'expr-from-story'],
};
const KINDS: readonly GardenKind[] = ['pattern', 'balance', 'bag'];

export const GARDEN_SKILLS: readonly string[] = KINDS.flatMap((k) => SKILLS_BY_KIND[k]);

export interface GardenRound {
  readonly kind: GardenKind;
  readonly skillId: string;
  readonly factKey: FactKey;
  readonly item: ReasoningItem;
}

export function gardenKindOf(skillId: string): GardenKind {
  const kind = KINDS.find((k) => SKILLS_BY_KIND[k].includes(skillId));
  if (!kind) throw new Error(`garden: "${skillId}" is not a garden skill`);
  return kind;
}

export const gardenSkillPool = (): FactKey[] => GARDEN_SKILLS.map(skillKey);

/** Tier 1 patterns: pick the last term from three seed packets (the next term and a near miss). */
function withSeedPackets(item: ReasoningItem, rng: Rng): ReasoningItem {
  const [a = 0, b = 0, , d = 0, e = 0] = item.work;
  const step = item.steps[0];
  if (item.steps.length !== 1 || step?.kind !== 'number') return item;
  const options = numberOptions(
    rng,
    e,
    [
      { value: d, misconception: 'wrong-step' },
      { value: e + (b - a), misconception: 'wrong-step' },
    ],
    3,
  ).map((o) => ({ ...o, label: { key: 'gardenPacket', params: { n: o.label.params?.n ?? 0 } } }));
  const packets: ReasoningStep = { kind: 'choice', prompt: step.prompt, options };
  return { ...item, steps: [packets] };
}

/** A reasoning item shaped for the garden's round kinds. */
export function buildGardenItem(skillId: string, rng: Rng, tier: SkillTier): ReasoningItem {
  const item = reasoningItemForSkill(skillId, rng, tier);
  const kind = gardenKindOf(skillId);
  if (kind === 'pattern' && tier === 1) return withSeedPackets(item, rng);
  if (kind === 'bag') return withFirstOpStep(item, rng);
  return item;
}

/**
 * `length` rounds from the planner's pick: kinds in the order the plan first names them (missing
 * kinds after), cycled; each slot takes the plan's next skill of its kind, else the kind's skill
 * least used so far in this run.
 */
export function planGardenRounds(
  planned: readonly FactKey[],
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
  rng: Rng,
  length: number,
): GardenRound[] {
  const ids = planned.map((k) => k.slice(3)).filter((id) => GARDEN_SKILLS.includes(id));
  const order = [...new Set([...ids.map(gardenKindOf), ...KINDS])];
  const queues = new Map(KINDS.map((k) => [k, ids.filter((id) => gardenKindOf(id) === k)]));
  const used = new Map<string, number>();
  const rounds: GardenRound[] = [];
  for (let i = 0; i < length; i++) {
    const kind = order[i % order.length] as GardenKind;
    const fallback = [...SKILLS_BY_KIND[kind]].sort(
      (p, q) => (used.get(p) ?? 0) - (used.get(q) ?? 0),
    )[0] as string;
    const skillId = queues.get(kind)?.shift() ?? fallback;
    used.set(skillId, (used.get(skillId) ?? 0) + 1);
    const factKey = skillKey(skillId);
    const item = buildGardenItem(skillId, rng, skillTierOf(stats[factKey]));
    rounds.push({ kind, skillId, factKey, item });
  }
  return rounds;
}
