// City level "Thành Phố Con Số": parcel delivery by house number, lighting building windows
// floor by floor and reverse delivery (tables 6-9). Only the definition is eager; the scene is
// its own chunk.
import type { LevelDefinition } from '../shared/level-types';

const cityLevel: LevelDefinition = {
  id: 'city',
  regionId: 'city',
  tables: [6, 7, 8, 9],
  rounds: 5,
  requires: 'forest',
  load: () => import('./city-scene'),
};

export default cityLevel;
