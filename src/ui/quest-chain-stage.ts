// Which quest the quest card shows (pure). The chain follows the gates: the bridge quest opens
// the field gate, then each level opens the next (forest, city, tower; chapter 2: garden, valley,
// workshop, cave); after the cave a closing card remains.
import type { ProgressionState } from '../levels/shared/level-progression';
import { nextStage, stagesCompleted } from '../levels/shared/level-stages';

/** The levels of the chain in gate order (each one's gate opens once the previous is done). */
export const CHAIN_LEVELS = [
  'field',
  'forest',
  'city',
  'tower',
  'garden',
  'valley',
  'workshop',
  'cave',
] as const;

export type ChainLevel = (typeof CHAIN_LEVELS)[number];
export type QuestStage = 'bridge' | ChainLevel | 'done';
export type ChainStage = Exclude<QuestStage, 'done'>;

/** The card shows one chapter's row (at most 5 cells, so it fits a 412 px phone). */
export const QUEST_CHAPTERS: readonly (readonly ChainStage[])[] = [
  ['bridge', 'field', 'forest', 'city', 'tower'],
  ['garden', 'valley', 'workshop', 'cave'],
];

export interface QuestChapterView {
  /** 1-based chapter number. */
  readonly chapter: number;
  readonly stages: readonly ChainStage[];
  /** Cells of this chapter already done. */
  readonly done: number;
}

/** Same state the level gates read: bridge quest flag plus the completed level ids. */
export function questStage(state: ProgressionState): QuestStage {
  if (!state.bridgeComplete) return 'bridge';
  return CHAIN_LEVELS.find((levelId) => !state.completedLevels.has(levelId)) ?? 'done';
}

/** Chapter row for `stage`; the closing card shows the last chapter complete. */
export function questChapter(stage: QuestStage): QuestChapterView {
  const last = QUEST_CHAPTERS.length - 1;
  const index = QUEST_CHAPTERS.findIndex((stages) => stages.includes(stage as ChainStage));
  const at = index < 0 ? last : index;
  const stages = QUEST_CHAPTERS[at] ?? [];
  const done = index < 0 ? stages.length : stages.indexOf(stage as ChainStage);
  return { chapter: at + 1, stages, done };
}

export interface QuestStageLine {
  /** Next stage to play (1-based). */
  readonly n: number;
  /** Total stages in the level. */
  readonly m: number;
  /** Stars earned across the level's stages so far. */
  readonly stars: number;
  /** Most stars the level can hold (3 per stage). */
  readonly max: number;
}

/**
 * Stage sub-line for the quest card's current level (pure). `stageStars` is the migrated
 * array (stage 1 === the level's stars); a missing entry is 0.
 * - One-stage level: null (nothing extra, like the gate label).
 * - Every stage done: 'all-done' → "Đã qua hết các chặng!".
 * - Else the next stage plus the level's stars so far over the level's maximum (a fresh
 *   level reads "Chặng 1/m · 0/3m sao"). The denominator matters: the celebration card
 *   already uses "Chặng n/m · {stars} sao" for ONE stage's stars, so a bare total would
 *   read as one stage's.
 */
export function questStageLine(
  stages: number,
  stageStars: readonly number[],
): QuestStageLine | 'all-done' | null {
  if (stages <= 1) return null;
  if (stagesCompleted({ stages, stageStars }) >= stages) return 'all-done';
  const n = nextStage({ stages, stageStars });
  let stars = 0;
  for (let i = 0; i < stages; i++) stars += stageStars[i] ?? 0;
  return { n, m: stages, stars, max: stages * 3 };
}
