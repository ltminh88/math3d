// Lesson planner (phase 05): a run is a list of fact keys for one lesson — the run loop
// (phase 06) turns each key into an item on demand, so the same skill key re-rolled is a
// new question with different numbers. Pure, node-only.
//   Order: weakest box first (unseen = box 1, so lesson mode *introduces* skills),
//   ties broken by a seeded shuffle — deterministic per (seed, stats).
//   Round-robin: one item per key, then up to five more rounds over skill keys only (a fact
//   repeated is the same question; a skill re-rolled is a new one). So a lesson with one
//   skill gives at most 6 items, and a run never repeats a fact key.
//   A key is plannable when it has a generator and passes `renderable` (phase 06 passes
//   dialogRenderable; the default renders everything). A lesson with no plannable keys
//   plans [] — the UI shows "Sắp có".
import { ARITHMETIC_SKILLS } from '../arithmetic/arithmetic-item-for-skill';
import { DATA_SKILLS } from '../data/data-item-for-skill';
import { FRACTION_SKILLS } from '../fractions/fraction-item-for-skill';
import { GEOMETRY_SKILLS } from '../geometry/geometry-item-for-skill';
import { LENGTH_SKILLS } from '../measurement/length-item-for-skill';
import { MEASUREMENT_SKILLS } from '../measurement/measurement-item-for-skill';
import { MONEY_SKILLS } from '../money/money-item-for-skill';
import { NUMBER_SKILLS } from '../numbers/number-item-for-skill';
import { REASONING_SKILLS } from '../reasoning/reasoning-item-for-skill';
import { TIME_SKILLS } from '../time/time-item-for-skill';
import type { FactKey } from './fact-key';
import { isSkillKey } from './fact-key';
import { type KnttLesson, lessonByNumber, skillsOfLesson } from './kntt-lesson-index';
import type { FactStat } from './learning-types';
import { type Rng, shuffle } from './seeded-rng';
import { SKILL_CATALOG, type SkillFamily, skillEntry } from './skill-catalog';

/** Default items in a lesson run (phase 06). */
export const LESSON_RUN_ITEMS = 6;
/** One skill contributes at most this many items to a run (phase 21: six, so a
 * single-skill lesson still fills a 6-item run with re-rolls). */
export const MAX_ITEMS_PER_SKILL = 6;

export interface PlanLessonRunOpts {
  /** Items in the run (default 6); capped by what the lesson can supply. */
  items?: number;
  /** True when the key can be shown in the lesson dialog; default: everything renders. */
  renderable?: (key: FactKey) => boolean;
}

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

/** The reasoning module generates six legacy families; take the ids of one family. */
const byFamily = (family: SkillFamily, ids: readonly string[]): readonly string[] =>
  ids.filter((id) => skillEntry(id)?.family === family);

/** Skill ids with a generator, per family (empty = the family phase has not landed). */
const GENERATORS_BY_FAMILY: Readonly<Record<SkillFamily, readonly string[]>> = {
  'word-problem': byFamily('word-problem', REASONING_SKILLS),
  remainder: byFamily('remainder', REASONING_SKILLS),
  unknown: byFamily('unknown', REASONING_SKILLS),
  pattern: byFamily('pattern', REASONING_SKILLS),
  expression: byFamily('expression', REASONING_SKILLS),
  logic: byFamily('logic', REASONING_SKILLS),
  geometry: GEOMETRY_SKILLS,
  // Boost, Phase 1B: the length-ladder ids plan like the other measurement ids.
  measurement: [...MEASUREMENT_SKILLS, ...LENGTH_SKILLS],
  number: NUMBER_SKILLS,
  arithmetic: ARITHMETIC_SKILLS,
  fraction: FRACTION_SKILLS,
  time: TIME_SKILLS,
  money: MONEY_SKILLS,
  data: DATA_SKILLS,
  // English items come from the island engine (1B), never the lesson planner.
  english: [],
};

/**
 * True when the fact key already has a generator: table facts always do (the fact pools
 * exist); a skill does when its family generated it.
 */
export function hasGenerator(key: FactKey): boolean {
  if (!isSkillKey(key)) return true;
  const family = skillEntry(key.slice(3))?.family;
  return family !== undefined && GENERATORS_BY_FAMILY[family].includes(key.slice(3));
}

/**
 * Keys of lesson `n` that can be practised now: generated and renderable, in catalog
 * order. Throws for an unknown lesson number (via skillsOfLesson).
 */
export function plannableKeys(
  lessonN: number,
  renderable: (key: FactKey) => boolean = () => true,
): FactKey[] {
  return skillsOfLesson(lessonN).filter((k) => hasGenerator(k) && renderable(k));
}

/** A lesson run: the lesson's plannable keys, weakest box first, round-robin. */
export function planLessonRun(
  lessonN: number,
  stats: Stats,
  rng: Rng,
  opts: PlanLessonRunOpts = {},
): FactKey[] {
  const lesson = lessonByNumber(lessonN);
  if (!lesson) throw new Error(`planLessonRun: unknown lesson ${lessonN}`);
  const items = opts.items ?? LESSON_RUN_ITEMS;
  const renderable = opts.renderable ?? (() => true);
  const keys = plannableKeys(lessonN, renderable);
  if (keys.length === 0) return [];
  const boxOf = (k: FactKey): number => stats[k]?.box ?? 1;
  // Shuffled first so the stable sort below breaks box ties deterministically by seed.
  const ordered = shuffle(rng, keys).sort((a, b) => boxOf(a) - boxOf(b));
  const spread = lesson.kind === 'mix' ? spreadMixWeakestFirst(ordered, lesson, stats) : ordered;
  const skills = spread.filter(isSkillKey);
  // Round-robin: one item per key, then up to five more rounds over skill keys only (a
  // fact repeated is the same question; a skill re-rolled is a new one).
  const rounds: FactKey[] = [...spread];
  for (let round = 1; round < MAX_ITEMS_PER_SKILL; round++) rounds.push(...skills);
  return rounds.slice(0, items);
}

/**
 * Mix runs pick the weakest keys first, globally (R25, direction 1): box
 * ascending, longest unseen first inside each source group. A key below box 4
 * in a late source group is therefore picked in the next run instead of
 * starving forever — the old spread took one key per source group in order,
 * so with 8 groups and 6 items the 7th/8th groups were never reached and B8's
 * B6 table-4 leftovers got 0 picks in 20 runs. Source spread survives only
 * as the tie-break inside one box level (one key per source in turn, so a
 * fact-heavy mix still touches every source) and the seeded shuffle still
 * decides the display order within equal (box, last-seen) keys.
 */
function spreadMixWeakestFirst(keys: FactKey[], lesson: KnttLesson, stats: Stats): FactKey[] {
  const boxOf = (k: FactKey): number => stats[k]?.box ?? 1;
  const lastSeenOf = (k: FactKey): number => stats[k]?.lastSeenAt ?? 0;
  const boxes = [...new Set(keys.map(boxOf))].sort((a, b) => a - b);
  const out: FactKey[] = [];
  for (const box of boxes)
    out.push(
      ...spreadBySource(
        keys.filter((k) => boxOf(k) === box),
        lesson,
        lastSeenOf,
      ),
    );
  return out;
}

/**
 * Mix lessons spread over their source lessons: one key per source in turn, weakest
 * first within each source — the lesson's own skills lead, then its sources. Without
 * this a fact-heavy mix (B44) would plan six facts from its biggest source and never
 * touch the rest. Inside one source, the longest-unseen key goes first.
 */
function spreadBySource(
  keys: FactKey[],
  lesson: KnttLesson,
  lastSeenOf: (k: FactKey) => number = () => 0,
): FactKey[] {
  const own = SKILL_CATALOG.filter((s) =>
    s.lessons.some((ref) => ref.book === lesson.book && ref.n.includes(lesson.n)),
  ).map((s) => `sk:${s.id}`);
  const ownSet = new Set(own);
  const sourceOf = new Map<FactKey, number>();
  for (const m of lesson.mixOf ?? [])
    for (const k of skillsOfLesson(m)) if (!sourceOf.has(k)) sourceOf.set(k, m);
  const groups = new Map<number, FactKey[]>();
  for (const m of lesson.mixOf ?? []) groups.set(m, []);
  const ownKeys: FactKey[] = [];
  const unassigned: FactKey[] = [];
  for (const key of keys) {
    if (ownSet.has(key)) ownKeys.push(key);
    else {
      const src = sourceOf.get(key);
      if (src === undefined) unassigned.push(key);
      else groups.get(src)?.push(key);
    }
  }
  const ordered = [ownKeys, ...groups.values(), unassigned]
    .filter((g) => g.length > 0)
    // Longest unseen first inside each source (stable: equal last-seen keeps
    // the seeded-shuffle order from the caller).
    .map((g) => [...g].sort((a, b) => lastSeenOf(a) - lastSeenOf(b)));
  const out: FactKey[] = [];
  for (let i = 0; ; i++) {
    let took = false;
    for (const g of ordered) {
      if (i < g.length) {
        out.push(g[i] as FactKey);
        took = true;
      }
    }
    if (!took) break;
  }
  return out;
}
