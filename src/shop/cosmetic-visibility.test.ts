// Phase 22 (issue #45): a bought cosmetic must be visible on its wearer, not sunk into
// the body. The fraction of an item's vertices outside the wearer's body volume
// (robe cone / head / beard for VLM; shirt / head / hair / backpack for the player)
// must be at least MIN_VISIBLE_FRACTION. Body volumes live in
// characters-milo-avatar.ts (GUIDE_BODY / PLAYER_BODY) and mirror the model builders.
import { describe, expect, it } from 'vitest';
import type { BodyPrimitive } from '../world/characters-milo-avatar';
import {
  GUIDE_ANCHORS,
  GUIDE_BODY,
  PLAYER_ANCHORS,
  PLAYER_BODY,
} from '../world/characters-milo-avatar';
import { COSMETIC_CATALOG, type CosmeticItem } from './cosmetic-catalog';
import { mergeParts } from './vertex-color-parts';

const MIN_VISIBLE_FRACTION = 0.8;

const insideBody = (
  p: readonly [x: number, y: number, z: number],
  body: readonly BodyPrimitive[],
): boolean =>
  body.some((prim) => {
    if (prim.kind === 'cone') {
      const [x, y, z] = p;
      if (y < prim.baseY || y > prim.topY) return false;
      const t = (y - prim.baseY) / (prim.topY - prim.baseY);
      const r = prim.bottomR + (prim.topR - prim.bottomR) * t;
      const dx = x - prim.center[0];
      const dz = z - prim.center[1];
      return dx * dx + dz * dz <= r * r;
    }
    if (prim.kind === 'sphere') {
      const [cx, cy, cz] = prim.center;
      const yScale = prim.yScale ?? 1;
      const dx = (p[0] - cx) / prim.r;
      const dy = (p[1] - cy) / (prim.r * yScale);
      const dz = (p[2] - cz) / prim.r;
      return dx * dx + dy * dy + dz * dz <= 1;
    }
    const [cx, cy, cz] = prim.center;
    const [sx, sy, sz] = prim.size;
    return (
      Math.abs(p[0] - cx) <= sx / 2 &&
      Math.abs(p[1] - cy) <= sy / 2 &&
      Math.abs(p[2] - cz) <= sz / 2
    );
  });

/** Share of the item's merged vertices lying outside the wearer's body volume. */
const visibleFraction = (item: CosmeticItem): number => {
  if (item.anchor === 'ground') return 1;
  const isVlm = item.slot === 'vlm-outfit';
  const anchors = isVlm ? GUIDE_ANCHORS : PLAYER_ANCHORS;
  const body = isVlm ? GUIDE_BODY : PLAYER_BODY;
  const anchor = anchors[item.anchor];
  const geometry = mergeParts(item.buildParts());
  const pos = geometry.getAttribute('position');
  let outside = 0;
  for (let i = 0; i < pos.count; i++) {
    const p = [pos.getX(i) + anchor[0], pos.getY(i) + anchor[1], pos.getZ(i) + anchor[2]] as const;
    if (!insideBody(p, body)) outside += 1;
  }
  geometry.dispose();
  return outside / pos.count;
};

describe('cosmetic visibility (phase 22)', () => {
  it('vlm-red-scarf wraps visibly around VLM: ≥80% of its vertices outside the body', () => {
    const scarf = COSMETIC_CATALOG.find((item) => item.id === 'vlm-red-scarf');
    expect(scarf).toBeDefined();
    if (scarf === undefined) throw new Error('vlm-red-scarf not in catalog');
    expect(visibleFraction(scarf)).toBeGreaterThanOrEqual(MIN_VISIBLE_FRACTION);
  });

  it('every worn cosmetic is at least 80% outside the wearer (village decor excluded)', () => {
    const failures = COSMETIC_CATALOG.filter((item) => item.anchor !== 'ground')
      .map((item) => ({ id: item.id, fraction: visibleFraction(item) }))
      .filter(({ fraction }) => fraction < MIN_VISIBLE_FRACTION);
    expect(failures).toEqual([]);
  });
});
