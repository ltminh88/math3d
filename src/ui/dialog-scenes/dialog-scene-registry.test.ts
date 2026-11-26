// Dialog scene registry (phase 04): every geo/meas skill's scene kind has a renderer,
// so no scene item is ever planned without a picture. Node DOM-free: only the kind map
// is asserted here; rendering itself is covered by the daily e2e spec.

import { describe, expect, test } from 'vitest';
import { DATA_SKILLS } from '../../data/data-item-for-skill';
import { FRACTION_SKILLS } from '../../fractions/fraction-item-for-skill';
import { GEOMETRY_SKILLS } from '../../geometry/geometry-item-for-skill';
import { mulberry32 } from '../../learning/seeded-rng';
import { LENGTH_SKILLS } from '../../measurement/length-item-for-skill';
import { MEASUREMENT_SKILLS } from '../../measurement/measurement-item-for-skill';
import { MONEY_SKILLS } from '../../money/money-item-for-skill';
import { NUMBER_SKILLS } from '../../numbers/number-item-for-skill';
import { dialogRenderable, itemForSkill } from '../../practice/item-for-skill';
import { TIME_SKILLS } from '../../time/time-item-for-skill';
import {
  type DialogSceneKind,
  hasSceneRenderer,
  registeredSceneKinds,
  renderScene,
} from './dialog-scene-registry';

const ALL_KINDS: readonly DialogSceneKind[] = [
  'segment',
  'circle',
  'circle-row',
  'angles',
  'shapes',
  'figure',
  'solids',
  'ruler',
  'balance',
  'jug',
  'thermometers',
  'side-polygon',
  'rect',
  'cells',
  'clock',
  'month-calendar',
  'notes',
  'data-table',
  'tally',
  'bag',
  'dice',
  'place-value',
  'number-line',
  'fraction-shape',
  'fraction-set',
  'fraction-pick',
  'length-ladder',
];

describe('dialog scene registry', () => {
  test('every SceneBody kind has exactly one renderer', () => {
    expect([...registeredSceneKinds()].sort()).toEqual([...ALL_KINDS].sort());
    for (const kind of ALL_KINDS) expect(hasSceneRenderer(kind)).toBe(true);
    expect(hasSceneRenderer('nope')).toBe(false);
  });

  test('every geo/meas skill x tier sample has a renderable scene', () => {
    for (const id of [...GEOMETRY_SKILLS, ...MEASUREMENT_SKILLS]) {
      for (const tier of [1, 2, 3] as const) {
        const item = itemForSkill(id, mulberry32(0), tier);
        if (item.scene === undefined) throw new Error(`skill ${id} tier ${tier} has no scene`);
        expect(hasSceneRenderer(item.scene.kind)).toBe(true);
        expect(dialogRenderable(item)).toBe(true);
      }
    }
  });

  test('every length-ladder skill x tier sample has a renderable scene (boost 2B)', () => {
    for (const id of LENGTH_SKILLS) {
      for (const tier of [1, 2, 3] as const) {
        const item = itemForSkill(id, mulberry32(0), tier);
        if (item.scene === undefined) throw new Error(`skill ${id} tier ${tier} has no scene`);
        expect(hasSceneRenderer(item.scene.kind)).toBe(true);
        expect(dialogRenderable(item)).toBe(true);
      }
    }
  });

  test('every time/money/data skill x tier sample has a renderable scene (phase 17)', () => {
    for (const id of [...TIME_SKILLS, ...MONEY_SKILLS, ...DATA_SKILLS]) {
      for (const tier of [1, 2, 3] as const) {
        const item = itemForSkill(id, mulberry32(0), tier);
        if (item.scene === undefined) continue;
        expect(hasSceneRenderer(item.scene.kind)).toBe(true);
        expect(dialogRenderable(item)).toBe(true);
      }
    }
  });

  test('every numbers/fraction skill x tier sample has a renderable scene (phase 16)', () => {
    for (const id of [...NUMBER_SKILLS, ...FRACTION_SKILLS]) {
      for (const tier of [1, 2, 3] as const) {
        const item = itemForSkill(id, mulberry32(0), tier);
        if (item.scene === undefined) continue;
        expect(hasSceneRenderer(item.scene.kind)).toBe(true);
        expect(dialogRenderable(item)).toBe(true);
      }
    }
  });

  test('dialogRenderable: no scene renders, scene without renderer stays out', () => {
    expect(dialogRenderable(itemForSkill('wp-times-then-add', mulberry32(0), 1))).toBe(true);
    expect(dialogRenderable({ skillId: 'x', tier: 1 } as never)).toBe(true);
    const sceneItem = itemForSkill('geo-midpoint', mulberry32(0), 1);
    expect(dialogRenderable(sceneItem)).toBe(true);
    expect(dialogRenderable(sceneItem, () => false)).toBe(false);
    // renderScene itself needs a DOM (covered by the daily e2e spec); here only the
    // unknown-kind path, which returns null without touching the document.
    expect(renderScene({ kind: 'nope' } as never)).toBeNull();
  });
});
