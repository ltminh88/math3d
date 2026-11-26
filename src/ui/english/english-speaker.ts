// English speaker (Phase 3B): clip → Web Speech en-US → read item.
// Order: a pre-generated MP3 clip from the audio map first; else Web Speech
// with an en-US voice at rate 0.8 (`cancel()` before each `speak`); with
// neither, the caller turns the item into a read item and shows one parent
// notice. Muted game: nothing plays — the caller shows the "bật âm thanh"
// prompt instead of skipping silently. iOS only speaks after a tap, so the
// "🔊 Nghe" tap is the gesture that calls `speak()` (and `unlock()` primes
// speech on the first tap, like the narrator's silent utterance).

import type { SynthLike, UtteranceLike } from '../../core/audio/speech-narrator';
import { pickVoice, type VoiceLike } from '../../core/audio/speech-voice-picker';
import { englishClipUrl } from '../../english/content/audio-map';

export type EnglishSpeakResult =
  | { readonly played: true; readonly via: 'clip' | 'speech' }
  | { readonly played: false; readonly reason: 'muted' | 'unavailable' };

export interface EnglishSpeakerDeps<V extends VoiceLike> {
  /** Clip URL for the exact text, or null (2C fills the map). */
  clipUrlFor: (text: string) => string | null;
  /** Play a clip URL; rejects when the browser refuses (falls back to speech). */
  playClip: (url: string) => Promise<void>;
  synth: SynthLike<V> | null;
  createUtterance: (text: string) => UtteranceLike;
  isMuted: () => boolean;
}

/** Speaker with injected deps (fakes in tests, browser wiring below). */
export class EnglishSpeaker<V extends VoiceLike = VoiceLike> {
  private voices: V[] = [];
  private readonly onVoices = () => this.refreshVoices();

  constructor(private readonly deps: EnglishSpeakerDeps<V>) {
    deps.synth?.addEventListener('voiceschanged', this.onVoices);
    this.refreshVoices();
  }

  private refreshVoices(): void {
    try {
      this.voices = this.deps.synth?.getVoices() ?? [];
    } catch {
      this.voices = [];
    }
  }

  /** True when a clip exists for the text or an English voice is available. */
  isAvailable(text: string): boolean {
    if (this.deps.clipUrlFor(text) !== null) return true;
    return pickVoice(this.voices, 'en') !== null;
  }

  /** Speak the text; never throws — failures fall through to the next branch. */
  async speak(text: string): Promise<EnglishSpeakResult> {
    if (!text.trim()) return { played: false, reason: 'unavailable' };
    if (this.deps.isMuted()) return { played: false, reason: 'muted' };
    const clip = this.deps.clipUrlFor(text);
    if (clip !== null) {
      try {
        await this.deps.playClip(clip);
        return { played: true, via: 'clip' };
      } catch {
        // Clip refused (autoplay / missing file) — fall through to speech.
      }
    }
    const { synth } = this.deps;
    if (!synth) return { played: false, reason: 'unavailable' };
    const voice = pickVoice(this.voices, 'en');
    if (!voice) return { played: false, reason: 'unavailable' };
    try {
      synth.cancel();
      const utterance = this.deps.createUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.8;
      utterance.volume = 1;
      synth.speak(utterance);
      return { played: true, via: 'speech' };
    } catch {
      return { played: false, reason: 'unavailable' };
    }
  }

  /** Prime speech on the first tap (iOS needs a gesture before any utterance). */
  unlock(): void {
    const { synth } = this.deps;
    if (!synth) return;
    try {
      const silent = this.deps.createUtterance(' ');
      silent.volume = 0;
      synth.speak(silent);
    } catch {
      // Silent prime is best-effort; the tap itself still grants activation.
    }
  }

  dispose(): void {
    try {
      this.deps.synth?.cancel();
    } catch {
      // Dispose is best-effort.
    }
    this.deps.synth?.removeEventListener('voiceschanged', this.onVoices);
  }
}

/** Browser wiring: clips from the audio map, `speechSynthesis`, `Audio` clips. */
export function createBrowserEnglishSpeaker(
  isMuted: () => boolean,
): EnglishSpeaker<SpeechSynthesisVoice> {
  const supported =
    typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  return new EnglishSpeaker<SpeechSynthesisVoice>({
    clipUrlFor: englishClipUrl,
    playClip: async (url) => {
      await new Audio(url).play();
    },
    synth: supported ? (speechSynthesis as unknown as SynthLike<SpeechSynthesisVoice>) : null,
    createUtterance: (text) => new SpeechSynthesisUtterance(text) as unknown as UtteranceLike,
    isMuted,
  });
}
