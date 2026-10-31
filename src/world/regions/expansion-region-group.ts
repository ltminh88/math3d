// A group centred on a chapter 2 region, added to the expansion scratch root (never the scene:
// the root is baked into a few meshes once every builder ran).
import { Group } from 'three';
import type { ExpansionRegionId } from '../../config/expansion-regions';
import { EXPANSION_REGIONS } from '../../config/expansion-regions';

export function expansionRegionGroup(root: Group, id: ExpansionRegionId): Group {
  const region = EXPANSION_REGIONS.find((r) => r.id === id);
  if (!region) throw new Error(`Unknown expansion region: ${id}`);
  const group = new Group();
  group.position.set(region.center[0], 0, region.center[1]);
  root.add(group);
  return group;
}
