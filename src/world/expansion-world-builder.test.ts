import { Group, Scene, Vector3 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { expansionRegionAt } from '../config/expansion-region-lookup';
import { EXPANSION_SIGNPOSTS } from '../config/expansion-signposts';
import { LEVEL_GATES } from '../config/level-gate-config';
import { boardRotationY } from './expansion-signpost-builder';
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

// Node test environment: a canvas whose 2D context records nothing (signpost text atlas).
function stubCanvas(): void {
  const context = new Proxy(
    { measureText: () => ({ width: 10 }) },
    { get: (target, key) => (key in target ? target[key as 'measureText'] : () => undefined) },
  );
  vi.stubGlobal('document', {
    createElement: () => ({ width: 0, height: 0, getContext: () => context }),
  });
}

describe('buildExpansionWorld', () => {
  beforeEach(stubCanvas);
  afterEach(() => vi.unstubAllGlobals());

  it('adds 4 meshes (3 baked + signpost text) and leaves the world material cache alone', () => {
    const ctx = context();
    const view = buildExpansionWorld(ctx);
    expect(ctx.scene.children).toEqual([view.ground, view.scenery, view.glow, view.signText]);
    const boards = EXPANSION_SIGNPOSTS.reduce((n, post) => n + post.boards.length, 0);
    // Two faces per board, 6 vertices per (non-indexed) face.
    expect(view.signText.geometry.getAttribute('position').count).toBe(boards * 2 * 6);
    expect(view.signText.castShadow).toBe(false);
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

describe('boardRotationY', () => {
  it('turns the pointing end of a board (+x) onto its heading', () => {
    for (const post of EXPANSION_SIGNPOSTS) {
      for (const { heading } of post.boards) {
        const end = new Vector3(1, 0, 0).applyAxisAngle(
          new Vector3(0, 1, 0),
          boardRotationY(heading),
        );
        const length = Math.hypot(heading[0], heading[1]);
        expect(end.x).toBeCloseTo(heading[0] / length, 6);
        expect(end.z).toBeCloseTo(heading[1] / length, 6);
      }
    }
  });
});
