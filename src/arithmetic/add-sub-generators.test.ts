// Arithmetic generators (phase 09): exact answers per story key, tier constraints
// (carries are the tier axis), ranges, deterministic per seed. RED-first: the
// generators, strings and ranges do not exist yet.
import { describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { dialogRenderable } from '../practice/item-for-skill';
import type { PracticeItem } from '../practice/practice-scene';
import { evalExpr } from '../reasoning/reasoning-test-oracles';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { arithmeticItemForSkill } from './arithmetic-item-for-skill';
import { renderArithmeticPrompt } from './arithmetic-strings';
import {
  equationMissingDigit,
  equationOperands,
  oracleAddCarries,
  oracleBorrowAcrossZero,
  oracleSubBorrows,
  stepValues,
  verdictTruth,
} from './arithmetic-test-oracles';
import { sweepArithmeticItem } from './arithmetic-test-sweep';

/** The phase-09 add/sub skills (the mul/div skills of phase 10 have their own test). */
const ADD_SUB_SKILLS = [
  'add-sub-mental-round',
  'add-sub-1000',
  'add-sub-1000-wp',
  'add-sub-1000-chain',
  'add-4digit',
  'sub-4digit',
  'add-sub-10000-wp',
  'add-5digit',
  'sub-5digit',
  'add-sub-100000-wp',
  'add-sub-find-error',
  'add-missing-digit',
] as const;

const p = (i: PracticeItem, k: string): number => Number(i.story.params?.[k]);
const s = (i: PracticeItem, k: string): string => String(i.story.params?.[k]);
const values = (i: PracticeItem): number[] => stepValues(i);
const last = (i: PracticeItem): number | undefined => values(i).at(-1);

const stepAt = (i: PracticeItem, idx: number): ReasoningStep => {
  const step = i.steps[idx];
  if (!step) throw new Error(`missing step ${idx}`);
  return step;
};

const applyOp = (a: number, op: string, b: number): number => (op === '+' ? a + b : a - b);

/** Independent answers per story key, from the story params. */
const ORACLE: Record<string, (i: PracticeItem) => void> = {
  addCalc: (i) => expect(last(i)).toBe(p(i, 'a') + p(i, 'b')),
  subCalc: (i) => expect(last(i)).toBe(p(i, 'a') - p(i, 'b')),
  mentalCalc: (i) => expect(last(i)).toBe(evalExpr(s(i, 'expr'))),
  chainCalc: (i) => {
    const first = applyOp(p(i, 'a'), s(i, 'op1'), p(i, 'b'));
    expect(values(i)).toEqual([first, applyOp(first, s(i, 'op2'), p(i, 'c'))]);
    expect(i.work).toEqual([first]);
  },
  wpAddHave: (i) => expect(last(i)).toBe(p(i, 'a') + p(i, 'b')),
  wpSubGive: (i) => expect(last(i)).toBe(p(i, 'a') - p(i, 'b')),
  wpTwoStepAdd: (i) => {
    expect(values(i)).toEqual([p(i, 'a') + p(i, 'b'), p(i, 'a') + p(i, 'b') + p(i, 'c')]);
    expect(i.work).toEqual([p(i, 'a') + p(i, 'b')]);
  },
  wpTwoStepLeft: (i) => {
    expect(values(i)).toEqual([p(i, 'a') + p(i, 'b'), p(i, 'a') + p(i, 'b') - p(i, 'c')]);
    expect(i.work).toEqual([p(i, 'a') + p(i, 'b')]);
  },
  // Big-number "give away" variants (warehouse / library / school): same maths as
  // wpSubGive / wpTwoStepLeft, only the wording changes.
  wpSubGiveOut: (i) => expect(last(i)).toBe(p(i, 'a') - p(i, 'b')),
  wpSubGiveLend: (i) => expect(last(i)).toBe(p(i, 'a') - p(i, 'b')),
  wpSubGiveHandout: (i) => expect(last(i)).toBe(p(i, 'a') - p(i, 'b')),
  wpTwoStepLeftOut: (i) => {
    expect(values(i)).toEqual([p(i, 'a') + p(i, 'b'), p(i, 'a') + p(i, 'b') - p(i, 'c')]);
    expect(i.work).toEqual([p(i, 'a') + p(i, 'b')]);
  },
  wpTwoStepLeftLend: (i) => {
    expect(values(i)).toEqual([p(i, 'a') + p(i, 'b'), p(i, 'a') + p(i, 'b') - p(i, 'c')]);
    expect(i.work).toEqual([p(i, 'a') + p(i, 'b')]);
  },
  wpTwoStepLeftHandout: (i) => {
    expect(values(i)).toEqual([p(i, 'a') + p(i, 'b'), p(i, 'a') + p(i, 'b') - p(i, 'c')]);
    expect(i.work).toEqual([p(i, 'a') + p(i, 'b')]);
  },
  wpCompare: (i) => {
    expect(p(i, 'a')).toBeGreaterThan(p(i, 'b'));
    expect(last(i)).toBe(p(i, 'a') - p(i, 'b'));
  },
  errorAdd: (i) => checkError(i, '+'),
  errorSub: (i) => checkError(i, '−'),
  missingDigit: (i) => {
    const missing = equationMissingDigit(s(i, 'equation'));
    expect(missing, 'equation parses to one missing digit').not.toBeUndefined();
    expect(last(i)).toBe(missing);
  },
};

/** A find-error item: the statement's truth is the answer; a false claim carries the fix. */
function checkError(i: PracticeItem, op: string): void {
  const correct = applyOp(p(i, 'a'), op, p(i, 'b'));
  const step = stepAt(i, 0);
  if (step.kind !== 'verdict') throw new Error('find-error step is not a verdict');
  expect(verdictTruth(step)).toBe(step.answer);
  if (step.answer) expect(p(i, 'shown')).toBe(correct);
  else {
    expect(p(i, 'shown')).not.toBe(correct);
    expect(step.fix?.answer).toBe(correct);
  }
}

/** Carries of the operation a story key's params describe (add or sub). */
function carriesOf(i: PracticeItem): number {
  const key = i.story.key;
  if (key === 'addCalc' || key === 'errorAdd') return oracleAddCarries(p(i, 'a'), p(i, 'b'));
  if (key === 'subCalc' || key === 'errorSub') return oracleSubBorrows(p(i, 'a'), p(i, 'b'));
  if (key === 'wpAddHave') return oracleAddCarries(p(i, 'a'), p(i, 'b'));
  if (key === 'wpTwoStepAdd')
    return (
      oracleAddCarries(p(i, 'a'), p(i, 'b')) + oracleAddCarries(p(i, 'a') + p(i, 'b'), p(i, 'c'))
    );
  if (key === 'wpTwoStepLeft')
    return (
      oracleAddCarries(p(i, 'a'), p(i, 'b')) + oracleSubBorrows(p(i, 'a') + p(i, 'b'), p(i, 'c'))
    );
  if (key === 'wpTwoStepLeftOut' || key === 'wpTwoStepLeftLend' || key === 'wpTwoStepLeftHandout')
    return (
      oracleAddCarries(p(i, 'a'), p(i, 'b')) + oracleSubBorrows(p(i, 'a') + p(i, 'b'), p(i, 'c'))
    );
  if (key === 'wpSubGive' || key === 'wpCompare') return oracleSubBorrows(p(i, 'a'), p(i, 'b'));
  if (key === 'wpSubGiveOut' || key === 'wpSubGiveLend' || key === 'wpSubGiveHandout')
    return oracleSubBorrows(p(i, 'a'), p(i, 'b'));
  if (key === 'chainCalc') {
    const first = applyOp(p(i, 'a'), s(i, 'op1'), p(i, 'b'));
    const c1 =
      s(i, 'op1') === '+'
        ? oracleAddCarries(p(i, 'a'), p(i, 'b'))
        : oracleSubBorrows(p(i, 'a'), p(i, 'b'));
    const c2 =
      s(i, 'op2') === '+' ? oracleAddCarries(first, p(i, 'c')) : oracleSubBorrows(first, p(i, 'c'));
    return c1 + c2;
  }
  if (key === 'mentalCalc') {
    const nums = s(i, 'expr')
      .split(' ')
      .filter((t) => /^\d+$/.test(t))
      .map(Number);
    let total = 0;
    let acc = nums[0] ?? 0;
    const ops = s(i, 'expr')
      .split(' ')
      .filter((t) => t === '+' || t === '−');
    for (let k = 0; k < ops.length; k++) {
      const n = nums[k + 1] as number;
      total += ops[k] === '+' ? oracleAddCarries(acc, n) : oracleSubBorrows(acc, n);
      acc = applyOp(acc, ops[k] as string, n);
    }
    return total;
  }
  if (key === 'missingDigit') {
    const pair = equationOperands(s(i, 'equation'));
    if (!pair) throw new Error('missing-digit equation does not parse');
    const [a, b] = pair;
    return s(i, 'equation').includes('−') ? oracleSubBorrows(a, b) : oracleAddCarries(a, b);
  }
  throw new Error(`no carry rule for ${key}`);
}

/** The tier's carry rule, per skill family. */
function tierCheck(skillId: string, item: PracticeItem, tier: SkillTier): void {
  const where = `${skillId} t${tier}`;
  const carries = carriesOf(item);
  if (skillId === 'add-sub-mental-round') {
    const nums = s(item, 'expr')
      .split(' ')
      .filter((t) => /^\d+$/.test(t))
      .map(Number);
    if (tier === 1) {
      expect(nums.length, where).toBe(2);
      for (const n of nums) expect(n % 100, where).toBe(0);
    } else if (tier === 2) {
      expect(nums.length, where).toBe(2);
      for (const n of nums) expect(n % 10, where).toBe(0);
    } else {
      expect(nums.length, where).toBe(3);
      for (const n of nums) expect(n % 50, where).toBe(0);
    }
    return;
  }
  if (skillId === 'add-sub-1000-chain') {
    if (tier === 1) expect(carries, where).toBe(0);
    else if (tier === 2) expect(carries, where).toBe(1);
    else expect(carries, where).toBeGreaterThanOrEqual(2);
    return;
  }
  if (
    skillId === 'add-sub-1000-wp' ||
    skillId === 'add-sub-10000-wp' ||
    skillId === 'add-sub-100000-wp'
  ) {
    if (tier === 1) {
      expect(item.steps.length, where).toBe(1);
      expect(carries, where).toBe(0);
    } else if (tier === 2) {
      if (item.steps.length === 1) expect(carries, where).toBe(1);
      else expect(carries, where).toBe(0);
    } else if (item.steps.length === 1) {
      expect(carries, where).toBeGreaterThanOrEqual(2);
    } else {
      expect(carries, where).toBeGreaterThanOrEqual(1);
    }
    return;
  }
  if (skillId === 'add-sub-find-error' || skillId === 'add-missing-digit') {
    const isSub =
      item.story.key === 'subCalc' ||
      item.story.key === 'errorSub' ||
      (item.story.key === 'missingDigit' && s(item, 'equation').includes('−'));
    const pair =
      item.story.key === 'missingDigit'
        ? equationOperands(s(item, 'equation'))
        : [p(item, 'a'), p(item, 'b')];
    if (!pair) throw new Error(`${where}: no operands`);
    const [pa, pb] = pair as [number, number];
    if (tier === 1) expect(carries, where).toBe(0);
    else if (tier === 2) expect(carries, where).toBe(1);
    else if (isSub) expect(oracleBorrowAcrossZero(pa, pb), where).toBe(true);
    else expect(carries, where).toBeGreaterThanOrEqual(2);
    if (skillId === 'add-missing-digit') {
      const equation = s(item, 'equation').replace(/[\u202F ]/g, '');
      const [lhs, rhs] = equation.split('=');
      const op = (lhs ?? '').includes('+') ? '+' : '−';
      const [left, right] = (lhs ?? '').split(op);
      const blankIn = (right ?? '').includes('?')
        ? 'second'
        : (left ?? '').includes('?')
          ? 'first'
          : 'result';
      expect(blankIn, where).toBe(tier === 1 ? 'result' : tier === 2 ? 'second' : 'first');
      expect(rhs, where).toBeDefined();
    }
    return;
  }
  // Plain add/sub skills: T1 no carries, T2 exactly one, T3 two carries (add) or a
  // borrow across a zero (sub).
  const isSub = item.story.key === 'subCalc';
  if (tier === 1) expect(carries, where).toBe(0);
  else if (tier === 2) expect(carries, where).toBe(1);
  else if (isSub) expect(oracleBorrowAcrossZero(p(item, 'a'), p(item, 'b')), where).toBe(true);
  else expect(carries, where).toBeGreaterThanOrEqual(2);
}

describe('arithmetic generators', () => {
  it('every skill generates a swept, oracle-checked item at every tier', () => {
    for (const id of ADD_SUB_SKILLS) {
      for (const tier of [1, 2, 3] as SkillTier[]) {
        for (let seed = 0; seed < 40; seed++) {
          const item = arithmeticItemForSkill(id, mulberry32(seed), tier);
          sweepArithmeticItem(item, id, tier, seed);
          const check = ORACLE[item.story.key];
          expect(check, `${id} story ${item.story.key}`).toBeDefined();
          check?.(item);
          tierCheck(id, item, tier);
        }
      }
    }
  });

  it('is deterministic per seed', () => {
    for (const id of ADD_SUB_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        expect(arithmeticItemForSkill(id, mulberry32(7), tier)).toEqual(
          arithmeticItemForSkill(id, mulberry32(7), tier),
        );
  });

  it('renders in the dialog at every tier (scene-free items always render)', () => {
    for (const id of ADD_SUB_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        expect(dialogRenderable(arithmeticItemForSkill(id, mulberry32(3), tier))).toBe(true);
  });

  it('a find-error item never shows a wrong result as true, nor a right one as false', () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = arithmeticItemForSkill('add-sub-find-error', mulberry32(seed), 2);
      const step = stepAt(item, 0);
      if (step.kind !== 'verdict') throw new Error('not a verdict');
      expect(verdictTruth(step)).toBe(step.answer);
    }
  });
});

/** Big-number word-problem contexts (le, 22/11, review of #51): a word problem with
 *  any number ≥ 1000 belongs to a warehouse, a library or a school — never to one
 *  child's marbles, sweets or fish. Small numbers keep the personal nouns. */
const WP_SKILLS = ['add-sub-1000-wp', 'add-sub-10000-wp', 'add-sub-100000-wp'] as const;
const BIG_MARKERS = ['Kho', 'Thư viện', 'Trường'];
const PERSONAL_NOUNS = ['viên bi', 'cái kẹo', 'bông hoa', 'quả táo', 'con cá'];

/** The numbers in a rendered story (SGK grouping spaces stripped first). */
function renderedNumbers(text: string): number[] {
  return text.replace(/[  ]/g, '').match(/\d+/g)?.map(Number) ?? [];
}

describe('arithmetic add/sub word-problem contexts', () => {
  it('a word problem with any number ≥ 1000 uses a big-number context, never a personal noun', () => {
    setLanguage('vi');
    for (const id of WP_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 40; seed++) {
          const item = arithmeticItemForSkill(id, mulberry32(seed), tier);
          const story = renderArithmeticPrompt(item.story);
          const hasBig = renderedNumbers(story).some((n) => n >= 1000);
          // The answers are numbers the child sees too: a big result needs the
          // big context even when every number printed in the story is small.
          const bigAnswer = stepValues(item).some((v) => v >= 1000);
          if (hasBig || bigAnswer) {
            expect(
              BIG_MARKERS.some((m) => story.includes(m)),
              `${story}: number ≥ 1000 without a big-number context`,
            ).toBe(true);
            for (const noun of PERSONAL_NOUNS)
              expect(story, `${story}: personal noun ${noun}`).not.toContain(noun);
          }
        }
  });

  it('a word problem with a personal noun shows only numbers < 1000', () => {
    setLanguage('vi');
    for (const id of WP_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 40; seed++) {
          const item = arithmeticItemForSkill(id, mulberry32(seed), tier);
          const story = renderArithmeticPrompt(item.story);
          if (PERSONAL_NOUNS.some((n) => story.includes(n))) {
            for (const n of renderedNumbers(story))
              expect(n, `${story}: personal noun with ${n} ≥ 1000`).toBeLessThan(1000);
            for (const v of stepValues(item))
              expect(v, `${story}: personal noun with answer ${v} ≥ 1000`).toBeLessThan(1000);
          }
        }
  });
});
