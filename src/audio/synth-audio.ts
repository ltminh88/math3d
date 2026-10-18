// WebAudio synth of the recovered game (original class `ng`, bundle lines 1390-1434).
// Frequencies, timings and gains are verbatim; the parity trace records every scheduled value,
// so keep the arithmetic order (e.g. `start + duration + 0.02`) unchanged.

const CORRECT_NOTES = [523.25, 659.25, 783.99];
const CELEBRATE_NOTES = [523, 659, 784, 1047];
const MUSIC_NOTES = [262, 330, 392, 330, 294, 349, 440, 349];
const MUSIC_STEP_MS = 850;

export class SynthAudio {
  private context: AudioContext | undefined;
  private timer: number | undefined;
  private note = 0;
  /** Save `sound` switch: when false every tone is silent (music keeps ticking but mutes). */
  enabled = true;

  /** Creates the context lazily (needs a user gesture) and resumes it. */
  unlock(): void {
    this.context ??= new AudioContext();
    void this.context.resume();
  }

  /** One sine note with a 20 ms attack and exponential decay. */
  tone(frequency: number, duration = 0.15, delay = 0, volume = 0.06): void {
    if (!this.enabled || !this.context) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  correct(): void {
    CORRECT_NOTES.forEach((frequency, i) => {
      this.tone(frequency, 0.3, i * 0.1);
    });
  }

  hint(): void {
    this.tone(392, 0.18);
    this.tone(440, 0.18, 0.14);
  }

  jump(): void {
    this.tone(480, 0.1);
  }

  celebrate(): void {
    CELEBRATE_NOTES.forEach((frequency, i) => {
      this.tone(frequency, 0.45, i * 0.13);
    });
  }

  /** Starts (true) or stops (false) the background melody loop; restarting keeps the position. */
  music(on: boolean): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (!on) return;
    this.timer = window.setInterval(() => {
      const frequency = MUSIC_NOTES[this.note++ % MUSIC_NOTES.length];
      if (frequency !== undefined) this.tone(frequency, 0.65, 0, 0.018);
    }, MUSIC_STEP_MS);
  }
}
