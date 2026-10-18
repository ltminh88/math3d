// The shared modal <dialog>: every dialog (Milo, quiz, book, help, settings, reset, complete)
// swaps its content. Opening pauses the world; closing restores the map-pause state.
import { translateLongText } from '../i18n/legacy-translator';
import { type DialogKind, gameState, getWorld } from './game-state';
import { byId } from './icons';
import { closeMap } from './map-overlay';

/** Shows `bodyHtml` under a translated `<h2 id="dialog-title">`, closing the map first. */
export function openDialog(title: string, bodyHtml: string, kind: DialogKind): void {
  if (gameState.mapOpen) {
    closeMap();
  }
  const world = getWorld();
  world.paused = true;
  world.clearInput();
  gameState.dialogKind = kind;
  byId('dialog-content').innerHTML = translateLongText(
    `<h2 id="dialog-title">${title}</h2>${bodyHtml}`,
  );
  const dialog = byId<HTMLDialogElement>('dialog');
  if (!dialog.open) {
    dialog.showModal();
  }
}

export function closeDialog(): void {
  byId<HTMLDialogElement>('dialog').close();
}

export function wireDialog(): void {
  byId('dialog').addEventListener('close', () => {
    const world = getWorld();
    world.paused = gameState.mapOpen;
    world.clearInput();
    gameState.dialogKind = '';
    gameState.question = undefined;
  });
  byId('close-dialog').onclick = closeDialog;
}
