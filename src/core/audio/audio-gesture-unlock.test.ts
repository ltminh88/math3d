import { describe, expect, it, vi } from 'vitest';
import { bindAudioGestureUnlock, type UnlockableAudio } from './audio-gesture-unlock';

class FakeAudio implements UnlockableAudio {
  running = false;
  /** Whether the next unlock() actually reaches 'running' (false = no activation on iOS). */
  willRun = true;
  unlockCalls = 0;
  private readonly listeners = new Set<() => void>();
  isRunning = () => this.running;
  unlock = async () => {
    this.unlockCalls += 1;
    if (this.willRun) this.setRunning(true);
  };
  suspend = async () => this.setRunning(false);
  onStateChange(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  setRunning(running: boolean) {
    this.running = running;
    for (const l of [...this.listeners]) l();
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup() {
  const target = new EventTarget();
  const audio = new FakeAudio();
  const onFirstActivation = vi.fn();
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const dispose = bindAudioGestureUnlock({ target, audio, doc, onFirstActivation });
  return { target, audio, onFirstActivation, doc, dispose };
}

describe('bindAudioGestureUnlock', () => {
  it('ignores pointerdown and unlocks on activation events', async () => {
    const { target, audio, onFirstActivation } = setup();
    target.dispatchEvent(new Event('pointerdown'));
    expect(audio.unlockCalls).toBe(0);
    target.dispatchEvent(new Event('pointerup'));
    await flush();
    expect(audio.unlockCalls).toBe(1);
    expect(onFirstActivation).toHaveBeenCalledTimes(1);
  });

  it('keeps listening until the context actually runs', async () => {
    const { target, audio } = setup();
    audio.willRun = false;
    target.dispatchEvent(new Event('touchend'));
    await flush();
    audio.willRun = true;
    target.dispatchEvent(new Event('click'));
    await flush();
    target.dispatchEvent(new Event('click'));
    await flush();
    expect(audio.unlockCalls).toBe(2);
  });

  it('re-arms after iOS suspends/interrupts the context and on hide', async () => {
    const { target, audio, doc, onFirstActivation } = setup();
    target.dispatchEvent(new Event('keydown'));
    await flush();
    audio.setRunning(false); // interrupted by the OS
    audio.willRun = false;
    target.dispatchEvent(new Event('pointerup'));
    await flush();
    expect(audio.unlockCalls).toBe(2);
    doc.hidden = true;
    doc.dispatchEvent(new Event('visibilitychange'));
    await flush();
    expect(audio.running).toBe(false);
    expect(onFirstActivation).toHaveBeenCalledTimes(1);
  });

  it('dispose removes the listeners', async () => {
    const { target, audio, dispose } = setup();
    dispose();
    target.dispatchEvent(new Event('click'));
    await flush();
    expect(audio.unlockCalls).toBe(0);
  });
});
