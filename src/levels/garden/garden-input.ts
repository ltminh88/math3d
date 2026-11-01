// Optional keys for the garden (WCAG 2.5.7 alternative to tapping; every step is playable by tap):
// 1-4 pick a seed packet or a "which part first?" card, digits + Enter go to the kit number pad
// on number steps (it listens itself), Enter moves on once a round is done, H asks for a hint
// while focus is in the level layer. Listens on `document` in the capture phase with the level's
// signal; keys taken here are consumed (preventDefault), so the pad never types them.
import type { GardenRoundController } from './garden-round-controller';

const PAD_KEY = /^([0-9]|Enter|Backspace|Delete)$/;

export function listenGardenKeys(
  controller: GardenRoundController,
  layer: HTMLElement,
  signal: AbortSignal,
): void {
  const onKey = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const flow = controller.flow;
    if (flow.done) return;
    if (event.key === 'h' || event.key === 'H') {
      const focus = document.activeElement;
      if (focus && focus !== document.body && !layer.contains(focus)) return;
      if (flow.roundComplete) return;
      controller.hint();
      event.preventDefault();
      return;
    }
    if (!PAD_KEY.test(event.key)) return;
    // A focused button handles its own Enter (next round, a card, a pad key).
    if (event.key === 'Enter' && document.activeElement instanceof HTMLButtonElement) return;
    if (flow.roundComplete) {
      event.preventDefault();
      if (event.key === 'Enter') controller.next();
      return;
    }
    if (flow.step?.kind !== 'choice') return;
    event.preventDefault();
    const n = Number(event.key);
    if (Number.isInteger(n) && n >= 1) controller.choiceButtons()[n - 1]?.click();
  };
  document.addEventListener('keydown', onKey, { capture: true, signal });
}
