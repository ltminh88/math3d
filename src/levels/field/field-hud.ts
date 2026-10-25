// Field level HUD inside the level overlay (ctx.ui), built from the recovered classes: VLM's
// speech line, the round panel (.glass, .dialog-eyebrow, .feedback success|gentle, .hint-area,
// .primary / .secondary buttons, .reward-pop) and the celebration card.
import { tc } from '../../i18n/common-strings';
import { tf } from './field-strings';
import './field-level.css';

export type FeedbackTone = 'success' | 'gentle' | '';

export interface FieldHud {
  readonly root: HTMLElement;
  /** VLM's speech line and the round panel (the scene frames the plot around them). */
  readonly speech: HTMLElement;
  readonly panel: HTMLElement;
  /** Holds the round's answer widget (number pad or equation choices). */
  readonly body: HTMLElement;
  speak(text: string): void;
  /** New round: eyebrow + progress dots, and the previous round's hint/feedback/button cleared. */
  resetRound(index: number, total: number): void;
  setPrompt(title: string, tip: string): void;
  setFeedback(text: string, tone: FeedbackTone): void;
  setHint(text: string | null): void;
  setTools(tools: { rotate: boolean; hint: boolean }): void;
  /** Shows the main action button (null hides it). */
  setNext(label: string | null, onClick?: () => void): void;
  rewardPop(text: string): void;
  /** Celebration card: VLM's thank-you, stars, the first-clear bonus line, the way back. */
  celebrate(score: string, stars: number, onBack: () => void, bonus: string | null): void;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  parent?: HTMLElement,
) {
  const node = document.createElement(tag);
  node.className = className;
  parent?.append(node);
  return node;
}

function button(label: string, className: string, parent: HTMLElement, onClick: () => void) {
  const b = el('button', className, parent);
  b.type = 'button';
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

export function createFieldHud(
  ui: HTMLElement,
  actions: { rotate: () => void; hint: () => void },
): FieldHud {
  const root = el('div', 'field-hud', ui);
  const speech = el('div', 'field-speech glass', root);
  const who = el('b', 'field-speech__name', speech);
  who.textContent = tc('guideName');
  const line = el('p', '', speech);
  line.setAttribute('aria-live', 'polite');
  const panel = el('section', 'field-panel glass', root);
  panel.setAttribute('aria-label', tf('title'));
  const eyebrow = el('p', 'dialog-eyebrow field-eyebrow', panel);
  const dots = el('div', 'field-dots', panel);
  dots.setAttribute('aria-hidden', 'true');
  const prompt = el('h2', 'field-prompt', panel);
  const tip = el('p', 'field-tip', panel);
  const tools = el('div', 'field-tools', panel);
  const rotate = button(`⟳ ${tf('rotate')}`, 'secondary field-tool', tools, actions.rotate);
  rotate.setAttribute('aria-keyshortcuts', 'R');
  const hint = button(`💡 ${tf('hint')}`, 'secondary field-tool', tools, actions.hint);
  hint.setAttribute('aria-keyshortcuts', 'H');
  // The hint sits above the answer widget so it stays in view on a short phone panel.
  const hintArea = el('div', 'hint-area field-hint', panel);
  const hintText = el('p', '', hintArea);
  hintArea.hidden = true;
  const body = el('div', 'field-body', panel);
  const feedback = el('p', 'feedback', panel);
  feedback.setAttribute('role', 'status');
  const next = el('button', 'primary wide field-next', panel);
  next.type = 'button';
  next.hidden = true;
  let onNext: (() => void) | undefined;
  next.addEventListener('click', () => onNext?.());

  return {
    root,
    speech,
    panel,
    body,
    speak(text) {
      line.textContent = text;
    },
    resetRound(index, total) {
      hintArea.hidden = true;
      feedback.textContent = '';
      feedback.className = 'feedback';
      next.hidden = true;
      onNext = undefined;
      eyebrow.textContent = tf('round', { n: index + 1, total }).toUpperCase();
      dots.replaceChildren(
        ...Array.from({ length: total }, (_, i) =>
          el('i', i < index ? 'done' : i === index ? 'now' : ''),
        ),
      );
    },
    setPrompt(title, text) {
      prompt.textContent = title;
      tip.textContent = text;
      tip.hidden = text === '';
    },
    setFeedback(text, tone) {
      feedback.textContent = text;
      feedback.className = `feedback ${tone}`.trim();
    },
    setHint(text) {
      hintArea.hidden = text === null;
      hintText.textContent = text ?? '';
    },
    setTools(state) {
      rotate.disabled = !state.rotate;
      hint.disabled = !state.hint;
    },
    setNext(label, onClick) {
      next.hidden = label === null;
      next.textContent = label ?? '';
      onNext = onClick;
      if (label !== null) next.focus({ preventScroll: true });
    },
    rewardPop(text) {
      const pop = el('span', 'reward-pop', panel);
      pop.textContent = text;
      pop.addEventListener('animationend', () => pop.remove());
    },
    celebrate(score, stars, onBack, bonus) {
      panel.classList.add('field-panel--done');
      for (const dot of dots.children) dot.className = 'done';
      line.textContent = tf('doneLine');
      eyebrow.textContent = tf('title').toUpperCase();
      prompt.textContent = tf('doneTitle');
      feedback.textContent = '';
      next.hidden = false;
      next.textContent = tf('backToGate');
      onNext = onBack;
      next.focus({ preventScroll: true });
      tip.hidden = false;
      tip.textContent = score;
      tools.hidden = true;
      hintArea.hidden = true;
      const starLine = el('p', 'field-stars', body);
      starLine.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      starLine.setAttribute('aria-label', `${stars}/3`);
      body.replaceChildren(starLine);
      if (bonus) el('p', 'field-tip field-bonus', body).textContent = bonus;
    },
  };
}
