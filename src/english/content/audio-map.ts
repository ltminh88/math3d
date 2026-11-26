// Pre-generated audio clips for English words/sentences (Phase 3B placeholder):
// Phase 2C fills this map with clip ids → mp3 URLs (Kokoro `af_heart`, Piper
// fallback). Until then it is empty and the speaker falls back to Web Speech.
// The clip id is the exact text the speaker says (one word, or one sentence).
export const ENGLISH_AUDIO_CLIPS: Readonly<Record<string, string>> = {};

/** Clip URL for the exact spoken text, or null when 2C has not provided one. */
export function englishClipUrl(text: string): string | null {
  return ENGLISH_AUDIO_CLIPS[text] ?? null;
}
