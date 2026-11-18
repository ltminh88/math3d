// Workshop stage plan (phase 09): stage 1 is today's run (parity, not an assumption); later
// stages re-weight which skill fills a slot, never the slot order (ruler → fence → tiles → one
// more order → two instruments). Stage 2 drills the perimeter pair in the two fence slots, so
// both appear; stage 3 drills the area trio in the two tiling slots; stage 4 drills cm↔mm at
// the ruler and the three instruments; stage 5 guarantees the fence word problem in the flex
// slot. No skill twice in one run, in any stage.
import { describe, expect, it } from 'vitest';
import { allNumbers } from '../../geometry/geometry-test-oracles';
import { skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import { MEASUREMENT_SKILLS } from '../../measurement/measurement-item-for-skill';
import { planWorkshopRounds } from './workshop-round-plan';
import { planWorkshopSkills, STATION_OF } from './workshop-stations';

const RULER = ['meas-ruler-read', 'meas-mm-convert'];
const PERIMETER_PAIR = ['meas-perimeter-rect', 'meas-perimeter-square'];
const AREA_TRIO = ['meas-area-rect', 'meas-area-square', 'meas-area-count'];
const INSTRUMENTS = ['meas-gram', 'meas-ml', 'meas-temperature'];

const boxed = (box: number) => ({ ...newFactStat(), box, attempts: 3 });
const seen = (box = 3) =>
  Object.fromEntries(MEASUREMENT_SKILLS.map((s) => [skillKey(s), boxed(box)]));

const skills = (stats: Record<string, FactStat>, seed: number, stage: number) =>
  planWorkshopSkills(stats, mulberry32(seed), 6, stage);

describe('stage 1 (parity with today)', () => {
  it('explicit stage 1 matches the default call, fresh and returning profiles', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      expect(skills({}, seed, 1)).toEqual(planWorkshopSkills({}, mulberry32(seed), 6));
      expect(skills(seen(), seed, 1)).toEqual(planWorkshopSkills(seen(), mulberry32(seed), 6));
    }
  });

  it('an unknown stage plays stage 1', () => {
    for (const seed of [1, 2, 3]) {
      expect(skills({}, seed, 99)).toEqual(skills({}, seed, 1));
      expect(skills(seen(), seed, 99)).toEqual(skills(seen(), seed, 1));
    }
  });
});

describe('stage slot emphasis', () => {
  it('stage 2 drills both perimeter skills in the two fence slots', () => {
    for (const stats of [{}, seen()]) {
      for (const seed of [1, 2, 3, 4, 5]) {
        const s = skills(stats, seed, 2);
        expect(s).toHaveLength(6);
        expect(new Set([s[1], s[3]])).toEqual(new Set(PERIMETER_PAIR));
        expect(RULER).toContain(s[0]);
        expect(s[2]).toBe('meas-area-rect');
        expect(s.slice(4).every((id) => INSTRUMENTS.includes(id as string))).toBe(true);
        expect(new Set(s.slice(4)).size).toBe(2);
      }
    }
  });

  it('stage 3 drills two area skills in the two tiling slots', () => {
    for (const stats of [{}, seen()]) {
      for (const seed of [1, 2, 3, 4, 5]) {
        const s = skills(stats, seed, 3);
        expect(s).toHaveLength(6);
        expect(AREA_TRIO).toContain(s[2]);
        expect(AREA_TRIO).toContain(s[3]);
        expect(s[2]).not.toBe(s[3]);
        expect(s[1]).toBe('meas-perimeter-rect');
        expect(RULER).toContain(s[0]);
        expect(s.slice(4).every((id) => INSTRUMENTS.includes(id as string))).toBe(true);
        expect(new Set(s.slice(4)).size).toBe(2);
      }
    }
  });

  it('stage 4 drills mm-convert at the ruler and the instruments', () => {
    for (const stats of [{}, seen()]) {
      for (const seed of [1, 2, 3, 4, 5]) {
        const s = skills(stats, seed, 4);
        expect(s).toHaveLength(6);
        expect(s[0]).toBe('meas-mm-convert');
        expect(s[1]).toBe('meas-perimeter-rect');
        expect(s[2]).toBe('meas-area-rect');
        expect(s.slice(4).every((id) => INSTRUMENTS.includes(id as string))).toBe(true);
        expect(new Set(s.slice(4)).size).toBe(2);
      }
    }
  });

  it('stage 5 guarantees the fence word problem in the flex slot', () => {
    for (const stats of [{}, seen()]) {
      for (const seed of [1, 2, 3, 4, 5]) {
        const s = skills(stats, seed, 5);
        expect(s).toHaveLength(6);
        expect(s[3]).toBe('meas-wp-fence');
        expect(s[1]).toBe('meas-perimeter-rect');
        expect(s[2]).toBe('meas-area-rect');
        expect(RULER).toContain(s[0]);
        expect(s.slice(4).every((id) => INSTRUMENTS.includes(id as string))).toBe(true);
        expect(new Set(s.slice(4)).size).toBe(2);
      }
    }
  });

  it('every stage keeps the story slot order', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      for (const seed of [1, 2, 3]) {
        const stations = skills(seen(), seed, stage).map((s) => STATION_OF[s] as string);
        expect(stations.slice(0, 3)).toEqual(['ruler', 'fence', 'tiles']);
        expect(['fence', 'tiles']).toContain(stations[3]);
        const instruments = ['balance', 'jug', 'thermometer'];
        const [a, b] = stations.slice(4).map((s) => instruments.indexOf(s));
        expect(a).toBeGreaterThanOrEqual(0);
        expect(b).toBeGreaterThan(a as number);
      }
    }
  });
});

describe('no-repeat inside a run', () => {
  it('no skill twice in any stage, for several seeds', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      for (const stats of [{}, seen()]) {
        for (const seed of [1, 2, 3, 4, 5]) {
          expect(new Set(skills(stats, seed, stage)).size).toBe(6);
        }
      }
    }
  });
});

describe('every number a child sees is at most 100', () => {
  it('all stages, fresh and returning profiles, several seeds', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      for (const stats of [{}, seen()]) {
        for (const seed of [1, 2, 3]) {
          const rng = mulberry32(seed);
          const rounds = planWorkshopRounds(planWorkshopSkills(stats, rng, 6, stage), stats, rng);
          expect(rounds).toHaveLength(6);
          for (const round of rounds) {
            for (const n of allNumbers(round.item)) {
              expect(n).toBeGreaterThanOrEqual(0);
              expect(n).toBeLessThanOrEqual(100);
            }
          }
        }
      }
    }
  });
});
