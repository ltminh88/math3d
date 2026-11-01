// Garden hint rungs, per step: 1 encourage; 2 the rule in words (each pot adds 5 / the inverse
// operation / brackets first, × and : before + and −); 3 the step worked with its result left as
// "?" (for an expression: the first part done, the rest to finish); 4 a last nudge (count step by
// step, check by putting the number back, left to right). No rung states the step's answer: only
// the three-miss path reveals it (learning-core ladder, rung 5). `gardenHintSpec` is pure (tested).
import type { HintRung } from '../../learning/hint-ladder';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ReasoningItem } from '../../reasoning/reasoning-types';
import { gardenKindOf } from './garden-round-plan';
import type { GardenStrings } from './garden-strings';

export interface HintSpec {
  key: Parameters<GardenStrings>[0];
  vars: Record<string, string | number>;
}

const spec = (key: HintSpec['key'], vars: HintSpec['vars'] = {}): HintSpec => ({ key, vars });
const work = (calc: string): HintSpec => spec('hintWork', { calc: `${calc} = ?` });

function patternHint(rung: HintRung, item: ReasoningItem, pos: number): HintSpec {
  const terms = item.work;
  const [a = 0, b = 0] = terms;
  const d = b - a;
  const prev = terms[pos - 2] ?? a;
  const sign = d >= 0 ? '+' : '−';
  if (rung === 2) return spec(d >= 0 ? 'hintRuleAdd' : 'hintRuleSub', { d: Math.abs(d) });
  if (rung === 3) return work(`${prev} ${sign} ${Math.abs(d)}`);
  if (Math.abs(d) > 5) return spec('hintCheck', { a, b, d: Math.abs(d) });
  const steps = Array.from({ length: Math.abs(d) - 1 }, (_, i) => prev + Math.sign(d) * (i + 1));
  return spec('hintCount', { sequence: [prev, ...steps, '?'].join(', ') });
}

/** `? + 23 = 80` → the inverse rule and `80 − 23` (the right side's value from `rhs`). */
function inverse(text: string, rhs: number): { key: HintSpec['key']; calc: string } {
  const [x = '', op = '', y = ''] = (text.split(' = ')[0] ?? '').split(' ');
  const known = x === '?' ? y : x;
  switch (op) {
    case '+':
      return { key: 'hintFindAddend', calc: `${rhs} − ${known}` };
    case '−':
      return x === '?'
        ? { key: 'hintFindMinuend', calc: `${rhs} + ${known}` }
        : { key: 'hintFindSubtrahend', calc: `${known} − ${rhs}` };
    case '×':
      return { key: 'hintFindFactor', calc: `${rhs} : ${known}` };
    default:
      return x === '?'
        ? { key: 'hintFindDividend', calc: `${rhs} × ${known}` }
        : { key: 'hintFindDivisor', calc: `${known} : ${rhs}` };
  }
}

function balanceHint(rung: HintRung, item: ReasoningItem, stepKey: string, part: string): HintSpec {
  const text = String(item.story.params?.text ?? '');
  if (stepKey === 'askPart') return rung === 2 ? spec('hintPartFirst', { text: part }) : work(part);
  const right = text.split(' = ')[1] ?? '';
  const rhs = /^\d+$/.test(right) ? Number(right) : (item.work[0] ?? 0);
  const inv = inverse(text, rhs);
  if (rung === 2) return spec(inv.key);
  return rung === 3 ? work(inv.calc) : spec('hintTryBack', { text });
}

function bagHint(rung: HintRung, item: ReasoningItem, stepKey: string, part: string): HintSpec {
  const p = item.story.params ?? {};
  const text = String(p.text ?? '');
  const brackets = text.includes('(');
  const rule = spec(brackets ? 'hintBrackets' : 'hintMulFirst');
  const partValue = item.work[0] ?? 0;
  switch (stepKey) {
    case 'gardenFirstOp':
      if (rung === 2) return rule;
      if (rung === 3) return spec(brackets ? 'hintFindBrackets' : 'hintFindMul');
      return spec('hintThenLeftRight');
    case 'askPart':
      if (rung === 2) return item.story.key === 'exprValue' ? rule : spec('hintStoryRead');
      return work(part);
    case 'askValue': {
      if (rung === 2) return rule;
      if (rung === 4) return spec('hintThenLeftRight');
      const rest = text.replace(brackets ? `(${part})` : part, String(partValue));
      return spec('hintAfterPart', { part, value: partValue, calc: `${rest} = ?` });
    }
    case 'pickExpr':
      if (rung === 2) return spec('hintStoryRead');
      return item.story.key === 'exprStoryShare'
        ? spec('hintStoryShare', { n: p.n ?? 0 })
        : spec('hintStoryEat', { n: p.n ?? 0, p: p.p ?? 0 });
    case 'askLeftOver':
      return rung === 2 ? spec('hintLeftOverRule') : work(`${partValue} − ${p.e}`);
    case 'askEach':
      return rung === 2 ? spec('hintEachRule') : work(`${partValue} : ${p.n}`);
    default:
      return spec('hint1');
  }
}

/** The hint for `rung` on step `stepIndex` (playable steps) of `item`. */
export function gardenHintSpec(rung: HintRung, item: ReasoningItem, stepIndex: number): HintSpec {
  if (rung <= 1) return spec('hint1');
  const step = playableSteps(item)[stepIndex];
  if (!step) return spec('hint1');
  const params = step.prompt.params ?? {};
  const kind = gardenKindOf(item.skillId);
  if (kind === 'pattern') return patternHint(rung, item, Number(params.pos ?? 5));
  return kind === 'balance'
    ? balanceHint(rung, item, step.prompt.key, String(params.text ?? ''))
    : bagHint(rung, item, step.prompt.key, partOf(item));
}

/** The part done first in an expression item (the text of its `askPart` step). */
function partOf(item: ReasoningItem): string {
  const ask = item.steps.find((s) => s.prompt.key === 'askPart');
  return String(ask?.prompt.params?.text ?? '');
}

/** Renders `rung` into the hint area and returns the text (for the announcement). */
export function renderGardenHint(
  area: HTMLElement,
  gs: GardenStrings,
  rung: HintRung,
  item: ReasoningItem,
  stepIndex: number,
): string {
  const hint = gardenHintSpec(rung, item, stepIndex);
  const text = gs(hint.key, hint.vars);
  const p = document.createElement('p');
  p.textContent = text;
  area.replaceChildren(p);
  area.hidden = false;
  area.dataset.rung = String(rung);
  return text;
}
