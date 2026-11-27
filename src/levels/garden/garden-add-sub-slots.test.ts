// Garden add/sub slots (boost, Phase 3A): RED-first — the slot file does not exist yet.
// One add/sub round per garden run: weakest-first among the B2 add/sub format ids
// the child has attempted (fallback: add-sub-bug-choice). Stage 1 caps the build
// tier at 1, so the ladder stays at T0 (no regroup) — inside the spec's T0–T1-only
// cap for the entry stage. The splice replaces the last non-bag round, so stage 3
// keeps both bag skills (brackets + stories) in every run; round count stays 6.
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import {
  buildGardenAddSubRound,
  GARDEN_ADD_SUB_SKILLS,
  pickGardenAddSubSkill,
  withGardenAddSubRound,
} from './garden-add-sub-slots';
import { planGardenRounds } from './garden-round-plan';

const stat = (box: number, attempts = 3): FactStat =>
  ({ box, attempts, correct: 2, totalMs: 9000, lastSeenSession: 1 }) as unknown as FactStat;

const PLANNED = [
  'sk:pattern-add',
  'sk:unknown-add-sub',
  'sk:expr-order',
  'sk:pattern-sub',
  'sk:unknown-mul-div',
  'sk:expr-brackets',
  'sk:pattern-skip-count',
  'sk:expr-from-story',
] as const;

describe('pickGardenAddSubSkill', () => {
  it('falls back to add-sub-bug-choice when no focus id was attempted', () => {
    expect(pickGardenAddSubSkill({})).toBe('add-sub-bug-choice');
    expect(pickGardenAddSubSkill({ 'sk:pattern-add': stat(1) })).toBe('add-sub-bug-choice');
  });

  it('picks the attempted focus id with the lowest box, ties in listed order', () => {
    const stats = {
      'sk:add-sub-true-false': stat(3),
      'sk:add-sub-bug-choice': stat(2),
      'sk:add-sub-column': stat(1),
    };
    expect(pickGardenAddSubSkill(stats)).toBe('add-sub-column');
    const tied = {
      'sk:add-sub-number-line': stat(2),
      'sk:add-sub-bug-choice': stat(2),
    };
    expect(pickGardenAddSubSkill(tied)).toBe('add-sub-bug-choice');
  });

  it('ignores unattempted focus ids and non-focus ids', () => {
    const stats = {
      'sk:add-sub-compare-estimate': stat(1, 0),
      'sk:add-sub-match': stat(1),
      'sk:pattern-add': stat(1),
    };
    expect(pickGardenAddSubSkill(stats)).toBe('add-sub-bug-choice');
  });

  it('the focus pool is the six B2 formats (match stays in the lesson run)', () => {
    expect(GARDEN_ADD_SUB_SKILLS).toEqual([
      'add-sub-bug-choice',
      'add-sub-true-false',
      'add-sub-compare-estimate',
      'add-sub-number-line',
      'add-sub-bar-model-wp',
      'add-sub-column',
    ]);
  });
});

describe('buildGardenAddSubRound', () => {
  it('builds an addsub round for the picked skill, tier from its box', () => {
    const stats = { 'sk:add-sub-true-false': stat(3) };
    const round = buildGardenAddSubRound(stats, mulberry32(5), 2);
    expect(round.kind).toBe('addsub');
    expect(round.skillId).toBe('add-sub-true-false');
    expect(round.factKey).toBe('sk:add-sub-true-false');
    expect(round.item.skillId).toBe('add-sub-true-false');
    expect(round.item.tier).toBe(2);
  });

  it('stage 1 caps the tier at 1 even for a box-5 skill (ladder stays T0)', () => {
    const stats = { 'sk:add-sub-bug-choice': stat(5) };
    const round = buildGardenAddSubRound(stats, mulberry32(5), 1);
    expect(round.item.tier).toBe(1);
    // The stage-1 item's pair never regroups: bug-choice story carries {a, b}.
    const p = round.item.story.params as Record<string, number>;
    const a = p.a as number;
    const b = p.b as number;
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeGreaterThanOrEqual(0);
  });

  it('is deterministic for a seed', () => {
    const a = buildGardenAddSubRound({}, mulberry32(9), 1);
    const b = buildGardenAddSubRound({}, mulberry32(9), 1);
    expect(a).toEqual(b);
  });
});

describe('withGardenAddSubRound', () => {
  const rounds = (seed = 33) => planGardenRounds([...PLANNED], {}, mulberry32(seed), 6);

  it('keeps six rounds with exactly one addsub round', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      const spliced = withGardenAddSubRound(rounds(), {}, mulberry32(4), stage);
      expect(spliced).toHaveLength(6);
      expect(spliced.filter((r) => r.kind === 'addsub')).toHaveLength(1);
      expect(new Set(spliced.map((r) => r.skillId)).size).toBe(6);
      for (let i = 1; i < spliced.length; i++) {
        expect(spliced[i]?.kind).not.toBe(spliced[i - 1]?.kind);
      }
    }
  });

  it('never replaces a bag round, so stage 3 keeps brackets and stories', () => {
    // Stage 3 drills six skills with exactly two bag skills (brackets +
    // stories), so both play in every run — the splice must not touch them.
    const stage3 = [
      'expr-brackets',
      'expr-from-story',
      'pattern-add',
      'pattern-sub',
      'unknown-add-sub',
      'unknown-mul-div',
    ];
    for (let seed = 1; seed <= 50; seed++) {
      const planned = planGardenRounds([...PLANNED], {}, mulberry32(seed), 6, stage3);
      expect(planned.map((r) => r.skillId)).toContain('expr-brackets');
      expect(planned.map((r) => r.skillId)).toContain('expr-from-story');
      const spliced = withGardenAddSubRound(planned, {}, mulberry32(seed), 3);
      const skills = spliced.map((r) => r.skillId);
      expect(skills).toContain('expr-brackets');
      expect(skills).toContain('expr-from-story');
      expect(spliced.filter((r) => r.kind === 'bag')).toHaveLength(2);
    }
  });

  it('the addsub round is the fallback skill for a fresh profile', () => {
    const spliced = withGardenAddSubRound(rounds(), {}, mulberry32(4), 1);
    expect(spliced.find((r) => r.kind === 'addsub')?.skillId).toBe('add-sub-bug-choice');
  });

  it('does not mutate the input rounds', () => {
    const before = rounds();
    const copy = [...before];
    withGardenAddSubRound(before, {}, mulberry32(4), 1);
    expect(before).toEqual(copy);
  });
});
