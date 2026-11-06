import { describe, expect, it } from 'vitest';
import { nearRoad } from '../world/world-scatter-exclusion';
import { nearExpansionRoad } from './expansion-region-lookup';
import { EXPANSION_REGIONS } from './expansion-regions';
import { EXPANSION_SIGNPOSTS } from './expansion-signposts';
import { LEVEL_GATES } from './level-gate-config';
import { RIVER, WALKABLE_BOUNDS } from './world-constants';

const degreesBetween = (a: readonly number[], b: readonly number[]): number => {
  const dot = (a[0] ?? 0) * (b[0] ?? 0) + (a[1] ?? 0) * (b[1] ?? 0);
  const lengths = Math.hypot(a[0] ?? 0, a[1] ?? 0) * Math.hypot(b[0] ?? 0, b[1] ?? 0);
  return (Math.acos(Math.min(1, dot / lengths)) * 180) / Math.PI;
};

const centerOf = (id: string) => {
  const region = EXPANSION_REGIONS.find((r) => r.id === id);
  if (!region) throw new Error(`unknown region ${id}`);
  return region.center;
};

const nearAnyRoad = (x: number, z: number, d: number) =>
  nearRoad(x, z, d) || nearExpansionRoad(x, z, d);

describe('expansion signposts', () => {
  it('cover the west bridgehead, the west-bank cave road and the east junction', () => {
    const ids = EXPANSION_SIGNPOSTS.map((post) => post.id);
    expect(ids).toEqual(
      expect.arrayContaining(['west-bridgehead', 'west-junction', 'cave-branch', 'east-junction']),
    );
    const caveBoards = EXPANSION_SIGNPOSTS.filter((post) =>
      post.boards.some((board) => board.target === 'cave'),
    );
    expect(caveBoards.filter((post) => post.position[0] < RIVER.riverMin).length).toBeGreaterThan(
      2,
    );
  });

  it('every arrow points toward its target region within 30 degrees', () => {
    for (const post of EXPANSION_SIGNPOSTS) {
      for (const board of post.boards) {
        const [tx, tz] = centerOf(board.target);
        const toTarget = [tx - post.position[0], tz - post.position[1]];
        expect(
          degreesBetween(board.heading, toTarget),
          `${post.id} → ${board.target}`,
        ).toBeLessThan(30);
      }
    }
  });

  it('posts stand beside a road, never on it, on a bank and clear of the gates', () => {
    for (const post of EXPANSION_SIGNPOSTS) {
      const [x, z] = post.position;
      expect(nearAnyRoad(x, z, 2.5), `${post.id} off the road`).toBe(false);
      expect(nearAnyRoad(x, z, 4.5), `${post.id} beside a road`).toBe(true);
      const bank = x < RIVER.riverMin ? WALKABLE_BOUNDS.west : WALKABLE_BOUNDS.east;
      expect(x > bank.minX && x < bank.maxX - 0.5, `${post.id} on a bank`).toBe(true);
      for (const gate of LEVEL_GATES) {
        expect(Math.hypot(x - gate.position[0], z - gate.position[1])).toBeGreaterThan(6);
      }
    }
  });

  it('boards never reach over a road (no overhead plank across the walking path)', () => {
    for (const post of EXPANSION_SIGNPOSTS) {
      for (const board of post.boards) {
        const length = Math.hypot(board.heading[0], board.heading[1]);
        for (let s = 0; s <= 2.5; s += 0.05) {
          const x = post.position[0] + (board.heading[0] / length) * s;
          const z = post.position[1] + (board.heading[1] / length) * s;
          expect(nearAnyRoad(x, z, 1.55), `${post.id} → ${board.target} at ${s}`).toBe(false);
        }
      }
    }
  });
});
