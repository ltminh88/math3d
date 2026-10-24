// The tower HUD inside the level overlay: VLM's speech card, the floor counter, and the answer
// panel (prompt, equation card, answer cards or number pad, feedback, hint, next floor).
// Recovered classes: glass, question-intro, equation, answers/answer, text-button, primary,
// feedback, hint-area, reward-pop.
import { tc } from '../../i18n/common-strings';
import { createNumberPad, type NumberPad } from '../../ui/kit/number-pad';
import { TowerAnswerButtons } from './tower-answer-buttons';
import type { TowerStep } from './tower-question-formats';
import type { TowerStrings } from './tower-strings';

export interface TowerPanelHandlers {
  onPick(index: number): void;
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

export class TowerPanel {
  readonly guide = el('div', 'tower-guide glass');
  readonly progress = el('div', 'tower-progress glass');
  readonly panel = el('section', 'tower-panel glass');
  readonly prompt = el('p', 'question-intro tower-prompt');
  readonly question = el('div', 'tower-question');
  readonly feedback = el('p', 'feedback');
  readonly hintArea = el('div', 'hint-area tower-hint');
  readonly hint = el('button', 'text-button tower-hint-button');
  readonly next = el('button', 'primary tower-next');
  readonly answers: TowerAnswerButtons;
  readonly pad: NumberPad;
  private readonly guideText = el('p');
  private readonly floorText = el('span');
  private readonly floors = el('ol', 'tower-floors');

  constructor(
    root: HTMLElement,
    private readonly ts: TowerStrings,
    handlers: TowerPanelHandlers,
  ) {
    const name = el('strong', 'tower-guide__name', tc('guideName'));
    this.guide.append(el('span', 'tower-guide__dot', '✦'), name, this.guideText);
    this.progress.append(this.floorText, this.floors);
    for (const button of [this.hint, this.next]) button.type = 'button';
    this.hint.textContent = `💡 ${ts('hint')}`;
    this.hint.addEventListener('click', handlers.onHint);
    this.next.addEventListener('click', handlers.onNext);
    this.next.hidden = true;
    this.answers = new TowerAnswerButtons(
      ts('promptChoice'),
      (label, n) => ts('cardName', { label, n }),
      handlers.onPick,
    );
    this.pad = createNumberPad({
      maxDigits: 2,
      activeInput: true,
      onSubmit: (value) => handlers.onSubmit(value),
      onChange: (digits) => handlers.onDigits(digits),
    });
    this.hintArea.hidden = true;
    this.prompt.id = 'tower-prompt';
    this.panel.setAttribute('aria-labelledby', this.prompt.id);
    this.panel.append(
      this.prompt,
      this.question,
      this.answers.element,
      this.pad.element,
      this.feedback,
      this.hint,
      this.hintArea,
      this.next,
      el('p', 'tower-keys', ts('keysHelp')),
    );
    root.append(this.guide, this.progress, this.panel);
  }

  /** Resets the panel for a new floor (data attributes are read by the e2e specs). */
  showFloor(index: number, total: number, format: string, prompt: string, guide: string): void {
    Object.assign(this.panel.dataset, { floor: index, format });
    this.floorText.textContent = this.ts('floor', { n: index + 1, total });
    // Floors listed top-down like the tower itself; the current one glows.
    this.floors.replaceChildren(
      ...Array.from({ length: total }, (_, i) => {
        const floor = total - 1 - i;
        return el('li', floor < index ? 'done' : floor === index ? 'current' : '');
      }),
    );
    this.prompt.textContent = prompt;
    this.say(guide);
    this.setFeedback('');
    this.clearHint();
    this.next.textContent = this.ts(index === total - 1 ? 'nextTop' : 'next');
    this.setAnswered(false);
  }

  /** Shows the input the step needs: answer cards (choice, verdict) or the number pad. */
  showInput(step: TowerStep): void {
    this.panel.dataset.step = step.kind;
    this.pad.clear();
    this.pad.element.hidden = step.kind !== 'number';
    if (step.kind === 'choice') this.answers.show(step.choices.map(String));
    else if (step.kind === 'verdict') this.answers.show([this.ts('yes'), this.ts('no')]);
    else this.answers.hide();
  }

  /** Hides the hint and its offer (new floor, or the next step of the floor). */
  clearHint(): void {
    this.offerHint(false);
    this.hintArea.hidden = true;
    this.hintArea.replaceChildren();
    delete this.hintArea.dataset.rung;
  }

  say(text: string): void {
    this.guideText.textContent = text;
  }

  setFeedback(text: string, tone: 'success' | 'gentle' | '' = ''): void {
    this.feedback.textContent = text;
    this.feedback.className = `feedback ${tone}`.trim();
  }

  offerHint(on: boolean): void {
    this.hint.classList.toggle('offer', on);
  }

  /** Floor finished: lock the inputs, show the next-floor button (focused, so Enter climbs). */
  setAnswered(answered: boolean): void {
    this.next.hidden = !answered;
    this.panel.classList.toggle('answered', answered);
    for (const node of this.pad.element.querySelectorAll('button')) node.disabled = answered;
    this.answers.setDisabled(answered);
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
