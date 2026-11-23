// The market HUD inside the level overlay: VLM's speech card, the round counter with one dot
// per round, and the stall panel (stage title, the scene picture, the kit step card, feedback,
// hint, next). Recovered classes: glass, question-intro, text-button, primary, feedback,
// hint-area, reward-pop.
import { tc } from '../../i18n/common-strings';
import type { MarketStrings } from './market-strings';

export interface MarketPanelHandlers {
  onHint(): void;
  onNext(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export class MarketPanel {
  readonly guide = el('div', 'market-guide glass');
  readonly progress = el('div', 'market-progress glass');
  readonly panel = el('section', 'market-panel glass');
  readonly title = el('p', 'question-intro market-stage');
  /** Where the round controller mounts the round's scene picture. */
  readonly sceneHost = el('div', 'market-scene');
  /** Where the round controller mounts the round's step card. */
  readonly cardHost = el('div', 'market-card');
  readonly feedback = el('p', 'feedback');
  readonly hintArea = el('div', 'hint-area market-hint');
  readonly hint = el('button', 'text-button market-hint-button');
  readonly next = el('button', 'primary market-next');
  private readonly guideText = el('p');
  private readonly roundText = el('span');
  private readonly dots = el('ol', 'market-rounds');

  constructor(
    root: HTMLElement,
    private readonly cs: MarketStrings,
    handlers: MarketPanelHandlers,
  ) {
    const name = el('strong', 'market-guide__name', tc('guideName'));
    this.guide.append(el('span', 'market-guide__dot', '✦'), name, this.guideText);
    this.progress.append(this.roundText, this.dots);
    for (const button of [this.hint, this.next]) button.type = 'button';
    // The 💡 gets its own span so the offer nudge can animate it without moving the
    // button's box (a transform on the button makes Playwright's tap wait forever).
    this.hint.append(el('span', 'hint-nudge', '💡'), ` ${cs('hint')}`);
    this.hint.addEventListener('click', handlers.onHint);
    this.next.addEventListener('click', handlers.onNext);
    this.next.hidden = true;
    this.hintArea.hidden = true;
    this.hintArea.setAttribute('aria-live', 'polite');
    this.title.id = 'market-stage';
    this.panel.setAttribute('aria-labelledby', this.title.id);
    this.panel.append(
      this.title,
      this.sceneHost,
      this.cardHost,
      this.feedback,
      this.hint,
      this.hintArea,
      this.next,
      el('p', 'market-keys', cs('keysHelp')),
    );
    root.append(this.guide, this.progress, this.panel);
  }

  /** Resets the panel for a new round (data attributes are read by the e2e specs). */
  showRound(index: number, total: number, title: string, guide: string): void {
    Object.assign(this.panel.dataset, { round: index });
    this.roundText.textContent = this.cs('round', { n: index + 1, total });
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

  /** Hides the hint and its offer (new round). */
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

  /** Round finished: show the next button (focused, so Enter goes on) and spend the hint. */
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
