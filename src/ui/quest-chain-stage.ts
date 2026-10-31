// Which quest the quest card shows (pure). The chain follows the gates: the bridge quest opens
// the field gate, then each level opens the next (forest, city, tower; chapter 2: garden, valley,
// workshop, cave); after the cave a closing card remains.
import type { ProgressionState } from '../levels/shared/level-progression';

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
