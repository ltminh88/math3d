// All orders delivered, drawn inside the level overlay (not a world dialog): the recovered
// completion medal, the run's stars, VLM's words, the rewards and "Về cổng", which ends the level
// as completed (the host adds the one-time completion bonus).
import { tc } from '../../i18n/common-strings';
import type { WorkshopStrings } from './workshop-strings';

export function showWorkshopCelebration(
  root: HTMLElement,
  ws: WorkshopStrings,
  earned: { xp: number; coins: number },
  stars: number,
  onBack: () => void,
  /** First clear: the one-time bonus the host adds on commit, else null. */
  bonus: { xp: number; coins: number } | null = null,
): HTMLElement {
  const card = document.createElement('section');
  card.className = 'workshop-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'workshop-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">📏</div>
    <h2 id="workshop-done-title"></h2><p class="workshop-stars" role="img"></p>
    <p class="workshop-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary workshop-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = ws('doneTitle');
  const starRow = card.querySelector('.workshop-stars') as HTMLElement;
  starRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  starRow.setAttribute('aria-label', ws('stars', { n: stars }));
  starRow.dataset.stars = String(stars);
  (card.querySelector('.workshop-done__line strong') as HTMLElement).textContent =
    `${tc('guideName')}:`;
  (card.querySelector('.workshop-done__line span') as HTMLElement).textContent = ws('doneLine');
  (card.querySelector('.completion-rewards') as HTMLElement).textContent = ws('doneScore', earned);
  if (bonus) {
    const line = document.createElement('p');
    line.className = 'completion-rewards workshop-bonus';
    line.textContent = ws('bonusLine', bonus);
    card.querySelector('.completion-rewards')?.after(line);
  }
  const back = card.querySelector('.workshop-back') as HTMLButtonElement;
  back.textContent = ws('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
