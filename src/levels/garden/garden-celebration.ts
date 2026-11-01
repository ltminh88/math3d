// The end of the garden run, drawn inside the level overlay (not a world dialog): the recovered
// completion medal, the run's stars, VLM's words, the rewards and "Về cổng", which ends the
// level as completed (the host adds the one-time completion bonus).
import { tc } from '../../i18n/common-strings';
import type { GardenStrings } from './garden-strings';

export function showGardenCelebration(
  root: HTMLElement,
  gs: GardenStrings,
  earned: { xp: number; coins: number },
  stars: number,
  onBack: () => void,
  /** First clear: the one-time bonus the host adds on commit, else null. */
  bonus: { xp: number; coins: number } | null = null,
): HTMLElement {
  const card = document.createElement('section');
  card.className = 'garden-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'garden-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">✿</div>
    <h2 id="garden-done-title"></h2><p class="garden-stars" role="img"></p>
    <p class="garden-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary garden-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = gs('doneTitle');
  const starRow = card.querySelector('.garden-stars') as HTMLElement;
  starRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  starRow.setAttribute('aria-label', gs('stars', { n: stars }));
  starRow.dataset.stars = String(stars);
  (card.querySelector('.garden-done__line strong') as HTMLElement).textContent =
    `${tc('guideName')}:`;
  (card.querySelector('.garden-done__line span') as HTMLElement).textContent = gs('doneLine');
  (card.querySelector('.completion-rewards') as HTMLElement).textContent = gs('doneScore', earned);
  if (bonus) {
    const line = document.createElement('p');
    line.className = 'completion-rewards garden-bonus';
    line.textContent = gs('bonusLine', bonus);
    card.querySelector('.completion-rewards')?.after(line);
  }
  const back = card.querySelector('.garden-back') as HTMLButtonElement;
  back.textContent = gs('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
