// Keyboard for the market (optional; every step also works by tapping): digits + Enter go to
// the kit number pad by itself, 1-4 pick a choice (1 Đúng, 2 Sai on a verdict) or toggle a
// sentence in choose-all (Space toggles a focused one, Enter presses Xong), Enter goes on once
// a round is done, H asks for a hint while focus is in the level layer. Listens on `document`
// in the capture phase with the level's signal; keys it takes are consumed (preventDefault).
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { MarketRoundController } from './market-round-controller';

const OPTION_KEY = /^[1-4]$/;

function buttonsOf(card: HTMLElement | null, selector: string): HTMLButtonElement[] {
  return card ? [...card.querySelectorAll<HTMLButtonElement>(selector)] : [];
}

export function listenMarketKeys(
  controller: MarketRoundController,
  layer: HTMLElement,
  signal: AbortSignal,
): void {
  const onKey = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const flow = controller.roundFlow;
    if (!flow || controller.done) return;
    const focus = document.activeElement;
    const onButton = focus instanceof HTMLButtonElement;
    if (event.key === 'h' || event.key === 'H') {
      if (focus && focus !== document.body && !layer.contains(focus)) return;
      if (flow.done) return;
      controller.hint();
      event.preventDefault();
      return;
    }
    if (flow.done) {
      // A focused button handles its own Enter (the next button is focused when a round ends).
      if (event.key === 'Enter' && !onButton) {
        event.preventDefault();
        controller.next();
      }
      return;
    }
    const plan = controller.plan;
    const kind = plan ? playableSteps(plan.item)[controller.currentStep()]?.kind : undefined;
    const card = controller.cardElement;
    if (kind === 'number' || !kind) return;
    if (event.key === 'Enter' && kind === 'multi' && !onButton) {
      buttonsOf(card, '.kit-multi__done')[0]?.click();
      event.preventDefault();
      return;
    }
    if (!OPTION_KEY.test(event.key)) return;
    const selector =
      kind === 'choice'
        ? '.kit-choices button'
        : kind === 'multi'
          ? '.kit-multi__option'
          : '.kit-verdict button';
    const target = buttonsOf(card, selector)[Number(event.key) - 1];
    if (!target || target.disabled) return;
    event.preventDefault();
    target.click();
  };
  document.addEventListener('keydown', onKey, { capture: true, signal });
}
