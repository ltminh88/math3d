import type { UnlockableAudio } from './audio-gesture-unlock';
import {
  type AudioSettings,
  type AudioSettingsStore,
  createLocalAudioSettingsStore,
} from './audio-settings';
import { MusicLoop } from './music-loop';
import { playTone, SFX_PRESETS, type SfxName } from './sfx-presets';

type ContextCtor = new () => AudioContext;

function contextConstructor(): ContextCtor | undefined {
  const w = globalThis as unknown as {
    AudioContext?: ContextCtor;
    webkitAudioContext?: ContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext;
}

/**
 * WebAudio synth with a master gain. The context is created and resumed inside a user-activation
 * event (iOS requirement; see audio-gesture-unlock.ts); until then every call is a safe no-op.
 */
export class AudioEngine implements UnlockableAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private music: MusicLoop | null = null;
  private musicWanted = false;
  private settings: AudioSettings;
  private readonly muteListeners = new Set<(muted: boolean) => void>();
  private readonly stateListeners = new Set<() => void>();

  constructor(private readonly store: AudioSettingsStore = createLocalAudioSettingsStore()) {
    this.settings = store.load();
  }

  /** Create/resume the context. Must be called synchronously from a user-activation handler. */
  async unlock(): Promise<void> {
    try {
      if (!this.ctx) {
        const Ctor = contextConstructor();
        if (!Ctor) return;
        this.ctx = new Ctor();
        this.ctx.addEventListener('statechange', () => {
          for (const listener of [...this.stateListeners]) listener();
        });
        this.master = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.5;
        this.musicGain.connect(this.master);
        this.master.connect(this.ctx.destination);
        this.applyGain();
        this.music = new MusicLoop(this.ctx, this.musicGain);
      }
      // 'suspended' or iOS 'interrupted': resume. A silent one-sample buffer also wakes old WebKit.
      if (this.ctx.state !== 'running' && this.ctx.state !== 'closed') {
        const ctx = this.ctx;
        const silent = ctx.createBufferSource();
        silent.buffer = ctx.createBuffer(1, 1, 22050);
        silent.connect(ctx.destination);
        silent.start();
        await ctx.resume();
      }
      if (this.musicWanted) this.music?.start();
    } catch (error) {
      console.warn('[audio] could not start audio; continuing silently', error);
    }
  }

  isRunning(): boolean {
    return this.ctx?.state === 'running';
  }

  /** Suspend while the page is hidden (stops music and saves battery); unlock() resumes. */
  async suspend(): Promise<void> {
    try {
      if (this.ctx?.state === 'running') await this.ctx.suspend();
    } catch (error) {
      console.warn('[audio] suspend failed', error);
    }
  }

  onStateChange(listener: () => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /** Stop music and close the context (iOS caps the number of live AudioContexts). */
  dispose(): void {
    this.stopMusic();
    this.stateListeners.clear();
    this.muteListeners.clear();
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.music = null;
    ctx?.close().catch((error) => console.warn('[audio] close failed', error));
  }

  isMuted(): boolean {
    return this.settings.muted;
  }

  getVolume(): number {
    return this.settings.volume;
  }

  setMuted(muted: boolean): void {
    this.update({ ...this.settings, muted });
    for (const listener of [...this.muteListeners]) listener(muted);
  }

  setVolume(volume: number): void {
    this.update({ ...this.settings, volume: Math.min(1, Math.max(0, volume)) });
  }

  onMuteChange(listener: (muted: boolean) => void): () => void {
    this.muteListeners.add(listener);
    return () => this.muteListeners.delete(listener);
  }

  play(name: SfxName): void {
    const { ctx, master } = this;
    if (!ctx || !master || this.settings.muted || ctx.state !== 'running') return;
    const start = ctx.currentTime;
    for (const step of SFX_PRESETS[name]) playTone(ctx, master, step, start);
  }

  startMusic(): void {
    this.musicWanted = true;
    if (this.ctx?.state === 'running') this.music?.start();
  }

  stopMusic(): void {
    this.musicWanted = false;
    this.music?.stop();
  }

  private update(next: AudioSettings): void {
    this.settings = next;
    this.store.save(next);
    this.applyGain();
  }

  private applyGain(): void {
    if (!this.master || !this.ctx) return;
    const value = this.settings.muted ? 0 : this.settings.volume;
    this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }
}
