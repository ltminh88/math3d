// Daily practice in the shared UI (phase 11, thin integration): the Milo dialog's entry and
// the quest card's reminder line. This module owns the daily HTML/logic; guide-dialog.ts and
// quest-chain.ts each add one line calling it, so merging with the sticker book — which adds
// its section BELOW this one — is just keeping both lines. The wiring uses a dynamic import
// so this module never pulls the daily panel into the quest-chain → hud import chain.
import { dayNumber } from '../learning/daily-intervals';
import { dailyUnlocked } from '../learning/daily-planner';
import { dailyCountedToday } from '../learning/daily-streak';
import { td } from './daily-practice-strings';
import { byId } from './icons';
import { connectedStore } from './progress-sync';

export interface DailyGuideInput {
  unlocked: boolean;
  streak: number;
}

/** The Milo dialog's daily section: entry button + streak, or the locked line. */
export function dailyGuideSectionHtml(input: DailyGuideInput): string {
  // Own class, not `dialog-copy`: the dialog's main copy already uses that class, and a
  // second match breaks selectors (and strict mode) that expect exactly one `.dialog-copy`.
  if (!input.unlocked) return `<p class="daily-guide-locked">${td('locked')}</p>`;
  const streak =
    input.streak > 0
      ? `<p class="daily-guide-streak">${td('streak', { n: input.streak })}</p>`
      : '';
  return `<div class="daily-guide-section"><button id="daily-guide-button" type="button" class="secondary wide">📅 ${td('button')}</button>${streak}</div>`;
}

/** The Milo dialog's daily section from the live store (called fresh on every dialog open). */
export function dailyGuideSection(): string {
  const snapshot = connectedStore()?.getSnapshot();
  if (!snapshot) return dailyGuideSectionHtml({ unlocked: false, streak: 0 });
  return dailyGuideSectionHtml({
    unlocked: dailyUnlocked(snapshot.levelProgress),
    streak: snapshot.daily?.dailyStreak ?? 0,
  });
}

/** Wires the Milo dialog's daily button (no-op when the dialog shows the locked line). */
export function wireDailyGuideButton(): void {
  const button = document.getElementById('daily-guide-button');
  if (!button) return;
  button.addEventListener('click', () => {
    // The daily run replaces the Milo dialog's content in the same shared <dialog>.
    void import('./daily-practice').then((m) => m.openDailyPractice());
  });
}

export interface DailyQuestInput {
  unlocked: boolean;
  countedToday: boolean;
}

/** The quest card's reminder line, or null when daily is still locked. */
export function dailyQuestReminderText(input: DailyQuestInput): string | null {
  if (!input.unlocked) return null;
  return input.countedToday ? td('questDone') : td('questTodo');
}

/** Creates/updates (or removes, when locked) the reminder line on the quest card. */
export function renderDailyQuestReminder(): void {
  const snapshot = connectedStore()?.getSnapshot();
  const text = snapshot
    ? dailyQuestReminderText({
        unlocked: dailyUnlocked(snapshot.levelProgress),
        countedToday: dailyCountedToday(snapshot.daily, dayNumber(Date.now())),
      })
    : null;
  let line = document.getElementById('quest-daily');
  if (text === null) {
    line?.remove();
    return;
  }
  if (!line) {
    line = document.createElement('p');
    line.id = 'quest-daily';
    line.className = 'quest-daily';
    byId('quest-body').prepend(line);
  }
  if (line.textContent !== text) line.textContent = text;
}
