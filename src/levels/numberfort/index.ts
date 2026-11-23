// Numberfort level "Lâu Đài Số": the second stage of chapter 3, six rounds of big numbers,
// rounding, Roman numerals and big arithmetic from the families (dialog scenes from phases
// 04/16/17, no new 3D interaction). Only the definition is eager; the scene is its own chunk.
import type { LevelDefinition } from '../shared/level-types';
import { NUMBERFORT_ROUNDS } from './numberfort-stage-plan';

const numberfortLevel: LevelDefinition = {
  id: 'numberfort',
  regionId: 'numberfort',
  // Skills, not tables, drive the numberfort; the tables only group × / : facts for the planner.
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: NUMBERFORT_ROUNDS,
  stages: 5,
  requires: 'cave',
  load: () => import('./numberfort-scene'),
};

export default numberfortLevel;
