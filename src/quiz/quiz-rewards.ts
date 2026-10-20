// Bridge quiz rewards, frozen to the original game (validated 2026-10-18). src/learning/scoring.ts
// is for later levels and must never change these (quiz-answer-batch.test.ts reads the original).

/** Every correct quiz answer, hints or not. */
export const CORRECT_ANSWER_REWARD = { xp: 10, coins: 5 } as const;
/** A correct bridge-mode answer builds one segment. */
export const BRIDGE_SEGMENTS_PER_CORRECT = 1;
/** Crossing the finished bridge the first time. */
export const QUEST_COMPLETE_REWARD = { xp: 50, coins: 10 } as const;
/** The feedback line shows "Combo N!" from this many consecutive correct answers. */
export const COMBO_SHOWN_FROM = 3;

export const NO_REWARD = { xp: 0, coins: 0 } as const;
