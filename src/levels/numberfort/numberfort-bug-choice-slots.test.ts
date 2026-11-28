// Numberfort bug-choice slots (boost, Phase 3A): RED-first — the slot file does
// not exist yet. Stages 3 and 5 play one round per run of the bug-choice format
// at their own range (10 000 / 100 000); other stages are untouched. The splice
// keeps exactly one bug-choice round: any round-robin pick of the same id is
// removed first, then the last round becomes the bug-choice round.
import { describe, expect, it } from 'vitest';
import {
  bugChoiceSkillForStage,
  NUMBERFORT_BUG_CHOICE_SKILL,
  withBugChoiceRound,
} from './numberfort-bug-choice-slots';
import {
  NUMBERFORT_HUNDRED_THOUSAND_ARITHMETIC_SKILLS,
  NUMBERFORT_TEN_THOUSAND_ARITHMETIC_SKILLS,
} from './numberfort-stage-plan';

describe('bugChoiceSkillForStage', () => {
  it('maps stage 3 to the 10000 variant and stage 5 to the 100000 variant', () => {
    expect(NUMBERFORT_BUG_CHOICE_SKILL).toEqual({
      3: 'add-sub-10000-bug-choice',
      5: 'add-sub-100000-bug-choice',
    });
    expect(bugChoiceSkillForStage(3)).toBe('add-sub-10000-bug-choice');
    expect(bugChoiceSkillForStage(5)).toBe('add-sub-100000-bug-choice');
  });

  it('has no bug-choice round for stages 1, 2 and 4', () => {
    for (const stage of [1, 2, 4]) expect(bugChoiceSkillForStage(stage)).toBeUndefined();
  });

  it('the new ids belong to their stage families', () => {
    expect(NUMBERFORT_TEN_THOUSAND_ARITHMETIC_SKILLS).toContain('add-sub-10000-bug-choice');
    expect(NUMBERFORT_HUNDRED_THOUSAND_ARITHMETIC_SKILLS).toContain('add-sub-100000-bug-choice');
  });
});

describe('withBugChoiceRound', () => {
  const ids3 = [...NUMBERFORT_TEN_THOUSAND_ARITHMETIC_SKILLS].slice(0, 6);
  const ids5 = [
    'num-read-write-100000',
    'add-5digit',
    'num-expand-100000',
    'sub-5digit',
    'num-compare-100000',
    'add-sub-100000-wp',
  ];

  it('stage 3 ends with the 10000 bug-choice round, exactly once', () => {
    const out = withBugChoiceRound(ids3, 3);
    expect(out).toHaveLength(6);
    expect(out[5]).toBe('add-sub-10000-bug-choice');
    expect(out.filter((id) => id === 'add-sub-10000-bug-choice')).toHaveLength(1);
    expect(out.slice(0, 5)).toEqual(ids3.slice(0, 5));
  });

  it('stage 5 ends with the 100000 bug-choice round, exactly once', () => {
    const out = withBugChoiceRound(ids5, 5);
    expect(out).toHaveLength(6);
    expect(out[5]).toBe('add-sub-100000-bug-choice');
    expect(out.filter((id) => id === 'add-sub-100000-bug-choice')).toHaveLength(1);
  });

  it('stays at exactly one when the round-robin already picked the id', () => {
    const picked = [
      'add-4digit',
      'add-sub-10000-bug-choice',
      'sub-4digit',
      'mul-4d-1d',
      'div-4d-1d',
      'add-sub-10000-wp',
    ];
    const out = withBugChoiceRound(picked, 3);
    expect(out.filter((id) => id === 'add-sub-10000-bug-choice')).toHaveLength(1);
    expect(out[5]).toBe('add-sub-10000-bug-choice');
    expect(out).toHaveLength(6);
  });

  it('leaves other stages untouched', () => {
    for (const stage of [1, 2, 4]) expect(withBugChoiceRound(ids3, stage)).toEqual(ids3);
  });

  it('does not mutate the input', () => {
    const copy = [...ids3];
    withBugChoiceRound(ids3, 3);
    expect(ids3).toEqual(copy);
  });
});
