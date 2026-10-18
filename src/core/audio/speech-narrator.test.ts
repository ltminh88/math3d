import { describe, expect, it } from 'vitest';
import { SpeechNarrator, type SynthLike, type UtteranceLike } from './speech-narrator';
import type { VoiceLike } from './speech-voice-picker';

function fakeSynth(voices: VoiceLike[]) {
  const spoken: UtteranceLike[] = [];
  const listeners = new Set<() => void>();
  let cancels = 0;
  const synth: SynthLike<VoiceLike> = {
    getVoices: () => voices,
    speak: (u) => {
      spoken.push(u);
    },
    cancel: () => {
      cancels++;
    },
    addEventListener: (_t, l) => listeners.add(l),
    removeEventListener: (_t, l) => listeners.delete(l),
  };
  return {
    synth,
    spoken,
    listeners,
    cancels: () => cancels,
    setVoices: (v: VoiceLike[]) => {
      voices.splice(0, voices.length, ...v);
      for (const l of listeners) l();
    },
  };
}

function build(voices: VoiceLike[], flags = { muted: false, enabled: true }) {
  const fake = fakeSynth(voices);
  const narrator = new SpeechNarrator({
    synth: fake.synth,
    createUtterance: (text) => ({ text, lang: '', voice: null, volume: 1, rate: 1 }),
    getLanguage: () => 'vi',
    isMuted: () => flags.muted,
    isReadAloudEnabled: () => flags.enabled,
  });
  return { fake, narrator, flags };
}

describe('SpeechNarrator', () => {
  it('speaks with the vi-VN voice and cancels the previous utterance', () => {
    const { fake, narrator } = build([{ lang: 'vi-VN', name: 'Linh' }]);
    expect(narrator.speak('Xin chào')).toBe(true);
    expect(fake.spoken[0]).toMatchObject({ text: 'Xin chào', lang: 'vi-VN' });
    expect(fake.cancels()).toBe(1);
  });

  it('stays silent when muted or when read-aloud is off', () => {
    const { fake, narrator, flags } = build([{ lang: 'vi-VN', name: 'Linh' }]);
    flags.muted = true;
    expect(narrator.speak('a')).toBe(false);
    flags.muted = false;
    flags.enabled = false;
    expect(narrator.speak('a')).toBe(false);
    expect(fake.spoken).toHaveLength(0);
  });

  it('is unavailable without a vi voice and never speaks an English voice', () => {
    const { fake, narrator } = build([{ lang: 'en-US', name: 'Samantha' }]);
    expect(narrator.isAvailable()).toBe(false);
    expect(narrator.speak('Xin chào')).toBe(false);
    expect(fake.spoken).toHaveLength(0);
  });

  it('notifies when voices arrive asynchronously', () => {
    const { fake, narrator } = build([]);
    const seen: boolean[] = [];
    narrator.onAvailabilityChange((a) => seen.push(a));
    fake.setVoices([{ lang: 'vi-VN', name: 'Linh' }]);
    expect(seen).toEqual([true]);
    narrator.dispose();
    expect(fake.listeners.size).toBe(0);
  });

  it('works as a no-op when speech synthesis is unsupported', () => {
    const narrator = new SpeechNarrator({
      synth: null,
      createUtterance: (text) => ({ text, lang: '', voice: null, volume: 1, rate: 1 }),
      getLanguage: () => 'vi',
      isMuted: () => false,
      isReadAloudEnabled: () => true,
    });
    expect(narrator.isAvailable()).toBe(false);
    expect(narrator.speak('x')).toBe(false);
    expect(() => narrator.unlock()).not.toThrow();
  });
});
