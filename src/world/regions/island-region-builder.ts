// Đảo Tiếng Anh (Phase 1A, west bank south of the bridge road): a sand islet in a pond
// ring, three palms and a plank bridge where the road enters from the north. Built into
// the expansion scratch group, then baked. Footprint probe (phase 1A): centre (-6,13),
// 12x10 — clear of the houses (-4,-11), the windmill (-15,-14), the shop stall (-7,-4),
// the pond and the gazebo; the road enters from the north. Local coords are offsets
// from the centre; the gate stands at local (-2,-3), so the path from the bridge stays
// clear of every collision circle.
import type { Group, Object3D } from 'three';
import type { WorldBuildContext } from '../world-build-context';
import { addBox, addCylinder, blockAt } from '../world-primitives';
import { expansionRegionGroup } from './expansion-region-group';

const WATER = 0x5cc6d6;
const SAND = 0xe8d29a;
const WOOD = 0xa47c52;
const TRUNK = 0x7a5232;
const FROND = 0x4f9a62;
const FLAG = 0x2f8f7b;

/** A leaning palm (trunk + four fronds) at local (x, z); no collision circle. */
export function addIslandPalm(
  ctx: WorldBuildContext,
  parent: Object3D,
  x: number,
  z: number,
): void {
  // Leaning trunk, four fronds fanning from its top.
  const trunk = addCylinder(ctx, parent, x, 1.1, z, 0.13, 0.2, 2.2, TRUNK, 6);
  trunk.rotation.z = 0.12;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 0.4;
    const frond = addCylinder(ctx, parent, x, 2.25, z, 0, 0.7, 1.4, FROND, 5);
    frond.rotation.z = 1.05 * Math.cos(angle);
    frond.rotation.x = 1.05 * Math.sin(angle);
    frond.position.set(x + 0.55 * Math.cos(angle), 2.25, z + 0.55 * Math.sin(angle));
  }
}

function palm(ctx: WorldBuildContext, islet: Group, x: number, z: number): void {
  addIslandPalm(ctx, islet, x, z);
  blockAt(ctx, islet, x, z, 0.8);
}

export function buildIsland(ctx: WorldBuildContext, solid: Group): void {
  const islet = expansionRegionGroup(solid, 'island');
  // Pond ring around the sand: the water disc shows between the sand edge and the pad.
  addCylinder(ctx, islet, 0, 0.03, 0, 5.5, 5.5, 0.08, WATER, 28);
  addCylinder(ctx, islet, 0, 0.06, 0, 4, 4, 0.12, SAND, 28);
  // Plank bridge from the road end (north edge) over the water ring onto the sand.
  for (let i = 0; i < 5; i++) {
    addBox(ctx, islet, -2, 0.16, -5.3 + i * 0.5, 1.2, 0.08, 0.5, WOOD);
  }
  palm(ctx, islet, 3.5, -2);
  palm(ctx, islet, 3.5, 2.5);
  palm(ctx, islet, -3.5, 2.5);
  // A small flag marks the islet.
  addCylinder(ctx, islet, 1.5, 0.8, -1, 0.05, 0.05, 1.6, TRUNK, 6);
  addBox(ctx, islet, 1.85, 1.45, -1, 0.7, 0.35, 0.04, FLAG);
  blockAt(ctx, islet, 1.5, -1, 0.3);
}
