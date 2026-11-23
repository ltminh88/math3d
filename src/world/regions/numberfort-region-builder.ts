// Lâu Đài Số (chapter 3, east bank between city and tower): two castle towers joined by a
// wall on the north edge and three coloured number blocks by the south edge. Built into the
// expansion scratch group, then baked. Footprint probe (phase 18): centre (61,-2), 12x10 —
// clear of the city/tower footprints and both diagonals; the road enters from the west.
// Local coords are offsets from the centre.

import type { Group } from 'three';
import type { WorldBuildContext } from '../world-build-context';
import { addBox, addCylinder, blockAt } from '../world-primitives';
import { expansionRegionGroup } from './expansion-region-group';

const STONE = 0x9aa3b8;
const ROOF = 0x5b6fb8;
/** [x, colour, z] of the three number blocks by the south edge. */
const BLOCKS: readonly (readonly [x: number, color: number, z: number])[] = [
  [-2, 0xe8c53a, 3.5],
  [0, 0x599989, 3.8],
  [2, 0xd96a4f, 3.5],
];

function tower(ctx: WorldBuildContext, fort: Group, x: number, z: number): void {
  addCylinder(ctx, fort, x, 1.6, z, 1.1, 1.1, 3.2, STONE, 10);
  addCylinder(ctx, fort, x, 3.95, z, 0, 1.35, 1.5, ROOF, 10);
  blockAt(ctx, fort, x, z, 1.3);
}

export function buildNumberCastle(ctx: WorldBuildContext, solid: Group): void {
  const fort = expansionRegionGroup(solid, 'numberfort');
  tower(ctx, fort, -4, -3.5);
  tower(ctx, fort, 4, -3.5);
  // Wall joining the towers along the north edge.
  addBox(ctx, fort, 0, 0.6, -4.5, 6, 1.2, 0.8, STONE);
  blockAt(ctx, fort, 0, -4.5, 1);
  // Three number blocks by the south edge.
  for (const [x, color, z] of BLOCKS) {
    addBox(ctx, fort, x, 0.5, z, 1, 1, 1, color);
    blockAt(ctx, fort, x, z, 0.8);
  }
}
