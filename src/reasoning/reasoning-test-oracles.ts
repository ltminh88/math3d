// Test-only helpers (imported by *.test.ts): collect every number of an item and recompute the
// truth of a statement or an expression text independently from the generators.
import type { PromptRef, ReasoningItem } from './reasoning-types';

/** Evaluates `12 + 3 × (8 − 2) : 3` with the usual order (× : before + −, brackets first). */
export function evalExpr(text: string): number {
  const tokens = text.match(/\d+|[+−×:()]/g) ?? [];
  let i = 0;
  const peek = () => tokens[i];
  const atom = (): number => {
    const tok = tokens[i++];
    if (tok === '(') {
      const v = sum();
      i++;
      return v;
    }
    return Number(tok);
  };
  const product = (): number => {
    let v = atom();
    while (peek() === '×' || peek() === ':') v = tokens[i++] === '×' ? v * atom() : v / atom();
    return v;
  };
  const sum = (): number => {
    let v = product();
    while (peek() === '+' || peek() === '−')
      v = tokens[i++] === '+' ? v + product() : v - product();
    return v;
  };
  return sum();
}

/** Every number in a prompt's params, including numbers inside expression / pattern texts. */
export function numbersOfPrompt(ref: PromptRef | undefined): number[] {
  const out: number[] = [];
  for (const v of Object.values(ref?.params ?? {})) {
    if (typeof v === 'number') out.push(v);
    else if (!v.startsWith('i:')) for (const m of v.match(/\d+/g) ?? []) out.push(Number(m));
  }
  return out;
}

export function numbersOfItem(item: ReasoningItem): number[] {
  const out = [...numbersOfPrompt(item.story), ...item.work];
  for (const step of item.steps) {
    out.push(...numbersOfPrompt(step.prompt));
    if (step.kind === 'number') out.push(step.answer);
    if (step.kind === 'choice' || step.kind === 'multi')
      for (const o of step.options) out.push(...numbersOfPrompt(o.label));
    if (step.kind === 'verdict') {
      out.push(...numbersOfPrompt(step.statement));
      if (step.fix) out.push(step.fix.answer, ...numbersOfPrompt(step.fix.prompt));
    }
  }
  return out;
}

/** Truth of a statement label (stmtRem / stmtEq / stmtTimes / stmtMore), or undefined. */
export function statementTruth(ref: PromptRef): boolean | undefined {
  const p = ref.params ?? {};
  const n = (k: string) => Number(p[k]);
  if (ref.key === 'stmtRem') return n('q') * n('per') + n('r') === n('total') && n('r') < n('per');
  if (ref.key === 'stmtEq') return evalExpr(String(p.text)) === n('value');
  if (ref.key === 'stmtTimes') return n('small') * n('n') === n('big');
  if (ref.key === 'stmtMore') return n('big') - n('small') === n('d');
  return undefined;
}
