import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SynthAudio } from './synth-audio';

type AudioCall = [string, string, ...number[]];

// Same recorder as the live-capture stub (tools/recovery/capture-parity-hooks.js), so the
// synth can be compared against the trace recorded from the ORIGINAL game.
function installRecordingAudioContext(calls: AudioCall[]): void {
  const param = (owner: string, name: string) => ({
    setValueAtTime: (v: number, t: number) => calls.push([owner, `${name}.set`, v, t]),
    linearRampToValueAtTime: (v: number, t: number) => calls.push([owner, `${name}.lin`, v, t]),
    exponentialRampToValueAtTime: (v: number, t: number) =>
      calls.push([owner, `${name}.exp`, v, t]),
  });
  class RecordingAudioContext {
    currentTime = 0;
    destination = { kind: 'destination' };
    resume() {
      calls.push(['ctx', 'resume']);
      return Promise.resolve();
    }
    createOscillator() {
      const frequency = {
        set value(v: number) {
          calls.push(['osc', 'frequency', v]);
        },
      };
      return {
        type: 'sine',
        frequency,
        connect() {},
        start: (t: number) => calls.push(['osc', 'start', t]),
        stop: (t: number) => calls.push(['osc', 'stop', t]),
      };
    }
    createGain() {
      return { gain: param('gain', 'gain'), connect() {} };
    }
  }
  vi.stubGlobal('AudioContext', RecordingAudioContext);
}

function recordedPlaythroughAudio(): AudioCall[] {
  const url = new URL(
    '../../tests/parity/baselines/live/desktop-chromium/playthrough.trace.json',
    import.meta.url,
  );
  return JSON.parse(readFileSync(url, 'utf8')).audio;
}

describe('SynthAudio', () => {
  let calls: AudioCall[];

  beforeEach(() => {
    calls = [];
    installRecordingAudioContext(calls);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('replays the live playthrough audio trace call for call', () => {
    const synth = new SynthAudio();
    // UI calls in the recorded run: 3 unlocks, wrong answer (hint), correct, wrong, five
    // correct answers each after an unlock, then the bridge-complete celebration.
    const script = ['unlock', 'unlock', 'unlock', 'hint', 'unlock', 'correct', 'unlock', 'hint'];
    for (let i = 0; i < 5; i++) script.push('unlock', 'correct');
    script.push('celebrate');
    for (const step of script) {
      if (step === 'unlock') synth.unlock();
      else if (step === 'hint') synth.hint();
      else if (step === 'correct') synth.correct();
      else synth.celebrate();
    }
    expect(calls).toEqual(recordedPlaythroughAudio());
  });

  it('is silent before unlock and while disabled', () => {
    const synth = new SynthAudio();
    synth.correct();
    expect(calls).toEqual([]);
    synth.unlock();
    synth.enabled = false;
    synth.jump();
    synth.celebrate();
    expect(calls).toEqual([['ctx', 'resume']]);
  });

  it('reuses one context and schedules the jump note', () => {
    const synth = new SynthAudio();
    synth.unlock();
    synth.unlock();
    synth.jump();
    expect(calls).toEqual([
      ['ctx', 'resume'],
      ['ctx', 'resume'],
      ['osc', 'frequency', 480],
      ['gain', 'gain.set', 0, 0],
      ['gain', 'gain.lin', 0.06, 0.02],
      ['gain', 'gain.exp', 0.001, 0.1],
      ['osc', 'start', 0],
      ['osc', 'stop', 0.12000000000000001],
    ]);
  });

  it('loops the melody every 850 ms and resumes position after a restart', () => {
    vi.useFakeTimers();
    vi.stubGlobal('window', globalThis);
    const synth = new SynthAudio();
    synth.unlock();
    synth.music(true);
    vi.advanceTimersByTime(849);
    expect(calls.filter(([, k]) => k === 'frequency')).toEqual([]);
    vi.advanceTimersByTime(850 * 7 + 1);
    synth.music(false);
    vi.advanceTimersByTime(5000);
    synth.music(true);
    vi.advanceTimersByTime(850 * 3);
    const notes = calls.filter(([, k]) => k === 'frequency').map(([, , f]) => f);
    expect(notes).toEqual([262, 330, 392, 330, 294, 349, 440, 349, 262, 330, 392]);
    expect(calls).toContainEqual(['gain', 'gain.lin', 0.018, 0.02]);
    expect(calls).toContainEqual(['gain', 'gain.exp', 0.001, 0.65]);
  });
});
