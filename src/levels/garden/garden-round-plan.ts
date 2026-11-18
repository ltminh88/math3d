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
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
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
 * least used so far in this run. `allowed` narrows the pool to a stage's subset (absent: all
 * eight skills, today's run); `floor` prefers skills already at or above that tier when the
 * queue and the fallback pick (absent: no preference). The floor never changes a round's
 * tier — every item is built at `skillTierOf(box)`.
 */
export function planGardenRounds(
  planned: readonly FactKey[],
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
  rng: Rng,
  length: number,
  allowed?: readonly string[],
  floor?: number,
): GardenRound[] {
  const pool = allowed ?? GARDEN_SKILLS;
  const ids = planned.map((k) => k.slice(3)).filter((id) => pool.includes(id));
  const order = [...new Set([...ids.map(gardenKindOf), ...KINDS])];
  const tierOf = (id: string): SkillTier => skillTierOf(stats[skillKey(id)]);
  const queues = new Map<GardenKind, string[]>(
    KINDS.map((k) => {
      // The planner repeats facts when the pool is short (its documented spill
      // behaviour): a fresh profile plans 3 skills twice. A kind's queue would then
      // hold the same skill twice and both of its slots would play it — dedupe the
      // queue (first occurrence wins, planned order kept) so a run never repeats a
      // skill. The least-used fallback covers the slots the queue no longer fills.
      const list = [...new Set(ids.filter((id) => gardenKindOf(id) === k))];
      if (floor === undefined) return [k, list] as [GardenKind, string[]];
      // Tier floor: skills already at or above the floor play first (stable — planned order
      // kept inside each group). A skill below the floor still plays at its own tier.
      return [
        k,
        [...list.filter((id) => tierOf(id) >= floor), ...list.filter((id) => tierOf(id) < floor)],
      ] as [GardenKind, string[]];
    }),
  );
  const used = new Map<string, number>();
  const rounds: GardenRound[] = [];
  for (let i = 0; i < length; i++) {
    const kind = order[i % order.length] as GardenKind;
    const fallback = [...pool.filter((id) => gardenKindOf(id) === kind)].sort(
      (p, q) =>
        (used.get(p) ?? 0) - (used.get(q) ?? 0) ||
        (floor === undefined ? 0 : Number(tierOf(p) < floor) - Number(tierOf(q) < floor)),
    )[0] as string;
    const skillId = queues.get(kind)?.shift() ?? fallback;
    used.set(skillId, (used.get(skillId) ?? 0) + 1);
    const factKey = skillKey(skillId);
    const item = buildGardenItem(skillId, rng, skillTierOf(stats[factKey]));
    rounds.push({ kind, skillId, factKey, item });
  }
  return rounds;
}

// Stage plan for the garden (phase 07): a stage is a skill subset + tier floor in the
// existing round planner — no new round type, no new wiring. Stage 1 is today's run; later
// stages drill a subset with a different emphasis. Every stage keeps ≥ 2 skills per kind,
// so the two slots each kind gets in a 6-round run never repeat a skill. The plan maps stage
// to its config, so the 6th-stage contingency (phase 00) is one more table row plus strings.

/** Stage → the skills it drills (stage 1 and 5: all eight; stages 2–4: seven each). */
export const GARDEN_STAGE_SKILLS: Readonly<Record<number, readonly string[]>> = {
  1: GARDEN_SKILLS,
  2: [
    'pattern-add',
    'pattern-sub',
    'pattern-skip-count',
    'unknown-add-sub',
    'unknown-mul-div',
    'expr-order',
    'expr-brackets',
  ],
  3: [
    'expr-order',
    'expr-brackets',
    'expr-from-story',
    'pattern-add',
    'pattern-sub',
    'unknown-add-sub',
    'unknown-mul-div',
  ],
  4: [
    'pattern-add',
    'pattern-sub',
    'pattern-skip-count',
    'unknown-add-sub',
    'unknown-mul-div',
    'expr-brackets',
    'expr-from-story',
  ],
  5: GARDEN_SKILLS,
};

/**
 * Tier floor per stage: stage 2 emphasises tier 2 (box ≥ 3), stage 4 tier 3 (box ≥ 5).
 * The floor is only a preference for which skills play — it never sets a round's tier.
 */
export function stageTierFloor(stage: number): number | undefined {
  if (stage === 2) return 2;
  if (stage === 4) return 3;
  return undefined;
}

/** The run's rounds for a stage: the host planner picks the facts, the stage picks the subset + tier floor. Stage 5 drills the weakest skills first (lowest box). */
export function planGardenRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): GardenRound[] {
  const stats = learning.stats();
  const planned = learning.planSession(gardenSkillPool(), definition.rounds);
  const allowed = GARDEN_STAGE_SKILLS[stage] ?? GARDEN_SKILLS;
  const floor = stageTierFloor(stage);
  const ordered =
    stage === 5
      ? [...planned].sort((a, b) => (stats[a]?.box ?? 1) - (stats[b]?.box ?? 1))
      : planned;
  return planGardenRounds(ordered, stats, learning.rng, definition.rounds, allowed, floor);
}
