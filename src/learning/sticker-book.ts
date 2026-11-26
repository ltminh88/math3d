// Sticker book derivation (phase 12, pure): a sticker is earned ⟺ its unit reached Leitner
// box 4+. The book reads the fact/skill stats the store already holds, so stickers need no
// storage: an old save's boxes *are* its stickers, and nothing can desync from real mastery.
import { divFactsForTables, mulFactsForTables } from './curriculum-tables';
import { type FactKey, skillKey } from './fact-key';
import type { FactStat } from './learning-types';
import { skillsOfFamily } from './skill-catalog';

/** A unit reaches its sticker at Leitner box 4 (tier 2), before full mastery (box 5). */
export const STICKER_EARN_BOX = 4;
/** Share of a table's mul+div facts at box 4+ that earns the table's sticker. */
export const TABLE_STICKER_SHARE = 0.7;
/** Tables with a sticker: 2–9 (table 10 has no level and no sticker). */
export const STICKER_TABLES: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9];

export type StickerTopic =
  | 'tables'
  | 'remainder'
  | 'unknown-pattern'
  | 'expression-logic'
  | 'geometry'
  | 'measurement'
  | 'number'
  | 'arithmetic'
  | 'fraction'
  | 'time'
  | 'money'
  | 'data'
  | 'english';

/** Book order of the topic pages (family topics stay hidden until their skills exist). */
export const STICKER_TOPICS: readonly StickerTopic[] = [
  'tables',
  'remainder',
  'unknown-pattern',
  'expression-logic',
  'geometry',
  'measurement',
  'number',
  'arithmetic',
  'fraction',
  'time',
  'money',
  'data',
  'english',
];

export interface Sticker {
  /** 'table:3' for a table, 'sk:<skillId>' for a skill. */
  readonly id: string;
  readonly topic: StickerTopic;
  readonly earned: boolean;
  /**
   * Skill stickers: the skill's Leitner box. Table stickers: how many of the table's
   * mul+div facts are already at box 4+ (the progress behind the 70% rule). The book
   * never prints this number for the child — it shows earned stickers in colour and
   * unearned ones as grey outlines.
   */
  readonly box: number;
}

/** Skill stickers per topic (the tables' division facts already count toward Bảng nhân). */
export const TOPIC_SKILLS: Readonly<Record<Exclude<StickerTopic, 'tables'>, readonly string[]>> = {
  remainder: ['div-rem-floor', 'div-rem-ceil'],
  'unknown-pattern': [
    'unknown-add-sub',
    'unknown-mul-div',
    'unknown-add-sub-wp',
    'unknown-mul-div-wp',
    'pattern-add',
    'pattern-sub',
    'pattern-skip-count',
  ],
  'expression-logic': [
    'expr-order',
    'expr-brackets',
    'expr-from-story',
    'choose-all-correct',
    'tf-explain',
    'wp-times-then-add',
    'wp-divide-then-add',
    'wp-times-then-sub',
    'wp-divide-then-sub',
    'wp-more-less-then-total',
    'wp-unit-then-times',
    'wp-times-compare',
    'wp-difference-compare',
  ],
  geometry: [
    'geo-midpoint',
    'geo-midpoint-length',
    'geo-circle-parts',
    'geo-radius-diameter',
    'geo-right-angle',
    'geo-count-right-angles',
    'geo-shape-classify',
    'geo-shape-count',
    'geo-solid-identify',
    'geo-solid-parts',
  ],
  measurement: [
    'meas-ruler-read',
    'meas-mm-convert',
    'meas-gram',
    'meas-gram-calc',
    'meas-ml',
    'meas-ml-calc',
    'meas-temperature',
    'meas-temperature-compare',
    'meas-perimeter-polygon',
    'meas-perimeter-rect',
    'meas-perimeter-square',
    'meas-area-count',
    'meas-area-equal',
    'meas-area-rect',
    'meas-area-square',
    'meas-wp-fence',
    // Boost, Phase 1B: the length ladder (measurement is a hardcoded list here).
    'meas-len-ladder',
    'meas-len-convert',
    'meas-len-convert-far',
    'meas-len-compare',
    'meas-len-order',
    'meas-len-choose-unit',
    'meas-len-mixed',
    'meas-len-add-sub',
  ],
  // New families: the topic is the family — no per-skill edits when a family phase lands.
  number: skillsOfFamily('number'),
  arithmetic: skillsOfFamily('arithmetic'),
  fraction: skillsOfFamily('fraction'),
  time: skillsOfFamily('time'),
  money: skillsOfFamily('money'),
  data: skillsOfFamily('data'),
  english: skillsOfFamily('english'),
};

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

/** All 47 stickers, in book order, derived from the stats alone. */
export function deriveStickers(stats: Stats): Sticker[] {
  const boxOf = (key: FactKey): number => stats[key]?.box ?? 1;
  const stickers: Sticker[] = STICKER_TABLES.map((table) => {
    const facts = [...mulFactsForTables([table]), ...divFactsForTables([table])];
    const at = facts.filter((k) => boxOf(k) >= STICKER_EARN_BOX).length;
    return {
      id: `table:${table}`,
      topic: 'tables',
      earned: at / facts.length >= TABLE_STICKER_SHARE,
      box: at,
    };
  });
  for (const topic of STICKER_TOPICS) {
    if (topic === 'tables') continue;
    for (const skill of TOPIC_SKILLS[topic]) {
      const box = boxOf(skillKey(skill));
      stickers.push({ id: `sk:${skill}`, topic, earned: box >= STICKER_EARN_BOX, box });
    }
  }
  return stickers;
}

/** Earned/total for one topic page (the header count, e.g. 3/8). */
export function topicProgress(
  stickers: readonly Sticker[],
  topic: StickerTopic,
): { earned: number; total: number } {
  const page = stickers.filter((s) => s.topic === topic);
  return { earned: page.filter((s) => s.earned).length, total: page.length };
}

/**
 * Topics with at least one sticker, in book order. A family topic stays hidden until its
 * first skill exists — an empty page would show nothing to tap.
 */
export function visibleTopics(stickers: readonly Sticker[]): StickerTopic[] {
  return STICKER_TOPICS.filter((t) => stickers.some((s) => s.topic === t));
}

/**
 * The earning announcement, tracked in memory per session: `noteBaseline` snapshots the
 * stickers the child already owns (an old save's stickers never announce); `check`
 * returns each newly earned sticker exactly once.
 */
export interface EarningTracker {
  noteBaseline(stats: Stats): void;
  check(stats: Stats): Sticker[];
}

export function createEarningTracker(): EarningTracker {
  const announced = new Set<string>();
  let baselined = false;
  const noteBaseline = (stats: Stats): void => {
    for (const s of deriveStickers(stats)) if (s.earned) announced.add(s.id);
    baselined = true;
  };
  const check = (stats: Stats): Sticker[] => {
    if (!baselined) {
      // First sight is the baseline: nothing earned before this session announces.
      noteBaseline(stats);
      return [];
    }
    const fresh = deriveStickers(stats).filter((s) => s.earned && !announced.has(s.id));
    for (const s of fresh) announced.add(s.id);
    return fresh;
  };
  return { noteBaseline, check };
}
