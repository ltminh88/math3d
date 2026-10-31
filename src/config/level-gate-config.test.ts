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
  it('chain nine stages: bridge → field → forest → city → tower → garden → valley → workshop → cave', () => {
    expect(LEVEL_GATES.map((g) => [g.levelId, g.regionId, g.requires])).toEqual([
      ['field', 'meadow', 'bridge'],
      ['forest', 'forest', 'field'],
      ['city', 'city', 'forest'],
      ['tower', 'tower', 'city'],
      ['garden', 'garden', 'tower'],
      ['valley', 'valley', 'garden'],
      ['workshop', 'workshop', 'valley'],
      ['cave', 'cave', 'workshop'],
    ]);
  });

  it('chapter 2 opens only after the tower, one gate after another', () => {
    const all = ['field', 'forest', 'city'];
    expect(statuses(true, all)).toMatchObject({ garden: 'locked', valley: 'locked' });
    // No level module ships yet for chapter 2: an open gate says "Sắp ra mắt".
    const levels = progressionState(true, done(...all, 'tower'));
    const garden = LEVEL_GATES.find((g) => g.levelId === 'garden');
    if (!garden) throw new Error('no garden gate');
    expect(gateStatus(garden, levels, false)).toBe('coming-soon');
    expect(statuses(true, [...all, 'tower', 'garden'])).toMatchObject({
      garden: 'completed',
      valley: 'open',
      workshop: 'locked',
      cave: 'locked',
    });
    expect(statuses(true, [...all, 'tower', 'garden', 'valley', 'workshop'])).toMatchObject({
      cave: 'open',
    });
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
