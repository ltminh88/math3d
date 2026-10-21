// Field level "Cánh Đồng Phép Tính" behind the meadow gate: planting arrays, commutativity,
// tables 3 and 4. Only the definition is eager; the scene is its own chunk.
import type { LevelDefinition } from '../shared/level-types';

const field: LevelDefinition = {
  id: 'field',
  regionId: 'meadow',
  tables: [3, 4],
  rounds: 5,
  requires: 'bridge',
  load: () => import('./field-scene'),
};

export default field;
