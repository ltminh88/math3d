import { Group, Scene } from 'three';
import { describe, expect, it } from 'vitest';
import { expansionRegionAt } from '../config/expansion-region-lookup';
import { LEVEL_GATES } from '../config/level-gate-config';
import { buildExpansionWorld } from './expansion-world-builder';
import type { WorldBuildContext } from './world-build-context';

function context(): WorldBuildContext {
  return {
    scene: new Scene(),
    materials: new Map(),
    obstacles: [],
    floaters: [],
    ripples: [],
    windmill: new Group(),
  };
}

describe('buildExpansionWorld', () => {
  it('adds 3 baked meshes and leaves the world material cache alone', () => {
    const ctx = context();
    const view = buildExpansionWorld(ctx);
    expect(ctx.scene.children).toEqual([view.ground, view.scenery, view.glow]);
    expect(ctx.materials.size).toBe(0);
    expect(view.scenery.castShadow).toBe(true);
    expect(view.ground.castShadow).toBe(false);
  });

  it('appends collision circles inside the regions, clear of every gate', () => {
    const ctx = context();
    buildExpansionWorld(ctx);
    expect(ctx.obstacles.length).toBeGreaterThan(10);
    for (const o of ctx.obstacles) {
      expect(expansionRegionAt(o.x, o.z, 1)).toBeDefined();
      for (const gate of LEVEL_GATES) {
        const d = Math.hypot(o.x - gate.position[0], o.z - gate.position[1]);
        expect(d).toBeGreaterThan(o.radius + 1.6);
      }
    }
  });
});
