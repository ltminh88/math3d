import { describe, expect, it } from 'vitest';
import { isLevelUnlocked, unlockedLevels } from './progression';

describe('progression', () => {
  it('opens only the first level on a fresh profile', () => {
    expect(unlockedLevels({})).toEqual(['bridge']);
  });

  it('opens the next level after one completion, regardless of mastery', () => {
    expect(unlockedLevels({ bridge: { stars: 1 } })).toEqual(['bridge', 'field']);
    expect(unlockedLevels({ bridge: { stars: 3 }, field: { stars: 1 } })).toEqual([
      'bridge',
      'field',
      'forest',
    ]);
  });

  it('does not skip a level that is not completed', () => {
    expect(unlockedLevels({ bridge: { stars: 0 }, field: { stars: 3 } })).toEqual(['bridge']);
    expect(isLevelUnlocked({ bridge: { stars: 1 } }, 'forest')).toBe(false);
  });
});
