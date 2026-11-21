// Dialog scene registry (phase 04): every geo/meas skill's scene kind has a renderer,
// so no scene item is ever planned without a picture. Node DOM-free: only the kind map
// is asserted here; rendering itself is covered by the daily e2e spec.

import { describe, expect, test } from 'vitest';
import type { SceneKind } from '../../geometry/geo-scene-types';
import { GEOMETRY_SKILLS } from '../../geometry/geometry-item-for-skill';
import { mulberry32 } from '../../learning/seeded-rng';
import { MEASUREMENT_SKILLS } from '../../measurement/measurement-item-for-skill';
import { dialogRenderable, itemForSkill } from '../../practice/item-for-skill';
import { hasSceneRenderer, registeredSceneKinds, renderScene } from './dialog-scene-registry';

const ALL_KINDS: readonly SceneKind[] = [
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
];

describe('dialog scene registry', () => {
  test('every SceneBody kind has exactly one renderer', () => {
    expect([...registeredSceneKinds()].sort()).toEqual([...ALL_KINDS].sort());
    for (const kind of ALL_KINDS) expect(hasSceneRenderer(kind)).toBe(true);
    expect(hasSceneRenderer('nope' as SceneKind)).toBe(false);
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
