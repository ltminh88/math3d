// Repeat meter (anti-repeat Phase 1): shape signatures and run-level repeat
// accounting. A shape is what makes a run *feel* the same: the story frame
// plus the kinds and prompt keys of its steps — numbers, answers and wrong
// options are not part of a shape. Exact repeats are `itemSignature`
// (`pool-counting.ts`). Pure, seeded, vitest-run (never tsx: the dispatcher
// pulls in `import.meta.glob` through the scene registry).
import type { FactKey } from '../../src/learning/fact-key';
import type { FactStat } from '../../src/learning/learning-types';
import { mulberry32 } from '../../src/learning/seeded-rng';
import type { SkillTier } from '../../src/learning/skill-tiers';
import type { ReasoningItem, ReasoningStep } from '../../src/reasoning/reasoning-types';
import { drawSkillItem } from './pool-counting';

/** Seed shared by the meter and the research baseline (2026-11-27). */
export const REPEAT_SEED = 20261113;
/** How many previous runs count as "recent" for the repeat check. */
export const REPEAT_WINDOW = 5;

const stepShape = (step: ReasoningStep): string => {
  if (step.kind === 'verdict') return `verdict:${step.prompt.key}+${step.statement.key}`;
  if (step.kind === 'set-clock') return `set-clock:${step.prompt.key}`;
  if (step.kind === 'order') return `order:${step.prompt.key}`;
  if (step.kind === 'match') return `match:${step.prompt.key}`;
  return `${step.kind}:${step.prompt.key}`;
};

/** The frame of one item: story key + step kinds and prompt keys. */
export function shapeSignature(item: ReasoningItem): string {
  return `${item.story.key}|${item.steps.map(stepShape).join(';')}`;
}

/** Distinct shapes a skill produces at a tier (1000 draws, tier 1 in the report). */
export function countShapes(
  skillId: string,
  tier: SkillTier,
  draws = 1000,
  seed = REPEAT_SEED,
): number {
  const rng = mulberry32(seed);
  const shapes = new Set<string>();
  for (let i = 0; i < draws; i++) shapes.add(shapeSignature(drawSkillItem(skillId, tier, rng)));
  return shapes.size;
}

export interface RunRecord {
  /** Signatures drawn in this run, in order. */
  items: string[];
  /** Draws whose signature already appeared earlier in this run. */
  inRunRepeats: number;
  /** Distinct items whose signature appeared in any of the previous K runs. */
  seenInPreviousRuns: number;
}

/** Turns raw per-run signature lists into repeat records (window K = 5). */
export function recordRuns(runs: readonly (readonly string[])[], k = REPEAT_WINDOW): RunRecord[] {
  const out: RunRecord[] = [];
  const history: Set<string>[] = [];
  for (const items of runs) {
    const seen = new Set<string>();
    let inRun = 0;
    for (const s of items) {
      if (seen.has(s)) inRun++;
      seen.add(s);
    }
    const prev = new Set<string>();
    for (const h of history.slice(-k)) for (const s of h) prev.add(s);
    let seenPrev = 0;
    for (const s of seen) if (prev.has(s)) seenPrev++;
    out.push({ items: [...items], inRunRepeats: inRun, seenInPreviousRuns: seenPrev });
    history.push(seen);
  }
  return out;
}

/** Synthetic profile: every key attempted once, boxes spread 1–5 by index. */
export function syntheticStats(keys: readonly FactKey[]): Record<FactKey, FactStat> {
  const stats: Record<FactKey, FactStat> = {};
  keys.forEach((key, i) => {
    stats[key] = {
      attempts: 1,
      correct: 1,
      totalMs: 1000,
      box: (i % 5) + 1,
      lastSeenSession: 0,
      lastSeenAt: 0,
      streak: 0,
      fluent: false,
      errs: [],
    };
  });
  return stats;
}

/** Advances a stats copy by one attempt per played key (no box change: the sim
 * models no correctness, only the seed movement a replay sees in the game). */
export function advanceAttempts(stats: Record<FactKey, FactStat>, keys: readonly FactKey[]): void {
  for (const k of keys) {
    const s = stats[k];
    if (s) s.attempts += 1;
  }
}
