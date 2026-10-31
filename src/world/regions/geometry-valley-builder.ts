// Thung Lũng Hình Học (chapter 2, north-east bank): stone cube, cone, cylinder and pyramid, a round
// pond and a giant ê ke (set square). Built into the expansion scratch group, then baked.
import { ExtrudeGeometry, type Group, Shape } from 'three';
import type { WorldBuildContext } from '../world-build-context';
import { addBox, addCylinder, addMesh, blockAt } from '../world-primitives';
import { expansionRegionGroup } from './expansion-region-group';

/** Right-angled set square (legs 2.4 across, 3.2 up) with the usual triangular cut-out. */
function setSquareGeometry(): ExtrudeGeometry {
  const outer = new Shape();
  outer.moveTo(0, 0);
  outer.lineTo(2.4, 0);
  outer.lineTo(0, 3.2);
  outer.closePath();
  const hole = new Shape();
  hole.moveTo(0.45, 0.45);
  hole.lineTo(1.25, 0.45);
  hole.lineTo(0.45, 1.55);
  hole.closePath();
  outer.holes.push(hole);
  return new ExtrudeGeometry(outer, { depth: 0.25, bevelEnabled: false });
}

export function buildGeometryValley(ctx: WorldBuildContext, root: Group): void {
  const valley = expansionRegionGroup(root, 'valley');
  // Pond with a sandy rim (west).
  addCylinder(ctx, valley, -7, 0.05, 1, 2.6, 2.6, 0.06, 0xdcc998, 20).castShadow = false;
  addCylinder(ctx, valley, -7, 0.08, 1, 2.2, 2.2, 0.06, 0x5cc0d3, 20).castShadow = false;
  blockAt(ctx, valley, -7, 1, 2.4);
  // Solid shapes.
  addBox(ctx, valley, -3, 0.8, -3, 1.6, 1.6, 1.6, 0xd8d2c4).rotation.y = 0.4;
  blockAt(ctx, valley, -3, -3, 1.2);
  addCylinder(ctx, valley, -9.5, 1.1, -3, 0, 1, 2.2, 0xe2b866, 10);
  blockAt(ctx, valley, -9.5, -3, 1);
  addCylinder(ctx, valley, -1, 0.9, 3, 0.8, 0.8, 1.8, 0x9fc3d6, 12);
  blockAt(ctx, valley, -1, 3, 0.9);
  addCylinder(ctx, valley, -5, 0.7, 3.5, 0, 1.1, 1.4, 0xc49bd8, 4).rotation.y = Math.PI / 4;
  blockAt(ctx, valley, -5, 3.5, 0.9);
  // Giant ê ke standing on its short leg, facing the default camera (+z).
  addMesh(ctx, valley, setSquareGeometry(), 0xf2c14e, 0.5, 0, -3.6);
  addBox(ctx, valley, 1.7, 0.08, -3.5, 2.8, 0.16, 0.6, 0xb8a98a);
  blockAt(ctx, valley, 1.7, -3.5, 1.6);
}
