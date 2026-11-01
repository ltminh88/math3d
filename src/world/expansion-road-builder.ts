// Ground layer of the chapter 2 regions: a low pad per region and the expansion roads (strips with
// round caps, same look as the recovered roads). Built into the expansion scratch group.
import type { Group } from 'three';
import { EXPANSION_REGIONS } from '../config/expansion-regions';
import { EXPANSION_ROADS } from '../config/expansion-roads';
import type { WorldBuildContext } from './world-build-context';
import { addBox, addCylinder } from './world-primitives';

const PATH_COLOR = 0xead5a3;
const PAD_COLOR: Record<string, number> = { valley: 0xb5cf8a, workshop: 0xd6c08e, cave: 0xa9b48f };

export function buildExpansionGround(ctx: WorldBuildContext, root: Group): void {
  for (const region of EXPANSION_REGIONS) {
    const [x, z] = region.center;
    const [w, d] = region.size;
    // Pad top at 0.05 stays under the road strips (top 0.085).
    addBox(ctx, root, x, 0.03, z, w, 0.04, d, PAD_COLOR[region.id] ?? 0xcfc8ad);
  }
  for (const road of EXPANSION_ROADS) {
    road.forEach((to, i) => {
      const from = road[i - 1];
      if (!from) return;
      const dx = to[0] - from[0];
      const dz = to[1] - from[1];
      const strip = addBox(
        ctx,
        root,
        (from[0] + to[0]) / 2,
        0.05,
        (from[1] + to[1]) / 2,
        3,
        0.07,
        Math.hypot(dx, dz),
        PATH_COLOR,
      );
      strip.rotation.y = Math.atan2(dx, dz);
      for (const [cx, cz] of [from, to]) {
        addCylinder(ctx, root, cx, 0.052, cz, 1.5, 1.5, 0.07, PATH_COLOR, 16);
      }
    });
  }
}
