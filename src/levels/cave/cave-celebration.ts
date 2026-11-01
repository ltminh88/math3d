// The treasure room, drawn inside the level overlay (not a world dialog): the recovered completion
// medal, the run's stars, VLM's words, the rewards and "Về cổng", which ends the level as
// completed (the host adds the one-time completion bonus; the quest card then shows its closing card).
import { tc } from '../../i18n/common-strings';
import type { CaveStrings } from './cave-strings';

export function showCaveCelebration(
  root: HTMLElement,
  cs: CaveStrings,
  earned: { xp: number; coins: number },
  stars: number,
  onBack: () => void,
  /** First clear: the one-time bonus the host adds on commit, else null. */
  bonus: { xp: number; coins: number } | null = null,
): HTMLElement {
  const card = document.createElement('section');
  card.className = 'cave-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'cave-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">💎</div>
    <h2 id="cave-done-title"></h2><p class="cave-stars" role="img"></p>
    <p class="cave-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary cave-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = cs('doneTitle');
  const starRow = card.querySelector('.cave-stars') as HTMLElement;
  starRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  starRow.setAttribute('aria-label', cs('stars', { n: stars }));
  starRow.dataset.stars = String(stars);
  (card.querySelector('.cave-done__line strong') as HTMLElement).textContent =
    `${tc('guideName')}:`;
  (card.querySelector('.cave-done__line span') as HTMLElement).textContent = cs('doneLine');
  (card.querySelector('.completion-rewards') as HTMLElement).textContent = cs('doneScore', earned);
  if (bonus) {
    const line = document.createElement('p');
    line.className = 'completion-rewards cave-bonus';
    line.textContent = cs('bonusLine', bonus);
    card.querySelector('.completion-rewards')?.after(line);
  }
  const back = card.querySelector('.cave-back') as HTMLButtonElement;
  back.textContent = cs('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
