// Valley level "Thung Lũng Hình Học" (chapter 2, KNTT B16-B21): six rounds of hands-on geometry on
// the stone board (midpoint, circles, the ê-ke on corners, shapes, blocks) over the `geo-*`
// skills. Only the definition is eager; the scene is its own chunk.
import type { LevelDefinition } from '../shared/level-types';

const valleyLevel: LevelDefinition = {
  id: 'valley',
  regionId: 'valley',
  // Skills, not tables, drive the valley; the tables only satisfy the shared contract.
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: 6,
  requires: 'garden',
  load: () => import('./valley-scene'),
};

export default valleyLevel;
