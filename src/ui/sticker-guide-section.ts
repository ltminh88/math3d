// The sticker book's entries in the two shared surfaces (phase 12). VLM's dialog gets the
// earning line ("Con vừa dán được hình …!") and a "Sổ dán hình" button; the quest card gets
// the same button in its bottom row. The two shared files each call one function from here
// — no sticker HTML lives in them. The sticker part always sits BELOW the daily-practice
// part (the order le fixed): in miloBodyHtml it is appended after the accept-quest button,
// and on the quest card the button is appended to .quest-bottom, below the card copy.
import { openStickerBook, takePendingEarningLines } from './sticker-book';
import { ts } from './sticker-book-strings';

/** VLM's dialog, below the daily-practice entry: the earning line (when there is one) + the book button. */
export function stickerGuideSectionHtml(): string {
  const lines = takePendingEarningLines();
  const tip = lines.length
    ? `<div class="milo-tip"><span>⭐</span><p>${lines.join('<br>')}</p></div>`
    : '';
  return `${tip}<button type="button" id="open-sticker-book-guide" class="secondary wide">📖 ${ts('openButton')}</button>`;
}

/** Wires the dialog's book button (called from talkToGuide after the dialog opens). */
export function wireStickerGuideSection(): void {
  const button = document.getElementById('open-sticker-book-guide');
  if (!button) return;
  button.onclick = () => openStickerBook();
}

/**
 * The quest card's "Sổ dán hình" button, in the card's bottom row so it stays visible when
 * the card is collapsed. Called at the end of the quest chain's render (both branches); the
 * guard keeps the repeated render from adding a second button.
 */
export function wireStickerBookButton(): void {
  if (document.getElementById('sticker-book-button')) return;
  const bottom = document.querySelector('#quest-card .quest-bottom');
  if (!bottom) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'sticker-book-button';
  button.className = 'text-button sticker-book-button';
  button.textContent = `📖 ${ts('openButton')}`;
  button.onclick = () => openStickerBook();
  bottom.append(button);
}
