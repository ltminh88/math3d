// Toast messages, save persistence with a one-time failure notice, and the CSS bump animation.
import { translateText } from '../i18n/legacy-translator';
import { writeSave } from '../save/save-storage';
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

/** Writes the current save; the first failure tells the player progress is session-only. */
export function persistSave(): boolean {
  const ok = writeSave(gameState.save);
  if (!ok && !gameState.saveFailWarned) {
    gameState.saveFailWarned = true;
    showToast('Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.');
  }
  return ok;
}

/** Restarts the `bump` animation on an element (class removal + forced reflow). */
export function bump(id: string): void {
  const element = byId(id);
  element.classList.remove('bump');
  void element.offsetWidth;
  element.classList.add('bump');
}
