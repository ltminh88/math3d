// Format generators (boost, Phase 1A): the five new add/sub formats.
// RED-first: the generators do not exist yet.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { NumberScene } from '../numbers/numbers-scene-types';
import type { PracticeItem } from '../practice/practice-scene';
import type { ChoiceOption, ReasoningStep } from '../reasoning/reasoning-types';
import { bugsFor, bugValue } from './add-sub-bug-catalogue';
import { ADD_SUB_FORMAT_GENERATORS } from './add-sub-format-generators';
import {
  oracleAddCarries,
  oracleBorrowAcrossZero,
  oracleSubBorrows,
} from './arithmetic-test-oracles';
import { sweepArithmeticItem } from './arithmetic-test-sweep';
import { countAddCarries, countSubBorrows } from './carry-count';

const SKILLS = [
  'add-sub-bug-choice',
  'add-sub-10000-bug-choice',
  'add-sub-100000-bug-choice',
  'add-sub-true-false',
  'add-sub-compare-estimate',
  'add-sub-number-line',
  'add-sub-bar-model-wp',
] as const;

const CAP = 1000;

const generate = (
  skillId: (typeof SKILLS)[number],
  tier: SkillTier,
  seed: number,
): PracticeItem => {
  const gen = ADD_SUB_FORMAT_GENERATORS[skillId];
  if (!gen) throw new Error(`no generator for ${skillId}`);
  return gen(mulberry32(seed), tier) as PracticeItem;
};

const params = (item: ReturnType<typeof generate>) =>
  item.story.params as Record<string, number | string>;

const numOf = (option: ChoiceOption): number => {
  expect(option.label.key).toBe('num');
  const n = option.label.params?.n;
  if (typeof n !== 'number') throw new Error('option has no number label');
  return n;
};

const choiceStep = (
  item: ReturnType<typeof generate>,
  index = 0,
): ReasoningStep & {
  kind: 'choice';
} => {
  const step = item.steps[index];
  expect(step?.kind).toBe('choice');
  return step as ReasoningStep & { kind: 'choice' };
};

const nearest100 = (n: number): number => Math.round(n / 100) * 100;

/** The tier's ladder rule, re-derived from the operands (oracle-local). */
const ladderMatchesTier = (a: number, b: number, op: '+' | '−', tier: SkillTier): boolean => {
  if (op === '+') {
    const c = oracleAddCarries(a, b);
    return tier === 1 ? c === 0 : tier === 2 ? c === 1 : c >= 2;
  }
  const borrows = oracleSubBorrows(a, b);
  if (tier === 1) return borrows === 0;
  if (tier === 2) return borrows === 1;
  return borrows >= 2 || oracleBorrowAcrossZero(a, b);
};

describe('format generators sweep', () => {
  it.each(SKILLS)('%s sweeps clean at every tier', (skillId) => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        sweepArithmeticItem(generate(skillId, tier, seed), skillId, tier, seed);
      }
    }
  });

  it.each(SKILLS)('%s is deterministic per seed', (skillId) => {
    for (const tier of [1, 2, 3] as const) {
      const first = generate(skillId, tier, 7);
      expect(generate(skillId, tier, 7)).toEqual(first);
    }
  });
});

describe('add-sub-bug-choice', () => {
  it('offers the right answer plus bug-tagged wrong values, all distinct, ≤ 1 000', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate('add-sub-bug-choice', tier, seed);
        const p = params(item);
        const isAdd = item.story.key === 'addCalc';
        const op = isAdd ? '+' : '−';
        const a = p.a as number;
        const b = p.b as number;
        const correct = isAdd ? a + b : a - b;
        expect(ladderMatchesTier(a, b, op, tier)).toBe(true);
        const step = choiceStep(item);
        expect(step.options.length).toBe(4);
        const values = step.options.map(numOf);
        expect(new Set(values).size).toBe(4);
        for (const v of values) expect(v).toBeLessThanOrEqual(CAP);
        const right = step.options.filter((o) => o.correct);
        expect(right.length).toBe(1);
        expect(numOf(right[0] as ChoiceOption)).toBe(correct);
        for (const o of step.options) {
          if (o.misconception && o.misconception !== 'near-miss') {
            expect(numOf(o)).toBe(bugValue(o.misconception as never, a, b, op));
          }
        }
      }
    }
  });

  it('picks the pair from the normal distribution, then the bugs in it (R103.4)', () => {
    for (const tier of [1, 2, 3] as const) {
      let plus = 0;
      let mismatch = 0;
      const n = 200;
      for (let seed = 0; seed < n; seed++) {
        const item = generate('add-sub-bug-choice', tier, seed);
        const p = params(item);
        if (item.story.key === 'addCalc') plus++;
        if (String(p.a).length !== String(p.b).length) mismatch++;
      }
      // Near the natural rates (measured: + ~50%, mismatch ~33%): neither
      // all-subtraction at T2 nor all digit-mismatched pairs at T1.
      expect(plus / n).toBeGreaterThanOrEqual(0.3);
      expect(plus / n).toBeLessThanOrEqual(0.7);
      expect(mismatch / n).toBeGreaterThanOrEqual(0.1);
      expect(mismatch / n).toBeLessThanOrEqual(0.6);
    }
  });

  it('at tier 3 the three wrong options are usually bug values, not slips', () => {
    let bugTagged = 0;
    let total = 0;
    for (let seed = 0; seed < 100; seed++) {
      const step = choiceStep(generate('add-sub-bug-choice', 3, seed));
      for (const o of step.options) {
        if (o.correct) continue;
        total++;
        if (o.misconception && o.misconception !== 'near-miss') bugTagged++;
      }
    }
    expect(bugTagged / total).toBeGreaterThan(0.5);
  });
});

describe('add-sub bug-choice at range (Phase 3A)', () => {
  it.each([
    ['add-sub-10000-bug-choice', 10000],
    ['add-sub-100000-bug-choice', 100000],
  ] as const)('%s keeps operands and options within %s', (skillId, cap) => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate(skillId, tier, seed);
        const p = params(item);
        const isAdd = item.story.key === 'addCalc';
        const op = isAdd ? '+' : '−';
        const a = p.a as number;
        const b = p.b as number;
        const correct = isAdd ? a + b : a - b;
        expect(ladderMatchesTier(a, b, op, tier)).toBe(true);
        expect(correct).toBeLessThanOrEqual(cap);
        const step = choiceStep(item);
        expect(step.options.length).toBe(4);
        for (const v of step.options.map(numOf)) expect(v).toBeLessThanOrEqual(cap);
        expect(numOf(step.options.filter((o) => o.correct)[0] as ChoiceOption)).toBe(correct);
        for (const o of step.options) {
          if (o.misconception && o.misconception !== 'near-miss') {
            expect(numOf(o)).toBe(bugValue(o.misconception as never, a, b, op));
          }
        }
      }
    }
  });

  it('actually practises at the big range (not the 1 000 range in disguise)', () => {
    // Over 40 seeds at least one pair has an operand above 1 000.
    for (const skillId of ['add-sub-10000-bug-choice', 'add-sub-100000-bug-choice'] as const) {
      let big = 0;
      for (let seed = 0; seed < 40; seed++) {
        const p = params(generate(skillId, 1, seed));
        if ((p.a as number) > 1000 || (p.b as number) > 1000) big++;
      }
      expect(big).toBeGreaterThan(0);
    }
  });
});

describe('add-sub-true-false', () => {
  it('a false statement comes from a bug or a slip, and carries the fix', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate('add-sub-true-false', tier, seed);
        const p = params(item);
        const isAdd = item.story.key === 'errorAdd';
        const op = isAdd ? '+' : '−';
        const a = p.a as number;
        const b = p.b as number;
        const shown = p.shown as number;
        const correct = isAdd ? a + b : a - b;
        expect(ladderMatchesTier(a, b, op, tier)).toBe(true);
        const step = item.steps[0];
        expect(step?.kind).toBe('verdict');
        if (step?.kind !== 'verdict') continue;
        expect(step.statement.key).toBe('stmtEq');
        expect((step.statement.params as Record<string, number>).value).toBe(shown);
        if (step.answer) {
          expect(shown).toBe(correct);
        } else {
          expect(shown).not.toBe(correct);
          expect(step.fix?.answer).toBe(correct);
          const fromBug = bugsFor(a, b, op).some((f) => f.value === shown);
          const fromSlip = Math.abs(shown - correct) === 1 || Math.abs(shown - correct) === 10;
          expect(fromBug || fromSlip).toBe(true);
        }
      }
    }
  });
});

describe('add-sub-compare-estimate', () => {
  it('nearest-hundred: the right hundred is correct, the trap is a bug hundred', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate('add-sub-compare-estimate', tier, seed);
        if (item.story.key !== 'estimateCalc') continue;
        const p = params(item);
        const isAdd = (p.op as string) === '+';
        const op = isAdd ? '+' : '−';
        const a = p.a as number;
        const b = p.b as number;
        const correct = isAdd ? a + b : a - b;
        expect(ladderMatchesTier(a, b, op, tier)).toBe(true);
        const step = choiceStep(item);
        const values = step.options.map(numOf);
        for (const v of values) expect(v % 100).toBe(0);
        const right = step.options.filter((o) => o.correct);
        expect(right.length).toBe(1);
        expect(numOf(right[0] as ChoiceOption)).toBe(nearest100(correct));
        for (const o of step.options) {
          if (o.misconception && o.misconception !== 'near-miss') {
            expect(numOf(o)).toBe(nearest100(bugValue(o.misconception as never, a, b, op)));
          }
        }
      }
    }
  });

  it('sign comparison: the trap value is a bug value, "=" is tagged with its bug', () => {
    let seen = 0;
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate('add-sub-compare-estimate', tier, seed);
        if (item.story.key !== 'compareCalc') continue;
        seen++;
        const p = params(item);
        const isAdd = (p.op as string) === '+';
        const op = isAdd ? '+' : '−';
        const a = p.a as number;
        const b = p.b as number;
        const c = p.c as number;
        const correct = isAdd ? a + b : a - b;
        expect(ladderMatchesTier(a, b, op, tier)).toBe(true);
        const step = choiceStep(item);
        expect(step.options.length).toBe(3);
        const signOf = correct < c ? 'cmpLt' : correct === c ? 'cmpEq' : 'cmpGt';
        const right = step.options.filter((o) => o.correct);
        expect(right.length).toBe(1);
        expect((right[0] as ChoiceOption).label.key).toBe(signOf);
        const eq = step.options.find((o) => o.label.key === 'cmpEq') as ChoiceOption;
        if (bugsFor(a, b, op).some((f) => f.value === c)) {
          expect(eq.misconception).toBeDefined();
          expect(eq.misconception).not.toBe('near-miss');
          expect(bugValue(eq.misconception as never, a, b, op)).toBe(c);
        }
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe('add-sub-number-line', () => {
  it('the marks always increase left to right, even for subtraction (R103.1)', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate('add-sub-number-line', tier, seed);
        const scene = item.scene as Extract<NumberScene, { kind: 'number-line' }> | undefined;
        expect(scene?.kind).toBe('number-line');
        if (scene?.kind !== 'number-line') continue;
        const marks = scene.marks;
        for (let i = 1; i < marks.length; i++) {
          expect(marks[i] as number, `t${tier} #${seed}: ${marks}`).toBeGreaterThan(
            marks[i - 1] as number,
          );
        }
        // The jumps still run in jump order (right-to-left for subtraction).
        const jumps = scene.jumps ?? [];
        expect(jumps.length).toBeGreaterThan(0);
        const p = params(item);
        const start = p.start as number;
        expect(jumps[0]?.from).toBe(start);
        for (let i = 1; i < jumps.length; i++) {
          expect(jumps[i]?.from).toBe((jumps[i - 1]?.from ?? 0) + (jumps[i - 1]?.by ?? 0));
        }
      }
    }
  });

  it('the scene lands on the right answer and the options match the bugs', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate('add-sub-number-line', tier, seed);
        const p = params(item);
        const start = p.start as number;
        const jumps = (p.jumps as string).split(', ').map((s) => Number(s));
        const correct = start + jumps.reduce((sum, j) => sum + j, 0);
        expect(correct).toBeGreaterThanOrEqual(0);
        expect(correct).toBeLessThanOrEqual(CAP);
        const scene = item.scene as Extract<NumberScene, { kind: 'number-line' }> | undefined;
        expect(scene).toBeDefined();
        expect(scene?.kind).toBe('number-line');
        if (scene?.kind !== 'number-line') continue;
        const marks = scene.marks;
        // Marks increase left to right (R103.1): the first is the smaller of
        // start/correct, the last the larger; '?' sits on the landing.
        expect(marks[0]).toBe(Math.min(start, correct));
        expect(marks[marks.length - 1]).toBe(Math.max(start, correct));
        expect(scene.missing).toEqual([marks.indexOf(correct)]);
        expect(scene.jumps?.length).toBe(jumps.length);
        for (let i = 0; i < jumps.length; i++) {
          expect(scene.jumps?.[i]?.by).toBe(jumps[i]);
        }
        const step = choiceStep(item);
        const right = step.options.filter((o) => o.correct);
        expect(right.length).toBe(1);
        expect(numOf(right[0] as ChoiceOption)).toBe(correct);
        // The jumps decompose one add or sub of the pair (start, |sum|).
        const isAdd = (jumps[0] as number) >= 0;
        const op = isAdd ? '+' : '−';
        const b = Math.abs(jumps.reduce((sum, j) => sum + j, 0));
        expect(ladderMatchesTier(start, b, op, tier)).toBe(true);
        for (const o of step.options) {
          if (o.misconception && o.misconception !== 'near-miss') {
            expect(numOf(o)).toBe(bugValue(o.misconception as never, start, b, op));
          }
        }
      }
    }
  });
});

describe('add-sub-bar-model-wp', () => {
  it('the unknown-bar step names the bars, never their numbers (R103.3)', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 300; seed++) {
        const item = generate('add-sub-bar-model-wp', tier, seed);
        const barStep = choiceStep(item, 0);
        expect(barStep.options.length).toBe(3);
        const keys = barStep.options.map((o) => o.label.key);
        expect(new Set(keys).size).toBe(3);
        for (const o of barStep.options) {
          expect(['barPartHave', 'barPartAdded', 'barBoth']).toContain(o.label.key);
          for (const v of Object.values(o.label.params ?? {})) {
            expect(typeof v).not.toBe('number');
            expect(String(v)).not.toContain('?');
          }
        }
        // No degenerate pair: the two parts differ, the unknown part is > 0.
        const p = params(item);
        if (item.story.key === 'barModelPart') {
          expect((p.total as number) - (p.a as number)).toBeGreaterThan(0);
        } else {
          expect(p.a).not.toBe(p.b);
        }
      }
    }
  });

  it('three steps: unknown bar, then the operation, then the number pad', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate('add-sub-bar-model-wp', tier, seed);
        expect(item.steps.length).toBe(3);
        const p = params(item);
        const isPart = item.story.key === 'barModelPart';
        const barStep = choiceStep(item, 0);
        const opStep = choiceStep(item, 1);
        const numStep = item.steps[2];
        expect(numStep?.kind).toBe('number');
        if (numStep?.kind !== 'number') continue;
        const rightBar = barStep.options.find((o) => o.correct) as ChoiceOption;
        const rightOp = opStep.options.find((o) => o.correct) as ChoiceOption;
        const wrongOp = opStep.options.find((o) => !o.correct) as ChoiceOption;
        if (isPart) {
          const a = p.a as number;
          const total = p.total as number;
          expect(rightBar.label.key).toBe('barPartAdded');
          expect((rightOp.label.params as Record<string, string>).text).toBe('−');
          expect((wrongOp.label.params as Record<string, string>).text).toBe('+');
          expect(wrongOp.misconception).toBe('wrong-inverse');
          expect(numStep.answer).toBe(total - a);
          expect(ladderMatchesTier(total, a, '−', tier)).toBe(true);
        } else {
          const a = p.a as number;
          const b = p.b as number;
          expect(rightBar.label.key).toBe('barBoth');
          expect((rightOp.label.params as Record<string, string>).text).toBe('+');
          expect((wrongOp.label.params as Record<string, string>).text).toBe('−');
          expect(wrongOp.misconception).toBe('wrong-inverse');
          expect(numStep.answer).toBe(a + b);
          expect(ladderMatchesTier(a, b, '+', tier)).toBe(true);
        }
      }
    }
  });
});

describe('bug-value coverage', () => {
  it('bug-choice options use the catalogue, not invented numbers', () => {
    // Every bug-tagged option in a bug-choice item equals bugValue for its
    // tag (checked above); this test pins the catalogue import is live.
    expect(bugsFor(385, 247, '+').map((f) => f.value)).toEqual([522, 622, 532]);
    expect(countAddCarries(385, 247)).toBe(2);
    expect(countSubBorrows(403, 158)).toBe(2);
  });
});
