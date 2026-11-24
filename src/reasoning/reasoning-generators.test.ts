import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { REASONING_SKILLS, reasoningItemForSkill } from './reasoning-item-for-skill';
import { evalExpr, numbersOfItem, statementTruth } from './reasoning-test-oracles';
import type { ReasoningItem, ReasoningStep } from './reasoning-types';

const TIERS: SkillTier[] = [1, 2, 3];
const SEEDS = 1000;

const finalNumber = (item: ReasoningItem): number => {
  const last = item.steps[item.steps.length - 1] as ReasoningStep;
  if (last.kind === 'number') return last.answer;
  if (last.kind === 'choice') {
    const label = last.options.find((o) => o.correct)?.label;
    return Number(label?.params?.n);
  }
  throw new Error(`no final number in ${item.skillId}`);
};
const p = (item: ReasoningItem, k: string) => Number(item.story.params?.[k]);

/** Independent final answers from the story's params. */
const ORACLE: Record<string, (item: ReasoningItem) => void> = {
  'wp-times-then-add': (i) => expect(finalNumber(i)).toBe(p(i, 'a') * p(i, 'n') + p(i, 'a')),
  'wp-divide-then-add': (i) => expect(finalNumber(i)).toBe(p(i, 'a') + p(i, 'a') / p(i, 'n')),
  'wp-more-less-then-total': (i) =>
    expect(finalNumber(i)).toBe(
      // Phase 02: more/less frames are wpMoreThenTotal* / wpLessThenTotal*.
      2 * p(i, 'a') + (i.story.key.includes('More') ? p(i, 'd') : -p(i, 'd')),
    ),
  'wp-unit-then-times': (i) =>
    expect(finalNumber(i)).toBe((p(i, 'total') / p(i, 'boxes')) * p(i, 'm')),
  'wp-times-compare': (i) => expect(finalNumber(i)).toBe(p(i, 'big') / p(i, 'small')),
  'wp-difference-compare': (i) => expect(finalNumber(i)).toBe(p(i, 'big') - p(i, 'small')),
  'div-rem-floor': (i) => {
    const [total, per] = [p(i, 'total'), p(i, 'per')];
    const q = Math.floor(total / per);
    const nums = i.steps.flatMap((s) => (s.kind === 'number' ? [s.answer] : []));
    const choice = i.steps.find((s) => s.kind === 'choice');
    if (choice?.kind === 'choice')
      expect(choice.options.find((o) => o.correct)?.label.params).toEqual({
        q,
        r: total - q * per,
      });
    else expect(nums.slice(-2)).toEqual([q, total - q * per]);
    expect(total % per).toBeGreaterThan(0);
  },
  'div-rem-ceil': (i) => {
    expect(p(i, 'total') % p(i, 'per')).toBeGreaterThan(0);
    expect(finalNumber(i)).toBe(Math.ceil(p(i, 'total') / p(i, 'per')));
  },
  'unknown-add-sub': (i) => checkUnknown(i),
  'unknown-mul-div': (i) => checkUnknown(i),
  'unknown-add-sub-wp': (i) => {
    const key = i.story.key;
    if (key === 'unknownWpSubPack') {
      const first = i.steps[0] as ReasoningStep;
      expect(first.kind === 'number' ? first.answer : -1).toBe(p(i, 'b') * p(i, 'c'));
      expect(finalNumber(i)).toBe(p(i, 'b') * p(i, 'c') + p(i, 'a'));
    } else if (key === 'unknownWpSubFirst') {
      expect(finalNumber(i)).toBe(p(i, 'a') + p(i, 'b'));
    } else {
      expect(finalNumber(i)).toBe(p(i, 's') - p(i, 'a'));
    }
  },
  'unknown-mul-div-wp': (i) => {
    const key = i.story.key;
    if (key === 'unknownWpMulSum') {
      const first = i.steps[0] as ReasoningStep;
      expect(first.kind === 'number' ? first.answer : -1).toBe(p(i, 'a') + p(i, 'b'));
      expect(finalNumber(i)).toBe((p(i, 'a') + p(i, 'b')) / p(i, 'n'));
    } else if (key === 'unknownWpMulBoxes' || key === 'unknownWpMulEach') {
      expect(finalNumber(i)).toBe(p(i, 'p') / p(i, 'n'));
    } else if (key === 'unknownWpDivBoxes') {
      expect(finalNumber(i)).toBe(p(i, 'p') / p(i, 'q'));
    } else {
      // unknownWpDivShare
      expect(finalNumber(i)).toBe(p(i, 'n') * p(i, 'q'));
    }
  },
  'wp-times-then-sub': (i) => {
    expect(finalNumber(i)).toBe(p(i, 'a') * p(i, 'n') - p(i, 'a'));
    if (i.tier === 1) {
      const first = i.steps[0] as ReasoningStep;
      expect(first.kind === 'number' ? first.answer : -1).toBe(p(i, 'a') * p(i, 'n'));
    }
    if (i.tier === 3) {
      const first = i.steps[0];
      if (first?.kind !== 'choice')
        throw new Error('wp-times-then-sub t3 needs an expression choice');
      expect(first.options.find((o) => o.correct)?.label.params?.text).toBe(
        `${p(i, 'a')} × ${p(i, 'n')} − ${p(i, 'a')}`,
      );
    }
  },
  'wp-divide-then-sub': (i) => {
    expect(finalNumber(i)).toBe(p(i, 'a') - p(i, 'a') / p(i, 'n'));
    if (i.tier === 1) {
      const first = i.steps[0] as ReasoningStep;
      expect(first.kind === 'number' ? first.answer : -1).toBe(p(i, 'a') / p(i, 'n'));
    }
    if (i.tier === 3) {
      const first = i.steps[0];
      if (first?.kind !== 'choice')
        throw new Error('wp-divide-then-sub t3 needs an expression choice');
      expect(first.options.find((o) => o.correct)?.label.params?.text).toBe(
        `${p(i, 'a')} − ${p(i, 'a')} : ${p(i, 'n')}`,
      );
    }
  },
  'pattern-add': (i) => checkPattern(i, (d) => d > 0),
  'pattern-sub': (i) => checkPattern(i, (d) => d < 0),
  'pattern-skip-count': (i) => checkPattern(i, (d, terms) => terms.every((t) => t % d === 0)),
  'expr-order': (i) => expect(finalNumber(i)).toBe(evalExpr(String(i.story.params?.text))),
  'expr-brackets': (i) => {
    expect(String(i.story.params?.text)).toContain('(');
    expect(finalNumber(i)).toBe(evalExpr(String(i.story.params?.text)));
  },
  'expr-from-story': (i) =>
    expect(finalNumber(i)).toBe(
      // Phase 02: both n × p − e frames are 'exprStoryEat' / 'exprStoryBox'; the rest share.
      ['exprStoryEat', 'exprStoryBox'].includes(i.story.key)
        ? p(i, 'n') * p(i, 'p') - p(i, 'e')
        : (p(i, 'a') + p(i, 'b')) / p(i, 'n'),
    ),
  'choose-all-correct': (i) => {
    const step = i.steps[0];
    if (step?.kind !== 'multi') throw new Error('choose-all needs a multi step');
    for (const o of step.options) expect(statementTruth(o.label), o.label.key).toBe(o.correct);
  },
  'tf-explain': (i) => {
    const step = i.steps[0];
    if (step?.kind !== 'verdict') throw new Error('tf-explain needs a verdict step');
    expect(statementTruth(step.statement)).toBe(step.answer);
    expect(step.fix !== undefined).toBe(!step.answer);
    const s = step.statement.params ?? {};
    const want: Record<string, number> = {
      stmtRem: Number(s.total) % Number(s.per),
      stmtEq: evalExpr(String(s.text)),
      stmtTimes: Number(s.big) / Number(s.small),
      stmtMore: Number(s.big) - Number(s.small),
    };
    if (step.fix) expect(step.fix.answer).toBe(want[step.statement.key]);
  },
};

function checkUnknown(item: ReasoningItem): void {
  const [lhs, rhs] = String(item.story.params?.text).split('=') as [string, string];
  const x = String(finalNumber(item));
  expect(evalExpr(lhs.replace('?', x))).toBe(evalExpr(rhs.replace('?', x)));
}

function checkPattern(item: ReasoningItem, rule: (d: number, terms: number[]) => boolean): void {
  const answers = item.steps.map((s) => (s.kind === 'number' ? s.answer : finalNumber(item)));
  let k = 0;
  const terms = String(item.story.params?.terms)
    .split(', ')
    .map((t) => (t === '?' ? (answers[k++] as number) : Number(t)));
  const d = (terms[1] as number) - (terms[0] as number);
  for (const [j, t] of terms.entries()) expect(t).toBe((terms[0] as number) + j * d);
  expect(rule(d, terms)).toBe(true);
}

function checkShape(step: ReasoningStep): void {
  if (step.kind === 'choice' || step.kind === 'multi') {
    const labels = step.options.map((o) => JSON.stringify(o.label));
    expect(new Set(labels).size).toBe(labels.length);
    for (const o of step.options) if (!o.correct) expect(o.misconception).toBeDefined();
    const correct = step.options.filter((o) => o.correct).length;
    if (step.kind === 'choice') {
      expect(step.options.length).toBeGreaterThanOrEqual(3);
      expect(step.options.length).toBeLessThanOrEqual(4);
      expect(correct).toBe(1);
    } else {
      expect(step.options.length).toBe(4);
      expect(correct).toBeGreaterThanOrEqual(1);
    }
  }
}

describe('reasoning generators', () => {
  it('cover the 22 reasoning skills of the catalog', () => {
    expect(REASONING_SKILLS).toHaveLength(22);
  });

  for (const skillId of REASONING_SKILLS) {
    it(`${skillId}: exact answers, unique options, numbers <= 100, deterministic`, () => {
      for (const tier of TIERS)
        for (let seed = 0; seed < SEEDS; seed++) {
          const item = reasoningItemForSkill(skillId, mulberry32(seed), tier);
          expect(item.skillId).toBe(skillId);
          expect(item.tier).toBe(tier);
          expect(item.steps.length).toBeGreaterThan(0);
          for (const n of numbersOfItem(item)) {
            expect(Number.isInteger(n), `${skillId} t${tier} #${seed}: ${n}`).toBe(true);
            expect(n >= 0 && n <= 100, `${skillId} t${tier} #${seed}: ${n}`).toBe(true);
          }
          item.steps.forEach(checkShape);
          ORACLE[skillId]?.(item);
          if (seed < 20)
            expect(reasoningItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });
  }

  it('refuses skills it has no generator for', () => {
    expect(() => reasoningItemForSkill('geo-midpoint', mulberry32(1), 1)).toThrow();
  });
});
