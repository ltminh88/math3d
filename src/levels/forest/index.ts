// Forest level "Rừng Nhân Chia": sharing equally, packing baskets and fact families (exact
// division, tables 2-5). Only the definition is eager; the scene is its own chunk.
import type { LevelDefinition } from '../shared/level-types';

const forestLevel: LevelDefinition = {
  id: 'forest',
  regionId: 'forest',
  tables: [2, 3, 4, 5],
  rounds: 5,
  stages: 6,
  requires: 'field',
  load: () => import('./forest-scene'),
};

export default forestLevel;
