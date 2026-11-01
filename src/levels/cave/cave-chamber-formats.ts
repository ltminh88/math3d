// Pure chamber planning of the cave: which skills the seven chambers ask (weakest box first, the
// required mix of chapter 2 reasoning), their formats (never the same twice in a row) and the
// generated items. Chamber = one recorded question under `sk:<skill id>`.

import { geometryItemForSkill, isGeometrySkill } from '../../geometry/geometry-item-for-skill';
import { type FactKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { type Rng, shuffle } from '../../learning/seeded-rng';
import { skillTierOf } from '../../learning/skill-tiers';
import { measurementItemForSkill } from '../../measurement/measurement-item-for-skill';
import { reasoningItemForSkill } from '../../reasoning/reasoning-item-for-skill';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ReasoningItem, ReasoningStep } from '../../reasoning/reasoning-types';

export type CaveFormat =
  | 'word'
  | 'remainder'
  | 'choose-all'
  | 'tf-explain'
  | 'expression'
  | 'geo-meas';
export type CaveFamily = 'reasoning' | 'geometry' | 'measurement';

const FORMAT_OF: Readonly<Record<string, CaveFormat>> = {
  'wp-times-then-add': 'word',
  'wp-divide-then-add': 'word',
  'wp-more-less-then-total': 'word',
  'wp-unit-then-times': 'word',
  'wp-times-compare': 'word',
  'wp-difference-compare': 'word',
  'div-rem-floor': 'remainder',
  'div-rem-ceil': 'remainder',
  'choose-all-correct': 'choose-all',
  'tf-explain': 'tf-explain',
  'expr-order': 'expression',
  'expr-brackets': 'expression',
  'expr-from-story': 'expression',
  'meas-wp-fence': 'geo-meas',
  'meas-perimeter-rect': 'geo-meas',
  'meas-area-rect': 'geo-meas',
  'geo-radius-diameter': 'geo-meas',
};

/** The cave's skills (reasoning, then the geometry/measurement word problems). */
export const CAVE_SKILLS: readonly string[] = Object.keys(FORMAT_OF);
/** Every run asks one of each (a 2-step word problem, a remainder in context, ...). */
export const REQUIRED_FORMATS: readonly CaveFormat[] = [
  'word',
  'remainder',
  'choose-all',
  'tf-explain',
  'geo-meas',
];
/** Top-up chambers keep a format to at most two, so the rotation always fits. */
const MAX_PER_FORMAT = 2;

export interface CaveChamber {
  readonly skillId: string;
  readonly format: CaveFormat;
  readonly family: CaveFamily;
  readonly item: ReasoningItem;
  /** Steps as played (a false verdict with a fix is followed by its number step). */
  readonly steps: readonly ReasoningStep[];
}

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

export function caveFormatOf(skillId: string): CaveFormat {
  const format = FORMAT_OF[skillId];
  if (!format) throw new Error(`cave: not a cave skill "${skillId}"`);
  return format;
}

export const caveSkillPool = (): FactKey[] => CAVE_SKILLS.map(skillKey);

const familyOf = (id: string): CaveFamily =>
  isGeometrySkill(id) ? 'geometry' : id.startsWith('meas-') ? 'measurement' : 'reasoning';

/** Could `ids` still be ordered with no format twice in a row, the first one not `last`? */
function canArrange(ids: readonly string[], last: CaveFormat | undefined): boolean {
  const counts = new Map<CaveFormat, number>();
  for (const id of ids) counts.set(caveFormatOf(id), (counts.get(caveFormatOf(id)) ?? 0) + 1);
  const n = ids.length;
  for (const [format, count] of counts) {
    if (count > Math.ceil(n / 2)) return false;
    if (format === last && count > Math.floor(n / 2)) return false;
  }
  return true;
}

/** Keeps the given order where it can; moves a chamber up only to avoid a repeated format. */
export function arrangeNoRepeat(ids: readonly string[]): string[] {
  const rest = [...ids];
  const out: string[] = [];
  while (rest.length > 0) {
    const last = out.length > 0 ? caveFormatOf(out[out.length - 1] as string) : undefined;
    let at = rest.findIndex(
      (id, i) =>
        caveFormatOf(id) !== last &&
        canArrange(
          rest.filter((_, j) => j !== i),
          caveFormatOf(id),
        ),
    );
    if (at === -1) at = 0;
    out.push(...rest.splice(at, 1));
  }
  return out;
}

/**
 * The chambers' skills: the planner's picks first, then seen skills weakest first, then fresh
 * ones; one of each required format, topped up to `length`; weakest box first, no repeats.
 */
export function planCaveSkills(
  planned: readonly FactKey[],
  stats: Stats,
  rng: Rng,
  length: number,
): string[] {
  const box = (id: string) => stats[`sk:${id}`]?.box ?? 1;
  const fromPlan = [...new Set(planned.map((k) => k.slice(3)))].filter((id) => id in FORMAT_OF);
  const rest = CAVE_SKILLS.filter((id) => !fromPlan.includes(id));
  const seen = rest
    .filter((id) => (stats[`sk:${id}`]?.attempts ?? 0) > 0)
    .sort((a, b) => box(a) - box(b));
  const fresh = shuffle(
    rng,
    rest.filter((id) => !seen.includes(id)),
  );
  const ranked = [...fromPlan, ...seen, ...fresh];
  const picked: string[] = [];
  const count = (f: CaveFormat) => picked.filter((id) => caveFormatOf(id) === f).length;
  for (const format of REQUIRED_FORMATS) {
    const id = ranked.find((s) => caveFormatOf(s) === format && !picked.includes(s));
    if (id && picked.length < length) picked.push(id);
  }
  for (const id of ranked) {
    if (picked.length >= length) break;
    if (!picked.includes(id) && count(caveFormatOf(id)) < MAX_PER_FORMAT) picked.push(id);
  }
  const order = (id: string) => ranked.indexOf(id);
  const sorted = picked.sort((a, b) => box(a) - box(b) || order(a) - order(b));
  return arrangeNoRepeat(sorted);
}

function itemFor(id: string, rng: Rng, stats: Stats): ReasoningItem {
  const tier = skillTierOf(stats[`sk:${id}`]);
  const family = familyOf(id);
  if (family === 'geometry') return geometryItemForSkill(id, rng, tier);
  if (family === 'measurement') return measurementItemForSkill(id, rng, tier);
  return reasoningItemForSkill(id, rng, tier);
}

/** Generates each chamber's item at the tier of its skill's Leitner box. */
export function buildCaveChambers(ids: readonly string[], stats: Stats, rng: Rng): CaveChamber[] {
  return ids.map((skillId) => {
    const item = itemFor(skillId, rng, stats);
    return {
      skillId,
      format: caveFormatOf(skillId),
      family: familyOf(skillId),
      item,
      steps: playableSteps(item),
    };
  });
}
