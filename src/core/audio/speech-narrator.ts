import { pickVoice, type SpeechLanguage, type VoiceLike } from './speech-voice-picker';

/** Minimal slices of the Web Speech API so the narrator can be tested with fakes. */
export interface UtteranceLike {
  text: string;
  lang: string;
  voice: unknown;
  volume: number;
  rate: number;
}
export interface SynthLike<V extends VoiceLike> {
  getVoices(): V[];
  speak(utterance: UtteranceLike): void;
  cancel(): void;
  addEventListener(type: 'voiceschanged', listener: () => void): void;
  removeEventListener(type: 'voiceschanged', listener: () => void): void;
}

export interface NarratorDeps<V extends VoiceLike> {
  synth: SynthLike<V> | null;
  createUtterance: (text: string) => UtteranceLike;
  getLanguage: () => SpeechLanguage;
  isMuted: () => boolean;
  /** The user-facing "read aloud" setting. */
  isReadAloudEnabled: () => boolean;
}

/**
 * Read-aloud for questions and hints. Speaks only with a voice of the right language; when none
 * exists isAvailable() is false so the UI hides its speaker button. Honors master mute + setting.
 */
export class SpeechNarrator<V extends VoiceLike = VoiceLike> {
  private voices: V[] = [];
  private readonly listeners = new Set<(available: boolean) => void>();
  private readonly onVoices = () => this.refreshVoices();
  private lastAvailable: boolean | null = null;

  constructor(private readonly deps: NarratorDeps<V>) {
    deps.synth?.addEventListener('voiceschanged', this.onVoices);
    this.refreshVoices();
  }

  private refreshVoices(): void {
    try {
      this.voices = this.deps.synth?.getVoices() ?? [];
    } catch (error) {
      console.warn('[narrator] could not list voices', error);
      this.voices = [];
    }
    this.notifyIfChanged();
  }

  private notifyIfChanged(): void {
    const available = this.isAvailable();
    if (available === this.lastAvailable) return;
    this.lastAvailable = available;
    for (const listener of [...this.listeners]) listener(available);
  }

  /** True when a voice for the current language exists (setting/mute do not matter here). */
  isAvailable(): boolean {
    return pickVoice(this.voices, this.deps.getLanguage()) !== null;
  }

  /** Subscribe to availability changes (voices load asynchronously; language can switch). */
  onAvailabilityChange(listener: (available: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Call after a language switch so availability listeners re-evaluate. */
  languageChanged(): void {
    this.cancel();
    this.notifyIfChanged();
  }

  speak(text: string): boolean {
    const { synth } = this.deps;
    if (!synth || !text.trim()) return false;
    if (this.deps.isMuted() || !this.deps.isReadAloudEnabled()) return false;
    const language = this.deps.getLanguage();
    const voice = pickVoice(this.voices, language);
    if (!voice) return false;
    try {
      synth.cancel();
      const utterance = this.deps.createUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.9;
      utterance.volume = 1;
      synth.speak(utterance);
      return true;
    } catch (error) {
      console.warn('[narrator] speech failed', error);
      return false;
    }
  }

  cancel(): void {
    try {
      this.deps.synth?.cancel();
    } catch (error) {
      console.warn('[narrator] cancel failed', error);
    }
  }

  /** iOS only allows speech after a gesture: prime the engine with a silent utterance. */
  unlock(): void {
    const { synth } = this.deps;
    if (!synth) return;
    try {
      const silent = this.deps.createUtterance(' ');
      silent.volume = 0;
      synth.speak(silent);
    } catch (error) {
      console.warn('[narrator] unlock failed', error);
    }
  }

  dispose(): void {
    this.cancel();
    this.deps.synth?.removeEventListener('voiceschanged', this.onVoices);
    this.listeners.clear();
  }
}

/** Build a narrator on top of the browser's speechSynthesis (null synth when unsupported). */
export function createBrowserNarrator(
  options: Pick<
    NarratorDeps<SpeechSynthesisVoice>,
    'getLanguage' | 'isMuted' | 'isReadAloudEnabled'
  >,
): SpeechNarrator<SpeechSynthesisVoice> {
  const supported =
    typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  return new SpeechNarrator<SpeechSynthesisVoice>({
    ...options,
    synth: supported ? (speechSynthesis as unknown as SynthLike<SpeechSynthesisVoice>) : null,
    createUtterance: (text) => new SpeechSynthesisUtterance(text) as unknown as UtteranceLike,
  });
}
