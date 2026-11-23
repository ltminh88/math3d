// Arithmetic generators (phase 11): mul/div 4-5 digit by 1 digit, mental round
// thousands, large word problems, chain operators. RED-first: the generators and
// the new string keys do not exist yet.
import { describe, expect, it } from 'vitest';
import { setLanguage } from '../i18n/i18n';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { dialogRenderable } from '../practice/item-for-skill';
import type { PracticeItem } from '../practice/practice-scene';
import { evalExpr } from '../reasoning/reasoning-test-oracles';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { ref } from './arithmetic-distractors';
import { arithmeticItemForSkill } from './arithmetic-item-for-skill';
import { renderArithmeticPrompt } from './arithmetic-strings';
import {
  allNumbers,
  oracleDivBySubtraction,
  oracleMulCarries,
  oracleZeroInQuotient,
  stepValues,
} from './arithmetic-test-oracles';
import { sweepArithmeticItem } from './arithmetic-test-sweep';

const LARGE_SKILLS = [
  'mul-4d-1d',
  'mul-thousands-mental',
  'div-4d-1d',
  'div-4d-1d-remainder',
  'div-thousands-mental',
  'mul-5d-1d',
  'div-5d-1d',
  'div-5d-1d-remainder',
  'mul-div-large-wp',
  'mul-chain-operators',
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

/** The digit tokens of a mental-calc / chain expr ("30 × 2 + 20" -> [30, 2, 20]). */
const exprNums = (i: PracticeItem): number[] =>
  s(i, 'expr')
    .split(' ')
    .filter((t) => /^\d+$/.test(t))
    .map(Number);

/** The three results of a compare story ("12345 × 2" expr params), in A/B/C order. */
const compareResults = (i: PracticeItem): [number, number, number] =>
  [s(i, 'expr1'), s(i, 'expr2'), s(i, 'expr3')].map((e) => evalExpr(e)) as [number, number, number];

/** Wrong product from "forgot the carry": each digit × b, mod 10 (oracle-local). */
function forgotCarryMul(a: number, b: number): number {
  const out: number[] = [];
  for (const d of String(a).split('').map(Number)) out.push((d * b) % 10);
  return Number(out.join(''));
}

/** Independent answers per story key, from the story params. */
function checkMulThenSub(i: PracticeItem): void {
  expect(values(i)).toEqual([p(i, 'per') * p(i, 'n'), p(i, 'per') * p(i, 'n') - p(i, 'c')]);
  expect(i.work).toEqual([p(i, 'per') * p(i, 'n')]);
}

function checkMoneyChange(i: PracticeItem): void {
  const total = p(i, 'per') * p(i, 'n');
  expect(values(i)).toEqual([total, p(i, 'paid') - total]);
  expect(p(i, 'paid') - total).toBeGreaterThan(0);
}

function checkCompare(i: PracticeItem): void {
  const [r1, r2, r3] = compareResults(i);
  expect(new Set([r1, r2, r3]).size).toBe(3);
  const step = stepAt(i, 0);
  if (step.kind !== 'choice') throw new Error('compare step is not a choice');
  const labels = step.options.map((o) => Number(o.label.params?.n));
  expect([...labels].sort((x, y) => x - y)).toEqual([r1, r2, r3].sort((x, y) => x - y));
  const want = step.prompt.key === 'askMaxResult' ? Math.max(r1, r2, r3) : Math.min(r1, r2, r3);
  const correct = step.options.filter((o) => o.correct);
  expect(correct.length).toBe(1);
  expect(Number(correct[0]?.label.params?.n)).toBe(want);
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
  mentalCalc: (i) => expect(last(i)).toBe(evalExpr(s(i, 'expr'))),
  chainCalc: (i) => expect(last(i)).toBe(evalExpr(s(i, 'expr'))),
  wpMulTimesRice: (i) => expect(last(i)).toBe(p(i, 'a') * p(i, 'b')),
  wpMulTimesBooks: (i) => expect(last(i)).toBe(p(i, 'a') * p(i, 'b')),
  wpMulTimesStudents: (i) => expect(last(i)).toBe(p(i, 'a') * p(i, 'b')),
  wpMulThenSubRice: checkMulThenSub,
  wpMulThenSubBooks: checkMulThenSub,
  wpMulThenSubSchool: checkMulThenSub,
  wpMoneyChange: checkMoneyChange,
  wpCompareLarge: checkCompare,
};

/** The largest number a phase-11 item may show at a tier. */
function rangeCheck(skillId: string, item: PracticeItem, tier: SkillTier): void {
  const fourDigit =
    skillId === 'mul-4d-1d' ||
    skillId === 'mul-thousands-mental' ||
    skillId === 'div-4d-1d' ||
    skillId === 'div-4d-1d-remainder' ||
    skillId === 'div-thousands-mental';
  const cap = fourDigit
    ? 10000
    : skillId === 'mul-div-large-wp' || skillId === 'mul-chain-operators'
      ? tier === 1
        ? 10000
        : 100000
      : 100000;
  for (const n of allNumbers(item))
    expect(n, `${skillId} t${tier}: ${n} > ${cap}`).toBeLessThanOrEqual(cap);
}

/** The tier's trap rule, per skill. */
function tierCheck(skillId: string, item: PracticeItem, tier: SkillTier): void {
  const where = `${skillId} t${tier}`;
  const key = item.story.key;
  if (skillId === 'mul-4d-1d' || skillId === 'mul-5d-1d') {
    const carries = oracleMulCarries(p(item, 'a'), p(item, 'b'));
    const cap = skillId === 'mul-4d-1d' ? 10000 : 100000;
    expect(p(item, 'a') * p(item, 'b'), where).toBeLessThan(cap);
    expect(p(item, 'a'), where).toBeGreaterThanOrEqual(cap === 10000 ? 1000 : 10000);
    if (tier === 1) expect(carries, where).toBe(0);
    else if (tier === 2) expect(carries, where).toBe(1);
    else
      expect(carries >= 2 || (carries >= 1 && String(p(item, 'a')).includes('0')), where).toBe(
        true,
      );
    return;
  }
  if (skillId === 'mul-thousands-mental') {
    const nums = exprNums(item);
    if (tier === 3) {
      expect(nums.length, where).toBe(3);
      return;
    }
    expect(nums.length, where).toBe(2);
    const [th, d] = nums as [number, number];
    expect(th % 1000, where).toBe(0);
    const product = (th / 1000) * d;
    if (tier === 1) expect(product, where).toBeLessThanOrEqual(5);
    else expect(product, where).toBeGreaterThanOrEqual(6);
    return;
  }
  if (skillId === 'div-4d-1d' || skillId === 'div-5d-1d') {
    const digits = skillId === 'div-4d-1d' ? 4 : 5;
    const a = p(item, 'a');
    const b = p(item, 'b');
    const q = oracleDivBySubtraction(a, b).q;
    const first = Math.floor(a / 10 ** (digits - 1));
    if (tier === 1) {
      expect(first % b, where).toBe(0);
      expect(q, where).toBeGreaterThanOrEqual(10 ** (digits - 1));
    } else if (tier === 2) {
      expect(first % b, where).not.toBe(0);
      expect(q, where).toBeLessThan(10 ** (digits - 1));
    } else {
      expect(oracleZeroInQuotient(q), where).toBe(true);
    }
    return;
  }
  if (skillId === 'div-4d-1d-remainder' || skillId === 'div-5d-1d-remainder') {
    const a = p(item, 'a');
    const b = p(item, 'b');
    const { q, r } = oracleDivBySubtraction(a, b);
    expect(values(item)).toEqual([q, r]);
    expect(r, where).toBeGreaterThan(0);
    expect(r, where).toBeLessThan(b);
    if (tier === 1) expect(b, where).toBeLessThanOrEqual(3);
    else if (tier === 2) {
      expect(b, where).toBeGreaterThanOrEqual(4);
      expect(b, where).toBeLessThanOrEqual(7);
    } else expect(oracleZeroInQuotient(q), where).toBe(true);
    return;
  }
  if (skillId === 'div-thousands-mental') {
    const nums = exprNums(item);
    if (tier === 3) {
      expect(nums.length, where).toBe(3);
      return;
    }
    expect(nums.length, where).toBe(2);
    const [th, d] = nums as [number, number];
    expect(th % 1000, where).toBe(0);
    expect((th / 1000) % d, where).toBe(0);
    const q = evalExpr(s(item, 'expr'));
    if (tier === 1) expect(q, where).toBe(1000);
    else expect([2000, 3000, 4000], where).toContain(q);
    return;
  }
  if (skillId === 'mul-div-large-wp') {
    if (tier === 3) {
      expect(['wpMoneyChange', 'wpCompareLarge'], where).toContain(key);
      return;
    }
    expect(key.startsWith('wpMulTimes') || key.startsWith('wpMulThenSub'), `${where}: ${key}`).toBe(
      true,
    );
    if (tier === 1) expect(Math.max(...allNumbers(item)), where).toBeLessThanOrEqual(10000);
    else expect(Math.max(...allNumbers(item)), where).toBeGreaterThan(10000);
    return;
  }
  if (skillId === 'mul-chain-operators') {
    const nums = exprNums(item);
    expect(nums.length, where).toBe(3);
    const expr = s(item, 'expr');
    if (tier === 1) {
      expect(expr, where).toContain('×');
      expect(expr.split(' ')[1], where).toBe('×');
      expect(expr, where).toContain('+');
    } else if (tier === 2) {
      expect(expr.split(' ')[1], where).toBe('×');
      expect(expr, where).toContain('−');
    } else {
      // T3: a + b × c — mul first. The trap is real: left-to-right differs.
      expect(expr.split(' ')[1], where).toBe('+');
      expect(expr, where).toContain('×');
      const [a, b, c] = nums as [number, number, number];
      expect((a + b) * (c as number), where).not.toBe(evalExpr(expr));
    }
    return;
  }
  throw new Error(`no tier rule for ${skillId}`);
}

describe('arithmetic mul/div large generators', () => {
  it('every skill generates a swept, oracle-checked item at every tier', () => {
    for (const id of LARGE_SKILLS) {
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
    for (const id of LARGE_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        expect(arithmeticItemForSkill(id, mulberry32(7), tier)).toEqual(
          arithmeticItemForSkill(id, mulberry32(7), tier),
        );
  });

  it('renders in the dialog at every tier (scene-free items always render)', () => {
    for (const id of LARGE_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[])
        expect(dialogRenderable(arithmeticItemForSkill(id, mulberry32(3), tier))).toBe(true);
  });

  it('a mul-4d-1d / mul-5d-1d find-error trap is real: the forgot-carry product differs', () => {
    for (const id of ['mul-4d-1d', 'mul-5d-1d'] as const)
      for (let seed = 0; seed < 40; seed++) {
        const item = arithmeticItemForSkill(id, mulberry32(seed), 3);
        expect(forgotCarryMul(p(item, 'a'), p(item, 'b'))).not.toBe(p(item, 'a') * p(item, 'b'));
      }
  });
});

/** Big-number word-problem contexts (le, 22/11): counts ≥ 1000 belong to a warehouse,
 *  a library or a school — never to one child's marbles or sweets. Money amounts are
 *  prices in đồng, not counts, so the money-change story is exempt from the marker
 *  check (it must say "đồng" instead). */
const BIG_MARKERS = ['Kho', 'Thư viện', 'Trường'];
const PERSONAL_NOUNS = ['viên bi', 'cái kẹo', 'bông hoa', 'quả táo', 'con cá'];

/** The numbers in a rendered story (SGK grouping spaces stripped first). */
function renderedNumbers(text: string): number[] {
  return (
    text
      .replace(/[\u202F ]/g, '')
      .match(/\d+/g)
      ?.map(Number) ?? []
  );
}

describe('arithmetic mul/div large word-problem contexts', () => {
  it('large word problems use a big-number context, never a personal noun', () => {
    setLanguage('vi');
    for (const tier of [1, 2, 3] as SkillTier[])
      for (let seed = 0; seed < 40; seed++) {
        const item = arithmeticItemForSkill('mul-div-large-wp', mulberry32(seed), tier);
        if (item.story.key === 'wpMoneyChange' || item.story.key === 'wpCompareLarge') continue;
        const story = renderArithmeticPrompt(item.story);
        expect(
          BIG_MARKERS.some((m) => story.includes(m)),
          `${story}: no big-number context`,
        ).toBe(true);
        for (const noun of PERSONAL_NOUNS)
          expect(story, `${story}: personal noun ${noun}`).not.toContain(noun);
      }
  });

  it('a two-step word problem asks in step 1 how much was bought / spent in all — never "Sau lần mua thứ nhất" (that phrase is only for stories with ≥ 2 purchases)', () => {
    setLanguage('vi');
    for (const tier of [1, 2, 3] as SkillTier[])
      for (let seed = 0; seed < 40; seed++) {
        const item = arithmeticItemForSkill('mul-div-large-wp', mulberry32(seed), tier);
        if (item.steps.length !== 2) continue;
        const first = renderArithmeticPrompt(stepAt(item, 0).prompt);
        expect(first, `step 1: ${first}`).toMatch(/tất cả/);
        expect(first, `step 1: ${first}`).not.toContain('Sau lần mua thứ nhất');
      }
  });

  it('any word-problem count ≥ 1000 comes with a big-number context (money prices exempt)', () => {
    setLanguage('vi');
    for (const tier of [1, 2, 3] as SkillTier[])
      for (let seed = 0; seed < 40; seed++) {
        const item = arithmeticItemForSkill('mul-div-large-wp', mulberry32(seed), tier);
        if (item.story.key === 'wpMoneyChange' || item.story.key === 'wpCompareLarge') continue;
        const story = renderArithmeticPrompt(item.story);
        if (renderedNumbers(story).some((n) => n >= 1000))
          expect(
            BIG_MARKERS.some((m) => story.includes(m)),
            `${story}: number ≥ 1000 without a big-number context`,
          ).toBe(true);
      }
  });

  it('the money-change story is about đồng, with a round amount handed over', () => {
    setLanguage('vi');
    for (let seed = 0; seed < 200; seed++) {
      const item = arithmeticItemForSkill('mul-div-large-wp', mulberry32(seed), 3);
      if (item.story.key !== 'wpMoneyChange') continue;
      const story = renderArithmeticPrompt(item.story);
      expect(story, `story: ${story}`).toContain('đồng');
      expect(p(item, 'paid') % 10000, `paid: ${p(item, 'paid')}`).toBe(0);
      expect(p(item, 'paid'), `paid: ${p(item, 'paid')}`).toBeLessThanOrEqual(100000);
    }
  });

  it('the money-change story renders every item noun — no raw i: key leaks into the text', () => {
    setLanguage('vi');
    let sawMoney = false;
    for (let seed = 0; seed < 200; seed++) {
      const item = arithmeticItemForSkill('mul-div-large-wp', mulberry32(seed), 3);
      if (item.story.key !== 'wpMoneyChange') continue;
      sawMoney = true;
      const story = renderArithmeticPrompt(item.story);
      expect(story, `story: ${story}`).not.toContain('arithmetic.item_');
      expect(story, `story: ${story}`).not.toContain('i:');
    }
    expect(sawMoney).toBe(true);
  });

  it('the English money-change story says "Each one costs", never "Each notebooks costs"', () => {
    setLanguage('en');
    for (const item of ['i:notebook', 'i:pen', 'i:cake', 'i:book']) {
      const story = renderArithmeticPrompt(
        ref('wpMoneyChange', { name: 'An', item, paid: 50000, n: 2, per: 3000 }),
      );
      expect(story, `story: ${story}`).toContain('Each one costs');
      for (const bad of ['notebooks costs', 'pens costs', 'cakes costs', 'books costs']) {
        expect(story, `story: ${story}`).not.toContain(bad);
      }
    }
  });
});
