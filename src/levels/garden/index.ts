// Garden level "Khu Vườn Quy Luật" (chapter 2, first stage): number patterns in the flower row,
// the unknown on the watering-can balance and expressions with brackets on the seed bags, six
// rounds over `sk:` skills. Only the definition is eager; the scene is its own chunk.
import type { LevelDefinition } from '../shared/level-types';

const gardenLevel: LevelDefinition = {
  id: 'garden',
  regionId: 'garden',
  // The planner's table list (skip counting and the × / : unknowns use tables 2-9); the run
  // itself draws from the garden's skill pool, not from table facts.
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: 6,
  stages: 1,
  requires: 'tower',
  load: () => import('./garden-scene'),
};

export default gardenLevel;
