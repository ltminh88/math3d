// Workshop length slots (boost, Phase 3B): per-stage ruler lists, the
// just-played exclusion, and the success criterion — every meas-len-* id is
// reachable from a workshop stage, weakest-first.
import { describe, expect, it } from 'vitest';
import { skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import { LENGTH_SKILLS } from '../../measurement/length-item-for-skill';
import {
  excludeJustPlayedLength,
  LENGTH_RULER_SLOTS,
  RULER_SLOT_FALLBACK,
  rulerSlotForStage,
} from './workshop-length-slots';
import { planWorkshopRounds } from './workshop-round-plan';
import { planWorkshopSkills } from './workshop-stations';

const boxed = (box: number, lastSeenSession = 0): FactStat => ({
  ...newFactStat(),
  box,
  attempts: 3,
  lastSeenSession,
});

describe('rulerSlotForStage', () => {
  it('stage 1 drills choose-unit, ladder and adjacent conversion', () => {
    expect(rulerSlotForStage(1)).toEqual([
      'meas-len-choose-unit',
      'meas-len-ladder',
      'meas-len-convert',
      ...RULER_SLOT_FALLBACK,
    ]);
  });

  it('grows along the ladder: far, compare/order, mixed, add/sub', () => {
    expect(LENGTH_RULER_SLOTS[2]).toContain('meas-len-convert-far');
    expect(LENGTH_RULER_SLOTS[3]).toEqual(
      expect.arrayContaining(['meas-len-compare', 'meas-len-order']),
    );
    expect(LENGTH_RULER_SLOTS[4]).toContain('meas-len-mixed');
    expect(LENGTH_RULER_SLOTS[5]).toContain('meas-len-add-sub');
    expect(LENGTH_RULER_SLOTS[5]).toHaveLength(8);
    for (let stage = 2; stage <= 5; stage++) {
      const prev = LENGTH_RULER_SLOTS[stage - 1] ?? [];
      const next = LENGTH_RULER_SLOTS[stage] ?? [];
      expect(next).toEqual(expect.arrayContaining([...prev]));
      expect(next.length).toBeGreaterThan(prev.length);
    }
  });

  it('an unknown stage plays stage 1', () => {
    expect(rulerSlotForStage(99)).toEqual(rulerSlotForStage(1));
  });
});

describe('excludeJustPlayedLength', () => {
  const candidates = rulerSlotForStage(3);
  const statsFor = (seen: Record<string, number>): Record<string, FactStat> =>
    Object.fromEntries(
      Object.entries(seen).map(([id, session]) => [skillKey(id), boxed(1, session)]),
    );

  it('keeps everything when nothing was played yet', () => {
    expect(excludeJustPlayedLength(candidates, {})).toEqual(candidates);
  });

  it('skips the length id played most recently while another remains', () => {
    const stats = statsFor({ 'meas-len-ladder': 7, 'meas-len-convert': 3 });
    const kept = excludeJustPlayedLength(candidates, stats);
    expect(kept).not.toContain('meas-len-ladder');
    expect(kept).toContain('meas-len-convert');
    expect(kept).toContain('meas-ruler-read');
  });

  it('keeps everything when every length id shares the last session', () => {
    const stats = statsFor(Object.fromEntries(LENGTH_SKILLS.map((id) => [id, 7])));
    expect(excludeJustPlayedLength(candidates, stats)).toEqual(candidates);
  });

  it('a just-played legacy id does not exclude anything', () => {
    const stats = statsFor({ 'meas-ruler-read': 9 });
    expect(excludeJustPlayedLength(candidates, stats)).toEqual(candidates);
  });

  it('keeps a lone length id even when it was just played', () => {
    const stats = statsFor({ 'meas-len-ladder': 4 });
    expect(excludeJustPlayedLength(['meas-len-ladder', ...RULER_SLOT_FALLBACK], stats)).toEqual([
      'meas-len-ladder',
      ...RULER_SLOT_FALLBACK,
    ]);
  });

  it('leaves a list without length ids alone', () => {
    expect(excludeJustPlayedLength(RULER_SLOT_FALLBACK, statsFor({}))).toEqual(RULER_SLOT_FALLBACK);
  });
});

describe('every meas-len-* id is reachable from a workshop stage', () => {
  it('weakest-first picks each stage id when it is the weakest', () => {
    for (let stage = 1; stage <= 5; stage++) {
      for (const id of LENGTH_RULER_SLOTS[stage] ?? []) {
        const stats = Object.fromEntries(
          rulerSlotForStage(stage).map((c) => [skillKey(c), boxed(c === id ? 1 : 5)]),
        );
        const skills = planWorkshopSkills(stats, mulberry32(7), 6, stage);
        expect(skills[0]).toBe(id);
      }
    }
  });

  it('every length id generates a round with the ladder scene', () => {
    for (const id of LENGTH_SKILLS) {
      const [round] = planWorkshopRounds([id], {}, mulberry32(7));
      expect(round?.station).toBe('ruler');
      expect(round?.item.scene.kind).toBe('length-ladder');
    }
  });
});
