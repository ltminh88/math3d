import { describe, expect, it } from 'vitest';
import { gateStatus, progressionState } from '../levels/shared/level-progression';
import { LEVEL_GATES } from './level-gate-config';

const done = (...ids: string[]) =>
  Object.fromEntries(ids.map((id) => [id, { completedAt: 1_700_000_000_000 }]));

const statuses = (bridge: boolean, completed: string[]) =>
  Object.fromEntries(
    LEVEL_GATES.map((gate) => [
      gate.levelId,
      gateStatus(gate, progressionState(bridge, done(...completed)), true),
    ]),
  );

describe('level gates', () => {
  it('chain the five regions: bridge → field → forest → city → tower', () => {
    expect(LEVEL_GATES.map((g) => [g.levelId, g.regionId, g.requires])).toEqual([
      ['field', 'meadow', 'bridge'],
      ['forest', 'forest', 'field'],
      ['city', 'city', 'forest'],
      ['tower', 'tower', 'city'],
    ]);
  });

  it('city stays locked until the forest, tower until the city', () => {
    expect(statuses(true, ['field'])).toMatchObject({ city: 'locked', tower: 'locked' });
    expect(statuses(true, ['field', 'forest'])).toMatchObject({ city: 'open', tower: 'locked' });
    expect(statuses(true, ['field', 'forest', 'city'])).toMatchObject({
      city: 'completed',
      tower: 'open',
    });
  });
});
