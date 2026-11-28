// Level exit target (two-modes Phase 2): where a level run returns when it ends — the world
// in normal play, or the English home in English mode (the world stays suspended and
// inactive behind the home, never resumed). Pure module-level state, read by the host.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLevelExitTarget, runLevelExitTarget, setLevelExitTarget } from './level-exit-target';

afterEach(() => setLevelExitTarget('world'));

describe('level exit target', () => {
  it('defaults to the world and runs nothing', () => {
    expect(getLevelExitTarget()).toBe('world');
    expect(() => runLevelExitTarget()).not.toThrow();
  });

  it('runs the home callback on every exit while the target is english-home', () => {
    const showHome = vi.fn();
    setLevelExitTarget('english-home', showHome);
    expect(getLevelExitTarget()).toBe('english-home');
    runLevelExitTarget();
    runLevelExitTarget();
    expect(showHome).toHaveBeenCalledTimes(2);
  });

  it('switching back to the world clears the callback', () => {
    const showHome = vi.fn();
    setLevelExitTarget('english-home', showHome);
    setLevelExitTarget('world');
    expect(getLevelExitTarget()).toBe('world');
    runLevelExitTarget();
    expect(showHome).not.toHaveBeenCalled();
  });

  it('tolerates a missing callback', () => {
    setLevelExitTarget('english-home');
    expect(() => runLevelExitTarget()).not.toThrow();
  });
});
