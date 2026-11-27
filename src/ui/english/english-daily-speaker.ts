// The one-per-run English speaker for daily items (Phase 6): the speaker is
// created on the first English item of a run and disposed when the run ends,
// so a second English item in the same run reuses it. The per-run flags live
// here too, so disposing resets them for the next run.
import { appSettings } from '../../store/app-settings';
import { createBrowserEnglishSpeaker } from './english-speaker';

type DailySpeaker = ReturnType<typeof createBrowserEnglishSpeaker>;
let speaker: DailySpeaker | null = null;
let unlockPrimed = false;
let mutedPromptShown = false;
let audioNoticeShown = false;

/** The run's speaker, created on first use. */
export function dailySpeaker(): DailySpeaker {
  if (!speaker) speaker = createBrowserEnglishSpeaker(() => !appSettings.get().sound);
  return speaker;
}

/** Disposes the run's speaker and resets the per-run flags. */
export function disposeDailySpeaker(): void {
  speaker?.dispose();
  speaker = null;
  unlockPrimed = false;
  mutedPromptShown = false;
  audioNoticeShown = false;
}

/** True the first time the game is muted in a run (false after, until dispose). */
export function takeMutedPrompt(): boolean {
  if (mutedPromptShown) return false;
  mutedPromptShown = true;
  return true;
}

/** Speaks text; a muted or unavailable outcome is reported via onNotice. */
export async function speakDaily(
  text: string,
  onNotice: (notice: 'soundOff' | 'noAudio') => void,
): Promise<void> {
  const sp = dailySpeaker();
  if (!unlockPrimed) {
    unlockPrimed = true;
    sp.unlock();
  }
  const result = await sp.speak(text);
  if (!result.played && result.reason === 'muted') onNotice('soundOff');
  else if (!result.played && result.reason === 'unavailable' && !audioNoticeShown) {
    audioNoticeShown = true;
    onNotice('noAudio');
  }
}
