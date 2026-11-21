// One daily-practice `sk:` item in the shared dialog (phase 11): the same step kit and the
// same step/hint flow as the levels (ReasoningRoundFlow), so steps and hints behave exactly
// as the child knows them. A solved item pays +5 coins, no XP; a revealed one pays nothing.
import { skillKey } from '../learning/fact-key';
import type { Rng } from '../learning/seeded-rng';
import type { QuestionOutcome } from '../learning/session-recorder';
import { skillTierOf } from '../learning/skill-tiers';
import { ReasoningRoundFlow } from '../levels/shared/reasoning-round-flow';
import type { ReasoningRoundPlan } from '../levels/shared/reasoning-round-slot';
import { trr } from '../levels/shared/reasoning-round-strings';
import { itemForSkill } from '../practice/item-for-skill';
import { playableSteps } from '../reasoning/reasoning-step-answers';
import { td } from './daily-practice-strings';
import { gameState } from './game-state';
import { byId } from './icons';
import { announce } from './kit/aria-announcer';
import { createStepCard } from './kit/step-card';

export interface DailySkillCallbacks {
  /** The item is finished (solved or revealed): record it and pay the per-answer coins. */
  onAnswered(outcome: QuestionOutcome): void;
  /** The child asked for the next item (or the results, on the last one). */
  onNext(): void;
  /** The child left mid-item (unfinished: nothing is recorded for it). */
  onLeave(): void;
}

/** The step-kit's plan for one learned skill: its tier comes from the Leitner box. */
export function skillPlan(skillId: string, box: number, rng: Rng): ReasoningRoundPlan {
  const tier = skillTierOf({ box });
  return {
    skillId,
    tier,
    factKey: skillKey(skillId),
    item: itemForSkill(skillId, rng, tier),
  };
}

/** Body HTML for the item: an already-counted note, the badge, and the step-card host. */
export function skillItemHtml(index: number, total: number, alreadyCounted: boolean): string {
  const note = alreadyCounted ? `<p class="daily-note">${td('alreadyDone')}</p>` : '';
  return `${note}<div class="dialog-eyebrow">${td('itemOf', { n: index + 1, total }).toUpperCase()}</div><p class="daily-badge">🧠 ${trr('badge')}</p><div class="daily-steps"></div><div class="daily-hint-area" hidden></div><p class="feedback" role="status"></p><div class="daily-footer"><button type="button" class="secondary daily-hint">💡 ${trr('hint')}</button><button type="button" class="text-button daily-leave">${td('leave')}</button></div><button type="button" class="primary wide daily-next" hidden></button>`;
}

/** Mounts the step card and wires hint / next / leave inside the open dialog. */
export function mountSkillItem(
  plan: ReasoningRoundPlan,
  isLast: boolean,
  signal: AbortSignal,
  cb: DailySkillCallbacks,
): { destroy(): void } {
  const flow = new ReasoningRoundFlow(plan, () => performance.now());
  const root = byId('dialog-content');
  const stepsHost = root.querySelector('.daily-steps') as HTMLElement;
  const hintArea = root.querySelector('.daily-hint-area') as HTMLElement;
  const feedbackEl = root.querySelector('.feedback') as HTMLElement;
  const hintButton = root.querySelector('.daily-hint') as HTMLButtonElement;
  const nextButton = root.querySelector('.daily-next') as HTMLButtonElement;
  const leaveButton = root.querySelector('.daily-leave') as HTMLButtonElement;
  const say = (text: string, tone: 'success' | 'gentle' | '') => {
    feedbackEl.textContent = text;
    feedbackEl.className = `feedback ${tone}`.trim();
    announce(text);
  };

  const finish = (outcome: QuestionOutcome, solved: boolean): void => {
    const steps = playableSteps(plan.item).length;
    while (card.currentStep() < steps) card.reveal();
    hintButton.disabled = true;
    cb.onAnswered(outcome);
    say(trr(solved ? 'correct' : 'revealed'), solved ? 'success' : 'gentle');
    if (solved) {
      gameState.audio.correct();
      const pop = document.createElement('b');
      pop.className = 'reward-pop';
      pop.textContent = '+5 xu';
      nextButton.append(pop);
      pop.addEventListener('animationend', () => pop.remove());
    } else gameState.audio.hint();
    nextButton.hidden = false;
    nextButton.textContent = isLast ? td('seeResult') : td('next');
    nextButton.focus({ preventScroll: true });
  };

  const card = createStepCard(plan.item, {
    onAnswer: (event) => {
      const result = flow.answer(event);
      if (result.verdict === 'step') {
        say(trr('stepRight'), 'success');
        gameState.audio.tone(698, 0.12);
      } else if (result.verdict === 'wrong') {
        say(trr('wrong'), 'gentle');
        hintButton.classList.toggle('offer', flow.canHint);
        gameState.audio.hint();
      } else if (result.outcome) finish(result.outcome, result.outcome.correct);
      else if (result.verdict === 'revealed') {
        card.reveal();
        say(trr('revealed'), 'gentle');
        hintButton.classList.remove('offer');
        gameState.audio.hint();
      }
    },
    onComplete: () => {},
    signal,
  });
  stepsHost.append(card.element);

  const hint = () => {
    if (!flow.canHint) return;
    hintArea.hidden = false;
    hintArea.textContent = flow.takeHint();
    hintButton.classList.remove('offer');
    hintButton.disabled = !flow.canHint;
    gameState.audio.hint();
    announce(hintArea.textContent);
  };
  hintButton.addEventListener('click', hint);
  nextButton.addEventListener('click', () => cb.onNext());
  leaveButton.addEventListener('click', () => cb.onLeave());
  announce(
    `${trr('badge')} ${card.element.querySelector('.kit-step-card__story')?.textContent ?? ''}`,
  );
  return { destroy: () => card.destroy() };
}
