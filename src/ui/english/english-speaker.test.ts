// Speaker branches (Phase 3B): clip first, Web Speech en-US fallback at rate
// 0.8 with cancel() before speak, muted → muted, no voice + no clip →
// unavailable (the caller turns the item into a read item).
import { describe, expect, it, vi } from 'vitest';
import type { UtteranceLike } from '../../core/audio/speech-narrator';
import { EnglishSpeaker, type EnglishSpeakerDeps } from './english-speaker';

type FakeVoice = { lang: string; name: string; localService?: boolean };

function fakeSynth(voices: FakeVoice[]) {
  return {
    getVoices: () => voices,
    speak: vi.fn(),
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function fakeUtterance(text: string): UtteranceLike {
  return { text, lang: '', voice: null, volume: 1, rate: 1 };
}

function deps(
  overrides: Partial<EnglishSpeakerDeps<FakeVoice>> = {},
): EnglishSpeakerDeps<FakeVoice> {
  return {
    clipUrlFor: () => null,
    playClip: vi.fn().mockResolvedValue(undefined),
    synth: fakeSynth([{ lang: 'en-US', name: 'English US', localService: true }]),
    createUtterance: fakeUtterance,
    isMuted: () => false,
    ...overrides,
  };
}

describe('EnglishSpeaker', () => {
  it('plays the clip when the audio map has the text', async () => {
    const playClip = vi.fn().mockResolvedValue(undefined);
    const speaker = new EnglishSpeaker(deps({ clipUrlFor: () => 'clips/apple.mp3', playClip }));
    expect(await speaker.speak('apple')).toEqual({ played: true, via: 'clip' });
    expect(playClip).toHaveBeenCalledWith('clips/apple.mp3');
  });

  it('falls back to Web Speech when the clip refuses to play', async () => {
    const synth = fakeSynth([{ lang: 'en-US', name: 'English US' }]);
    const speaker = new EnglishSpeaker(
      deps({ playClip: vi.fn().mockRejectedValue(new Error('nope')), synth }),
    );
    expect(await speaker.speak('apple')).toEqual({ played: true, via: 'speech' });
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    const spoken = synth.speak.mock.calls[0]?.[0] as UtteranceLike;
    expect(spoken.text).toBe('apple');
    expect(spoken.lang).toBe('en-US');
    expect(spoken.rate).toBe(0.8);
  });

  it('prefers en-US over en-GB and cancels before speaking', async () => {
    const synth = fakeSynth([
      { lang: 'en-GB', name: 'English GB' },
      { lang: 'en-US', name: 'English US' },
    ]);
    const speaker = new EnglishSpeaker(deps({ synth }));
    await speaker.speak('cat');
    const spoken = synth.speak.mock.calls[0]?.[0] as UtteranceLike;
    expect(spoken.lang).toBe('en-US');
    expect(synth.cancel).toHaveBeenCalledTimes(1);
  });

  it('returns muted without touching clip or speech when the game is muted', async () => {
    const playClip = vi.fn();
    const synth = fakeSynth([{ lang: 'en-US', name: 'English US' }]);
    const speaker = new EnglishSpeaker(
      deps({ clipUrlFor: () => 'clips/apple.mp3', playClip, synth, isMuted: () => true }),
    );
    expect(await speaker.speak('apple')).toEqual({ played: false, reason: 'muted' });
    expect(playClip).not.toHaveBeenCalled();
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it('returns unavailable when there is no clip and no English voice', async () => {
    const speaker = new EnglishSpeaker(deps({ synth: fakeSynth([]) }));
    expect(await speaker.speak('apple')).toEqual({ played: false, reason: 'unavailable' });
  });

  it('returns unavailable when speech is unsupported and there is no clip', async () => {
    const speaker = new EnglishSpeaker(deps({ synth: null }));
    expect(await speaker.speak('apple')).toEqual({ played: false, reason: 'unavailable' });
  });

  it('isAvailable is true for a clip even with no voice', () => {
    const speaker = new EnglishSpeaker(
      deps({
        clipUrlFor: (text) => (text === 'apple' ? 'clips/apple.mp3' : null),
        synth: fakeSynth([]),
      }),
    );
    expect(speaker.isAvailable('apple')).toBe(true);
    expect(speaker.isAvailable('banana')).toBe(false);
  });

  it('unlock primes speech with a silent utterance', () => {
    const synth = fakeSynth([{ lang: 'en-US', name: 'English US' }]);
    const speaker = new EnglishSpeaker(deps({ synth }));
    speaker.unlock();
    const spoken = synth.speak.mock.calls[0]?.[0] as UtteranceLike;
    expect(spoken.text).toBe(' ');
    expect(spoken.volume).toBe(0);
  });
});
