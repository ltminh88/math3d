// The old levels' reasoning round on screen: a panel in the level overlay with the item's story
// and steps (01 step kit: number pad, choices, Đúng/Sai; every step by tap, keys optional), a hint
// button (H too), feedback and the level's "next" button. The level hides its own panel meanwhile,
// records the outcome and adds it to its tally (`onRecorded`).
import './reasoning-round.css';
import type { SynthAudio } from '../../audio/synth-audio';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { createStepCard } from '../../ui/kit/step-card';
import { ReasoningRoundFlow } from './reasoning-round-flow';
import type { ReasoningRoundPlan } from './reasoning-round-slot';
import { trr } from './reasoning-round-strings';
import { installReasoningTestHook } from './reasoning-round-test-hook';

export interface ReasoningRoundPanelOptions {
  ui: HTMLElement;
  signal: AbortSignal;
  audio: SynthAudio;
  announce(message: string): void;
  plan: ReasoningRoundPlan;
  /** The level's round eyebrow ("LUỐNG 6/6") and its intro line for the round. */
  eyebrow: string;
  title: string;
  /** Records the outcome (learning + tally) and returns its reward for the pop. */
  onRecorded(outcome: QuestionOutcome): { xp: number };
  nextLabel: string;
  onNext(): void;
}

export interface ReasoningRoundPanel {
  readonly element: HTMLElement;
  readonly flow: ReasoningRoundFlow;
  hint(): void;
  destroy(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, parent: HTMLElement) {
  const node = document.createElement(tag);
  node.className = className;
  parent.append(node);
  return node;
}

export function mountReasoningRound(o: ReasoningRoundPanelOptions): ReasoningRoundPanel {
  const flow = new ReasoningRoundFlow(o.plan, () => performance.now());
  const root = el('section', 'reasoning-round glass', o.ui);
  root.setAttribute('aria-label', trr('badge'));
  root.dataset.skill = o.plan.skillId;
  el('p', 'dialog-eyebrow reasoning-round__eyebrow', root).textContent = o.eyebrow;
  el('p', 'reasoning-round__badge', root).textContent = `🧠 ${trr('badge')}`;
  el('h2', 'reasoning-round__title', root).textContent = o.title;
  const hintButton = el('button', 'secondary reasoning-round__hint', root);
  hintButton.type = 'button';
  hintButton.textContent = `💡 ${trr('hint')}`;
  hintButton.setAttribute('aria-keyshortcuts', 'H');
  const hintArea = el('div', 'hint-area reasoning-round__hint-area', root);
  hintArea.hidden = true;
  const body = el('div', 'reasoning-round__body', root);
  const feedback = el('p', 'feedback', root);
  feedback.setAttribute('role', 'status');
  const next = el('button', 'primary wide reasoning-round__next', root);
  next.type = 'button';
  next.hidden = true;
  next.textContent = o.nextLabel;
  next.addEventListener('click', () => o.onNext());

  const say = (text: string, tone: 'success' | 'gentle' | '') => {
    feedback.textContent = text;
    feedback.className = `feedback ${tone}`.trim();
    o.announce(text);
  };

  function finish(outcome: QuestionOutcome, solved: boolean): void {
    const steps = playableSteps(o.plan.item).length;
    while (card.currentStep() < steps) card.reveal();
    hintButton.disabled = true;
    const reward = o.onRecorded(outcome);
    say(trr(solved ? 'correct' : 'revealed'), solved ? 'success' : 'gentle');
    if (solved) o.audio.correct();
    else o.audio.hint();
    if (reward.xp > 0) {
      const pop = el('span', 'reward-pop', root);
      pop.textContent = trr('reward', { xp: reward.xp });
      pop.addEventListener('animationend', () => pop.remove(), { signal: o.signal });
    }
    root.classList.add('reasoning-round--done');
    next.hidden = false;
    next.focus({ preventScroll: true });
  }

  const card = createStepCard(o.plan.item, {
    onAnswer: (event) => {
      const result = flow.answer(event);
      if (result.verdict === 'step') {
        say(trr('stepRight'), 'success');
        o.audio.tone(698, 0.12);
      } else if (result.verdict === 'wrong') {
        say(trr('wrong'), 'gentle');
        hintButton.classList.toggle('offer', flow.canHint);
        o.audio.hint();
      } else if (result.outcome) finish(result.outcome, result.verdict === 'correct');
    },
    onComplete: () => {},
  });
  body.append(card.element);

  const hint = () => {
    if (!flow.canHint) return;
    hintArea.hidden = false;
    hintArea.textContent = flow.takeHint();
    hintButton.classList.remove('offer');
    hintButton.disabled = !flow.canHint;
    o.audio.hint();
    o.announce(hintArea.textContent);
  };
  hintButton.addEventListener('click', hint);
  // H asks for a hint like in the levels (the level's own H handler ignores it meanwhile).
  document.addEventListener(
    'keydown',
    (e) => {
      const typing =
        e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey && !e.altKey && !typing)
        hint();
    },
    { signal: o.signal },
  );
  const removeHook =
    import.meta.env.MODE === 'test' ? installReasoningTestHook(o.plan, flow) : null;
  o.announce(
    `${o.title} ${card.element.querySelector('.kit-step-card__story')?.textContent ?? ''}`,
  );
  return {
    element: root,
    flow,
    hint,
    destroy: () => {
      removeHook?.();
      card.destroy();
      root.remove();
    },
  };
}
