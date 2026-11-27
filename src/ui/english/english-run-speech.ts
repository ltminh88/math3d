// Run speech (two-modes Phase 1, split from english-run.ts, move-only):
// the "🔊 Nghe" behaviour — one "bật âm thanh" prompt per run while muted,
// one parent notice per run when an item has no audio at all. Both go
// through the feedback line so the child never meets a silent item unawares.
import type { EnglishSpeaker } from './english-speaker';
import { tei } from './english-strings';

export interface EnglishRunSpeech {
  readonly onSpeak: (text: string) => Promise<void>;
  /** Say the "bật âm thanh" prompt once per run (the round calls it after mount while muted). */
  readonly promptMutedOnce: () => void;
}

export function createEnglishRunSpeech(
  speaker: EnglishSpeaker,
  say: (text: string) => void,
): EnglishRunSpeech {
  let mutedPromptShown = false;
  let audioNoticeShown = false;
  let unlockPrimed = false;
  return {
    onSpeak: async (text: string) => {
      if (!unlockPrimed) {
        unlockPrimed = true;
        speaker.unlock();
      }
      const result = await speaker.speak(text);
      if (!result.played && result.reason === 'muted') say(tei('soundOff'));
      else if (!result.played && result.reason === 'unavailable' && !audioNoticeShown) {
        audioNoticeShown = true;
        say(tei('noAudio'));
      }
    },
    promptMutedOnce: () => {
      if (mutedPromptShown) return;
      mutedPromptShown = true;
      say(tei('soundOff'));
    },
  };
}
