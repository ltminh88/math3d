import { describe, expect, it } from 'vitest';
import { gateStatus, isGateOpen, progressionState } from './level-progression';

const done = (levelId: string) => ({ [levelId]: { completedAt: 1_700_000_000_000 } });

describe('level progression', () => {
  it('opens the field gate only after the bridge quest', () => {
    expect(isGateOpen('bridge', progressionState(false, {}))).toBe(false);
    expect(isGateOpen('bridge', progressionState(true, {}))).toBe(true);
  });

  it('opens the forest gate only once the field level was completed', () => {
    expect(isGateOpen('field', progressionState(true, {}))).toBe(false);
    expect(isGateOpen('field', progressionState(true, { field: { completedAt: 0 } }))).toBe(false);
    expect(isGateOpen('field', progressionState(true, done('field')))).toBe(true);
  });

  it('a gate without requirement is always open', () => {
    expect(isGateOpen(null, progressionState(false, {}))).toBe(true);
  });

  it('a stored field completion without the bridge still needs nothing more for the forest', () => {
    // Progress is monotonic in practice; the forest gate checks only its own requirement.
    expect(isGateOpen('field', progressionState(false, done('field')))).toBe(true);
  });

  describe('gate status', () => {
    const field = { levelId: 'field', requires: 'bridge' } as const;
    const forest = { levelId: 'forest', requires: 'field' } as const;

    it('locked wins over a missing level module', () => {
      expect(gateStatus(field, progressionState(false, {}), false)).toBe('locked');
      expect(gateStatus(forest, progressionState(true, {}), false)).toBe('locked');
    });

    it('an open gate without a registered level is coming soon', () => {
      expect(gateStatus(field, progressionState(true, {}), false)).toBe('coming-soon');
      expect(gateStatus(field, progressionState(true, done('field')), false)).toBe('coming-soon');
    });

    it('open, then completed once the level has a completion time', () => {
      expect(gateStatus(field, progressionState(true, {}), true)).toBe('open');
      expect(gateStatus(field, progressionState(true, done('field')), true)).toBe('completed');
      expect(gateStatus(forest, progressionState(true, done('field')), true)).toBe('open');
    });
  });
});
