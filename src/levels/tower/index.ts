// Tower level "Tháp Toán Học": the final challenge, seven floors of mixed multiplication and
// division over tables 2-9, weak facts first. Only the definition is eager; the scene is its own
// chunk.
import type { LevelDefinition } from '../shared/level-types';

const towerLevel: LevelDefinition = {
  id: 'tower',
  regionId: 'tower',
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: 7,
  stages: 1,
  requires: 'city',
  load: () => import('./tower-scene'),
};

export default towerLevel;
