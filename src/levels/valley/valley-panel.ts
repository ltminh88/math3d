// The valley HUD inside the level overlay: VLM's speech card, the round counter with the six
// garden stones, the answer panel (what to do, the item's story, the step card host, feedback,
// hint, next) and the ⟲/⟳ view buttons over the board. Recovered classes: glass, question-intro,
// text-button, primary, feedback, hint-area, reward-pop.
import { tc } from '../../i18n/common-strings';
import { isCoarsePointer } from '../../ui/pointer-kind';
import type { ValleyStrings } from './valley-strings';

export interface ValleyPanelHandlers {
  onHint(): void;
  onNext(): void;
  onRotate(direction: 1 | -1): void;
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

export class ValleyPanel {
  readonly guide = el('div', 'valley-guide glass');
  readonly progress = el('div', 'valley-progress glass');
  readonly panel = el('section', 'valley-panel glass');
  readonly prompt = el('p', 'question-intro valley-prompt');
  readonly story = el('p', 'valley-story');
  readonly cardHost = el('div', 'valley-card');
  readonly feedback = el('p', 'feedback');
  readonly hintArea = el('div', 'hint-area valley-hint');
  readonly hint: HTMLButtonElement;
  readonly next: HTMLButtonElement;
  readonly turns = el('div', 'valley-turns glass');
  private readonly guideText = el('p');
  private readonly roundText = el('span');
  private readonly stones = el('ol', 'valley-stones');

  constructor(
    root: HTMLElement,
    private readonly vs: ValleyStrings,
    handlers: ValleyPanelHandlers,
  ) {
    const name = el('strong', 'valley-guide__name', tc('guideName'));
    this.guide.append(el('span', 'valley-guide__dot', '✦'), name, this.guideText);
    this.progress.append(this.roundText, this.stones);
    this.hint = button('text-button valley-hint-button', `💡 ${vs('hint')}`, handlers.onHint);
    this.next = button('primary valley-next', '', handlers.onNext);
    this.next.hidden = true;
    this.hintArea.hidden = true;
    this.prompt.id = 'valley-prompt';
    this.panel.setAttribute('aria-labelledby', this.prompt.id);
    this.turns.setAttribute('role', 'group');
    this.turns.setAttribute('aria-label', `${vs('rotateLeft')} / ${vs('rotateRight')}`);
    this.turns.append(
      button('valley-turn', '⟲', () => handlers.onRotate(-1)),
      button('valley-turn', '⟳', () => handlers.onRotate(1)),
    );
    this.turns.children[0]?.setAttribute('aria-label', vs('rotateLeft'));
    this.turns.children[1]?.setAttribute('aria-label', vs('rotateRight'));
    this.panel.append(
      this.prompt,
      this.story,
      this.cardHost,
      this.feedback,
      this.hint,
      this.hintArea,
      this.next,
    );
    // Key hints only where there is a keyboard (no "phím" on touch screens).
    if (!isCoarsePointer()) this.panel.append(el('p', 'valley-keys', vs('keysHelp')));
    root.append(this.guide, this.progress, this.panel, this.turns);
  }

  /** Resets the panel for round `index` (data attributes are read by the e2e specs). */
  showRound(index: number, total: number, kind: string, prompt: string, story: string): void {
    Object.assign(this.panel.dataset, { round: index, kind });
    this.roundText.textContent = this.vs('round', { n: index + 1, total });
    this.stones.replaceChildren(
      ...Array.from({ length: total }, (_, i) =>
        el('li', i < index ? 'done' : i === index ? 'current' : ''),
      ),
    );
    this.prompt.textContent = prompt;
    this.story.textContent = story;
    this.story.hidden = false;
    this.cardHost.replaceChildren();
    this.setFeedback('');
    this.clearHint();
    this.next.textContent = this.vs(index === total - 1 ? 'nextLast' : 'next');
    this.setAnswered(false);
  }

  say(text: string): void {
    this.guideText.textContent = text;
  }

  setFeedback(text: string, tone: 'success' | 'gentle' | '' = ''): void {
    this.feedback.textContent = text;
    this.feedback.className = `feedback ${tone}`.trim();
  }

  showHint(text: string, rung: number, last: boolean): void {
    this.hintArea.hidden = false;
    this.hintArea.dataset.rung = String(rung);
    this.hintArea.textContent = text;
    this.offerHint(false);
    this.hint.disabled = last;
  }

  clearHint(): void {
    this.offerHint(false);
    this.hintArea.hidden = true;
    this.hintArea.textContent = '';
    delete this.hintArea.dataset.rung;
    this.hint.disabled = false;
  }

  offerHint(on: boolean): void {
    this.hint.classList.toggle('offer', on);
  }

  /** Round finished: the next button shows (focused, so Enter goes on). */
  setAnswered(answered: boolean): void {
    this.next.hidden = !answered;
    this.panel.classList.toggle('answered', answered);
    if (answered) {
      this.hint.disabled = true;
      this.next.focus();
    }
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
    this.turns.hidden = true;
  }

  destroy(): void {
    for (const node of [this.guide, this.progress, this.panel, this.turns]) node.remove();
  }
}
