// R35 lane 3 — group 7 (money): story amounts are formatted strings ("10 000"),
// so the tests assert formatted params; the matcher must never name the change
// itself, which is the step's answer.
import { describe, expect, test } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { MoneyScene } from '../money/money-scene-types';
import { formatMoney, renderMoneyPrompt } from '../money/money-strings';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { Misconception, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { itemForSkill } from './item-for-skill';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const moneyItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: ReasoningStep[],
  work: number[] = [],
  scene?: MoneyScene,
): PracticeItem => ({ skillId, tier, story, steps, work, ...(scene ? { scene } : {}) });

const num = (key: string, answer: number, params?: PromptRef['params']): ReasoningStep => ({
  kind: 'number',
  prompt: params ? { key, params } : { key },
  answer,
});
const choice = (
  key: string,
  options: readonly {
    id: string;
    label: PromptRef;
    correct: boolean;
    misconception?: Misconception;
  }[],
  params?: PromptRef['params'],
): ReasoningStep => ({
  kind: 'choice',
  prompt: params ? { key, params } : { key },
  options: options.map((o) => ({ ...o })),
});
const qty = (id: string, n: number, correct: boolean, misconception?: Misconception) => ({
  id,
  label: { key: 'num', params: { n } },
  correct,
  ...(misconception ? { misconception } : {}),
});
const letter = (id: string, l: string, correct: boolean) => ({
  id,
  label: { key: 'letter', params: { l } },
  correct,
});
const notesScene = (notes: MoneyScene['notes']): MoneyScene => ({
  kind: 'notes',
  notes,
  minUnitPx: 28,
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

describe('explainWrongAnswer — group 7 money', () => {
  test('change-back tier 1: total / whole note / added / one note off / fallback', () => {
    // 2 notebooks × 2 000 = 4 000, paid 10 000, change 6 000.
    const it = moneyItem(
      'money-change-back',
      1,
      {
        key: 'changeStory',
        params: { name: 'An', count: 2, item: 'i:notebook', price: '2 000', paid: '10 000' },
      },
      [num('askChange', 6000)],
      [6000],
    );
    expect(explain(it, 0, 4000)).toEqual({
      key: 'moneyChangeTotal',
      params: { total: formatMoney(4000), paid: formatMoney(10000) },
    });
    expect(explain(it, 0, 10000)).toEqual({
      key: 'moneyChangeWholeNote',
      params: { paid: formatMoney(10000) },
    });
    expect(explain(it, 0, 14000)).toEqual({
      key: 'moneyChangeAdded',
      params: { paid: formatMoney(10000), total: formatMoney(4000) },
    });
    expect(explain(it, 0, 5000)).toEqual({
      key: 'moneyChangeOneNote',
      params: { paid: formatMoney(10000), total: formatMoney(4000) },
    });
    expect(explain(it, 0, 60000)).toEqual({
      key: 'moneyChangeOneNote',
      params: { paid: formatMoney(10000), total: formatMoney(4000) },
    });
    // 9 000 is off by 3 000 — not a denomination, so it is not "one note off".
    expect(explain(it, 0, 9000)).toEqual({
      key: 'moneyChangeFallback',
      params: { paid: formatMoney(10000), total: formatMoney(4000) },
    });
    expect(explain(it, 0, 6000)).toBeNull();
  });

  test('change-back tier 2: the total step names the paid note, never the total', () => {
    // 3 items × 3 000 = 9 000, paid 10 000, change 1 000.
    const it = moneyItem(
      'money-change-back',
      2,
      {
        key: 'changeStory',
        params: { name: 'An', count: 3, item: 'i:pen', price: '3 000', paid: '10 000' },
      },
      [num('askChangeTotal', 9000), num('askChange', 1000)],
      [9000, 1000],
    );
    expect(explain(it, 0, 10000)).toEqual({
      key: 'moneyTotalPaidNote',
      params: { paid: formatMoney(10000), count: 3 },
    });
    expect(explain(it, 0, 1000)).toEqual({ key: 'moneyTotalChangeFirst' });
    expect(explain(it, 0, 8000)).toEqual({ key: 'moneyTotalFallback', params: { count: 3 } });
    expect(explain(it, 1, 9000)).toEqual({
      key: 'moneyChangeTotal',
      params: { total: formatMoney(9000), paid: formatMoney(10000) },
    });
    expect(explain(it, 1, 1000)).toBeNull();
  });

  test('total-notes: missed / double-counted / fallback', () => {
    const it = moneyItem(
      'money-total-notes',
      1,
      { key: 'totalNotesStory' },
      [
        choice('askTotal', [
          qty('o0', 17000, true),
          qty('o1', 15000, false, 'missed-note'),
          qty('o2', 19000, false, 'double-counted'),
          qty('o3', 16000, false, 'near-miss'),
        ]),
      ],
      [17000],
      notesScene([{ value: 10000 }, { value: 5000 }, { value: 2000 }]),
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'moneyTotalMissed' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'moneyTotalDouble' });
    expect(explain(it, 0, 'o3')).toEqual({ key: 'moneyCountFallback' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('pick-notes: too few / too much / right sum but too many notes', () => {
    // Target 12 000. Minimal: A (10 000) + D (2 000). B and C are both 5 000.
    const it = moneyItem(
      'money-pick-notes',
      1,
      { key: 'pickNotesStory' },
      [
        {
          kind: 'multi',
          prompt: { key: 'askPick', params: { target: '12 000' } },
          options: [
            letter('o0', 'A', true),
            letter('o1', 'B', false),
            letter('o2', 'C', false),
            letter('o3', 'D', true),
          ],
        },
      ],
      [12000],
      notesScene([
        { value: 10000, label: 'A' },
        { value: 5000, label: 'B' },
        { value: 5000, label: 'C' },
        { value: 2000, label: 'D' },
      ]),
    );
    expect(explain(it, 0, ['o0'])).toEqual({
      key: 'moneyPickTooFew',
      params: { target: formatMoney(12000) },
    });
    expect(explain(it, 0, ['o0', 'o1'])).toEqual({
      key: 'moneyPickTooMuch',
      params: { target: formatMoney(12000) },
    });
    expect(explain(it, 0, ['o1', 'o2', 'o3'])).toEqual({
      key: 'moneyPickTooMany',
      params: { target: formatMoney(12000) },
    });
    expect(explain(it, 0, [])).toEqual({
      key: 'moneyPickTooFew',
      params: { target: formatMoney(12000) },
    });
    expect(explain(it, 0, ['o0', 'o3'])).toBeNull();
  });

  test('money-wp tier 1: added one time too few / near miss', () => {
    const it = moneyItem(
      'money-wp',
      1,
      { key: 'wpBuyStory', params: { name: 'An', count: 3, item: 'i:notebook', price: '2 000' } },
      [
        choice('askWpTotal', [
          qty('o0', 6000, true),
          qty('o1', 4000, false, 'add-instead-of-times'),
          qty('o2', 8000, false, 'near-miss'),
        ]),
      ],
    );
    expect(explain(it, 0, 'o1')).toEqual({
      key: 'moneyWpAddShort',
      params: { count: 3, item: renderMoneyPrompt({ key: 'item_notebook' }), price: '2 000' },
    });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'moneyFallback' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('money-wp tier 2: only one item so far / near miss', () => {
    const it = moneyItem(
      'money-wp',
      2,
      {
        key: 'wpTwoStory',
        params: {
          name: 'An',
          count1: 2,
          item1: 'i:pen',
          price1: '3 000',
          count2: 3,
          item2: 'i:book',
          price2: '2 000',
        },
      },
      [
        choice('askWpTotal', [
          qty('o0', 12000, true),
          qty('o1', 6000, false, 'one-step-only'),
          qty('o2', 9000, false, 'near-miss'),
        ]),
      ],
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'moneyWpOneItem' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'moneyFallback' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('money-wp tier 3: total step traps, then the leftover step', () => {
    // 3 cakes × 5 000 = 15 000, have 20 000, left 5 000.
    const it = moneyItem(
      'money-wp',
      3,
      {
        key: 'wpLeftStory',
        params: { name: 'An', have: '20 000', count: 3, item: 'i:cake', price: '5 000' },
      },
      [num('askWpTotal', 15000), num('askWpLeft', 5000)],
      [15000, 5000],
    );
    expect(explain(it, 0, 10000)).toEqual({
      key: 'moneyWpAddShort',
      params: { count: 3, item: renderMoneyPrompt({ key: 'item_cake' }), price: '5 000' },
    });
    expect(explain(it, 0, 5000)).toEqual({ key: 'moneyWpOneItem' });
    expect(explain(it, 0, 12000)).toEqual({ key: 'moneyTotalFallback', params: { count: 3 } });
    expect(explain(it, 1, 15000)).toEqual({
      key: 'moneyWpLeftTotal',
      params: { have: formatMoney(20000) },
    });
    expect(explain(it, 1, 20000)).toEqual({
      key: 'moneyWpLeftHave',
      params: { have: formatMoney(20000) },
    });
    expect(explain(it, 1, 7000)).toEqual({ key: 'moneyWpFallback' });
    expect(explain(it, 1, 5000)).toBeNull();
  });

  test('out-of-group skills return null', () => {
    const it = moneyItem('money-recognize', 1, { key: 'x' }, [num('askX', 5)], [5]);
    expect(explain(it, 0, 4)).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const skillId of [
      'money-change-back',
      'money-total-notes',
      'money-pick-notes',
      'money-wp',
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
