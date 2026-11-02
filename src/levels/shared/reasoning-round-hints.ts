// Hint ladder of the old levels' reasoning round (pure): 1 encourage, 2 the picture, 3 the strategy
// plus the operation of the step the child is on, with "?" where its result goes. A hint never
// states the current step's answer; it only reuses numbers already on screen (the story, the
// prompts and the answers of the steps already done).
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ReasoningItem } from '../../reasoning/reasoning-types';
import { type ReasoningStringKey, trr } from './reasoning-round-strings';

type Key = ReasoningStringKey;

const HINTS: Readonly<Record<string, readonly [look: Key, plan: Key]>> = {
  'wp-times-then-add': ['lookWp', 'planTimesAdd'],
  'wp-times-compare': ['lookWp', 'planTimesCompare'],
  'pattern-skip-count': ['lookPattern', 'planPattern'],
  'div-rem-floor': ['lookDiv', 'planFloor'],
  'div-rem-ceil': ['lookDiv', 'planCeil'],
  'unknown-mul-div': ['lookUnknown', 'planUnknown'],
  'expr-brackets': ['lookExpr', 'planExpr'],
  'expr-order': ['lookExpr', 'planExpr'],
  'tf-explain': ['lookClaim', 'planClaim'],
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The expression with its first worked part replaced by that part's value ("49 × 2"). */
function afterPart(text: string, part: string, value: number): string {
  if (text.includes(`(${part})`)) return text.replace(`(${part})`, String(value));
  return text.replace(new RegExp(`(^|[^\\d])${escapeRegExp(part)}(?!\\d)`), `$1${value}`);
}

/** The current number step's operation with "?" for its result, or null (choices, verdicts). */
function stepOperation(item: ReasoningItem, stepIndex: number): string | null {
  const steps = playableSteps(item);
  const step = steps[stepIndex];
  if (step?.kind !== 'number') return null;
  const story = item.story.params ?? {};
  const before = steps[stepIndex - 1];
  const done = before?.kind === 'number' ? before.answer : null;
  switch (item.skillId) {
    case 'wp-times-then-add': {
      const { a, n } = story;
      if (step.prompt.key === 'askOther') return `${a} × ${n} = ?`;
      return done === null ? trr('opThenAdd', { a: a ?? '', n: n ?? '' }) : `${done} + ${a} = ?`;
    }
    case 'div-rem-floor': {
      const { total, per } = story;
      if (step.prompt.key === 'askBoxes')
        return trr('opDivRem', { total: total ?? '', per: per ?? '' });
      return done === null ? null : `${total} − ${per} × ${done} = ?`;
    }
    case 'expr-brackets':
    case 'expr-order': {
      if (step.prompt.key === 'askPart') return `${step.prompt.params?.text} = ?`;
      const part = before?.prompt.params?.text;
      const text = story.text;
      if (done === null || typeof part !== 'string' || typeof text !== 'string') return null;
      return `${afterPart(text, part, done)} = ?`;
    }
    default:
      return null;
  }
}

/** Hint text for `rung` (1-3) while the child is on playable step `stepIndex`. */
export function reasoningHint(item: ReasoningItem, rung: number, stepIndex: number): string {
  const [look, plan] = HINTS[item.skillId] ?? (['lookExpr', 'planExpr'] as const);
  if (rung <= 1) return trr('encourage');
  if (rung === 2) return trr(look);
  const op = stepOperation(item, stepIndex);
  return op ? `${trr(plan)} ${trr('thisStep', { op })}` : trr(plan);
}
