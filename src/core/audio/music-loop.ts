import { playTone } from './sfx-presets';

// C major pentatonic (C4 D4 E4 G4 A4 C5); -1 = rest. Eight notes of calm wandering, looped.
const SCALE: readonly number[] = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
const MELODY: readonly number[] = [0, 2, 4, 2, 3, -1, 1, 2, 4, 5, 4, 3, 2, -1, 1, 0];
const STEP_SECONDS = 0.375;
const LOOKAHEAD_SECONDS = 0.3;
const TICK_MS = 100;

/** Frequency for a melody step, or null for a rest. Wraps around the melody. */
export function melodyFrequency(step: number): number | null {
  const index = MELODY[((step % MELODY.length) + MELODY.length) % MELODY.length];
  if (index === undefined || index < 0) return null;
  return SCALE[index] ?? null;
}

/** Look-ahead scheduler: a timer queues the next notes slightly before they are due. */
export class MusicLoop {
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextTime = 0;

  constructor(
    private readonly ctx: AudioContext,
    private readonly destination: AudioNode,
  ) {}

  get playing(): boolean {
    return this.timer !== null;
  }

  start(): void {
    if (this.timer !== null) return;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.timer = setInterval(() => this.schedule(), TICK_MS);
    this.schedule();
  }

  stop(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  private schedule(): void {
    if (this.ctx.state !== 'running') {
      // Suspended contexts do not advance currentTime; do not queue a backlog.
      this.nextTime = this.ctx.currentTime + 0.05;
      return;
    }
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD_SECONDS) {
      const freq = melodyFrequency(this.step);
      if (freq !== null) {
        playTone(
          this.ctx,
          this.destination,
          { freq, at: 0, dur: STEP_SECONDS * 0.9, type: 'sine', gain: 0.22 },
          this.nextTime,
        );
      }
      this.step += 1;
      this.nextTime += STEP_SECONDS;
    }
  }
}
