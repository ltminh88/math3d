// Toast messages and the CSS bump animation. (Progress persistence lives in progress-sync.ts.)
import { translateText } from '../i18n/legacy-translator';
import { gameState } from './game-state';
import { byId } from './icons';

const TOAST_MS = 4200;

/** Shows a translated status toast for 4.2 s (a new toast restarts the timer). */
export function showToast(text: string): void {
  byId('toast').textContent = translateText(text);
  byId('toast').hidden = false;
  clearTimeout(gameState.toastTimer);
  gameState.toastTimer = window.setTimeout(() => (byId('toast').hidden = true), TOAST_MS);
}

/** Restarts the `bump` animation on an element (class removal + forced reflow). */
export function bump(id: string): void {
  const element = byId(id);
  element.classList.remove('bump');
  void element.offsetWidth;
  element.classList.add('bump');
}
