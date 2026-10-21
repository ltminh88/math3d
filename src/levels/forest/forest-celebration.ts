// End of the run, drawn inside the level overlay (not a world dialog): the recovered completion
// medal, VLM's thanks, the round rewards and "Về cổng", which ends the level as completed.
import { tc } from '../../i18n/common-strings';
import type { ForestStrings } from './forest-strings';

export function showForestCelebration(
  root: HTMLElement,
  ts: ForestStrings,
  earned: { xp: number; coins: number },
  onBack: () => void,
): HTMLElement {
  const card = document.createElement('section');
  card.className = 'forest-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'forest-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">★</div>
    <h2 id="forest-done-title"></h2><p class="forest-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary forest-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = ts('doneTitle');
  (card.querySelector('.forest-done__line strong') as HTMLElement).textContent =
    `${tc('guideName')}:`;
  (card.querySelector('.forest-done__line span') as HTMLElement).textContent = ts('doneLine');
  (card.querySelector('.completion-rewards') as HTMLElement).textContent = ts('doneScore', earned);
  const back = card.querySelector('.forest-back') as HTMLButtonElement;
  back.textContent = ts('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
