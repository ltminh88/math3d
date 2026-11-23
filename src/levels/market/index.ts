// Market level "Chợ Phiên Tí Hon": the first stage of chapter 3, six rounds of money, time,
// calendar and data skills from the families (dialog scenes from phases 16/17, no new 3D
// interaction). Only the definition is eager; the scene is its own chunk.
import type { LevelDefinition } from '../shared/level-types';
import { MARKET_ROUNDS } from './market-stage-plan';

const marketLevel: LevelDefinition = {
  id: 'market',
  regionId: 'market',
  // Skills, not tables, drive the market; the tables only group × / : facts for the planner.
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: MARKET_ROUNDS,
  stages: 5,
  requires: 'cave',
  load: () => import('./market-scene'),
};

export default marketLevel;
