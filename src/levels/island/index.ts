// Island level "Đảo Tiếng Anh": the English side region, eight stages of eight rounds
// each. Only the definition is eager; the scene is its own chunk. The run itself is
// `startEnglishRun` (Phase 0 stub, Phase 1B engine): the shell only frames it.
import type { LevelDefinition } from '../shared/level-types';
import { ISLAND_ROUNDS, ISLAND_STAGES } from './island-stage-plan';

const islandLevel: LevelDefinition = {
  id: 'island',
  regionId: 'island',
  // English, not tables, drives the island; `tables` is a required field with no meaning
  // here, so it holds [2] as numberfort's comment explains for its own tables.
  tables: [2],
  rounds: ISLAND_ROUNDS,
  stages: ISLAND_STAGES,
  requires: 'bridge',
  load: () => import('./island-scene'),
};

export default islandLevel;
