// The forest HUD inside the level overlay: VLM's speech card, round dots, and the answer panel
// (prompt, equation or fact-family card, deal/check/hint, number pad, feedback, hint area).
// Recovered classes: glass, question-intro, equation, secondary, primary, text-button, feedback.
import { tc } from '../../i18n/common-strings';
import { createNumberPad, type NumberPad } from '../../ui/kit/number-pad';
import type { ForestRound } from './forest-round-flow';
import type { RoundTexts } from './forest-round-texts';
import type { ForestStrings } from './forest-strings';

export interface ForestPanelHandlers {
  onDeal(): void;
  onCheck(): void;
  onHint(): void;
  onNext(): void;
  onSubmit(value: number): void;
  onDigits(digits: string): void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(className: string, text: string, onClick: () => void): HTMLButtonElement {
  const node = el('button', className, text);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

export class ForestPanel {
  readonly guide = el('div', 'forest-guide glass');
  readonly progress = el('div', 'forest-progress glass');
  readonly panel = el('section', 'forest-panel glass');
  readonly prompt = el('p', 'question-intro forest-prompt');
  readonly question = el('div', 'forest-question');
  readonly feedback = el('p', 'feedback');
  readonly hintArea = el('div', 'hint-area forest-hint');
  readonly deal: HTMLButtonElement;
  readonly check: HTMLButtonElement;
  readonly hint: HTMLButtonElement;
  readonly next: HTMLButtonElement;
  readonly pad: NumberPad;
  private readonly guideText = el('p');
  private readonly dots = el('ol', 'forest-dots');
  private readonly roundText = el('span');

  constructor(
    root: HTMLElement,
    private readonly ts: ForestStrings,
    handlers: ForestPanelHandlers,
  ) {
    const name = el('strong', 'forest-guide__name', tc('guideName'));
    this.guide.append(el('span', 'forest-guide__dot', '✦'), name, this.guideText);
    this.progress.append(this.roundText, this.dots);
    this.deal = button('secondary forest-deal', ts('dealShare'), handlers.onDeal);
    this.check = button('secondary forest-check', ts('check'), handlers.onCheck);
    this.hint = button('text-button forest-hint-button', `💡 ${ts('hint')}`, handlers.onHint);
    this.next = button('primary forest-next', ts('next'), handlers.onNext);
    this.next.hidden = true;
    const actions = el('div', 'forest-actions');
    actions.append(this.deal, this.check, this.hint);
    this.pad = createNumberPad({
      maxDigits: 2,
      activeInput: true,
      onSubmit: (value) => handlers.onSubmit(value),
      onChange: (digits) => handlers.onDigits(digits),
    });
    this.hintArea.hidden = true;
    this.prompt.id = 'forest-prompt';
    this.panel.setAttribute('aria-labelledby', this.prompt.id);
    this.panel.append(
      this.prompt,
      this.question,
      actions,
      this.pad.element,
      this.feedback,
      this.hintArea,
      this.next,
      el('p', 'forest-keys', ts('keysHelp')),
    );
    root.append(this.guide, this.progress, this.panel);
  }

  /** Resets the panel for a new round (data attributes are read by the e2e specs). */
  showRound(round: ForestRound, index: number, total: number, texts: RoundTexts): void {
    Object.assign(this.panel.dataset, {
      round: index,
      kind: round.kind,
      dividend: round.dividend,
      divisor: round.divisor,
    });
    this.setRound(index, total);
    this.prompt.textContent = texts.prompt;
    this.say(texts.guide);
    this.setAnswered(false);
    this.setTools(round.kind !== 'family', texts.deal);
    this.setFeedback('');
    this.offerHint(false);
    this.hintArea.hidden = true;
    this.pad.clear();
  }

  say(text: string): void {
    this.guideText.textContent = text;
  }

  setRound(index: number, total: number): void {
    this.roundText.textContent = this.ts('round', { n: index + 1, total });
    this.dots.replaceChildren(
      ...Array.from({ length: total }, (_, i) =>
        el('li', i < index ? 'done' : i === index ? 'current' : ''),
      ),
    );
  }

  setFeedback(text: string, tone: 'success' | 'gentle' | '' = ''): void {
    this.feedback.textContent = text;
    this.feedback.className = `feedback ${tone}`.trim();
  }

  /** Concrete rounds show deal + check; the fact family only the pad. */
  setTools(concrete: boolean, dealLabel: string): void {
    this.deal.hidden = !concrete;
    this.check.hidden = !concrete;
    this.deal.textContent = dealLabel;
    this.deal.disabled = false;
  }

  offerHint(on: boolean): void {
    this.hint.classList.toggle('offer', on);
  }

  /** Round over: lock the pad and tools, show Next (focused, so Enter continues). */
  setAnswered(answered: boolean): void {
    this.next.hidden = !answered;
    this.panel.classList.toggle('answered', answered);
    for (const node of this.pad.element.querySelectorAll('button')) node.disabled = answered;
    this.deal.disabled = answered || this.deal.disabled;
    this.check.disabled = answered;
    this.hint.disabled = answered;
    if (answered) this.next.focus();
  }

  /** A short "+10 XP" pop above the panel (recovered `.reward-pop`). */
  popReward(text: string, signal: AbortSignal): void {
    const pop = el('span', 'reward-pop', text);
    this.panel.append(pop);
    const timer = window.setTimeout(() => pop.remove(), 1300);
    signal.addEventListener('abort', () => window.clearTimeout(timer), { once: true });
  }

  hide(): void {
    this.panel.hidden = true;
    this.progress.hidden = true;
  }

  destroy(): void {
    this.pad.destroy();
    this.guide.remove();
    this.progress.remove();
    this.panel.remove();
  }
}
