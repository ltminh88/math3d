// The garden HUD inside the level overlay: VLM's speech card, the round counter, and the answer
// panel (round kind, the flower-row pots, the kit step card, feedback, hint, next round).
// Recovered classes: glass, question-intro, text-button, primary, feedback, hint-area, reward-pop.
import { tc } from '../../i18n/common-strings';
import type { GardenKind } from './garden-round-plan';
import type { GardenStrings } from './garden-strings';

export interface GardenPanelHandlers {
  onHint(): void;
  onNext(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const KIND_KEYS = { pattern: 'kindPattern', balance: 'kindBalance', bag: 'kindBag' } as const;

export class GardenPanel {
  readonly guide = el('div', 'garden-guide glass');
  readonly progress = el('div', 'garden-progress glass');
  readonly panel = el('section', 'garden-panel glass');
  readonly title = el('p', 'question-intro garden-kind');
  readonly pots = el('ol', 'garden-pots');
  readonly cardHost = el('div', 'garden-card');
  readonly feedback = el('p', 'feedback');
  readonly hintArea = el('div', 'hint-area garden-hint');
  readonly hint = el('button', 'text-button garden-hint-button');
  readonly next = el('button', 'primary garden-next');
  private readonly guideText = el('p');
  private readonly roundText = el('span');
  private readonly dots = el('ol', 'garden-dots');

  constructor(
    root: HTMLElement,
    private readonly gs: GardenStrings,
    handlers: GardenPanelHandlers,
  ) {
    const name = el('strong', 'garden-guide__name', tc('guideName'));
    this.guide.append(el('span', 'garden-guide__dot', '✿'), name, this.guideText);
    this.progress.append(this.roundText, this.dots);
    for (const button of [this.hint, this.next]) button.type = 'button';
    this.hint.textContent = `💡 ${gs('hint')}`;
    this.hint.addEventListener('click', handlers.onHint);
    this.next.addEventListener('click', handlers.onNext);
    this.next.hidden = true;
    this.hintArea.hidden = true;
    this.title.id = 'garden-kind';
    this.panel.setAttribute('aria-labelledby', this.title.id);
    this.pots.setAttribute('aria-label', gs('kindPattern'));
    this.panel.append(
      this.title,
      this.pots,
      this.cardHost,
      this.feedback,
      this.hint,
      this.hintArea,
      this.next,
      el('p', 'garden-keys', gs('keysHelp')),
    );
    root.append(this.guide, this.progress, this.panel);
  }

  /** Resets the panel for a new round (data attributes are read by the e2e specs). */
  showRound(index: number, total: number, kind: GardenKind, guide: string): void {
    Object.assign(this.panel.dataset, { round: index, kind });
    this.roundText.textContent = this.gs('round', { n: index + 1, total });
    this.dots.replaceChildren(
      ...Array.from({ length: total }, (_, i) =>
        el('li', i < index ? 'done' : i === index ? 'current' : ''),
      ),
    );
    this.title.textContent = this.gs(KIND_KEYS[kind]);
    this.pots.hidden = kind !== 'pattern';
    this.say(guide);
    this.setFeedback('');
    this.clearHint();
    this.next.textContent = this.gs(index === total - 1 ? 'nextLast' : 'next');
    this.setAnswered(false);
  }

  /** The flower row: numbers shown, `null` for a pot still empty; `current` is asked now. */
  showPots(values: readonly (number | null)[], current: number): void {
    this.pots.replaceChildren(
      ...values.map((value, i) => {
        const pot = el('li', 'garden-pot', value === null ? '?' : String(value));
        pot.dataset.state = value === null ? 'empty' : 'filled';
        if (i === current) pot.classList.add('current');
        pot.setAttribute(
          'aria-label',
          value === null
            ? this.gs('potEmpty', { pos: i + 1 })
            : this.gs('pot', { pos: i + 1, value }),
        );
        return pot;
      }),
    );
  }

  mountCard(card: HTMLElement): void {
    this.cardHost.replaceChildren(card);
  }

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

  /** Round finished: show the next-round button (focused, so Enter moves on). */
  setAnswered(answered: boolean): void {
    this.next.hidden = !answered;
    this.panel.classList.toggle('answered', answered);
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
    this.guide.remove();
    this.progress.remove();
    this.panel.remove();
  }
}
