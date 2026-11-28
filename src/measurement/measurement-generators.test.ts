import { describe, expect, it } from 'vitest';
import type { GeoItem } from '../geometry/geo-scene-types';
import { correctLabels, stepValue } from '../geometry/geometry-test-oracles';
import { sweepItem } from '../geometry/geometry-test-sweep';
import { mulberry32 } from '../learning/seeded-rng';
import { skillsOfFamily } from '../learning/skill-catalog';
import type { SkillTier } from '../learning/skill-tiers';
import { OBJECTS } from './length-everyday-objects';
import { MEASUREMENT_SKILLS, measurementItemForSkill } from './measurement-item-for-skill';
import { area, UNIT } from './measurement-test-oracles';

const p = (i: GeoItem, k: string) => Number(i.story.params?.[k]);
const scene = <K extends GeoItem['scene']['kind']>(i: GeoItem, kind: K) => {
  expect(i.scene.kind).toBe(kind);
  return i.scene as Extract<GeoItem['scene'], { kind: K }>;
};
/** Values of the number / quantity steps, in order (the unit-choice step is skipped). */
const values = (i: GeoItem) =>
  i.steps.filter((s) => s.prompt.key !== 'pickUnit').map((s) => stepValue(s));
const last = (i: GeoItem) => values(i).at(-1);
const sum = (ns: readonly number[]) => ns.reduce((a, b) => a + b, 0);
const correctKey = (i: GeoItem) => {
  const step = i.steps[0];
  if (step?.kind !== 'choice') throw new Error('needs a choice');
  return step.options.find((o) => o.correct)?.label;
};

const cellsOf = (i: GeoItem) => scene(i, 'cells').groups.map((g) => g.cells);
/** Independent answers per story key, from the story params and the scene's raw data. */
const ORACLE: Record<string, (i: GeoItem) => void> = {
  rulerCm: (i) => {
    const r = scene(i, 'ruler');
    expect(r.fromMm).toBe(0);
    expect((last(i) as number) * 10).toBe(r.toMm);
  },
  rulerMm: (i) => expect(last(i)).toBe(scene(i, 'ruler').toMm - scene(i, 'ruler').fromMm),
  rulerShift: (i) => {
    expect(scene(i, 'ruler').fromMm).toBeGreaterThan(0);
    // Two number steps now (boost 1B): the cm part, then the mm part.
    const len = scene(i, 'ruler').toMm - scene(i, 'ruler').fromMm;
    expect(values(i)).toEqual([Math.floor(len / 10), len % 10]);
  },
  // R129: the T1 object must fit the number — its OBJECTS cm range contains n.
  cmToMm: (i) => {
    expect(last(i)).toBe(10 * p(i, 'n'));
    const obj = OBJECTS.find((o) => o.item === i.story.params?.item);
    expect(obj, `OBJECTS entry for ${String(i.story.params?.item)}`).toBeDefined();
    expect(obj?.unit).toBe('cm');
    expect(p(i, 'n')).toBeGreaterThanOrEqual(obj?.lo ?? 0);
    expect(p(i, 'n')).toBeLessThanOrEqual(obj?.hi ?? 0);
  },
  mmToCm: (i) => {
    expect((last(i) as number) * 10).toBe(p(i, 'm'));
    const obj = OBJECTS.find((o) => o.item === i.story.params?.item);
    expect(obj, `OBJECTS entry for ${String(i.story.params?.item)}`).toBeDefined();
    expect(obj?.unit).toBe('cm');
    expect(p(i, 'm') / 10).toBeGreaterThanOrEqual(obj?.lo ?? 0);
    expect(p(i, 'm') / 10).toBeLessThanOrEqual(obj?.hi ?? 0);
  },
  compareCmMm: (i) => {
    const [a, b] = [10 * p(i, 'a'), p(i, 'b')];
    const want = a === b ? 'sameLength' : a > b ? i.story.params?.x : i.story.params?.y;
    const label = correctKey(i);
    expect(label?.key === 'sameLength' ? 'sameLength' : label?.params?.item).toBe(want);
  },
  diffCmMm: (i) => expect(values(i)).toEqual([10 * p(i, 'a'), 10 * p(i, 'a') - p(i, 'b')]),
  balanceRead: (i) => {
    expect(scene(i, 'balance').count).toBe(1);
    expect(last(i)).toBe(sum(scene(i, 'balance').weights));
  },
  heavier: (i) => {
    const [a, b] = [p(i, 'a'), p(i, 'b')];
    expect(correctKey(i)?.params?.item).toBe(a > b ? i.story.params?.x : i.story.params?.y);
    expect(last(i)).toBe(Math.abs(a - b));
  },
  balanceShare: (i) => {
    const b = scene(i, 'balance');
    expect(values(i)).toEqual([sum(b.weights), sum(b.weights) / b.count]);
  },
  gramTotal: (i) => {
    expect(values(i)).toEqual([p(i, 'a') + p(i, 'b')]);
    expect(sum(scene(i, 'balance').weights)).toBe(p(i, 'a') + p(i, 'b'));
  },
  gramTotalLeft: (i) => {
    const [a, b, c] = [p(i, 'a'), p(i, 'b'), p(i, 'c')];
    expect(values(i)).toEqual([a + b, a + b - c]);
    expect(sum(scene(i, 'balance').weights)).toBe(a + b);
  },
  jugRead: (i) => {
    const j = scene(i, 'jug');
    expect(last(i)).toBe((j.level * j.capacity) / j.marks);
  },
  jugMarks: (i) => {
    const j = scene(i, 'jug');
    expect(values(i)).toEqual([j.capacity / j.marks, (j.level * j.capacity) / j.marks]);
  },
  jugPour: (i) => {
    expect(values(i)).toEqual([
      p(i, 'cups') * p(i, 'per'),
      p(i, 'total') - p(i, 'cups') * p(i, 'per'),
    ]);
    const j = scene(i, 'jug');
    expect((j.level * j.capacity) / j.marks).toBe(p(i, 'total'));
  },
  mlAdd: (i) => {
    const j = scene(i, 'jug');
    expect(last(i)).toBe(p(i, 'a') + p(i, 'b'));
    expect((j.level * j.capacity) / j.marks).toBe(p(i, 'a') + p(i, 'b'));
  },
  mlDiff: (i) => {
    const [a, b] = [p(i, 'a'), p(i, 'b')];
    expect(a).not.toBe(b);
    expect(last(i)).toBe(Math.abs(a - b));
    const j = scene(i, 'jug');
    expect((j.level * j.capacity) / j.marks).toBe(Math.max(a, b));
  },
  mlFill: (i) => {
    const [a, b] = [p(i, 'a'), p(i, 'b')];
    expect(values(i)).toEqual([a + b, 100 - (a + b)]);
    const j = scene(i, 'jug');
    expect((j.level * j.capacity) / j.marks).toBe(a + b);
  },
  tempRead: (i) => expect(last(i)).toBe(scene(i, 'thermometers').readings[0]?.value),
  tempHottest: (i) => checkExtreme(i, Math.max),
  tempColdest: (i) => checkExtreme(i, Math.min),
  tempDrop: (i) => expect(last(i)).toBe(p(i, 'noon') - p(i, 'night')),
  tempCompare: (i) => {
    const [a, b] = scene(i, 'thermometers').readings.map((r) => r.value) as [number, number];
    expect(a).not.toBe(b);
    expect(last(i)).toBe(Math.abs(a - b));
  },
  tempHotDiff: (i) => {
    const readings = scene(i, 'thermometers').readings;
    const temps = readings.map((r) => r.value);
    const best = Math.max(...temps);
    const winners = readings.filter((r) => r.value === best).map((r) => r.label);
    expect(winners).toHaveLength(1);
    expect(correctLabels(i)).toEqual(winners);
    expect(last(i)).toBe(Math.max(...temps) - Math.min(...temps));
  },
  tempDropCompare: (i) => {
    const [a, b, c, d] = [p(i, 'a'), p(i, 'b'), p(i, 'c'), p(i, 'd')];
    const [dx, dy] = [a - b, c - d];
    expect(dx).not.toBe(dy);
    const want = dx > dy ? i.story.params?.x : i.story.params?.y;
    expect(correctLabels(i)).toEqual([want]);
    expect(last(i)).toBe(Math.abs(dx - dy));
  },
  perimSum: (i) => {
    const s = scene(i, 'side-polygon');
    expect(s.hidden).toEqual([]);
    if (s.sides.length === 3)
      for (const side of s.sides) expect(side).toBeLessThan(sum(s.sides) - side);
    expect(last(i)).toBe(sum(s.sides));
  },
  perimMissing: (i) => {
    const s = scene(i, 'side-polygon');
    expect(s.hidden).toHaveLength(1);
    expect(sum(s.sides)).toBe(p(i, 'p'));
    expect(last(i)).toBe(s.sides[s.hidden[0] as number]);
  },
  rectPerim: (i) => expect(last(i)).toBe((p(i, 'a') + p(i, 'b')) * 2),
  rectPerimBack: (i) => {
    expect(last(i)).toBe(p(i, 'p') / 2 - p(i, 'a'));
    expect(scene(i, 'rect').height).toBe(last(i));
  },
  squarePerim: (i) => expect(last(i)).toBe(4 * p(i, 's')),
  wireSquare: (i) => expect((last(i) as number) * 4).toBe(p(i, 'p')),
  areaCount: (i) => expect(last(i)).toBe(area(cellsOf(i)[0] ?? [])),
  areaUnit: (i) => expect(last(i)).toBe(area(cellsOf(i)[0] ?? [])),
  areaDiff: (i) => {
    const [a, b] = cellsOf(i).map(area) as [number, number];
    expect(values(i)).toEqual([a, b, a - b]);
  },
  areaBigger: (i) => {
    const [a, b] = cellsOf(i).map(area) as [number, number];
    const want = a === b ? 'sameArea' : a > b ? 'A' : 'B';
    const label = correctKey(i);
    expect(label?.key === 'sameArea' ? 'sameArea' : label?.params?.l).toBe(want);
  },
  areaBiggerDiff: (i) => {
    const [a, b] = cellsOf(i).map(area) as [number, number];
    expect(a).toBeGreaterThan(b);
    expect(last(i)).toBe(a - b);
  },
  areaEqual: (i) => {
    const [a, b] = cellsOf(i).map(area) as [number, number];
    expect(a).toBe(b);
    expect(correctKey(i)?.key).toBe('sameArea');
    expect(last(i)).toBe(a);
  },
  rectArea: (i) => expect(last(i)).toBe(p(i, 'a') * p(i, 'b')),
  rectCut: (i) => {
    const [a, b, c] = [p(i, 'a'), p(i, 'b'), p(i, 'c')];
    expect(c).toBeLessThan(Math.min(a, b));
    expect(values(i)).toEqual([a * b, c * c, a * b - c * c]);
  },
  squareArea: (i) => expect(last(i)).toBe(p(i, 's') * p(i, 's')),
  squareAreaTile: (i) => expect(last(i)).toBe(p(i, 's') * p(i, 's')),
  squareAreaCard: (i) => expect(last(i)).toBe(p(i, 's') * p(i, 's')),
  squareFromRect: (i) => {
    const r = p(i, 'a') * p(i, 'b');
    const side = values(i)[2] as number;
    expect(values(i)).toEqual([r, 2 * r, side]);
    expect(side * side).toBe(2 * r);
  },
  squareFromRectTile: (i) => {
    const r = p(i, 'a') * p(i, 'b');
    const side = values(i)[2] as number;
    expect(values(i)).toEqual([r, 2 * r, side]);
    expect(side * side).toBe(2 * r);
  },
  fence: (i) => expect(last(i)).toBe((p(i, 'a') + p(i, 'b')) * 2),
  fenceGate: (i) => expect(last(i)).toBe((p(i, 'a') + p(i, 'b')) * 2 - p(i, 'g')),
  fenceWall: (i) => {
    expect(scene(i, 'rect').wall).toBe(true);
    expect(last(i)).toBe(p(i, 'a') + 2 * p(i, 'b'));
  },
};

function checkExtreme(i: GeoItem, pickFn: (...n: number[]) => number): void {
  const readings = scene(i, 'thermometers').readings;
  const best = pickFn(...readings.map((r) => r.value));
  const winners = readings.filter((r) => r.value === best).map((r) => r.label);
  expect(winners).toHaveLength(1);
  expect(correctLabels(i)).toEqual(winners);
}

describe('measurement generators', () => {
  it('cover every meas-* skill of the catalog', () => {
    // The length-ladder ids have their own dispatcher (boost 1B) and sweep:
    // they are not GeoItems, so the shared <=100 sweep cannot cover them.
    expect([...MEASUREMENT_SKILLS].sort()).toEqual(
      skillsOfFamily('measurement')
        .filter((id) => !id.startsWith('meas-len-'))
        .sort(),
    );
  });

  for (const skillId of MEASUREMENT_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers <= 100, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = measurementItemForSkill(skillId, mulberry32(seed), tier);
          sweepItem(item, skillId, tier, seed);
          const key = item.story.key;
          expect(ORACLE[key], `oracle for ${key}`).toBeDefined();
          ORACLE[key]?.(item);
          expect(item.unit, key).toBe(UNIT[key]);
          if (seed < 20)
            expect(measurementItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });

  it('refuses skills it has no generator for', () => {
    expect(() => measurementItemForSkill('geo-midpoint', mulberry32(1), 1)).toThrow();
  });
});
