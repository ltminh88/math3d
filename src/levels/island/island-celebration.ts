// The finished walk around the islet, drawn inside the level overlay (not a world
// dialog): the recovered completion medal, the run's stars, VLM's words, the score and
// "Về cổng", which ends the level (the host adds the one-time completion bonus; the
// quest card then shows its next quest). The score is the round ratio, not XP: the shell
// never sees per-question rewards, and the host's toast reports the committed ones.
import { tc } from '../../i18n/common-strings';
import type { EnglishRunResult } from '../../ui/english/english-run';
import type { IslandStrings } from './island-strings';

export function showIslandCelebration(
  root: HTMLElement,
  cs: IslandStrings,
  result: EnglishRunResult,
  stars: number,
  onBack: () => void,
  /** First clear: the one-time bonus the host adds on commit, else null. */
  bonus: { xp: number; coins: number } | null = null,
  /** The stage just played ("Chặng {n}/8 · {sao} sao"), else null. */
  stageLine: string | null = null,
): HTMLElement {
  const card = document.createElement('section');
  card.className = 'island-done glass';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-labelledby', 'island-done-title');
  card.innerHTML = `<div class="completion-medal" aria-hidden="true">🏝️</div>
    <h2 id="island-done-title"></h2><p class="island-stars" role="img"></p>
    <p class="island-done__line"><strong></strong> <span></span></p>
    <p class="completion-rewards"></p><button type="button" class="primary island-back"></button>`;
  (card.querySelector('h2') as HTMLElement).textContent = cs('doneTitle');
  const starRow = card.querySelector('.island-stars') as HTMLElement;
  starRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  starRow.setAttribute('aria-label', cs('stars', { n: stars }));
  starRow.dataset.stars = String(stars);
  if (stageLine) {
    const line = document.createElement('p');
    line.className = 'island-stage-line';
    line.textContent = stageLine;
    starRow.after(line);
  }
  (card.querySelector('.island-done__line strong') as HTMLElement).textContent =
    `${tc('guideName')}:`;
  const lineText = card.querySelector('.island-done__line span') as HTMLElement;
  lineText.textContent = result.roundsPlayed > 0 ? cs('doneLine') : cs('emptyLine');
  const score = card.querySelector('.completion-rewards') as HTMLElement;
  score.textContent =
    result.roundsPlayed > 0
      ? cs('doneScore', { correct: result.correctCount, total: result.roundsPlayed })
      : '';
  if (!result.roundsPlayed) score.remove();
  if (bonus) {
    const line = document.createElement('p');
    line.className = 'completion-rewards island-bonus';
    line.textContent = cs('bonusLine', bonus);
    card.querySelector('.completion-rewards')?.after(line);
  }
  const back = card.querySelector('.island-back') as HTMLButtonElement;
  back.textContent = cs('backToGate');
  back.addEventListener('click', onBack, { once: true });
  root.append(card);
  back.focus();
  return card;
}
