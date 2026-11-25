// R35 lane 3 — group 9 (add/sub with carrying/borrowing): the matcher re-derives
// the carry column from the operands, so the tests assert the rendered place name
// ("chục", "đơn vị") via renderNumbersPrompt — and assert the guard that an
// off-by-ten with no carry in the operation falls back instead of naming a column.
import { describe, expect, test } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { renderNumbersPrompt } from '../numbers/numbers-strings';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { itemForSkill } from './item-for-skill';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const carryItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: ReasoningStep[],
  work: number[] = [],
): PracticeItem => ({ skillId, tier, story, steps, work });

const num = (key: string, answer: number, params?: PromptRef['params']): ReasoningStep => ({
  kind: 'number',
  prompt: params ? { key, params } : { key },
  answer,
});
const explain = (it: PracticeItem, stepIndex: number, answer: StepAnswer) =>
  explainWrongAnswer({
    skillId: it.skillId,
    tier: it.tier,
    item: it,
    stepIndex,
    answer,
    missNumber: 1,
  });
const place = (p: string): string => renderNumbersPrompt({ key: `item_${p}` });

describe('explainWrongAnswer — group 9 carry', () => {
  test('plain add: carry pattern / wrong operation / check-form / fallback', () => {
    // 47 + 28 = 75; forgetting the carry gives 65.
    const it = carryItem('add-sub-1000', 2, { key: 'addCalc', params: { a: 47, b: 28 } }, [
      num('askSum', 75),
    ]);
    expect(explain(it, 0, 65)).toEqual({ key: 'carryCheckAdd', params: { col: place('tens') } });
    expect(explain(it, 0, 19)).toEqual({ key: 'carryWrongOpAdd', params: { a: 47, b: 28 } });
    expect(explain(it, 0, 85)).toEqual({ key: 'carryCheckAdd', params: { col: place('tens') } });
    expect(explain(it, 0, 70)).toEqual({
      key: 'carryFallback',
      params: { a: 47, op: '+', b: 28 },
    });
    expect(explain(it, 0, 75)).toBeNull();
  });

  test('plain sub: no borrow / wrong operation / check-form', () => {
    // 52 − 27 = 25; subtracting without borrowing gives 35.
    const it = carryItem('add-sub-1000', 2, { key: 'subCalc', params: { a: 52, b: 27 } }, [
      num('askDiff', 25),
    ]);
    expect(explain(it, 0, 35)).toEqual({
      key: 'carryCheckSub',
      params: { col: place('ones') },
    });
    expect(explain(it, 0, 79)).toEqual({ key: 'carryWrongOpSub', params: { a: 52, b: 27 } });
    expect(explain(it, 0, 15)).toEqual({ key: 'carryCheckSub', params: { col: place('ones') } });
    expect(explain(it, 0, 20)).toEqual({
      key: 'carryFallback',
      params: { a: 52, op: '−', b: 27 },
    });
    expect(explain(it, 0, 25)).toBeNull();
  });

  test('sub: no-borrow wins over the wrong-operation reading when both match', () => {
    // 100 − 59 = 41; no-borrow gives 159, which is also 100 + 59.
    const it = carryItem('add-sub-1000', 3, { key: 'subCalc', params: { a: 100, b: 59 } }, [
      num('askDiff', 41),
    ]);
    expect(explain(it, 0, 159)).toEqual({
      key: 'carryCheckSub',
      params: { col: place('ones') },
    });
  });

  test('plain add tier 3: two carries, first one named', () => {
    // 487 + 375 = 862; forgetting every carry gives 752.
    const it = carryItem('add-sub-1000', 3, { key: 'addCalc', params: { a: 487, b: 375 } }, [
      num('askSum', 862),
    ]);
    expect(explain(it, 0, 752)).toEqual({ key: 'carryCheckAdd', params: { col: place('tens') } });
  });

  test('plain sub tier 3: borrow across zero', () => {
    // 402 − 157 = 245; subtracting without borrowing gives 355.
    const it = carryItem('add-sub-1000', 3, { key: 'subCalc', params: { a: 402, b: 157 } }, [
      num('askDiff', 245),
    ]);
    expect(explain(it, 0, 355)).toEqual({
      key: 'carryCheckSub',
      params: { col: place('ones') },
    });
  });

  test('4-digit add and 5-digit sub use the same core', () => {
    // 4 827 + 3 156 = 7 983; forgetting the carry gives 7 973.
    const add4 = carryItem('add-4digit', 2, { key: 'addCalc', params: { a: 4827, b: 3156 } }, [
      num('askSum', 7983),
    ]);
    expect(explain(add4, 0, 7973)).toEqual({
      key: 'carryCheckAdd',
      params: { col: place('tens') },
    });
    // 52 034 − 17 856 = 34 178; subtracting without borrowing gives 45 822.
    const sub5 = carryItem('sub-5digit', 3, { key: 'subCalc', params: { a: 52034, b: 17856 } }, [
      num('askDiff', 34178),
    ]);
    expect(explain(sub5, 0, 45822)).toEqual({
      key: 'carryCheckSub',
      params: { col: place('ones') },
    });
  });

  test('word problem one step: same diagnosis from the story frame', () => {
    const add = carryItem(
      'add-sub-1000-wp',
      2,
      { key: 'wpAddHave', params: { name: 'An', item: 'i:marble', a: 47, b: 28 } },
      [num('askTotal', 75)],
    );
    expect(explain(add, 0, 65)).toEqual({ key: 'carryCheckAdd', params: { col: place('tens') } });
    const sub = carryItem(
      'add-sub-1000-wp',
      2,
      { key: 'wpCompare', params: { name: 'An', name2: 'Bình', item: 'i:marble', a: 52, b: 27 } },
      [num('askMore', 25)],
    );
    expect(explain(sub, 0, 35)).toEqual({
      key: 'carryCheckSub',
      params: { col: place('ones') },
    });
  });

  test('word problem two steps: skipped / forgot the second step / check-form', () => {
    // 147 + 128 = 275, then + 50 = 325.
    const it = carryItem(
      'add-sub-1000-wp',
      3,
      { key: 'wpTwoStepAdd', params: { name: 'An', item: 'i:book', a: 147, b: 128, c: 50 } },
      [num('askAfterBuy', 275), num('askFinalTotal', 325)],
      [275],
    );
    expect(explain(it, 0, 325)).toEqual({
      key: 'carryChainSkipped',
      params: { a: 147, op1: '+', b: 128 },
    });
    expect(explain(it, 0, 285)).toEqual({ key: 'carryCheckAdd', params: { col: place('tens') } });
    expect(explain(it, 1, 275)).toEqual({
      key: 'carryChainForgotSecond',
      params: { op2: '+', c: 50 },
    });
    // 275 + 50 = 325; the carry is generated in the tens, so it lands in the hundreds.
    expect(explain(it, 1, 315)).toEqual({
      key: 'carryCheckAdd',
      params: { col: place('hundreds') },
    });
    expect(explain(it, 1, 325)).toBeNull();
  });

  test('chain: skipped / carry pattern / forgot the second step / no-borrow guard', () => {
    // 47 + 28 = 75, then − 15 = 60.
    const it = carryItem(
      'add-sub-1000-chain',
      2,
      {
        key: 'chainCalc',
        params: { expr: '47 + 28 − 15', a: 47, b: 28, c: 15, op1: '+', op2: '−' },
      },
      [num('askFirst', 75), num('askResult', 60)],
      [75],
    );
    expect(explain(it, 0, 60)).toEqual({
      key: 'carryChainSkipped',
      params: { a: 47, op1: '+', b: 28 },
    });
    expect(explain(it, 0, 65)).toEqual({ key: 'carryCheckAdd', params: { col: place('tens') } });
    expect(explain(it, 1, 75)).toEqual({
      key: 'carryChainForgotSecond',
      params: { op2: '−', c: 15 },
    });
    expect(explain(it, 1, 90)).toEqual({ key: 'carryWrongOpSub', params: { a: 75, b: 15 } });
    // 75 − 15 has no borrow, so off-by-ten must NOT name a column.
    expect(explain(it, 1, 50)).toEqual({
      key: 'carryFallback',
      params: { a: 75, op: '−', b: 15 },
    });
    expect(explain(it, 1, 60)).toBeNull();
  });

  test('find-error: the verdict is not diagnosable, the fix step is', () => {
    const wrong = carryItem(
      'add-sub-find-error',
      2,
      { key: 'errorAdd', params: { name: 'An', a: 47, b: 28, shown: 65 } },
      [
        {
          kind: 'verdict',
          prompt: { key: 'isNameTrue', params: { name: 'An' } },
          statement: { key: 'stmtEq', params: { text: '47 + 28', value: 65 } },
          answer: false,
          fix: { prompt: { key: 'askCorrect' }, answer: 75 },
        },
      ],
      [75],
    );
    // The child said "Đúng" about a wrong result — no diagnosis for a boolean.
    expect(explain(wrong, 0, true)).toBeNull();
    // The fix step: re-typing the shown wrong number.
    expect(explain(wrong, 1, 65)).toEqual({
      key: 'carryFixRepeat',
      params: { a: 47, op: '+', b: 28 },
    });
    expect(explain(wrong, 1, 55)).toEqual({
      key: 'carryFallback',
      params: { a: 47, op: '+', b: 28 },
    });
    expect(explain(wrong, 1, 75)).toBeNull();
    // When the shown result is right, a wrong verdict is still not diagnosable.
    const right = carryItem(
      'add-sub-find-error',
      1,
      { key: 'errorSub', params: { name: 'An', a: 52, b: 27, shown: 25 } },
      [
        {
          kind: 'verdict',
          prompt: { key: 'isNameTrue', params: { name: 'An' } },
          statement: { key: 'stmtEq', params: { text: '52 − 27', value: 25 } },
          answer: true,
        },
      ],
      [],
    );
    expect(explain(right, 0, false)).toBeNull();
  });

  test('missing-digit: any wrong digit is only the fallback', () => {
    const it = carryItem(
      'add-missing-digit',
      1,
      { key: 'missingDigit', params: { equation: '47 + 28 = 7?' } },
      [num('askMissingDigit', 5)],
    );
    expect(explain(it, 0, 3)).toEqual({ key: 'carryFallbackPlain' });
    expect(explain(it, 0, 5)).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const skillId of [
      'add-sub-1000',
      'add-sub-1000-wp',
      'add-sub-10000-wp',
      'add-sub-100000-wp',
      'add-sub-1000-chain',
      'add-4digit',
      'sub-4digit',
      'add-5digit',
      'sub-5digit',
      'add-sub-find-error',
      'add-missing-digit',
    ]) {
      for (const tier of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 10; seed++) {
          const it = itemForSkill(skillId, mulberry32(seed), tier);
          it.steps.forEach((step, s) => {
            const wrong: StepAnswer =
              step.kind === 'number'
                ? step.answer + 1
                : step.kind === 'choice'
                  ? (step.options.find((o) => !o.correct)?.id ?? 'o0')
                  : step.kind === 'verdict'
                    ? !step.answer
                    : [];
            const result = explain(it, s, wrong);
            if (result) expect(twa(result.key, result.params)).not.toContain('wrongAnswer.');
          });
        }
      }
    }
  });
});
