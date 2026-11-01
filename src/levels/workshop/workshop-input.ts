// Keyboard for the workshop (optional; every action also has a button): digits + Enter go to the
// step card's number pad, 1-4 pick a choice (1 Đúng, 2 Sai on a true/false step), → walks the next
// fence side, Space lays a row of tiles, H asks for a hint, Enter goes to the next order once one
// is done. Listens on `document` with the level's signal; keys taken here are consumed.
import type { WorkshopRoundController } from './workshop-round-controller';

export function listenWorkshopKeys(
  controller: WorkshopRoundController,
  layer: HTMLElement,
  signal: AbortSignal,
): void {
  const onKey = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const flow = controller.flow;
    if (flow.done) return;
    const focus = document.activeElement;
    const inLevel = !focus || focus === document.body || layer.contains(focus);
    const onButton = focus instanceof HTMLButtonElement || focus?.getAttribute('role') === 'button';
    if (!inLevel) return;
    if (flow.roundComplete) {
      if (event.key === 'Enter' && !onButton) {
        event.preventDefault();
        controller.next();
      }
      return;
    }
    if (event.key === 'h' || event.key === 'H') {
      event.preventDefault();
      controller.hint();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      controller.walkNext();
    } else if (event.key === ' ' && !onButton) {
      event.preventDefault();
      controller.placeRow();
    } else if (/^[1-4]$/.test(event.key)) {
      const row = controller.card?.element.querySelector('.kit-step:last-child');
      const buttons = row?.querySelectorAll<HTMLButtonElement>(
        '.kit-choices button, .kit-verdict button',
      );
      const button = buttons?.[Number(event.key) - 1];
      if (!button || button.disabled) return;
      event.preventDefault();
      button.click();
    }
  };
  document.addEventListener('keydown', onKey, { capture: true, signal });
}
