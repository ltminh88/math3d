// Workshop level "Xưởng Đo Đạc" (chapter 2): six measuring orders for the carpenter — ruler,
// fence (chu vi), tiling the same floor (diện tích), one more order, then the balance, jug or
// thermometer. It drills the `meas-*` skills; `tables` only satisfies the shared contract.
// Only the definition is eager; the scene is its own chunk.
import type { LevelDefinition } from '../shared/level-types';

const workshopLevel: LevelDefinition = {
  id: 'workshop',
  regionId: 'workshop',
  tables: [10],
  rounds: 6,
  stages: 1,
  requires: 'valley',
  load: () => import('./workshop-scene'),
};

export default workshopLevel;
