// Keyboard for the tower (WCAG 2.5.7 alternative to tapping): 1-3 pick an answer card (1 Đúng,
// 2 Sai on the "đố vui"), digits + Enter go to the kit number pad on number steps, Enter climbs
// once the floor is done. Listens on `document` in the capture phase with the level's signal;
// keys the cards take are consumed (preventDefault), so the pad never types into a hidden display.
import type { TowerRoundController } from './tower-round-controller';

const PAD_KEY = /^([0-9]|Enter|Backspace|Delete)$/;

export function listenTowerKeys(controller: TowerRoundController, signal: AbortSignal): void {
  const onKey = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!PAD_KEY.test(event.key)) return;
    const flow = controller.flow;
    const onButton = document.activeElement instanceof HTMLButtonElement;
    // A focused button handles its own Enter (next floor, an answer card, a pad key).
    if (event.key === 'Enter' && onButton) return;
    if (flow.done) return;
    if (flow.roundComplete) {
      event.preventDefault();
      if (event.key === 'Enter') controller.next();
      return;
    }
    const step = flow.step;
    if (!step || step.kind === 'number') return;
    event.preventDefault();
    const n = Number(event.key);
    if (Number.isInteger(n) && n >= 1) controller.pick(n - 1);
  };
  document.addEventListener('keydown', onKey, { capture: true, signal });
}
