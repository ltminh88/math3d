// The lesson-mode HUD button (phase 06): "Ôn theo bài" in the top bar, right after the
// daily button. Created once, like the shop button; hidden with the whole HUD while a
// level runs. On touch screens the label hides (icon only, aria-label kept): full-width
// the button would reach the settled VLM label's top touch point (see
// lesson-practice.css).

import { byId } from './icons';
import { openLessonPicker } from './lesson-practice';
import { tl } from './lesson-practice-strings';
import '../styles/lesson-practice.css';

export function initLessonButton(): void {
  if (document.getElementById('open-lesson')) return;
  const button = document.createElement('button');
  button.id = 'open-lesson';
  button.type = 'button';
  button.className = 'tool-button lesson-button';
  button.innerHTML = '📖<span></span>';
  (button.querySelector('span') as HTMLElement).textContent = tl('button');
  button.setAttribute('aria-label', tl('button'));
  button.onclick = () => openLessonPicker();
  const daily = byId('open-daily');
  if (daily) daily.after(button);
  else byId('quest-card').after(button);
}
