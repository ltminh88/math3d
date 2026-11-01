// Cave level "Hang Đố Vui": the final stage of chapter 2, seven chambers of mixed reasoning
// (two-step word problems, remainders, choose-all, true/false + fix, expressions, shapes and
// measures), weakest skill first. Only the definition is eager; the scene is its own chunk.
import type { LevelDefinition } from '../shared/level-types';

const caveLevel: LevelDefinition = {
  id: 'cave',
  regionId: 'cave',
  // Skills, not tables, drive the cave; the tables only group × / : facts for the planner.
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: 7,
  requires: 'workshop',
  load: () => import('./cave-scene'),
};

export default caveLevel;
