import { describe, expect, it } from 'vitest';
import { WorldSuspension } from './world-suspension';

const world = (paused: boolean) => {
  const state = { paused, cleared: 0, clearInput: () => state.cleared++ };
  return state;
};

describe('world suspension', () => {
  it('pauses while suspended and gives back the pause state the world had', () => {
    const suspension = new WorldSuspension();
    const w = world(false);
    expect(suspension.suspend(w)).toBe(true);
    expect(suspension.active).toBe(true);
    expect(w.paused).toBe(true);
    w.paused = false; // a dialog closed meanwhile
    expect(suspension.resume(w)).toBe(true);
    expect(w.paused).toBe(false);
    expect(suspension.active).toBe(false);
    expect(w.cleared).toBe(2);
  });

  it('a world paused before the level stays paused after it', () => {
    const suspension = new WorldSuspension();
    const w = world(true);
    suspension.suspend(w);
    w.paused = false;
    suspension.resume(w);
    expect(w.paused).toBe(true);
  });

  it('suspend and resume are idempotent', () => {
    const suspension = new WorldSuspension();
    const w = world(false);
    suspension.suspend(w);
    expect(suspension.suspend(w)).toBe(false);
    suspension.resume(w);
    expect(suspension.resume(w)).toBe(false);
    expect(w.cleared).toBe(2);
  });
});
