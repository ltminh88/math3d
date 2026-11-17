// The daily run's finish screen (phase 11): streak, coins earned, completion bonus when the
// run counted, and the button back to the world. A missed day restarts the streak at 1 and
// the screen only ever celebrates the current count (no penalty copy).
import { DAILY_FINISH_COINS } from '../learning/daily-streak';
import type { DailyProgress } from '../store/save-schema';
import { td } from './daily-practice-strings';

export function finishScreenHtml(
  daily: DailyProgress | undefined,
  coins: number,
  counted: boolean,
): string {
  return `<p class="dialog-copy">${td('streak', { n: daily?.dailyStreak ?? 0 })}</p><p class="dialog-copy">${td('finishCoins', { coins })}</p>${counted ? `<p class="dialog-copy">${td('finishBonus', { coins: DAILY_FINISH_COINS })}</p>` : ''}<button type="button" class="primary wide" id="daily-back">${td('backToWorld')}</button>`;
}
