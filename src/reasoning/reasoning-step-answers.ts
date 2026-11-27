// Answer checking for reasoning steps, shared by the step kit and level code (pure).
import { type ClockSetting, isSetClockCorrect } from '../time/clock-setter';
import type { Misconception, ReasoningItem, ReasoningStep } from './reasoning-types';

/** number step: a number; choice: an option id; multi: the chosen option ids; verdict: true/false; set-clock: the set hands; order: the tapped tile indices in order; match: the right index paired with each left, in left order. */
export type StepAnswer =
  | number
  | string
  | readonly string[]
  | readonly number[]
  | boolean
  | ClockSetting;

const isNumberList = (answer: StepAnswer): answer is readonly number[] =>
  Array.isArray(answer) && answer.every((v) => typeof v === 'number');

/** The first slot whose tapped tile is not the right one, or null when the order is right. */
export function firstMisplacedTile(
  step: Extract<ReasoningStep, { kind: 'order' }>,
  answer: StepAnswer,
): number | null {
  if (!isNumberList(answer)) return 0;
  for (let i = 0; i < step.answer.length; i++) if (answer[i] !== step.answer[i]) return i;
  return answer.length === step.answer.length ? null : step.answer.length;
}

/** The first wrong pair (left index, right index, the right option's bug if tagged). */
export function firstWrongPair(
  step: Extract<ReasoningStep, { kind: 'match' }>,
  answer: StepAnswer,
): { left: number; right: number; misconception?: Misconception } | null {
  if (!isNumberList(answer)) return { left: 0, right: -1 };
  for (let i = 0; i < step.pairs.length; i++)
    if (answer[i] !== step.pairs[i])
      return {
        left: i,
        right: answer[i] as number,
        misconception: step.right[answer[i] as number]?.misconception,
      };
  return answer.length === step.pairs.length ? null : { left: step.pairs.length, right: -1 };
}

/** Every wrong pair, so a widget can flash all of them after a wrong "Xong". */
export function wrongPairs(
  step: Extract<ReasoningStep, { kind: 'match' }>,
  answer: StepAnswer,
): readonly { left: number; right: number }[] {
  if (!isNumberList(answer)) return [];
  const out: { left: number; right: number }[] = [];
  for (let i = 0; i < step.pairs.length; i++)
    if (answer[i] !== step.pairs[i]) out.push({ left: i, right: answer[i] as number });
  return out;
}

/** The bug a wrong order stands for, if it matches a known wrong order
 * (boost 2B, R90.2): the exact reverse of the correct order is a direction
 * error; ordering by the tiles' bare numbers while ignoring their units is
 * an ignore-unit error. Tiles without a numeric param make the bare-number
 * check inapplicable. A correct order is no bug. */
export function orderBug(
  step: Extract<ReasoningStep, { kind: 'order' }>,
  answer: StepAnswer,
): Misconception | undefined {
  if (!isNumberList(answer) || isStepAnswerCorrect(step, answer)) return undefined;
  const correct = [...step.answer];
  const reversed = [...correct].reverse();
  if (answer.length === reversed.length && answer.every((n, i) => n === reversed[i]))
    return 'unit-direction';
  const bareNumbers = step.tiles.map((t) => Number(t.params?.n));
  if (bareNumbers.some((n) => !Number.isFinite(n))) return undefined;
  const bare = bareNumbers
    .map((_, i) => i)
    .sort((a, b) => (bareNumbers[a] as number) - (bareNumbers[b] as number));
  if (answer.length === bare.length && answer.every((n, i) => n === bare[i])) return 'ignore-unit';
  return undefined;
}

/** The bug a wrong answer stands for, if the picked option (or order, or
 * pairing) is tagged with one (boost Phase 0, R79; 2B, R90): a wrong choice or
 * multi pick carries its option's misconception; a wrong match carries the
 * first wrong pair's right option's bug; a wrong order carries `orderBug`'s
 * verdict. A correct answer, a number, a verdict or a clock set is no bug. */
export function wrongAnswerBug(
  step: ReasoningStep | undefined,
  answer: StepAnswer,
): Misconception | undefined {
  if (typeof answer === 'string') {
    if (step?.kind !== 'choice' && step?.kind !== 'multi') return undefined;
    return step.options.find((o) => o.id === answer)?.misconception;
  }
  if (!isNumberList(answer)) return undefined;
  if (step?.kind === 'match') return firstWrongPair(step, answer)?.misconception;
  if (step?.kind === 'order') return orderBug(step, answer);
  return undefined;
}

/** The steps as played: a false verdict that carries a fix is followed by a number step for it. */
export function playableSteps(item: ReasoningItem): ReasoningStep[] {
  return item.steps.flatMap((step): ReasoningStep[] =>
    step.kind === 'verdict' && step.fix
      ? [step, { kind: 'number', prompt: step.fix.prompt, answer: step.fix.answer }]
      : [step],
  );
}

export function isStepAnswerCorrect(step: ReasoningStep, answer: StepAnswer): boolean {
  switch (step.kind) {
    case 'number':
      return answer === step.answer;
    case 'choice':
      return step.options.some((o) => o.correct && o.id === answer);
    case 'multi': {
      if (!Array.isArray(answer)) return false;
      const chosen = new Set(answer as readonly string[]);
      return step.options.every((o) => o.correct === chosen.has(o.id));
    }
    case 'verdict':
      return answer === step.answer;
    case 'order':
      return firstMisplacedTile(step, answer) === null;
    case 'match':
      return firstWrongPair(step, answer) === null;
    case 'set-clock': {
      if (typeof answer !== 'object' || answer === null || Array.isArray(answer)) return false;
      const setting = answer as ClockSetting;
      if (typeof setting.h !== 'number' || typeof setting.m !== 'number') return false;
      return isSetClockCorrect(setting, { h: step.h, m: step.m }, step.snapMinutes);
    }
  }
}

/** Multi-select toggle: adds the id, or removes it when already chosen. */
export function toggleSelection(selected: readonly string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
}
