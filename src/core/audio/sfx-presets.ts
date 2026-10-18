export type SfxName = 'correct' | 'gentleWrong' | 'pick' | 'drop' | 'buildStep' | 'star' | 'uiTap';

export interface ToneStep {
  freq: number;
  /** Start offset in seconds from the moment the sound is played. */
  at: number;
  dur: number;
  type: OscillatorType;
  gain: number;
  /** Optional glide target frequency. */
  slideTo?: number;
}

// Warm, short, never harsh: wrong answers get a soft falling blip, not a buzzer.
export const SFX_PRESETS: Record<SfxName, readonly ToneStep[]> = {
  correct: [
    { freq: 523.25, at: 0, dur: 0.12, type: 'triangle', gain: 0.5 },
    { freq: 659.25, at: 0.1, dur: 0.12, type: 'triangle', gain: 0.5 },
    { freq: 783.99, at: 0.2, dur: 0.25, type: 'triangle', gain: 0.5 },
  ],
  gentleWrong: [{ freq: 330, at: 0, dur: 0.22, type: 'sine', gain: 0.4, slideTo: 262 }],
  pick: [{ freq: 440, at: 0, dur: 0.08, type: 'triangle', gain: 0.35, slideTo: 587 }],
  drop: [
    { freq: 196, at: 0, dur: 0.1, type: 'sine', gain: 0.5, slideTo: 130 },
    { freq: 392, at: 0.04, dur: 0.06, type: 'triangle', gain: 0.25 },
  ],
  buildStep: [
    { freq: 392, at: 0, dur: 0.09, type: 'square', gain: 0.18 },
    { freq: 494, at: 0.08, dur: 0.12, type: 'square', gain: 0.18 },
  ],
  star: [
    { freq: 784, at: 0, dur: 0.1, type: 'sine', gain: 0.4 },
    { freq: 988, at: 0.09, dur: 0.1, type: 'sine', gain: 0.4 },
    { freq: 1319, at: 0.18, dur: 0.3, type: 'sine', gain: 0.4 },
  ],
  uiTap: [{ freq: 600, at: 0, dur: 0.05, type: 'sine', gain: 0.3 }],
};

/** Schedule one tone through a short attack/decay envelope into `destination`. */
export function playTone(
  ctx: AudioContext,
  destination: AudioNode,
  step: ToneStep,
  startTime: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const begin = startTime + step.at;
  const end = begin + step.dur;
  osc.type = step.type;
  osc.frequency.setValueAtTime(step.freq, begin);
  if (step.slideTo !== undefined) osc.frequency.linearRampToValueAtTime(step.slideTo, end);
  gain.gain.setValueAtTime(0.0001, begin);
  gain.gain.exponentialRampToValueAtTime(step.gain, begin + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(begin);
  osc.stop(end + 0.02);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}
