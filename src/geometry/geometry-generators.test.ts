import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { skillsOfFamily } from '../learning/skill-catalog';
import type { SkillTier } from '../learning/skill-tiers';
import type { GeoItem } from './geo-scene-types';
import { GEOMETRY_SKILLS, geometryItemForSkill } from './geometry-item-for-skill';
import {
  classify,
  correctLabels,
  countRectangles,
  countTriangles,
  isConvex,
  lastValue,
  rightAngles,
  stepValue,
} from './geometry-test-oracles';
import { sweepItem } from './geometry-test-sweep';

const p = (i: GeoItem, k: string) => Number(i.story.params?.[k]);
const scene = <K extends GeoItem['scene']['kind']>(i: GeoItem, kind: K) => {
  expect(i.scene.kind).toBe(kind);
  return i.scene as Extract<GeoItem['scene'], { kind: K }>;
};
const firstPrompt = (i: GeoItem) => i.steps[0]?.prompt.key ?? '';
const PARTS: Record<string, number> = { Faces: 6, Edges: 12, Vertices: 8 };
const CM = ['midFind', 'midDouble', 'midCheck', 'circleR', 'circleD', 'circleRow'];

/** Independent answers per story key, from the story params and the scene's raw data. */
const ORACLE: Record<string, (i: GeoItem) => void> = {
  midFind: (i) => {
    expect(p(i, 'len') % 2).toBe(0);
    expect(scene(i, 'segment').length).toBe(p(i, 'len'));
    expect(lastValue(i) * 2).toBe(p(i, 'len'));
  },
  midDouble: (i) => expect(lastValue(i)).toBe(2 * p(i, 'half')),
  midCheck: (i) => {
    const step = i.steps[0];
    if (step?.kind !== 'verdict') throw new Error('midCheck needs a verdict');
    expect(step.answer).toBe(p(i, 'am') === p(i, 'mb'));
    expect(step.fix?.answer).toBe(step.answer ? undefined : (p(i, 'am') + p(i, 'mb')) / 2);
    expect(scene(i, 'segment').points.find((pt) => pt.label === 'M')?.at).toBe(p(i, 'am'));
  },
  circleParts: (i) => {
    const s = scene(i, 'circle');
    const at = new Map(s.points.map((pt) => [pt.label, pt.angleDeg]));
    const role = (a: string, b: string) => {
      const [x, y] = [at.get(a), at.get(b)];
      if (x === null || y === null) return 'radius';
      return Math.abs((x as number) - (y as number)) % 360 === 180 ? 'diameter' : 'chord';
    };
    const want = firstPrompt(i) === 'pickDiameter' ? 'diameter' : 'radius';
    const step = i.steps[0];
    if (step?.kind !== 'choice' && step?.kind !== 'multi') throw new Error('needs options');
    for (const o of step.options)
      expect(role(String(o.label.params?.a), String(o.label.params?.b)) === want).toBe(o.correct);
  },
  circleR: (i) => expect(lastValue(i)).toBe(2 * p(i, 'r')),
  circleD: (i) => expect(lastValue(i) * 2).toBe(p(i, 'd')),
  circleRow: (i) => {
    expect(stepValue(i.steps[0])).toBe(2 * p(i, 'r'));
    expect(lastValue(i)).toBe(2 * p(i, 'r') * p(i, 'count'));
  },
  rightAngle: (i) => {
    const right = scene(i, 'angles')
      .angles.filter((a) => a.degrees === 90)
      .map((a) => a.label);
    expect(correctLabels(i).sort()).toEqual(right.sort());
  },
  countRight: (i) => {
    const [shape] = scene(i, 'shapes').shapes;
    expect(isConvex(shape?.vertices ?? [])).toBe(true);
    expect(lastValue(i)).toBe(rightAngles(shape?.vertices ?? []));
  },
  mostRight: (i) => {
    const counts = scene(i, 'shapes').shapes.map(
      (s) => [s.label, rightAngles(s.vertices)] as const,
    );
    const max = Math.max(...counts.map((c) => c[1]));
    const best = counts.filter((c) => c[1] === max);
    expect(best).toHaveLength(1);
    expect(correctLabels(i)).toEqual([best[0]?.[0]]);
  },
  classify: (i) => {
    const target = firstPrompt(i).split('_')[1] as string;
    const shapes = scene(i, 'shapes').shapes;
    const classes = shapes.map((s) => classify(s.vertices));
    for (const s of shapes) expect(isConvex(s.vertices)).toBe(true);
    // KNTT B19: a square is never offered as a rectangle, nor a rectangle as a "tứ giác".
    if (target === 'rect') expect(classes).not.toContain('square');
    if (target === 'quad')
      expect(classes.filter((c) => c === 'rect' || c === 'square')).toEqual([]);
    const want = shapes.filter((_, k) => classes[k] === target).map((s) => s.label);
    expect(correctLabels(i).sort()).toEqual(want.sort());
  },
  countShapes: (i) => {
    const s = scene(i, 'figure');
    if (s.ask === 'triangle') expect(lastValue(i)).toBe(countTriangles(s.segments));
    else {
      const { rects, squares } = countRectangles(s.segments);
      expect(squares).toBe(0);
      expect(lastValue(i)).toBe(rects);
    }
  },
  solidName: (i) => {
    const [solid] = scene(i, 'solids').solids;
    const cube = new Set(solid?.dims).size === 1;
    const step = i.steps[0];
    if (step?.kind !== 'choice') throw new Error('solidName needs a choice');
    expect(step.options.find((o) => o.correct)?.label.key).toBe(cube ? 'nameCube' : 'nameBox');
  },
  pickCubes: (i) => {
    const solids = scene(i, 'solids').solids;
    const cubes = solids.filter((s) => new Set(s.dims).size === 1).map((s) => s.label);
    expect(correctLabels(i).sort()).toEqual(cubes.sort());
  },
  partsCube: (i) => expect(lastValue(i)).toBe(PARTS[firstPrompt(i).slice(3)]),
  partsBox: (i) => expect(lastValue(i)).toBe(PARTS[firstPrompt(i).slice(3)]),
  decor: (i) => {
    const part = { 'i:face': 'Faces', 'i:edge': 'Edges', 'i:vertex': 'Vertices' }[
      String(i.story.params?.part)
    ];
    const parts = PARTS[part ?? ''] as number;
    expect(stepValue(i.steps[0])).toBe(parts);
    expect(lastValue(i)).toBe(parts * p(i, 'per'));
  },
};

describe('geometry generators', () => {
  it('cover every geo-* skill of the catalog', () => {
    expect([...GEOMETRY_SKILLS].sort()).toEqual(skillsOfFamily('geometry').sort());
  });

  for (const skillId of GEOMETRY_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers <= 100, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = geometryItemForSkill(skillId, mulberry32(seed), tier);
          sweepItem(item, skillId, tier, seed);
          const oracle = ORACLE[item.story.key];
          expect(oracle, `oracle for ${item.story.key}`).toBeDefined();
          oracle?.(item);
          expect(item.unit).toBe(CM.includes(item.story.key) ? 'cm' : null);
          if (seed < 20)
            expect(geometryItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });

  it('refuses skills it has no generator for', () => {
    expect(() => geometryItemForSkill('meas-gram', mulberry32(1), 1)).toThrow();
  });
});
