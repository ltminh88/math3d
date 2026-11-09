import { describe, expect, it, vi } from 'vitest';
import { isStaleChunkError, reloadForNewBuild } from './stale-build-reload';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
}

describe('stale build reload', () => {
  it('recognises the browsers’ failed dynamic import errors only', () => {
    for (const message of [
      'Failed to fetch dynamically imported module: https://x/assets/garden-scene-CCypPAMW.js',
      'Importing a module script failed.',
      'error loading dynamically imported module',
    ]) {
      expect(isStaleChunkError(new TypeError(message))).toBe(true);
    }
    expect(isStaleChunkError(new Error('scene build failed'))).toBe(false);
    expect(isStaleChunkError('Importing a module script failed.')).toBe(false);
  });

  it('reloads once, then not again inside the guard window', () => {
    const storage = memoryStorage();
    const reload = vi.fn();
    expect(reloadForNewBuild(storage, reload, 1_000_000)).toBe(true);
    expect(reloadForNewBuild(storage, reload, 1_030_000)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(reloadForNewBuild(storage, reload, 1_100_000)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('does not reload when storage is blocked (no loop guard)', () => {
    const reload = vi.fn();
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {},
    };
    expect(reloadForNewBuild(blocked, reload, 1)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
