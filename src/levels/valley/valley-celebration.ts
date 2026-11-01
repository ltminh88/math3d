// The rebuilt stone garden, drawn inside the level overlay (not a world dialog): the recovered
// completion medal, the run's stars, VLM's words, the rewards and "Về cổng", which ends the level
// as completed (the host adds the one-time completion bonus).
import { tc } from '../../i18n/common-strings';
import type { ValleyStrings } from './valley-strings';

export function showValleyCelebration(
  root: HTMLElement,
  vs: ValleyStrings,
  earned: { xp: number; coins: number },
  stars: number,
  onBack: () => void,
  /** First clear: the one-time bonus the host adds on commit, else null. */
  bonus: { xp: number; coins: number } | null = null,
): HTMLElement {
  const card = document.createElement('section');
  card.className = 'valley-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'valley-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">★</div>
    <h2 id="valley-done-title"></h2><p class="valley-stars" role="img"></p>
    <p class="valley-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary valley-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = vs('doneTitle');
  const starRow = card.querySelector('.valley-stars') as HTMLElement;
  starRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  starRow.setAttribute('aria-label', vs('stars', { n: stars }));
  starRow.dataset.stars = String(stars);
  (card.querySelector('.valley-done__line strong') as HTMLElement).textContent =
    `${tc('guideName')}:`;
  (card.querySelector('.valley-done__line span') as HTMLElement).textContent = vs('doneLine');
  (card.querySelector('.completion-rewards') as HTMLElement).textContent = vs('doneScore', earned);
  if (bonus) {
    const line = document.createElement('p');
    line.className = 'completion-rewards valley-bonus';
    line.textContent = vs('bonusLine', bonus);
    card.querySelector('.completion-rewards')?.after(line);
  }
  const back = card.querySelector('.valley-back') as HTMLButtonElement;
  back.textContent = vs('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
