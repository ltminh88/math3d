// English home (two-modes Phase 2): the DOM home for English mode — CEC stage cards with
// stars, a card tap enters the island, "Về menu" goes back to the welcome menu. Lazily
// imported from the welcome, so it stays out of the main chunk. The world is never
// activated here: while this page is open the level exit target is 'english-home', so a
// run's exit shows this page again with fresh stars and the world stays suspended.

import { setLevelExitTarget } from '../../levels/shared/level-exit-target';
import { enterLevelFromMap, isLevelRunning } from '../../levels/shared/level-gates';
import { appSettings } from '../../store/app-settings';
import { byId } from '../icons';
import { returnToMenu } from '../menu-language-start';
import { connectedStore } from '../progress-sync';
import './english-home.css';
import { englishHomeCards } from './english-home-stage-cards';
import { th } from './english-home-strings';

let home: HTMLElement | undefined;
let unsubscribe: (() => void) | undefined;

/** Best stars per island stage from the store (the same progress the world gate reads). */
function islandStageStars(): readonly number[] {
  return connectedStore()?.getSnapshot().levelProgress.island?.stageStars ?? [];
}

function renderHome(section: HTMLElement): void {
  (section.querySelector('.english-home-title') as HTMLElement).textContent = th('title');
  (section.querySelector('.english-home-sub') as HTMLElement).textContent = th('subtitle');
  (section.querySelector('.english-home-menu') as HTMLElement).textContent = th('backToMenu');
  const list = section.querySelector('.english-home-cards') as HTMLElement;
  list.replaceChildren(
    ...englishHomeCards(islandStageStars()).map((card) => {
      const stageName = th('stageName', { name: card.name });
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `english-home-card${card.next ? ' next' : ''}${
        card.status === 'completed' ? ' completed' : ''
      }`;
      button.disabled = !card.enterable;
      button.dataset.stage = String(card.stage);
      button.setAttribute(
        'aria-label',
        th('cardLabel', { stageName, stars: card.stars }) +
          (card.enterable ? '' : ` — ${th('lockedNote')}`),
      );
      const stage = document.createElement('span');
      stage.className = 'english-home-card-stage';
      stage.textContent = th('stage', { n: card.stage });
      const name = document.createElement('strong');
      name.textContent = stageName;
      const stars = document.createElement('span');
      stars.className = 'english-home-card-stars';
      stars.setAttribute('aria-hidden', 'true');
      stars.textContent = card.starsText;
      button.append(stage, name, stars);
      if (card.enterable) button.addEventListener('click', () => void enterStage(card.stage));
      return button;
    }),
  );
}

function ensureHome(): HTMLElement {
  if (home) return home;
  const section = document.createElement('section');
  section.id = 'english-home';
  section.className = 'english-home';
  section.hidden = true;
  section.tabIndex = -1;
  section.setAttribute('aria-labelledby', 'english-home-title');
  section.innerHTML =
    '<h1 id="english-home-title" class="english-home-title"></h1>' +
    '<p class="english-home-sub"></p>' +
    '<div class="english-home-cards" role="group" aria-label=""></div>' +
    '<button type="button" id="english-home-menu" class="text-button english-home-menu"></button>';
  (section.querySelector('.english-home-cards') as HTMLElement).setAttribute(
    'aria-label',
    th('cardsGroup'),
  );
  (section.querySelector('.english-home-menu') as HTMLElement).addEventListener(
    'click',
    leaveEnglishMode,
  );
  (byId('world').parentElement as HTMLElement).append(section);
  home = section;
  return section;
}

/** Enters one island stage; a run that never starts leaves the child on the home. */
async function enterStage(stage: number): Promise<void> {
  if (!home || isLevelRunning()) return;
  home.hidden = true;
  const outcome = await enterLevelFromMap('island', stage);
  if (outcome !== 'entered' && !isLevelRunning()) showEnglishHome();
}

/** Back to the welcome menu: exits English mode, so later runs return to the world. */
function leaveEnglishMode(): void {
  setLevelExitTarget('world');
  unsubscribe?.();
  unsubscribe = undefined;
  if (home) home.hidden = true;
  returnToMenu();
}

/**
 * Shows the home again with fresh stars — the exit target the host calls after every run,
 * and the fallback when a run never starts. The store subscription re-renders the cards
 * when the run's commit lands (the host commits in the background after exit).
 */
export function showEnglishHome(): void {
  const section = ensureHome();
  renderHome(section);
  byId('welcome').hidden = true;
  byId('hud').hidden = true;
  byId('area-label').hidden = true;
  byId('world-caption').hidden = true;
  byId('menu-footer').hidden = true;
  document.body.classList.remove('playing');
  section.hidden = false;
  section.focus({ preventScroll: true });
  if (!unsubscribe) {
    unsubscribe = connectedStore()?.subscribe(() => {
      if (home && !home.hidden) renderHome(home);
    });
  }
}

/** Opens English mode from the welcome: remembers the choice, never activates the world. */
export function startEnglishHome(): void {
  appSettings.update({ playMode: 'english' });
  setLevelExitTarget('english-home', showEnglishHome);
  showEnglishHome();
}
