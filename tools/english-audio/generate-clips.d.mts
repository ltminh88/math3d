// Types for the plain-JavaScript clip generator (generate-clips.mjs), so
// `tsc --noEmit` can check the tests that import it.
export declare const VOICE: string;
export declare const SPEED: number;
export declare const SAMPLE_RATE: number;
export declare const AUDIO_URL_PREFIX: string;
export declare const LETTER_NAMES: Readonly<Record<string, string>>;
export declare const SEED_TEXTS: readonly string[];

export interface ClipItem {
  readonly text: string;
  readonly kind: 'word' | 'letter' | 'sentence';
}

export interface PlannedClip extends ClipItem {
  readonly id: string;
  readonly hash: string;
  readonly action: 'generate' | 'skip';
}

export interface ManifestClip {
  readonly text: string;
  readonly hash: string;
}

export interface Manifest {
  readonly clips: Readonly<Record<string, ManifestClip>>;
}

export declare function clipIdFor(item: ClipItem): string;
export declare function ttsTextFor(item: ClipItem): string;
export declare function textHash(ttsText: string, voice?: string, speed?: number): string;
export declare function clipFileName(id: string, hash: string): string;
export declare function planClips(
  items: readonly ClipItem[],
  manifest: Manifest,
  outDir: string,
): PlannedClip[];
export declare function emitAudioMap(
  entries: readonly { text: string; id: string; hash: string }[],
): string;
export declare function emitCredits(args: { kokoroVersion: string; speed: number }): string;
