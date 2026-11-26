import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { SEED_UNIT_1 } from '../content/seed-unit-1';
import { createItemPlanner, kindsForSkill, type PlannedRound } from './item-planner';

const stat = (box: number, lastSeenSession = 0): FactStat => ({
  attempts: 1,
  correct: 1,
  totalMs: 1000,
  box,
  lastSeenSession,
  lastSeenAt: 0,
  streak: 0,
  fluent: false,
  errs: [],
});

describe('kindsForSkill', () => {
  it('maps letters/sounds/alphabet to letter-pick', () => {
    expect(kindsForSkill('en-letters-a-d')).toEqual(['letter-pick']);
    expect(kindsForSkill('en-sounds-a-d')).toEqual(['letter-pick']);
    expect(kindsForSkill('en-alphabet-order')).toEqual(['letter-pick']);
  });
  it('maps words/topics to listen + pairs, patterns to order + fill', () => {
    expect(kindsForSkill('en-words-a-d')).toEqual(['listen-pick-picture', 'match-pairs']);
    expect(kindsForSkill('en-topic-animals')).toEqual(['listen-pick-picture', 'match-pairs']);
    expect(kindsForSkill('en-pattern-i-like')).toEqual(['order-words', 'fill-pattern']);
  });
});

describe('createItemPlanner', () => {
  it('is deterministic per seed and varies with the seed', () => {
    const run = (seed: number): PlannedRound[] => {
      const planner = createItemPlanner({ skills: SEED_UNIT_1.skillIds, stats: {}, seed });
      let last: PlannedRound | null = null;
      const out: PlannedRound[] = [];
      for (let i = 0; i < 16; i++) {
        last = planner.next(last);
        out.push(last);
      }
      return out;
    };
    expect(run(7)).toEqual(run(7));
    expect(run(7)).not.toEqual(run(8));
  });

  it('never repeats the same (skill, kind) twice in a row', () => {
    const planner = createItemPlanner({ skills: SEED_UNIT_1.skillIds, stats: {}, seed: 42 });
    let last: PlannedRound | null = null;
    for (let i = 0; i < 40; i++) {
      const next = planner.next(last);
      if (last) expect(`${next.skillId}:${next.kind}`).not.toBe(`${last.skillId}:${last.kind}`);
      last = next;
    }
  });

  it('plans the weakest skill first', () => {
    const stats = {
      'sk:en-letters-a-d': stat(5, 9),
      'sk:en-sounds-a-d': stat(4, 9),
      'sk:en-words-a-d': stat(1, 9),
      'sk:en-pattern-i-like': stat(3, 9),
      'sk:en-pattern-this-is': stat(2, 9),
    };
    const planner = createItemPlanner({ skills: SEED_UNIT_1.skillIds, stats, seed: 1 });
    expect(planner.next(null).skillId).toBe('en-words-a-d');
    expect(planner.next(null).skillId).toBe('en-pattern-this-is');
  });

  it('breaks box ties by oldest lastSeenSession', () => {
    const stats = {
      'sk:en-letters-a-d': stat(1, 5),
      'sk:en-sounds-a-d': stat(1, 1),
      'sk:en-words-a-d': stat(1, 9),
      'sk:en-pattern-i-like': stat(1, 3),
      'sk:en-pattern-this-is': stat(1, 7),
    };
    const planner = createItemPlanner({ skills: SEED_UNIT_1.skillIds, stats, seed: 1 });
    expect(planner.next(null).skillId).toBe('en-sounds-a-d');
    expect(planner.next(null).skillId).toBe('en-pattern-i-like');
  });

  it('throws on an empty pool', () => {
    expect(() => createItemPlanner({ skills: [], stats: {}, seed: 1 })).toThrow('empty skill pool');
  });
});
