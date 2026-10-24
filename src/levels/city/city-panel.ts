// The city HUD inside the level overlay: VLM's speech card, round dots and the answer panel
// (prompt, equation, house/parcel cards or light-a-floor + number pad, feedback, hint area).
// Recovered classes: glass, question-intro, equation, answers/answer, secondary, primary,
// text-button, feedback, hint-area, reward-pop.
import { tc } from '../../i18n/common-strings';
import { createNumberPad, type NumberPad } from '../../ui/kit/number-pad';
import { type ChoiceCard, CityChoiceCards } from './city-choice-cards';
import type { CityRound } from './city-round-flow';
import type { CityStrings } from './city-strings';

export interface CityPanelHandlers {
  onChoice(value: number): void;
  onLight(): void;
  onHint(): void;
  onNext(): void;
  onSubmit(value: number): void;
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

export class CityPanel {
  readonly guide = el('div', 'city-guide glass');
  readonly progress = el('div', 'city-progress glass');
  readonly panel = el('section', 'city-panel glass');
  readonly prompt = el('p', 'question-intro city-prompt');
  readonly equation = el('div', 'equation city-equation');
  readonly count = el('p', 'city-count');
  readonly feedback = el('p', 'feedback');
  readonly hintArea = el('div', 'hint-area city-hint');
  readonly light: HTMLButtonElement;
  readonly hint: HTMLButtonElement;
  readonly next: HTMLButtonElement;
  readonly choices: CityChoiceCards;
  private pad: NumberPad | undefined;
  private readonly padSlot = el('div', 'city-pad-slot');
  private readonly guideText = el('p');
  private readonly dots = el('ol', 'city-dots');
  private readonly roundText = el('span');

  constructor(
    root: HTMLElement,
    private readonly ts: CityStrings,
    private readonly handlers: CityPanelHandlers,
  ) {
    const name = el('strong', 'city-guide__name', tc('guideName'));
    this.guide.append(el('span', 'city-guide__dot', '✦'), name, this.guideText);
    this.progress.append(this.roundText, this.dots);
    this.choices = new CityChoiceCards(ts('title'), handlers.onChoice);
    this.light = button('secondary city-light', ts('lightFloor'), handlers.onLight);
    this.hint = button('text-button city-hint-button', `💡 ${ts('hint')}`, handlers.onHint);
    this.next = button('primary city-next', ts('next'), handlers.onNext);
    this.next.hidden = true;
    this.count.setAttribute('aria-live', 'off');
    const actions = el('div', 'city-actions');
    actions.append(this.light, this.hint);
    this.hintArea.hidden = true;
    this.prompt.id = 'city-prompt';
    this.panel.setAttribute('aria-labelledby', this.prompt.id);
    this.panel.append(
      this.prompt,
      this.equation,
      this.count,
      this.choices.element,
      this.padSlot,
      actions,
      this.feedback,
      this.hintArea,
      this.next,
      el('p', 'city-keys', ts('keysHelp')),
    );
    root.append(this.guide, this.progress, this.panel);
  }

  /** Resets the panel for a new round (data attributes are read by the e2e specs). */
  showRound(round: CityRound, index: number, total: number, prompt: string, guide: string): void {
    Object.assign(this.panel.dataset, { round: index, kind: round.kind, product: round.product });
    this.setRound(index, total);
    this.prompt.textContent = prompt;
    this.say(guide);
    const { table: t, other: m, product: p } = round;
    this.equation.textContent = round.kind === 'reverse' ? `? = ${p}` : `${t} × ${m} = ?`;
    const windows = round.kind === 'windows';
    this.light.hidden = !windows;
    this.light.disabled = false;
    this.count.hidden = !windows;
    this.choices.set(windows ? [] : this.cards(round));
    this.pad?.destroy();
    this.pad = windows
      ? createNumberPad({ maxDigits: 2, activeInput: true, onSubmit: this.handlers.onSubmit })
      : undefined;
    this.padSlot.replaceChildren(...(this.pad ? [this.pad.element] : []));
    this.setAnswered(false);
    this.setFeedback('');
    this.offerHint(false);
    this.hintArea.hidden = true;
  }

  private cards(round: CityRound): ChoiceCard[] {
    if (round.kind === 'reverse') {
      return round.parcels.map((p) => ({
        label: p.label,
        name: this.ts('parcel', { label: p.label }),
        value: p.value,
      }));
    }
    return round.houses.map((n) => ({ label: String(n), name: this.ts('house', { n }), value: n }));
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

  offerHint(on: boolean): void {
    this.hint.classList.toggle('offer', on);
  }

  clearPad(): void {
    this.pad?.clear();
  }

  /** Round over: lock the inputs, show Next (focused, so Enter continues). */
  setAnswered(answered: boolean): void {
    this.next.hidden = !answered;
    this.panel.classList.toggle('answered', answered);
    for (const node of this.padSlot.querySelectorAll('button')) node.disabled = answered;
    this.choices.setDisabled(answered);
    this.light.disabled = answered || this.light.disabled;
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
    this.pad?.destroy();
    this.guide.remove();
    this.progress.remove();
    this.panel.remove();
  }
}
