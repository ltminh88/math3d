// Chợ Phiên Tí Hon (chapter 3, west bank north): three market stalls with striped awnings,
// two crates and a lantern pole. Built into the expansion scratch groups, then baked.
// Footprint probe (phase 18): centre (-32,-30), 12x8 — clear of the outer hills, the pond
// and the village; the road enters from the south. Local coords are offsets from the centre.

import type { Group } from 'three';
import type { WorldBuildContext } from '../world-build-context';
import { addBox, addCylinder, addSphere, blockAt } from '../world-primitives';
import { expansionRegionGroup } from './expansion-region-group';

const WOOD = 0xa47c52;
const AWNINGS = [0xd96a4f, 0xe8c53a, 0x599989] as const;
const GOODS = [0xe05d44, 0xf7c948, 0x7fb069] as const;

function stall(
  ctx: WorldBuildContext,
  market: Group,
  x: number,
  z: number,
  awning: number,
  goods: number,
): void {
  // Counter + slanted awning + a crate of goods on top.
  addBox(ctx, market, x, 0.45, z, 2.2, 0.9, 1, WOOD);
  const roof = addBox(ctx, market, x, 1.9, z, 2.4, 0.08, 1.5, awning);
  roof.rotation.x = 0.28;
  addBox(ctx, market, x - 0.4, 1.05, z, 0.6, 0.3, 0.6, goods);
  addBox(ctx, market, x + 0.45, 1.05, z + 0.1, 0.45, 0.3, 0.45, goods);
  blockAt(ctx, market, x, z, 1.1);
}

export function buildTinyMarket(ctx: WorldBuildContext, solid: Group, glow: Group): void {
  const market = expansionRegionGroup(solid, 'market');
  const light = expansionRegionGroup(glow, 'market');
  stall(ctx, market, -4.5, -2.8, AWNINGS[0], GOODS[0]);
  stall(ctx, market, 0, -2.8, AWNINGS[1], GOODS[1]);
  stall(ctx, market, 4, -2.8, AWNINGS[2], GOODS[2]);
  // Crates by the south edge.
  addBox(ctx, market, -4.5, 0.45, 2.5, 0.9, 0.9, 0.9, WOOD);
  blockAt(ctx, market, -4.5, 2.5, 0.7);
  addBox(ctx, market, 4.5, 0.45, 2.5, 0.9, 0.9, 0.9, WOOD);
  blockAt(ctx, market, 4.5, 2.5, 0.7);
  // Lantern pole: pole in the solid root, light in the glow root (baked unlit).
  addCylinder(ctx, market, 2.5, 1.1, 1.5, 0.07, 0.09, 2.2, 0x6b4a2f, 6);
  addSphere(ctx, light, 2.5, 2.3, 1.5, 0.22, 0xffd064);
  blockAt(ctx, market, 2.5, 1.5, 0.5);
}
