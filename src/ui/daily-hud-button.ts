// The daily-practice HUD button (phase 11): "Luyện tập hôm nay" in the top bar, next to the
// quest card. Created once, like the shop button; hidden with the whole HUD while a level runs.
import { openDailyPractice } from './daily-practice';
import { td } from './daily-practice-strings';
import { byId } from './icons';
import './daily-practice.css';

export function initDailyButton(): void {
  if (document.getElementById('open-daily')) return;
  const button = document.createElement('button');
  button.id = 'open-daily';
  button.type = 'button';
  button.className = 'tool-button daily-button';
  button.innerHTML = '📅<span></span>';
  (button.querySelector('span') as HTMLElement).textContent = td('button');
  button.setAttribute('aria-label', td('button'));
  button.onclick = () => openDailyPractice();
  byId('quest-card').after(button);
}
