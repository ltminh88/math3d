import { byId } from './icons';

/**
 * Rewrites markup only when it changed: the HUD is refreshed again after the store hydrates, and
 * re-inserting identical icons under the glass (backdrop-filter) buttons changes their raster.
 */
const writtenMarkup = new WeakMap<Element, string>();
export function setMarkup(id: string, html: string): void {
  const el = byId(id);
  if (writtenMarkup.get(el) !== html) {
    el.innerHTML = html;
    writtenMarkup.set(el, html);
  }
}
