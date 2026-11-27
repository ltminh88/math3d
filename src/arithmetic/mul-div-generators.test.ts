// Arithmetic generators (phase 10): mul/div 2-3 digit by 1 digit, exact answers per
// story key, tier constraints (carries / zero-in-quotient / divisor size), ranges,
// deterministic per seed. RED-first: the mul/div generators and the new strings keys
// do not exist yet.
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
  allNumbers,
  oracleDivBySubtraction,
  oracleMulCarries,
  oracleSubBorrows,
  oracleZeroInQuotient,
  stepValues,
  verdictTruth,
} from './arithmetic-test-oracles';
import { sweepArithmeticItem } from './arithmetic-test-sweep';

const MUL_DIV_SKILLS = [
  'mul-2d-1d',
  'mul-tens-mental',
  'mul-2d-1d-wp',
  'div-2d-1d',
  'div-2d-1d-remainder',
  'div-tens-mental',
  'div-2d-1d-wp',
  'mul-3d-1d',
  'mul-hundreds-mental',
  'mul-3d-1d-wp',
  'div-3d-1d',
  'div-3d-1d-remainder',
  'div-hundreds-mental',
  'div-reduce-times',
  'mul-div-find-error',
] as const;

const p = (i: PracticeItem, k: string): number => Number(i.story.params?.[k]);
const s = (i: PracticeItem, k: string): string => String(i.story.params?.[k]);
const values = (i: PracticeItem): number[] => stepValues(i);
const last = (i: PracticeItem): number | undefined => values(i).at(-1);
const ceilDiv = (a: number, b: number): number => Math.ceil(a / b);

const stepAt = (i: PracticeItem, idx: number): ReasoningStep => {
  const step = i.steps[idx];
  if (!step) throw new Error(`missing step ${idx}`);
  return step;
};

/** The digit tokens of a mental-calc expr ("30 × 2 + 20" -> [30, 2, 20]). */
const exprNums = (i: PracticeItem): number[] =>
  s(i, 'expr')
    .split(' ')
    .filter((t) => /^\d+$/.test(t))
    .map(Number);

/** The missing number of a □ expr ("20 × □ = 60" -> 3, "□ : 3 = 20" -> 60). */
function missingValue(expr: string): number {
  const [left, right] = expr.split(' = ');
  const result = Number(right);
  const [x, op, y] = (left ?? '').split(' ');
  if (x === '□') return op === '×' ? result / Number(y) : result * Number(y);
  return op === '×' ? result / Number(x) : Number(x) / result;
}

/** The (a, b) pair behind a □ mental expr, solved from the visible numbers. */
function missingPair(item: PracticeItem, op: '×' | ':'): [number, number] {
  const expr = s(item, 'expr');
  const [left, right] = expr.split(' = ');
  const result = Number(right);
  const [x, o, y] = (left ?? '').split(' ');
  if (o !== op) throw new Error(`expected ${op} in ${expr}`);
  if (x === '□') {
    const other = Number(y);
    return op === '×' ? [result / other, other] : [result * other, other];
  }
  const first = Number(x);
  return op === '×' ? [first, result / first] : [first, first / result];
}
function forgotCarryMul(a: number, b: number): number {
  const out: number[] = [];
  for (const d of String(a).split('').map(Number)) out.push((d * b) % 10);
  return Number(out.join(''));
}

/** A find-error item: the statement's truth is the answer; a false claim carries the fix. */
function checkError(i: PracticeItem, op: '×' | ':'): void {
  const correct =
    op === '×' ? p(i, 'a') * p(i, 'b') : oracleDivBySubtraction(p(i, 'a'), p(i, 'b')).q;
  const step = stepAt(i, 0);
  if (step.kind !== 'verdict') throw new Error('find-error step is not a verdict');
  expect(verdictTruth(step)).toBe(step.answer);
  if (step.answer) {
    expect(p(i, 'shown')).toBe(correct);
    if (op === ':') expect(p(i, 'a') % p(i, 'b')).toBe(0);
  } else {
    expect(p(i, 'shown')).not.toBe(correct);
    expect(step.fix?.answer).toBe(correct);
  }
}

/** Independent answers per story key, from the story params. */
function checkMulTimes(i: PracticeItem): void {
  expect(last(i)).toBe(p(i, 'a') * p(i, 'b'));
}

function checkMulThenSub(i: PracticeItem): void {
  expect(values(i)).toEqual([p(i, 'per') * p(i, 'n'), p(i, 'per') * p(i, 'n') - p(i, 'c')]);
  expect(i.work).toEqual([p(i, 'per') * p(i, 'n')]);
}

const ORACLE: Record<string, (i: PracticeItem) => void> = {
  mulCalc: (i) => expect(last(i)).toBe(p(i, 'a') * p(i, 'b')),
  divCalc: (i) => {
    const { q, r } = oracleDivBySubtraction(p(i, 'a'), p(i, 'b'));
    expect(r).toBe(0);
    expect(last(i)).toBe(q);
  },
  divRemainderCalc: (i) => {
    const { q, r } = oracleDivBySubtraction(p(i, 'a'), p(i, 'b'));
    expect(r).toBeGreaterThan(0);
    expect(values(i)).toEqual([q, r]);
  },
  mentalCalc: (i) => {
    const expr = s(i, 'expr');
    if (expr.includes('□')) {
      const missing = missingValue(expr);
      expect(Number.isInteger(missing)).toBe(true);
      expect(last(i)).toBe(missing);
      if (stepAt(i, 0).prompt.key === 'askMissingDigit') expect(missing).toBeLessThan(10);
      return;
    }
    expect(last(i)).toBe(evalExpr(expr));
  },
  wpMulGroups: (i) => expect(last(i)).toBe(p(i, 'per') * p(i, 'n')),
  wpMulTimesRice: checkMulTimes,
  wpMulTimesBooks: checkMulTimes,
  wpMulTimesStudents: checkMulTimes,
  wpMulThenSubRice: checkMulThenSub,
  wpMulThenSubBooks: checkMulThenSub,
  wpMulThenSubSchool: checkMulThenSub,
  wpDivShare: (i) => {
    const { q, r } = oracleDivBySubtraction(p(i, 'a'), p(i, 'b'));
    expect(r).toBe(0);
    expect(last(i)).toBe(q);
  },
  wpDivBoxes: (i) => {
    const { q, r } = oracleDivBySubtraction(p(i, 'a'), p(i, 'b'));
    expect(r).toBeGreaterThan(0);
    if (i.steps.length === 1) expect(last(i)).toBe(ceilDiv(p(i, 'a'), p(i, 'b')));
    else {
      // T3, three steps in order: full boxes, leftover, boxes needed to hold them all.
      expect(values(i)).toEqual([q, r, ceilDiv(p(i, 'a'), p(i, 'b'))]);
      expect(i.work).toEqual([q, r]);
    }
  },
  wpReduceTimes: (i) => {
    const { q, r } = oracleDivBySubtraction(p(i, 'a'), p(i, 'b'));
    expect(r).toBe(0);
    expect(last(i)).toBe(q);
  },
  errorMul: (i) => checkError(i, '×'),
  errorDiv: (i) => checkError(i, ':'),
};

/** The largest number a phase-10 item may show (2-digit skills ≤ 99, 3-digit ≤ 999). */
function rangeCheck(skillId: string, item: PracticeItem, tier: SkillTier): void {
  const twoDigit =
    skillId.startsWith('mul-2d') ||
    skillId.startsWith('div-2d') ||
    skillId === 'mul-tens-mental' ||
    skillId === 'div-tens-mental';
  const cap = skillId === 'mul-div-find-error' ? (tier === 1 ? 99 : 999) : twoDigit ? 99 : 999;
  for (const n of allNumbers(item))
    expect(n, `${skillId} t${tier}: ${n} > ${cap}`).toBeLessThanOrEqual(cap);
}

/** The tier's trap rule, per skill. */
function tierCheck(skillId: string, item: PracticeItem, tier: SkillTier): void {
  const where = `${skillId} t${tier}`;
  const key = item.story.key;
  if (skillId === 'mul-2d-1d' || skillId === 'mul-2d-1d-wp') {
    let a: number;
    let b: number;
    if (key === 'mentalCalc') {
      [a, b] = missingPair(item, '×');
    } else {
      a = key === 'wpMulGroups' ? p(item, 'per') : p(item, 'a');
      b = key === 'wpMulGroups' ? p(item, 'n') : p(item, 'b');
    }
    const ones = (a % 10) * b;
    if (tier === 1) expect(ones, where).toBeLessThan(10);
    else if (tier === 2) {
      expect(ones, where).toBeGreaterThanOrEqual(10);
      expect(ones, where).toBeLessThan(20);
    } else expect(ones, where).toBeGreaterThanOrEqual(20);
    return;
  }
  if (skillId === 'mul-tens-mental') {
    if (key === 'errorMul') {
      // T3 verdict: a round ten × a digit, product ≤ 99 (skill cap).
      const a = p(item, 'a');
      const b = p(item, 'b');
      expect(a % 10, where).toBe(0);
      expect((a / 10) * b, where).toBeLessThanOrEqual(9);
      return;
    }
    if (s(item, 'expr').includes('□')) {
      const [a, b] = missingPair(item, '×');
      expect(a % 10, where).toBe(0);
      expect(a / 10, where).toBeLessThanOrEqual(9);
      expect(b, where).toBeLessThanOrEqual(9);
      expect((a / 10) * b, where).toBeLessThanOrEqual(9);
      return;
    }
    const nums = exprNums(item);
    if (tier === 3) {
      expect(nums.length, where).toBe(3);
      return;
    }
    expect(nums.length, where).toBe(2);
    const [tens, d] = nums as [number, number];
    expect(tens % 10, where).toBe(0);
    expect((tens / 10) * d, where).toBeLessThanOrEqual(9);
    if (tier === 1) {
      expect(tens / 10, where).toBeLessThanOrEqual(5);
      expect(d, where).toBeLessThanOrEqual(5);
    }
    return;
  }
  if (skillId === 'mul-hundreds-mental') {
    if (key === 'errorMul') {
      const a = p(item, 'a');
      const b = p(item, 'b');
      expect(a % 100, where).toBe(0);
      expect((a / 100) * b, where).toBeLessThanOrEqual(9);
      return;
    }
    if (s(item, 'expr').includes('□')) {
      const [a, b] = missingPair(item, '×');
      expect(a % 100, where).toBe(0);
      expect(a / 100, where).toBeLessThanOrEqual(9);
      expect(b, where).toBeLessThanOrEqual(9);
      expect((a / 100) * b, where).toBeLessThanOrEqual(9);
      return;
    }
    const nums = exprNums(item);
    if (tier === 3) {
      expect(nums.length, where).toBe(3);
      return;
    }
    expect(nums.length, where).toBe(2);
    const [h, d] = nums as [number, number];
    expect(h % 100, where).toBe(0);
    expect((h / 100) * d, where).toBeLessThanOrEqual(9);
    if (tier === 1) {
      expect(h / 100, where).toBeLessThanOrEqual(4);
      expect(d, where).toBeLessThanOrEqual(4);
    }
    return;
  }
  if (skillId === 'div-tens-mental') {
    if (key === 'errorDiv') {
      const a = p(item, 'a');
      const b = p(item, 'b');
      expect(a % 10, where).toBe(0);
      expect(a % b, where).toBe(0);
      expect(a / b, where).toBeLessThanOrEqual(40);
      return;
    }
    if (s(item, 'expr').includes('□')) {
      const [a, b] = missingPair(item, ':');
      expect(a % 10, where).toBe(0);
      expect(a % b, where).toBe(0);
      expect(a / b, where).toBeLessThanOrEqual(40);
      return;
    }
    const nums = exprNums(item);
    if (tier === 3) {
      expect(nums.length, where).toBe(3);
      return;
    }
    expect(nums.length, where).toBe(2);
    const [tens, d] = nums as [number, number];
    expect(tens % 10, where).toBe(0);
    expect((tens / 10) % d, where).toBe(0);
    expect(evalExpr(s(item, 'expr')), where).toBeLessThanOrEqual(40);
    return;
  }
  if (skillId === 'div-hundreds-mental') {
    if (key === 'errorDiv') {
      const a = p(item, 'a');
      const b = p(item, 'b');
      expect(a % 100, where).toBe(0);
      expect(a % b, where).toBe(0);
      expect(a / b, where).toBeLessThanOrEqual(400);
      return;
    }
    if (s(item, 'expr').includes('□')) {
      const [a, b] = missingPair(item, ':');
      expect(a % 100, where).toBe(0);
      expect(a % b, where).toBe(0);
      expect(a / b, where).toBeLessThanOrEqual(400);
      return;
    }
    const nums = exprNums(item);
    if (tier === 3) {
      expect(nums.length, where).toBe(3);
      return;
    }
    expect(nums.length, where).toBe(2);
    const [h, d] = nums as [number, number];
    expect(h % 100, where).toBe(0);
    expect((h / 100) % d, where).toBe(0);
    expect(evalExpr(s(item, 'expr')), where).toBeLessThanOrEqual(400);
    return;
  }
  if (skillId === 'mul-3d-1d') {
    const carries = oracleMulCarries(p(item, 'a'), p(item, 'b'));
    if (tier === 1) expect(carries, where).toBe(0);
    else if (tier === 2) expect(carries, where).toBe(1);
    else
      expect(carries >= 2 || (carries >= 1 && String(p(item, 'a')).includes('0')), where).toBe(
        true,
      );
    return;
  }
  if (skillId === 'mul-3d-1d-wp') {
    if (key.startsWith('wpMulThenSub')) {
      const total =
        oracleMulCarries(p(item, 'per'), p(item, 'n')) +
        oracleSubBorrows(p(item, 'per') * p(item, 'n'), p(item, 'c'));
      if (tier === 2) expect(total, where).toBe(0);
      else expect(total, where).toBeGreaterThanOrEqual(1);
      return;
    }
    const carries = oracleMulCarries(p(item, 'a'), p(item, 'b'));
    if (tier === 1) expect(carries, where).toBe(0);
    else if (tier === 2) expect(carries, where).toBe(1);
    else
      expect(carries >= 2 || (carries === 1 && String(p(item, 'a')).includes('0')), where).toBe(
        true,
      );
    return;
  }
  if (skillId === 'div-2d-1d') {
    let a: number;
    let b: number;
    if (key === 'mentalCalc') {
      [a, b] = missingPair(item, ':');
    } else {
      a = p(item, 'a');
      b = p(item, 'b');
    }
    const q = oracleDivBySubtraction(a, b).q;
    if (tier === 1) {
      expect(Math.floor(a / 10) % b, where).toBe(0);
      expect(q, where).toBeGreaterThanOrEqual(10);
    } else if (tier === 2) {
      expect(Math.floor(a / 10) % b, where).not.toBe(0);
      expect(q, where).toBeGreaterThanOrEqual(10);
    } else {
      expect(b, where).toBeGreaterThanOrEqual(7);
    }
    return;
  }
  if (skillId === 'div-2d-1d-remainder' || skillId === 'div-3d-1d-remainder') {
    const a = p(item, 'a');
    const b = p(item, 'b');
    const { q, r } = oracleDivBySubtraction(a, b);
    expect(values(item)).toEqual([q, r]);
    expect(r, where).toBeGreaterThan(0);
    expect(r, where).toBeLessThan(b);
    if (skillId === 'div-2d-1d-remainder') {
      if (tier === 1) expect(b, where).toBeLessThanOrEqual(3);
      else if (tier === 2) {
        expect(b, where).toBeGreaterThanOrEqual(4);
        expect(b, where).toBeLessThanOrEqual(7);
      } else expect(b, where).toBeGreaterThanOrEqual(8);
    } else if (tier === 3) {
      expect(oracleZeroInQuotient(q), where).toBe(true);
    } else if (tier === 1) {
      expect(b, where).toBeLessThanOrEqual(3);
    } else {
      expect(b, where).toBeGreaterThanOrEqual(4);
      expect(b, where).toBeLessThanOrEqual(7);
    }
    return;
  }
  if (skillId === 'div-2d-1d-wp') {
    if (tier === 1) expect(key, where).toBe('wpDivShare');
    else if (tier === 2) {
      expect(key, where).toBe('wpDivBoxes');
      expect(item.steps.length, where).toBe(1);
    } else {
      expect(key, where).toBe('wpDivBoxes');
      expect(item.steps.length, where).toBe(3);
    }
    return;
  }
  if (skillId === 'div-3d-1d') {
    const a = p(item, 'a');
    const b = p(item, 'b');
    const q = oracleDivBySubtraction(a, b).q;
    if (tier === 1) {
      expect(Math.floor(a / 100) % b, where).toBe(0);
      expect(q, where).toBeGreaterThanOrEqual(100);
    } else if (tier === 2) {
      expect(Math.floor(a / 100) % b, where).not.toBe(0);
      expect(q, where).toBeLessThan(100);
    } else {
      expect(oracleZeroInQuotient(q), where).toBe(true);
    }
    return;
  }
  if (skillId === 'div-reduce-times') {
    const a = p(item, 'a');
    const b = p(item, 'b');
    const q = oracleDivBySubtraction(a, b).q;
    if (tier === 1) expect(a % 100, where).toBe(0);
    else if (tier === 2) {
      expect(a, where).toBeGreaterThanOrEqual(100);
      expect(oracleZeroInQuotient(q), where).toBe(false);
    } else {
      expect(oracleZeroInQuotient(q), where).toBe(true);
    }
    return;
  }
  if (skillId === 'mul-div-find-error') {
    const a = p(item, 'a');
    const b = p(item, 'b');
    if (tier === 1) {
      expect(a, where).toBeLessThan(100);
    } else if (tier === 2) {
      expect(a, where).toBeGreaterThanOrEqual(100);
    } else if (key === 'errorDiv') {
      expect(oracleZeroInQuotient(oracleDivBySubtraction(a, b).q), where).toBe(true);
    } else {
      expect(oracleMulCarries(a, b), where).toBeGreaterThanOrEqual(1);
      expect(forgotCarryMul(a, b), where).not.toBe(a * b);
    }
    return;
  }
  throw new Error(`no tier rule for ${skillId}`);
}

describe('arithmetic mul/div generators', () => {
  it('every skill generates a swept, oracle-checked item at every tier', () => {
    for (const id of MUL_DIV_SKILLS) {
      for (const tier of [1, 2, 3] as SkillTier[]) {
        for (let seed = 0; seed < 40; seed++) {
          const item = arithmeticItemForSkill(id, mulberry32(seed), tier);
          sweepArithmeticItem(item, id, tier, seed);
          rangeCheck(id, item, tier);
          const check = ORACLE[item.story.key];
          expect(check, `${id} story ${item.story.key}`).toBeDefined();
          check?.(item);
          tierCheck(id, item, tier);
        }
      }
    }
  });

  it('is deterministic per seed', () => {
    for (const id of MUL_DIV_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        expect(arithmeticItemForSkill(id, mulberry32(7), tier)).toEqual(
          arithmeticItemForSkill(id, mulberry32(7), tier),
        );
  });

  it('renders in the dialog at every tier (scene-free items always render)', () => {
    for (const id of MUL_DIV_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        expect(dialogRenderable(arithmeticItemForSkill(id, mulberry32(3), tier))).toBe(true);
  });

  it('a mul-div find-error item never shows a wrong result as true, nor a right one as false', () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = arithmeticItemForSkill('mul-div-find-error', mulberry32(seed), 2);
      const step = stepAt(item, 0);
      if (step.kind !== 'verdict') throw new Error('not a verdict');
      expect(verdictTruth(step)).toBe(step.answer);
    }
  });
});

/** Big-number word-problem contexts (le, 22/11): counts in the hundreds belong to a
 *  warehouse, a library or a school — never to one child's marbles or sweets. Small
 *  counts (≤ 99) keep the personal nouns. */
const BIG_MARKERS = ['Kho', 'Thư viện', 'Trường'];
const PERSONAL_NOUNS = [
  'viên bi',
  'cái kẹo',
  'bông hoa',
  'quả táo',
  'con cá',
  'quả cam',
  'quả bóng',
  'quyển vở',
  'cây bút chì',
  'cái bánh',
  'quả chuối',
  'quả xoài',
  'con gà',
  'cục tẩy',
  'bút sáp',
];
const ALL_NOUNS = [...PERSONAL_NOUNS, 'quyển sách'];

/** The numbers in a rendered story (SGK grouping spaces stripped first). */
function renderedNumbers(text: string): number[] {
  return text.replace(/[  ]/g, '').match(/\d+/g)?.map(Number) ?? [];
}

describe('arithmetic mul/div word-problem contexts', () => {
  it('3-digit word problems use a big-number context, never a personal noun', () => {
    setLanguage('vi');
    for (const tier of [1, 2, 3] as SkillTier[])
      for (let seed = 0; seed < 40; seed++) {
        const item = arithmeticItemForSkill('mul-3d-1d-wp', mulberry32(seed), tier);
        const story = renderArithmeticPrompt(item.story);
        expect(
          BIG_MARKERS.some((m) => story.includes(m)),
          `${story}: no big-number context`,
        ).toBe(true);
        for (const noun of PERSONAL_NOUNS)
          expect(story, `${story}: personal noun ${noun}`).not.toContain(noun);
      }
  });

  it('a two-step word problem asks in step 1 how much was bought in all — never "Sau lần mua thứ nhất" (that phrase is only for stories with ≥ 2 purchases, and phase 10 has none)', () => {
    setLanguage('vi');
    for (const tier of [1, 2, 3] as SkillTier[])
      for (let seed = 0; seed < 40; seed++) {
        const item = arithmeticItemForSkill('mul-3d-1d-wp', mulberry32(seed), tier);
        if (item.steps.length !== 2) continue;
        const first = renderArithmeticPrompt(stepAt(item, 0).prompt);
        expect(first, `step 1: ${first}`).toContain('mua về tất cả');
        expect(first, `step 1: ${first}`).not.toContain('Sau lần mua thứ nhất');
      }
  });

  it('2-digit word problems keep the small personal contexts', () => {
    setLanguage('vi');
    for (const id of ['mul-2d-1d-wp', 'div-2d-1d-wp'] as const)
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 40; seed++) {
          const story = renderArithmeticPrompt(
            arithmeticItemForSkill(id, mulberry32(seed), tier).story,
          );
          expect(
            ALL_NOUNS.some((n) => story.includes(n)),
            `${story}: no personal noun`,
          ).toBe(true);
        }
  });

  it('any word-problem number ≥ 1000 comes with a big-number context', () => {
    setLanguage('vi');
    for (const id of ['mul-2d-1d-wp', 'mul-3d-1d-wp', 'div-2d-1d-wp'] as const)
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 40; seed++) {
          const story = renderArithmeticPrompt(
            arithmeticItemForSkill(id, mulberry32(seed), tier).story,
          );
          if (renderedNumbers(story).some((n) => n >= 1000))
            expect(
              BIG_MARKERS.some((m) => story.includes(m)),
              `${story}: number ≥ 1000 without a big-number context`,
            ).toBe(true);
        }
  });

  it('div-2d-1d-wp T3 asks full boxes, then the leftover, then the boxes needed (đầy → dư → cần ít nhất)', () => {
    setLanguage('vi');
    for (let seed = 0; seed < 40; seed++) {
      const item = arithmeticItemForSkill('div-2d-1d-wp', mulberry32(seed), 3);
      expect(item.steps.length).toBe(3);
      const a = p(item, 'a');
      const b = p(item, 'b');
      const [q, r, boxes] = values(item) as [number, number, number];
      expect(q, `full boxes: ${a} : ${b}`).toBe(Math.floor(a / b));
      expect(r, `leftover: ${a} : ${b}`).toBe(a - q * b);
      expect(r).toBeGreaterThan(0);
      expect(boxes, `boxes needed: ${a} : ${b}`).toBe(q + 1);
      expect(q * b + r).toBe(a);
      const prompts = item.steps.map((st) =>
        st.kind === 'number' ? renderArithmeticPrompt(st.prompt) : '',
      );
      expect(prompts[0], `step 1: ${prompts[0]}`).toContain('đầy');
      expect(prompts[1], `step 2: ${prompts[1]}`).toContain('dư');
      expect(prompts[2], `step 3: ${prompts[2]}`).toContain('ít nhất');
    }
  });

  it('a reduce-times item never says "còn lại" (giảm n lần = chia n, not what is left)', () => {
    setLanguage('vi');
    for (const tier of [1, 2, 3] as SkillTier[])
      for (let seed = 0; seed < 40; seed++) {
        const item = arithmeticItemForSkill('div-reduce-times', mulberry32(seed), tier);
        const story = renderArithmeticPrompt(item.story);
        const step = renderArithmeticPrompt(stepAt(item, 0).prompt);
        expect(story, `story: ${story}`).toContain('được bao nhiêu');
        expect(story, `story: ${story}`).not.toContain('còn lại');
        expect(step, `step: ${step}`).not.toContain('còn lại');
      }
  });
});
