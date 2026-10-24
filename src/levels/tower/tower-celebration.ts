// The top of the tower, drawn inside the level overlay (not a world dialog): the recovered
// completion medal, the run's stars, VLM's words, the floor rewards and "Về cổng", which ends
// the level as completed (the host adds the one-time completion bonus).
import { tc } from '../../i18n/common-strings';
import { type SessionTally, starsFor } from '../../learning/scoring';
import type { TowerStrings } from './tower-strings';

export function showTowerCelebration(
  root: HTMLElement,
  ts: TowerStrings,
  earned: { xp: number; coins: number },
  tally: SessionTally,
  onBack: () => void,
): HTMLElement {
  const stars = starsFor(tally);
  const card = document.createElement('section');
  card.className = 'tower-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'tower-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">★</div>
    <h2 id="tower-done-title"></h2><p class="tower-stars" role="img"></p>
    <p class="tower-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary tower-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = ts('doneTitle');
  const starRow = card.querySelector('.tower-stars') as HTMLElement;
  starRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  starRow.setAttribute('aria-label', ts('stars', { n: stars }));
  starRow.dataset.stars = String(stars);
  (card.querySelector('.tower-done__line strong') as HTMLElement).textContent =
    `${tc('guideName')}:`;
  (card.querySelector('.tower-done__line span') as HTMLElement).textContent = ts('doneLine');
  (card.querySelector('.completion-rewards') as HTMLElement).textContent = ts('doneScore', earned);
  const back = card.querySelector('.tower-back') as HTMLButtonElement;
  back.textContent = ts('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
