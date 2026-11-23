// The finished castle wall, drawn inside the level overlay (not a world dialog): the
// recovered completion medal, the run's stars, VLM's words, the rewards and "Về cổng", which
// ends the level as completed (the host adds the one-time completion bonus; the quest card
// then shows its next quest).
import { tc } from '../../i18n/common-strings';
import type { NumberfortStrings } from './numberfort-strings';

export function showNumberfortCelebration(
  root: HTMLElement,
  cs: NumberfortStrings,
  earned: { xp: number; coins: number },
  stars: number,
  onBack: () => void,
  /** First clear: the one-time bonus the host adds on commit, else null. */
  bonus: { xp: number; coins: number } | null = null,
  /** The stage just played ("Chặng {n}/5 · {sao} sao"), else null. */
  stageLine: string | null = null,
  /** Stage 1 only: the chapter-3 opening line; later stages end with the stage celebration. */
  closing = true,
): HTMLElement {
  const card = document.createElement('section');
  card.className = 'numberfort-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'numberfort-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">🏰</div>
    <h2 id="numberfort-done-title"></h2><p class="numberfort-stars" role="img"></p>
    <p class="numberfort-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary numberfort-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = cs('doneTitle');
  const starRow = card.querySelector('.numberfort-stars') as HTMLElement;
  starRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  starRow.setAttribute('aria-label', cs('stars', { n: stars }));
  starRow.dataset.stars = String(stars);
  if (stageLine) {
    const line = document.createElement('p');
    line.className = 'numberfort-stage-line';
    line.textContent = stageLine;
    starRow.after(line);
  }
  if (closing) {
    (card.querySelector('.numberfort-done__line strong') as HTMLElement).textContent =
      `${tc('guideName')}:`;
    (card.querySelector('.numberfort-done__line span') as HTMLElement).textContent = cs('doneLine');
  } else {
    card.querySelector('.numberfort-done__line')?.remove();
  }
  (card.querySelector('.completion-rewards') as HTMLElement).textContent = cs('doneScore', earned);
  if (bonus) {
    const line = document.createElement('p');
    line.className = 'completion-rewards numberfort-bonus';
    line.textContent = cs('bonusLine', bonus);
    card.querySelector('.completion-rewards')?.after(line);
  }
  const back = card.querySelector('.numberfort-back') as HTMLButtonElement;
  back.textContent = cs('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
