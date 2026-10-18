import { describe, expect, it } from 'vitest';
import {
  type AnimationDriver,
  FrameClock,
  GameLoop,
  MAX_DELTA_SECONDS,
  type VisibilitySource,
} from './game-loop';

describe('FrameClock', () => {
  it('returns 0 on the first frame and seconds afterwards', () => {
    const clock = new FrameClock();
    expect(clock.step(1000)).toEqual({ dt: 0, rawMs: 0 });
    expect(clock.step(1016).dt).toBeCloseTo(0.016);
  });

  it('clamps long gaps but reports the raw interval', () => {
    const clock = new FrameClock();
    clock.step(0);
    const result = clock.step(5000);
    expect(result.dt).toBe(MAX_DELTA_SECONDS);
    expect(result.rawMs).toBe(5000);
  });

  it('treats the frame after reset as a first frame', () => {
    const clock = new FrameClock();
    clock.step(0);
    clock.reset();
    expect(clock.step(9999).dt).toBe(0);
  });
});

function fixture(hidden = false) {
  let callback: ((time: number) => void) | null = null;
  const driver: AnimationDriver = { setAnimationLoop: (cb) => (callback = cb) };
  const listeners = new Set<() => void>();
  const visibility = {
    hidden,
    addEventListener: (_t: 'visibilitychange', l: () => void) => listeners.add(l),
    removeEventListener: (_t: 'visibilitychange', l: () => void) => listeners.delete(l),
  } satisfies VisibilitySource & { hidden: boolean };
  let renders = 0;
  let updateResult = false;
  const loop = new GameLoop(
    driver,
    { update: () => updateResult, render: () => renders++ },
    visibility,
  );
  return {
    loop,
    renders: () => renders,
    frame: (t: number) => callback?.(t),
    hasCallback: () => callback !== null,
    setUpdateResult: (v: boolean) => {
      updateResult = v;
    },
    setHidden: (h: boolean) => {
      visibility.hidden = h;
      for (const l of listeners) l();
    },
  };
}

describe('GameLoop', () => {
  it('renders once when dirty, then idles until requestRender or an animating update', () => {
    const f = fixture();
    f.loop.start();
    f.frame(0);
    f.frame(16);
    f.frame(32);
    expect(f.renders()).toBe(1);
    f.loop.requestRender();
    f.frame(48);
    expect(f.renders()).toBe(2);
    f.setUpdateResult(true);
    f.frame(64);
    f.frame(80);
    expect(f.renders()).toBe(4);
  });

  it('renders every frame in continuous mode', () => {
    const f = fixture();
    f.loop.setContinuous(true);
    f.loop.start();
    f.frame(0);
    f.frame(16);
    f.frame(32);
    expect(f.renders()).toBe(3);
  });

  it('pauses while hidden and resumes when visible again', () => {
    const f = fixture();
    f.loop.start();
    expect(f.hasCallback()).toBe(true);
    f.setHidden(true);
    expect(f.hasCallback()).toBe(false);
    f.setHidden(false);
    expect(f.hasCallback()).toBe(true);
  });

  it('does not resume after an explicit stop', () => {
    const f = fixture();
    f.loop.start();
    f.loop.stop();
    f.setHidden(true);
    f.setHidden(false);
    expect(f.hasCallback()).toBe(false);
  });
});
