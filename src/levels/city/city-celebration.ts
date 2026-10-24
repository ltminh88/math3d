// End of the run, drawn inside the level overlay (not a world dialog): the recovered completion
// medal, the run's stars, VLM's thanks, the round rewards and "Về cổng", which ends the level as
// completed (stars follow the session recorder's rule, so they match what the gate shows).
import { tc } from '../../i18n/common-strings';
import type { CityStrings } from './city-strings';

export function showCityCelebration(
  root: HTMLElement,
  ts: CityStrings,
  earned: { xp: number; coins: number },
  stars: number,
  onBack: () => void,
): HTMLElement {
  const card = document.createElement('section');
  card.className = 'city-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'city-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">★</div>
    <h2 id="city-done-title"></h2><p class="city-stars" role="img"></p>
    <p class="city-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary city-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = ts('doneTitle');
  const starRow = card.querySelector('.city-stars') as HTMLElement;
  starRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  starRow.setAttribute('aria-label', ts('stars', { n: stars }));
  starRow.dataset.stars = String(stars);
  (card.querySelector('.city-done__line strong') as HTMLElement).textContent =
    `${tc('guideName')}:`;
  (card.querySelector('.city-done__line span') as HTMLElement).textContent = ts('doneLine');
  (card.querySelector('.completion-rewards') as HTMLElement).textContent = ts('doneScore', earned);
  const back = card.querySelector('.city-back') as HTMLButtonElement;
  back.textContent = ts('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
