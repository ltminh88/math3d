// Numberfort bug-choice slots (boost, Phase 3A): stages 3 and 5 play one
// round per run of the bug-choice format at their own range (10 000 /
// 100 000). The splice keeps exactly one bug-choice round: any round-robin
// pick of the same id is removed first, then the last round becomes the
// bug-choice round. Other stages are untouched.
export const NUMBERFORT_BUG_CHOICE_SKILL: Readonly<Record<number, string>> = {
  3: 'add-sub-10000-bug-choice',
  5: 'add-sub-100000-bug-choice',
};

/** The bug-choice skill for a stage, if the stage plays one. */
export function bugChoiceSkillForStage(stage: number): string | undefined {
  return NUMBERFORT_BUG_CHOICE_SKILL[stage];
}

/** Splice the stage's bug-choice round into a planned id list (last round). */
export function withBugChoiceRound(ids: readonly string[], stage: number): string[] {
  const skill = bugChoiceSkillForStage(stage);
  if (!skill) return [...ids];
  const rest = ids.filter((id) => id !== skill);
  if (rest.length === 0) return [skill];
  // Exactly one bug-choice round, in the last slot, keeping the run length:
  // if the round-robin already picked it, the earlier occurrence is dropped
  // and the other rounds keep their places; otherwise the last round is
  // replaced.
  return [...rest.slice(0, ids.length - 1), skill];
}
