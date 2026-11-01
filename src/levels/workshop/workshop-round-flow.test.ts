import { describe, expect, it } from 'vitest';
import { skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import { MEASUREMENT_SKILLS } from '../../measurement/measurement-item-for-skill';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { WorkshopRoundFlow } from './workshop-round-flow';
import { planWorkshopRounds, rectOf } from './workshop-round-plan';
import { planWorkshopSkills, STATION_OF, WORKSHOP_ROUNDS } from './workshop-stations';

const stat = (box: number, lastSeenSession = 1): FactStat => ({
  ...newFactStat(),
  attempts: 1,
  box,
  lastSeenSession,
});

describe('workshop skill plan', () => {
  it('maps every measurement skill to a station', () => {
    expect(Object.keys(STATION_OF).sort()).toEqual([...MEASUREMENT_SKILLS].sort());
  });

  it('plays six rounds in story order: ruler, fence, tiles of the same rectangle, instruments', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const skills = planWorkshopSkills({}, mulberry32(seed), WORKSHOP_ROUNDS);
      expect(skills).toHaveLength(6);
      expect(skills[1]).toBe('meas-perimeter-rect');
      expect(skills[2]).toBe('meas-area-rect');
      const stations = skills.map((s) => STATION_OF[s] as string);
      expect(stations.slice(0, 3)).toEqual(['ruler', 'fence', 'tiles']);
      expect(['fence', 'tiles']).toContain(stations[3]);
      const instruments = ['balance', 'jug', 'thermometer'];
      const [a, b] = stations.slice(4).map((s) => instruments.indexOf(s));
      expect(a).toBeGreaterThanOrEqual(0);
      expect(b).toBeGreaterThan(a as number);
      expect(new Set(skills.slice(4)).size).toBe(2);
    }
  });

  it('picks the weakest skill of a slot first (lowest box, then least recently seen)', () => {
    const stats = {
      [skillKey('meas-ruler-read')]: stat(4),
      [skillKey('meas-mm-convert')]: stat(2),
      [skillKey('meas-gram')]: stat(5),
      [skillKey('meas-ml')]: stat(2, 9),
      [skillKey('meas-temperature')]: stat(2, 3),
    };
    for (let seed = 1; seed <= 20; seed++) {
      const skills = planWorkshopSkills(stats, mulberry32(seed), 6);
      expect(skills[0]).toBe('meas-mm-convert');
      expect(skills.slice(4).sort()).toEqual(['meas-ml', 'meas-temperature']);
    }
  });

  it('every skill is reachable over many runs', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 300; seed++)
      for (const s of planWorkshopSkills({}, mulberry32(seed), 6)) seen.add(s);
    expect([...seen].sort()).toEqual([...MEASUREMENT_SKILLS].sort());
  });
});

describe('workshop round plan', () => {
  it('uses the tier of each skill box and the same rectangle for perimeter and area', () => {
    for (const box of [1, 3, 5]) {
      const stats = Object.fromEntries(MEASUREMENT_SKILLS.map((id) => [skillKey(id), stat(box)]));
      for (let seed = 1; seed <= 150; seed++) {
        const rng = mulberry32(seed);
        const rounds = planWorkshopRounds(planWorkshopSkills(stats, rng, 6), stats, rng);
        const tier = box >= 5 ? 3 : box >= 3 ? 2 : 1;
        for (const r of rounds) {
          expect(r.tier).toBe(tier);
          expect(r.factKey).toBe(skillKey(r.skillId));
          expect(r.item.skillId).toBe(r.skillId);
          expect(r.station).toBe(STATION_OF[r.skillId]);
        }
        expect(rectOf(rounds[1]?.item)).toEqual(rectOf(rounds[2]?.item));
        expect(rectOf(rounds[1]?.item)).not.toBeNull();
      }
    }
  });

  it('a tier-1 area round is small enough to tile (at most 20 cells)', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const rng = mulberry32(seed);
      const rounds = planWorkshopRounds(planWorkshopSkills({}, rng, 6), {}, rng);
      const area = rounds[2];
      expect(area?.tiling).toBe(true);
      // The fence round walks the same rectangle; only tiling rounds tile.
      expect(rounds[1]?.tiling).toBe(false);
      const rect = rectOf(area?.item) as [number, number];
      expect(rect[0] * rect[1]).toBeLessThanOrEqual(20);
    }
  });

  it('is deterministic for a seed', () => {
    const plan = (seed: number) => {
      const rng = mulberry32(seed);
      return planWorkshopRounds(planWorkshopSkills({}, rng, 6), {}, rng);
    };
    expect(plan(42)).toEqual(plan(42));
  });
});

describe('workshop round flow', () => {
  const rounds = () => {
    const rng = mulberry32(7);
    return planWorkshopRounds(planWorkshopSkills({}, rng, 6), {}, rng);
  };

  it('a clean round records a first-try sk: outcome and moves on', () => {
    let t = 1000;
    const flow = new WorkshopRoundFlow(rounds(), () => t);
    const steps = playableSteps(flow.round?.item as never).length;
    t = 4000;
    for (let i = 0; i < steps; i++) expect(flow.answer(true)).toBe('correct');
    expect(flow.roundComplete).toBe(true);
    const outcome = flow.finishRound();
    expect(outcome).toEqual({
      factKey: flow.round?.factKey,
      ms: 3000,
      correct: true,
      firstTry: true,
      usedHint: false,
      wrongAnswers: [],
    });
    flow.next();
    expect(flow.index).toBe(1);
    expect(flow.stepIndex).toBe(0);
  });

  it('offers a hint after a miss, climbs three rungs and reveals after three misses', () => {
    const flow = new WorkshopRoundFlow(rounds(), () => 0);
    expect(flow.hintOffered).toBe(false);
    expect(flow.answer(false, 12)).toBe('wrong');
    expect(flow.hintOffered).toBe(true);
    expect([flow.takeHint(), flow.takeHint(), flow.takeHint(), flow.takeHint()]).toEqual([
      1, 2, 3, 3,
    ]);
    expect(flow.answer(false, 13)).toBe('wrong');
    expect(flow.answer(false, 14)).toBe('reveal');
    expect(flow.stepIndex).toBe(1);
    expect(flow.hintRung).toBe(0);
    while (!flow.roundComplete) flow.answer(true);
    const outcome = flow.finishRound();
    expect(outcome.correct).toBe(false);
    expect(outcome.firstTry).toBe(false);
    expect(outcome.usedHint).toBe(true);
    expect(outcome.wrongAnswers).toEqual([12, 13, 14]);
  });

  it('is done after the last round', () => {
    const flow = new WorkshopRoundFlow(rounds(), () => 0);
    for (let r = 0; r < 6; r++) {
      while (!flow.roundComplete) flow.answer(true);
      flow.finishRound();
      flow.next();
    }
    expect(flow.done).toBe(true);
    expect(flow.round).toBeNull();
  });
});
