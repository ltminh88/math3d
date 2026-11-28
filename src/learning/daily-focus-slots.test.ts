// Daily focus slots (boost, Phase 4A): 6 focus (weakest first, ≤ 2 per skill,
// add/sub interleaved with length) + 3 due review + 1 mastered. The hand-traced
// cases below use accuracy without `recent` (seeded-stat fallback) so the
// scores are plain correct/attempts.
import { describe, expect, it } from 'vitest';
import {
  planFocusDay,
} from './daily-focus-slots';
import type { FactKey } from './fact-key';
import type { FactStat } from './learning-types';
import { newFactStat } from './leitner-box';
import { mulberry32 } from './seeded-rng';

const dayMs = (y: number, m: number, d: number): number => new Date(y, m, d).getTime();

const stat = (
  box: number,
  partial: Partial<FactStat> = {},
): FactStat => ({
  ...newFactStat(),
  attempts: 10,
  correct: 10,
  box,
  lastSeenAt: dayMs(2026, 10, 20),
  lastSeenSession: 5,
  ...partial,
});

/** Weak add/sub skill: 2/10 correct, no labelled bug. */
const weakAdd = (id: string, correct: number, box = 1): [FactKey, FactStat] => [
  `sk:${id}` as FactKey,
  stat(box, { correct }),
];

describe('planFocusDay', () => {
  it('6 focus weakest-first interleaved + 3 review + 1 mastered', () => {
    const stats: Record<FactKey, FactStat> = {
      ...Object.fromEntries([
        weakAdd('add-sub-1000', 2), // score 0.8
        weakAdd('meas-len-convert', 5, 2), // score 0.5
        weakAdd('add-sub-column', 8), // score 0.2
        weakAdd('meas-ruler-read', 9, 3), // score 0.1
      ]),
      'mul:3x4': stat(1, { lastSeenAt: dayMs(2026, 10, 19) }),
      'mul:3x5': stat(1, { lastSeenAt: dayMs(2026, 10, 20) }),
      'div:12/3': stat(2, { lastSeenAt: dayMs(2026, 10, 21) }),
      'mul:4x4': stat(5, { lastSeenAt: dayMs(2026, 10, 1) }),
    };
    const pool = Object.keys(stats) as FactKey[];
    const { picked, spill } = planFocusDay({
      pool,
      due: ['mul:3x4', 'mul:3x5'],
      notDue: ['div:12/3'],
      mastered: ['mul:4x4'],
      stats,
      rng: mulberry32(7),
    });
    // Focus order: weakest add/sub, weakest length, next add/sub, next length,
    // then second slots (no labelled bugs, so the base keys repeat).
    expect(picked).toEqual([
      'sk:add-sub-1000',
      'sk:meas-len-convert',
      'sk:add-sub-column',
      'sk:meas-ruler-read',
      'sk:add-sub-1000',
      'sk:meas-len-convert',
      'mul:3x4',
      'mul:3x5',
      'div:12/3',
      'mul:4x4',
    ]);
    expect(spill).toEqual([]);
  });

  it('review takes due items before weaker not-due ones', () => {
    const stats: Record<FactKey, FactStat> = {
      ...Object.fromEntries([
        weakAdd('add-sub-1000', 2),
        weakAdd('add-sub-column', 3),
        weakAdd('meas-len-convert', 4, 2),
      ]),
      'mul:3x4': stat(4, { lastSeenAt: dayMs(2026, 10, 19) }),
      'mul:3x5': stat(1, { lastSeenAt: dayMs(2026, 10, 21) }),
    };
    const pool = Object.keys(stats) as FactKey[];
    const { picked } = planFocusDay({
      pool,
      due: ['mul:3x4'],
      notDue: ['mul:3x5'],
      mastered: [],
      stats,
      rng: mulberry32(7),
    });
    // Focus: add-sub-1000, meas-len-convert, add-sub-column, then second slots
    // in group round-robin (convert's second slot before 1000's).
    // Review: the due box-4 fact before the not-due box-1 fact.
    expect(picked.slice(0, 6)).toEqual([
      'sk:add-sub-1000',
      'sk:meas-len-convert',
      'sk:add-sub-column',
      'sk:meas-len-convert',
      'sk:add-sub-1000',
      'sk:add-sub-column',
    ]);
    expect(picked.slice(6)).toEqual(['mul:3x4', 'mul:3x5']);
  });

  it('a labelled bug sends the second slot to a bug-targeting format', () => {
    const stats: Record<FactKey, FactStat> = {
      'sk:add-sub-1000': stat(1, {
        correct: 2,
        bugs: ['forgot-carry', 'forgot-carry', 'near-miss'],
      }),
    };
    const pool = ['sk:add-sub-1000'] as FactKey[];
    const first = planFocusDay({
      pool,
      due: [],
      notDue: [],
      mastered: [],
      stats,
      rng: mulberry32(7),
    });
    expect(first.picked[0]).toBe('sk:add-sub-1000');
    expect(first.picked[1]).toMatch(/^sk:add-sub-(find-error|true-false)$/);
    // Same seed, same day: the format pick is deterministic.
    const second = planFocusDay({
      pool,
      due: [],
      notDue: [],
      mastered: [],
      stats,
      rng: mulberry32(7),
    });
    expect(second.picked).toEqual(first.picked);
  });

  it('one group only: the day still fills, ≤ 2 per skill', () => {
    const stats: Record<FactKey, FactStat> = {
      ...Object.fromEntries([
        weakAdd('add-sub-1000', 2),
        weakAdd('add-sub-column', 3),
        weakAdd('add-sub-match', 4),
      ]),
    };
    const pool = Object.keys(stats) as FactKey[];
    const { picked } = planFocusDay({
      pool,
      due: [],
      notDue: [],
      mastered: [],
      stats,
      rng: mulberry32(7),
    });
    expect(picked).toEqual([
      'sk:add-sub-1000',
      'sk:add-sub-column',
      'sk:add-sub-match',
      'sk:add-sub-1000',
      'sk:add-sub-column',
      'sk:add-sub-match',
    ]);
    const counts = new Map<string, number>();
    for (const k of picked) counts.set(k, (counts.get(k) ?? 0) + 1);
    for (const n of counts.values()) expect(n).toBeLessThanOrEqual(2);
  });

  it('a short pool plans short, never topped up', () => {
    const stats: Record<FactKey, FactStat> = {
      ...Object.fromEntries([weakAdd('add-sub-1000', 2), weakAdd('meas-len-convert', 5, 2)]),
      'mul:3x4': stat(1),
    };
    const pool = Object.keys(stats) as FactKey[];
    const { picked, spill } = planFocusDay({
      pool,
      due: ['mul:3x4'],
      notDue: [],
      mastered: [],
      stats,
      rng: mulberry32(7),
    });
    expect(picked).toEqual([
      'sk:add-sub-1000',
      'sk:meas-len-convert',
      'sk:add-sub-1000',
      'sk:meas-len-convert',
      'mul:3x4',
    ]);
    expect(spill).toEqual([]);
  });
});
