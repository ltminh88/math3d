// Keyboard for the valley (optional: every action has a tap path). Arrows walk the board targets
// and Enter taps the focused one (it is a button); 1-4 press the step card's answer buttons on
// choice, choose-all and Đúng/Sai steps (digits go to the kit number pad on number steps);
// Enter is "Xong" on choose-all steps; H asks for a hint, R turns the view, Enter goes on once the round is done. Listened for on
// `document` in the capture phase with the level's signal.
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ValleyRoundController } from './valley-round-controller';

const ARROWS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

export function listenValleyKeys(
  controller: ValleyRoundController,
  layer: HTMLElement,
  signal: AbortSignal,
): void {
  const onKey = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const flow = controller.flow;
    if (flow.done) return;
    const focus = document.activeElement;
    const inLevel = !focus || focus === document.body || layer.contains(focus);
    if (!inLevel) return;
    const key = event.key;
    if (key === 'h' || key === 'H') {
      controller.hint();
      event.preventDefault();
    } else if (key === 'r' || key === 'R') {
      controller.board.camera.rotate(event.shiftKey ? -1 : 1);
      event.preventDefault();
    } else if (ARROWS.has(key)) {
      const buttons = controller.board.labels.buttons().filter((b) => !b.disabled);
      if (buttons.length === 0) return;
      const at = buttons.indexOf(focus as HTMLButtonElement);
      const step = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
      const next =
        at === -1
          ? step === 1
            ? 0
            : buttons.length - 1
          : (at + step + buttons.length) % buttons.length;
      buttons[next]?.focus();
      event.preventDefault();
    } else if (
      key === 'Enter' &&
      flow.phase === 'complete' &&
      !(focus instanceof HTMLButtonElement)
    ) {
      controller.next();
      event.preventDefault();
    } else if (
      key === 'Enter' &&
      flow.phase === 'steps' &&
      !(focus instanceof HTMLButtonElement) &&
      controller.card?.element.querySelector('.kit-step:last-child .kit-multi__done')
    ) {
      // Choose-all: Enter is "Xong" (1-4 toggle the options).
      const done = controller.card.element.querySelector<HTMLButtonElement>(
        '.kit-step:last-child .kit-multi__done',
      );
      if (done && !done.disabled) done.click();
      event.preventDefault();
    } else if (/^[1-4]$/.test(key) && flow.phase === 'steps' && controller.card) {
      const step = flow.round && playableSteps(flow.round.item)[controller.card.currentStep()];
      if (!step || step.kind === 'number') return;
      const row = controller.card.element.querySelector('.kit-step:last-child');
      const buttons = row?.querySelectorAll<HTMLButtonElement>(
        '.kit-choices button, .kit-multi__option, .kit-verdict button',
      );
      buttons?.[Number(key) - 1]?.click();
      event.preventDefault();
    }
  };
  document.addEventListener('keydown', onKey, { capture: true, signal });
}
