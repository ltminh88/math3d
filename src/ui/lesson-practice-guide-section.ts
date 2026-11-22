// Lesson mode in the shared UI (phase 06, thin integration): the Milo dialog's entry.
// This module owns the lesson entry HTML; guide-dialog.ts adds two lines calling it.
// The wiring uses a dynamic import so this module never pulls the lesson panel into
// the quest-chain → hud import chain. Open from day one: no locked line.
import { tl } from './lesson-practice-strings';

export function lessonGuideSectionHtml(): string {
  return `<div class="lesson-guide-section"><button id="lesson-guide-button" type="button" class="secondary wide">📖 ${tl('button')}</button></div>`;
}

/** The Milo dialog's lesson section (called fresh on every dialog open). */
export function lessonGuideSection(): string {
  return lessonGuideSectionHtml();
}

/** Wires the Milo dialog's lesson button. */
export function wireLessonGuideButton(): void {
  const button = document.getElementById('lesson-guide-button');
  if (!button) return;
  button.addEventListener('click', () => {
    // The picker replaces the Milo dialog's content in the same shared <dialog>.
    void import('./lesson-practice').then((m) => m.openLessonPicker());
  });
}
