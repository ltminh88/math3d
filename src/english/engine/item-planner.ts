// Item planner (Phase 1B, pure): weakest skill first by Leitner, seeded so the
// run is deterministic per seed, and never the same (skill, kind) twice in a row.
// The run picks one round at a time; the planner cycles the weakest-first order
// and rolls the kind, retrying when it would repeat the previous round.
import type { FactKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32, shuffle } from '../../learning/seeded-rng';
import type { EnglishItemKind, EnglishSkillId } from '../english-types';

/** Which item kinds a skill can generate (2A owns the word/sentence banks). */
export function kindsForSkill(skillId: EnglishSkillId): readonly EnglishItemKind[] {
  if (skillId.startsWith('en-letters-') || skillId.startsWith('en-sounds-')) {
    return ['letter-pick'];
  }
  if (skillId === 'en-alphabet-order') return ['letter-pick'];
  if (skillId.startsWith('en-words-') || skillId.startsWith('en-topic-')) {
    return ['listen-pick-picture', 'match-pairs'];
  }
  // Look 1 (Phase 4): pattern skills order/fill their own sentences; phonics
  // skills pick letters; every other Look skill is a word skill.
  if (skillId.startsWith('en-look-')) {
    if (skillId.endsWith('-pattern')) return ['order-words', 'fill-pattern'];
    if (skillId.startsWith('en-look-phonics-')) return ['letter-pick'];
    return ['listen-pick-picture', 'match-pairs'];
  }
  return ['order-words', 'fill-pattern'];
}

export interface PlannedRound {
  readonly skillId: EnglishSkillId;
  readonly kind: EnglishItemKind;
}

export interface ItemPlanner {
  /** The next round. Never the same (skill, kind) as `last` when the pool allows it. */
  next(last: PlannedRound | null): PlannedRound;
}

export interface ItemPlannerOptions {
  /** Skills in this run's pool (the stage unit's skillIds). */
  readonly skills: readonly EnglishSkillId[];
  readonly stats: Readonly<Record<FactKey, FactStat | undefined>>;
  readonly seed: number;
}

export function createItemPlanner(options: ItemPlannerOptions): ItemPlanner {
  if (options.skills.length === 0) throw new Error('createItemPlanner: empty skill pool');
  const rng = mulberry32(options.seed);
  const boxOf = (skillId: EnglishSkillId): number => options.stats[`sk:${skillId}`]?.box ?? 1;
  const seenOf = (skillId: EnglishSkillId): number =>
    options.stats[`sk:${skillId}`]?.lastSeenSession ?? 0;
  // Weakest first; ties keep their seeded shuffle order (Array.sort is stable).
  const order = shuffle(rng, options.skills).sort(
    (a, b) => boxOf(a) - boxOf(b) || seenOf(a) - seenOf(b),
  );
  let index = 0;
  return {
    next(last) {
      for (let tries = 0; tries < order.length; tries++) {
        const skillId = order[index % order.length] as EnglishSkillId;
        index += 1;
        const kinds = kindsForSkill(skillId);
        const kind = kinds[Math.floor(rng() * kinds.length)] as EnglishItemKind;
        if (last && last.skillId === skillId && last.kind === kind) continue;
        return { skillId, kind };
      }
      // Single-skill, single-kind pool: a repeat is unavoidable.
      const skillId = order[index % order.length] as EnglishSkillId;
      index += 1;
      return { skillId, kind: kindsForSkill(skillId)[0] as EnglishItemKind };
    },
  };
}
