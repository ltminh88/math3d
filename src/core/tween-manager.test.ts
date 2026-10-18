import { describe, expect, it } from 'vitest';
import { EASE, TweenManager } from './tween-manager';

describe('TweenManager', () => {
  it('reaches exactly 1 and completes once', () => {
    const tweens = new TweenManager();
    const values: number[] = [];
    let completed = 0;
    tweens.add({ duration: 1, onUpdate: (p) => values.push(p), onComplete: () => completed++ });
    tweens.update(0.5);
    tweens.update(0.6);
    tweens.update(1);
    expect(values).toEqual([0.5, 1]);
    expect(completed).toBe(1);
    expect(tweens.hasActive()).toBe(false);
  });

  it('waits out the delay before updating', () => {
    const tweens = new TweenManager();
    const values: number[] = [];
    tweens.add({ duration: 1, delay: 1, onUpdate: (p) => values.push(p) });
    tweens.update(0.5);
    expect(values).toEqual([]);
    tweens.update(1);
    expect(values).toEqual([0.5]);
  });

  it('does not call callbacks after cancel', () => {
    const tweens = new TweenManager();
    let calls = 0;
    const handle = tweens.add({ duration: 1, onUpdate: () => calls++, onComplete: () => calls++ });
    handle.cancel();
    tweens.update(2);
    expect(calls).toBe(0);
    expect(tweens.hasActive()).toBe(false);
  });

  it('easings map 0 to 0 and 1 to 1', () => {
    for (const ease of Object.values(EASE)) {
      expect(ease(0)).toBeCloseTo(0);
      expect(ease(1)).toBeCloseTo(1);
    }
  });
});
