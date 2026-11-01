// The cave HUD inside the level overlay: VLM's speech card, the chamber counter with one crystal
// dot per chamber, and the riddle panel (format title, the kit step card, feedback, hint, next).
// Recovered classes: glass, question-intro, text-button, primary, feedback, hint-area, reward-pop.
import { tc } from '../../i18n/common-strings';
import type { CaveStrings } from './cave-strings';

export interface CavePanelHandlers {
  onHint(): void;
  onNext(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export class CavePanel {
  readonly guide = el('div', 'cave-guide glass');
  readonly progress = el('div', 'cave-progress glass');
  readonly panel = el('section', 'cave-panel glass');
  readonly title = el('p', 'question-intro cave-format');
  /** Where the round controller mounts the chamber's step card. */
  readonly cardHost = el('div', 'cave-card');
  readonly feedback = el('p', 'feedback');
  readonly hintArea = el('div', 'hint-area cave-hint');
  readonly hint = el('button', 'text-button cave-hint-button');
  readonly next = el('button', 'primary cave-next');
  private readonly guideText = el('p');
  private readonly chamberText = el('span');
  private readonly dots = el('ol', 'cave-crystals');

  constructor(
    root: HTMLElement,
    private readonly cs: CaveStrings,
    handlers: CavePanelHandlers,
  ) {
    const name = el('strong', 'cave-guide__name', tc('guideName'));
    this.guide.append(el('span', 'cave-guide__dot', '✦'), name, this.guideText);
    this.progress.append(this.chamberText, this.dots);
    for (const button of [this.hint, this.next]) button.type = 'button';
    this.hint.textContent = `💡 ${cs('hint')}`;
    this.hint.addEventListener('click', handlers.onHint);
    this.next.addEventListener('click', handlers.onNext);
    this.next.hidden = true;
    this.hintArea.hidden = true;
    this.hintArea.setAttribute('aria-live', 'polite');
    this.title.id = 'cave-format';
    this.panel.setAttribute('aria-labelledby', this.title.id);
    this.panel.append(
      this.title,
      this.cardHost,
      this.feedback,
      this.hint,
      this.hintArea,
      this.next,
      el('p', 'cave-keys', cs('keysHelp')),
    );
    root.append(this.guide, this.progress, this.panel);
  }

  /** Resets the panel for a new chamber (data attributes are read by the e2e specs). */
  showChamber(index: number, total: number, format: string, title: string, guide: string): void {
    Object.assign(this.panel.dataset, { chamber: index, format });
    this.chamberText.textContent = this.cs('chamber', { n: index + 1, total });
    this.dots.replaceChildren(
      ...Array.from({ length: total }, (_, i) =>
        el('li', i < index ? 'done' : i === index ? 'current' : ''),
      ),
    );
    this.title.textContent = title;
    this.say(guide);
    this.setFeedback('');
    this.clearHint();
    this.next.textContent = this.cs(index === total - 1 ? 'nextLast' : 'next');
    this.setAnswered(false);
  }

  showHint(rung: number, text: string): void {
    this.hintArea.hidden = false;
    this.hintArea.dataset.rung = String(rung);
    this.hintArea.textContent = text;
  }

  /** Hides the hint and its offer (new chamber). */
  clearHint(): void {
    this.offerHint(false);
    this.hintArea.hidden = true;
    this.hintArea.textContent = '';
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

  /** Chamber finished: show the next button (focused, so Enter goes on) and spend the hint. */
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
