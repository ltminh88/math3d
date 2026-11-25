// R35 lane 3 — group 10 (division with remainder): both steps are main steps.
// The hard rule is asserted: at the remainder step, a remainder ≥ the divisor is
// always diagnosed first — even when the wrong number also equals the quotient.
import { describe, expect, test } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { Misconception, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { itemForSkill } from './item-for-skill';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const remItem = (
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
const qty = (id: string, n: number, correct: boolean, misconception?: Misconception) => ({
  id,
  label: { key: 'num', params: { n } },
  correct,
  ...(misconception ? { misconception } : {}),
});
const qr = (id: string, q: number, r: number, correct: boolean, misconception?: Misconception) => ({
  id,
  label: { key: 'qr', params: { q, r } },
  correct,
  ...(misconception ? { misconception } : {}),
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

describe('explainWrongAnswer — group 10 remainder', () => {
  test('remainder division: quotient traps and remainder traps', () => {
    // 23 ÷ 5 = 4 dư 3.
    const it = remItem(
      'div-2d-1d-remainder',
      1,
      { key: 'divRemainderCalc', params: { a: 23, b: 5 } },
      [num('askQuotient', 4), num('askRemainder', 3)],
    );
    expect(explain(it, 0, 5)).toEqual({
      key: 'remQuotientOneMore',
      params: { a: 23, b: 5 },
    });
    // q − 1 and r coincide here (both 3) — the survey order puts q ± 1 first.
    expect(explain(it, 0, 3)).toEqual({
      key: 'remQuotientOneLess',
      params: { a: 23, b: 5 },
    });
    expect(explain(it, 0, 4)).toBeNull();
    expect(explain(it, 1, 4)).toEqual({
      key: 'remRemainderQuotient',
      params: { q: 4, a: 23, b: 5 },
    });
    expect(explain(it, 1, 8)).toEqual({ key: 'remRemainderTooBig', params: { w: 8, b: 5 } });
    expect(explain(it, 1, 13)).toEqual({ key: 'remRemainderTooBig', params: { w: 13, b: 5 } });
    expect(explain(it, 1, 2)).toEqual({ key: 'remFallback', params: { a: 23, b: 5 } });
    expect(explain(it, 1, 3)).toBeNull();
  });

  test('remainder division tier 3: dropping the zero in the quotient', () => {
    // 161 ÷ 2 = 80 dư 1.
    const it = remItem(
      'div-3d-1d-remainder',
      3,
      { key: 'divRemainderCalc', params: { a: 161, b: 2 } },
      [num('askQuotient', 80), num('askRemainder', 1)],
    );
    expect(explain(it, 0, 8)).toEqual({ key: 'remQuotientZero' });
    expect(explain(it, 0, 81)).toEqual({
      key: 'remQuotientOneMore',
      params: { a: 161, b: 2 },
    });
    expect(explain(it, 0, 79)).toEqual({
      key: 'remQuotientOneLess',
      params: { a: 161, b: 2 },
    });
    expect(explain(it, 0, 1)).toEqual({ key: 'remQuotientRemainder' });
  });

  test('floor tier 1: boxes, then the leftover', () => {
    // 26 cái, 5 cái một hộp: 5 hộp, thừa 1.
    const boxes = remItem(
      'div-rem-floor',
      1,
      { key: 'divRemFloor', params: { total: 26, per: 5, item: 'i:marble' } },
      [num('askBoxes', 5), num('askLeft', 1)],
      [25, 1],
    );
    expect(explain(boxes, 0, 6)).toEqual({ key: 'remFloorBoxesOneMore', params: { per: 5 } });
    expect(explain(boxes, 0, 4)).toEqual({ key: 'remFloorBoxesOneLess', params: { per: 5 } });
    expect(explain(boxes, 0, 1)).toEqual({ key: 'remFloorBoxesRemainder', params: { per: 5 } });
    // 17 cái, 5 cái một hộp: 3 hộp, thừa 2 — the quotient fits in the leftover box.
    const left = remItem(
      'div-rem-floor',
      1,
      { key: 'divRemFloor', params: { total: 17, per: 5, item: 'i:marble' } },
      [num('askBoxes', 3), num('askLeft', 2)],
      [15, 2],
    );
    expect(explain(left, 1, 7)).toEqual({ key: 'remFloorLeftTooBig', params: { w: 7, per: 5 } });
    expect(explain(left, 1, 3)).toEqual({ key: 'remFloorLeftQuotient' });
    expect(explain(left, 1, 2)).toBeNull();
  });

  test('floor tier 2 choice: the tag names the error, the label splits near-miss', () => {
    // 23 cái, 5 cái một hộp: 4 hộp, thừa 3.
    const it = remItem(
      'div-rem-floor',
      2,
      { key: 'divRemFloor', params: { total: 23, per: 5, item: 'i:marble' } },
      [
        {
          kind: 'choice',
          prompt: { key: 'pickBoxesLeft' },
          options: [
            qr('o0', 4, 3, true),
            qr('o1', 3, 8, false, 'remainder-too-big'),
            qr('o2', 5, 3, false, 'near-miss'),
            qr('o3', 4, 2, false, 'wrong-step'),
            qr('o4', 3, 4, false, 'near-miss'),
          ],
        },
      ],
      [20, 3],
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'remFloorPickTooBig' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'remFloorPickOneMore', params: { per: 5 } });
    expect(explain(it, 0, 'o3')).toEqual({
      key: 'remFloorPickRemainderWrong',
      params: { total: 23 },
    });
    expect(explain(it, 0, 'o4')).toEqual({ key: 'remFloorPickSwapped' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('ceil tier 1: full cars, then the cars needed', () => {
    // 23 bạn, mỗi xe chở 5 bạn: 4 xe đầy, cần 5 xe.
    const it = remItem(
      'div-rem-ceil',
      1,
      { key: 'divRemCeil', params: { total: 23, per: 5 } },
      [num('askFull', 4, { per: 5 }), num('askNeed', 5)],
      [4, 5],
    );
    expect(explain(it, 0, 5)).toEqual({ key: 'remCeilFullOneMore' });
    expect(explain(it, 0, 3)).toEqual({ key: 'remCeilFullRemainder', params: { per: 5 } });
    expect(explain(it, 1, 4)).toEqual({
      key: 'remCeilNeedRoundedDown',
      params: { q: 4, r: 3 },
    });
    expect(explain(it, 1, 3)).toEqual({ key: 'remCeilNeedRemainder' });
    expect(explain(it, 1, 6)).toEqual({ key: 'remCeilFallback' });
    expect(explain(it, 1, 5)).toBeNull();
  });

  test('ceil tier 2 and tier 3: rounded down / remainder in the cars box', () => {
    const t2 = remItem(
      'div-rem-ceil',
      2,
      { key: 'divRemCeil', params: { total: 23, per: 5 } },
      [num('askNeed', 5)],
      [4, 5],
    );
    expect(explain(t2, 0, 4)).toEqual({
      key: 'remCeilNeedRoundedDown',
      params: { q: 4, r: 3 },
    });
    expect(explain(t2, 0, 3)).toEqual({ key: 'remCeilNeedRemainder' });
    const t3 = remItem(
      'div-rem-ceil',
      3,
      { key: 'divRemCeil', params: { total: 23, per: 5 } },
      [
        {
          kind: 'choice',
          prompt: { key: 'askNeed' },
          options: [
            qty('o0', 5, true),
            qty('o1', 4, false, 'round-down-trap'),
            qty('o2', 3, false, 'one-step-only'),
            qty('o3', 6, false, 'near-miss'),
          ],
        },
      ],
      [4, 5],
    );
    expect(explain(t3, 0, 'o1')).toEqual({
      key: 'remCeilNeedRoundedDown',
      params: { q: 4, r: 3 },
    });
    expect(explain(t3, 0, 'o2')).toEqual({ key: 'remCeilNeedRemainder' });
    expect(explain(t3, 0, 'o3')).toEqual({ key: 'remCeilFallback' });
    expect(explain(t3, 0, 'o0')).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const skillId of [
      'div-2d-1d-remainder',
      'div-3d-1d-remainder',
      'div-4d-1d-remainder',
      'div-5d-1d-remainder',
      'div-rem-floor',
      'div-rem-ceil',
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
