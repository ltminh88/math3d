// The workshop HUD inside the level overlay: VLM's speech card, the order counter, and the work
// panel (station name, measuring board, step card, feedback, hint, next order, key help that is
// hidden on touch screens). Recovered classes: glass, primary, text-button, feedback, hint-area,
// reward-pop.
import { tc } from '../../i18n/common-strings';
import type { WorkshopStation } from './workshop-stations';
import type { WorkshopStrings } from './workshop-strings';

export interface WorkshopPanelHandlers {
  onHint(): void;
  onNext(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const STATION_KEY = {
  ruler: 'stationRuler',
  fence: 'stationFence',
  tiles: 'stationTiles',
  balance: 'stationBalance',
  jug: 'stationJug',
  thermometer: 'stationThermometer',
} as const;

export class WorkshopPanel {
  readonly guide = el('div', 'workshop-guide glass');
  readonly progress = el('div', 'workshop-progress glass');
  readonly panel = el('section', 'workshop-panel glass');
  readonly title = el('h2', 'workshop-station');
  readonly boardHost = el('div', 'workshop-board-host');
  readonly cardHost = el('div', 'workshop-card-host');
  readonly feedback = el('p', 'feedback');
  readonly hint = el('button', 'text-button workshop-hint-button');
  readonly hintArea = el('div', 'hint-area workshop-hint');
  readonly next = el('button', 'primary workshop-next');
  private readonly guideText = el('p');
  private readonly orderText = el('span');
  private readonly dots = el('ol', 'workshop-dots');

  constructor(
    root: HTMLElement,
    private readonly ws: WorkshopStrings,
    handlers: WorkshopPanelHandlers,
  ) {
    const name = el('strong', 'workshop-guide__name', tc('guideName'));
    this.guide.append(el('span', 'workshop-guide__dot', '✦'), name, this.guideText);
    this.progress.append(this.orderText, this.dots);
    for (const button of [this.hint, this.next]) button.type = 'button';
    this.hint.textContent = `💡 ${ws('hint')}`;
    this.hint.addEventListener('click', handlers.onHint);
    this.next.addEventListener('click', handlers.onNext);
    this.hintArea.hidden = true;
    this.hintArea.setAttribute('aria-live', 'polite');
    this.title.id = 'workshop-station';
    this.panel.setAttribute('aria-labelledby', this.title.id);
    const actions = el('div', 'workshop-actions');
    actions.append(this.hint, this.next);
    this.panel.append(
      this.title,
      this.boardHost,
      this.cardHost,
      this.feedback,
      this.hintArea,
      actions,
      el('p', 'workshop-keys', ws('keysHelp')),
    );
    root.append(this.guide, this.progress, this.panel);
  }

  /** Resets the panel for order `index` (data attributes are read by the e2e specs). */
  showRound(index: number, total: number, station: WorkshopStation, guide: string): void {
    Object.assign(this.panel.dataset, { round: index, station });
    this.orderText.textContent = this.ws('round', { n: index + 1, total });
    this.dots.replaceChildren(
      ...Array.from({ length: total }, (_, i) =>
        el('li', i < index ? 'done' : i === index ? 'current' : ''),
      ),
    );
    this.title.textContent = this.ws(STATION_KEY[station]);
    this.say(guide);
    this.setFeedback('');
    this.clearHint();
    this.next.textContent = this.ws(index === total - 1 ? 'nextLast' : 'next');
    this.setAnswered(false);
    this.panel.scrollTop = 0;
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

  showHint(rung: number, text: string): void {
    this.hintArea.hidden = false;
    this.hintArea.dataset.rung = String(rung);
    this.hintArea.textContent = text;
  }

  clearHint(): void {
    this.offerHint(false);
    this.hintArea.hidden = true;
    this.hintArea.textContent = '';
    delete this.hintArea.dataset.rung;
    this.hint.disabled = false;
  }

  /** Order finished: hide the hint, show the next-order button (focused, so Enter goes on). */
  setAnswered(answered: boolean): void {
    this.next.hidden = !answered;
    this.hint.hidden = answered;
    this.panel.classList.toggle('answered', answered);
    if (answered) this.next.focus({ preventScroll: true });
    if (answered) this.next.scrollIntoView({ block: 'nearest' });
  }

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
