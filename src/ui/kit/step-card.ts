import './step-kit.css';
import {
  isStepAnswerCorrect,
  playableSteps,
  type StepAnswer,
} from '../../reasoning/reasoning-step-answers';
import { renderPrompt as renderReasoningPrompt } from '../../reasoning/reasoning-strings';
import type { PromptRef, ReasoningItem, ReasoningStep } from '../../reasoning/reasoning-types';
import { announce } from './aria-announcer';
import { createChoiceButtons } from './choice-buttons';
import { createMultiSelectButtons } from './multi-select-buttons';
import { createNumberPad } from './number-pad';
import { tk } from './ui-kit-strings';
import { createVerdictButtons } from './verdict-buttons';

export interface StepAnswerEvent {
  stepIndex: number;
  correct: boolean;
  answer: StepAnswer;
}

export interface StepCardOptions {
  /** Every try, right or wrong (the host counts misses, offers hints, decides when to reveal). */
  onAnswer?: (event: StepAnswerEvent) => void;
  /** All steps answered. */
  onComplete: () => void;
  /** Prompt text for the item's family (geometry/measurement pass their own); reasoning by default. */
  render?: (prompt: PromptRef) => string;
}

export interface StepCard {
  element: HTMLElement;
  currentStep(): number;
  /** Shows the right answer of the current step and moves on (after too many misses). */
  reveal(): void;
  destroy(): void;
}

interface Widget {
  element: HTMLElement;
  destroy(): void;
}

const answerText = (step: ReasoningStep, renderPrompt: (p: PromptRef) => string): string => {
  if (step.kind === 'number') return String(step.answer);
  if (step.kind === 'verdict') return tk(step.answer ? 'yes' : 'no');
  return step.options
    .filter((o) => o.correct)
    .map((o) => renderPrompt(o.label))
    .join(', ');
};

/**
 * A reasoning item as a story plus a chain of steps; only the current step takes input. Every
 * step is answered by tapping (number pad, choices, toggles + Xong, Đúng/Sai); keys are optional.
 */
export function createStepCard(
  item: ReasoningItem,
  options: StepCardOptions,
  doc: Document = document,
): StepCard {
  const renderPrompt = options.render ?? renderReasoningPrompt;
  const steps = playableSteps(item);
  let index = 0;
  let widget: Widget | null = null;
  const element = doc.createElement('section');
  element.className = 'kit-step-card';
  const story = doc.createElement('p');
  story.className = 'kit-step-card__story';
  story.textContent = renderPrompt(item.story);
  const list = doc.createElement('ol');
  list.className = 'kit-step-card__steps';
  list.setAttribute('aria-label', tk('steps'));
  element.append(story, list);

  function finishStep(): void {
    const step = steps[index] as ReasoningStep;
    const row = list.lastElementChild as HTMLElement;
    widget?.destroy();
    widget = null;
    row.classList.add('kit-step--done');
    const done = doc.createElement('span');
    done.className = 'kit-step__answer';
    done.textContent = `✓ ${answerText(step, renderPrompt)}`;
    row.appendChild(done);
    announce(tk('stepDone', { answer: answerText(step, renderPrompt) }), doc);
    index += 1;
    if (index < steps.length) showStep();
    else options.onComplete();
  }

  function submit(answer: StepAnswer): void {
    const correct = isStepAnswerCorrect(steps[index] as ReasoningStep, answer);
    options.onAnswer?.({ stepIndex: index, correct, answer });
    if (correct) finishStep();
    else announce(tk('tryAgain'), doc);
  }

  function widgetFor(step: ReasoningStep): Widget {
    const choices = (s: ReasoningStep) =>
      s.kind === 'choice' || s.kind === 'multi'
        ? s.options.map((o) => ({ id: o.id, label: renderPrompt(o.label) }))
        : [];
    if (step.kind === 'number') {
      const pad = createNumberPad(
        {
          activeInput: true,
          onSubmit: (value) => {
            submit(value);
            pad.clear();
          },
        },
        doc,
      );
      return pad;
    }
    if (step.kind === 'choice') return createChoiceButtons(choices(step), (c) => submit(c.id), doc);
    if (step.kind === 'verdict') return createVerdictButtons((v) => submit(v), doc);
    const multi = createMultiSelectButtons(
      choices(step),
      (ids) => {
        const before = index;
        submit(ids);
        if (index === before) multi.reset();
      },
      doc,
    );
    return multi;
  }

  function showStep(): void {
    const step = steps[index] as ReasoningStep;
    const row = doc.createElement('li');
    row.className = `kit-step kit-step--${step.kind}`;
    const prompt = doc.createElement('p');
    prompt.className = 'kit-step__prompt';
    prompt.textContent = renderPrompt(step.prompt);
    row.appendChild(prompt);
    if (step.kind === 'verdict') {
      const statement = doc.createElement('p');
      statement.className = 'kit-step__statement';
      statement.textContent = renderPrompt(step.statement);
      row.appendChild(statement);
    }
    widget = widgetFor(step);
    row.appendChild(widget.element);
    list.appendChild(row);
  }

  showStep();
  return {
    element,
    currentStep: () => index,
    reveal: () => {
      if (index < steps.length) finishStep();
    },
    destroy: () => {
      widget?.destroy();
      element.remove();
    },
  };
}
