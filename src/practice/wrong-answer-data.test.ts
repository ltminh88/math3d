// R35 lane 3 — group 8 (data tables, tally, chance): every number lives in the
// scene, so the tests build DataTableScene items by hand; the matcher must render
// column/row refs ('i:swim', 'l:week_this') into labels, never pass a raw ref to twa.
import { describe, expect, test } from 'vitest';
import type {
  BagItem,
  BagScene,
  DataTableScene,
  DiceScene,
  TallyScene,
} from '../data/data-scene-types';
import { renderDataPrompt } from '../data/data-strings';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { Misconception, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { itemForSkill } from './item-for-skill';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const dataItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: ReasoningStep[],
  work: number[] = [],
  scene?: PracticeItem['scene'],
): PracticeItem => ({ skillId, tier, story, steps, work, ...(scene ? { scene } : {}) });

const tableScene = (
  headers: string[],
  rows: (number | null)[][],
  rowLabels?: string[],
  hiddenCell?: { row: number; col: number },
): DataTableScene => ({
  kind: 'data-table',
  headers,
  rows,
  ...(rowLabels ? { rowLabels } : {}),
  ...(hiddenCell ? { hiddenCell } : {}),
  minUnitPx: 28,
});
const tallyScene = (marks: boolean[]): TallyScene => ({ kind: 'tally', marks, minUnitPx: 28 });
const bagScene = (items: BagItem[], pick: number): BagScene => ({
  kind: 'bag',
  items,
  pick,
  minUnitPx: 28,
});
const diceScene = (up: number, other?: number): DiceScene => ({
  kind: 'dice',
  up,
  ...(other !== undefined ? { other } : {}),
  minUnitPx: 28,
});
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
const headerOpt = (id: string, header: string, correct: boolean) => ({
  id,
  // headerRef turns 'i:<noun>' into the label key 'item_<noun>' — no params.
  label: { key: header.startsWith('i:') ? `item_${header.slice(2)}` : header.slice(2) },
  correct,
  ...(!correct ? { misconception: 'wrong-category' as const } : {}),
});
const chanceOpt = (
  id: string,
  verdict: string,
  correct: boolean,
  misconception?: Misconception,
) => ({
  id,
  label: { key: `chance_${verdict}` },
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

describe('explainWrongAnswer — group 8 data', () => {
  test('table-read: wrong column / added the whole row', () => {
    const scene = tableScene(['i:swim', 'i:chess'], [[5, 3]]);
    const it = dataItem(
      'table-read',
      1,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askTableCell', params: { header: 'i:swim' } },
          options: [
            qty('o0', 5, true),
            qty('o1', 3, false, 'wrong-cell'),
            qty('o2', 8, false, 'wrong-total'),
          ],
        },
      ],
      [5],
      scene,
    );
    const header = renderDataPrompt({ key: 'i:swim' });
    expect(explain(it, 0, 'o1')).toEqual({ key: 'dataReadWrongCell', params: { header } });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'dataReadWrongTotal', params: { header } });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('table-read tier 3: the row ref is rendered too', () => {
    const scene = tableScene(
      ['i:swim', 'i:chess'],
      [
        [4, 6],
        [7, 2],
      ],
      ['l:week_last', 'l:week_this'],
    );
    const it = dataItem(
      'table-read',
      3,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askTableCellRow', params: { row: 'l:week_this', header: 'i:chess' } },
          options: [
            qty('o0', 2, true),
            qty('o1', 7, false, 'wrong-cell'),
            qty('o2', 9, false, 'wrong-total'),
          ],
        },
      ],
      [2],
      scene,
    );
    expect(explain(it, 0, 'o1')).toEqual({
      key: 'dataReadWrongCell',
      params: { header: renderDataPrompt({ key: 'i:chess' }) },
    });
    expect(explain(it, 0, 'o2')).toEqual({
      key: 'dataReadWrongTotal',
      params: { header: renderDataPrompt({ key: 'i:chess' }) },
    });
  });

  test('table-sums tier 1: wrong row / wrong column', () => {
    const scene = tableScene(
      ['i:swim', 'i:chess'],
      [
        [5, 3],
        [4, 6],
      ],
    );
    const it = dataItem(
      'table-sums',
      1,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askRowSum', params: { row: 'l:week_last' } },
          options: [
            qty('o0', 8, true),
            qty('o1', 10, false, 'wrong-row'),
            qty('o2', 9, false, 'wrong-column'),
          ],
        },
      ],
      [8],
      scene,
    );
    const row = renderDataPrompt({ key: 'l:week_last' });
    expect(explain(it, 0, 'o1')).toEqual({ key: 'dataSumsWrongRow', params: { row } });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'dataSumsWrongColumnRow', params: { row } });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('table-sums tier 2: wrong column / wrong row', () => {
    const scene = tableScene(
      ['i:swim', 'i:chess'],
      [
        [5, 3],
        [4, 2],
      ],
    );
    const it = dataItem(
      'table-sums',
      2,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askColSum', params: { header: 'i:swim' } },
          options: [
            qty('o0', 9, true),
            qty('o1', 5, false, 'wrong-column'),
            qty('o2', 8, false, 'wrong-row'),
          ],
        },
      ],
      [9],
      scene,
    );
    const header = renderDataPrompt({ key: 'i:swim' });
    expect(explain(it, 0, 'o1')).toEqual({ key: 'dataSumsWrongColumn', params: { header } });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'dataSumsWrongRowCol', params: { header } });
  });

  test('table-sums tier 3: one row only / missed one cell', () => {
    const scene = tableScene(
      ['i:swim', 'i:chess'],
      [
        [5, 3],
        [4, 6],
      ],
    );
    const it = dataItem(
      'table-sums',
      3,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askTableSum' },
          options: [
            qty('o0', 18, true),
            qty('o1', 8, false, 'wrong-row'),
            qty('o2', 15, false, 'missed-one'),
          ],
        },
      ],
      [18],
      scene,
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'dataSumsOneRow' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'dataSumsMissedOne' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('table-fill-missing tier 1: copied a cell into the All row', () => {
    const scene = tableScene(
      ['i:swim', 'i:chess'],
      [
        [5, 3],
        [4, 6],
        [9, null],
      ],
      ['l:boys', 'l:girls', 'l:all'],
      { row: 2, col: 1 },
    );
    const it = dataItem(
      'table-fill-missing',
      1,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askFill' },
          options: [
            qty('o0', 9, true),
            qty('o1', 6, false, 'wrong-cell'),
            qty('o2', 3, false, 'wrong-total'),
          ],
        },
      ],
      [9],
      scene,
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'dataFillWrongCellAll' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'dataFillWrongTotal' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('table-fill-missing tier 2: copied the other row / took the All number', () => {
    const scene = tableScene(
      ['i:swim', 'i:chess'],
      [
        [5, null],
        [4, 6],
        [9, 9],
      ],
      ['l:boys', 'l:girls', 'l:all'],
      { row: 0, col: 1 },
    );
    const it = dataItem(
      'table-fill-missing',
      2,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askFill' },
          options: [
            qty('o0', 3, true),
            qty('o1', 6, false, 'wrong-cell'),
            qty('o2', 9, false, 'wrong-total'),
          ],
        },
      ],
      [3],
      scene,
    );
    expect(explain(it, 0, 'o1')).toEqual({
      key: 'dataFillWrongCellRow',
      params: {
        row: renderDataPrompt({ key: 'l:boys' }),
        other: renderDataPrompt({ key: 'l:girls' }),
      },
    });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'dataFillWrongTotal' });
  });

  test('table-max-min: near miss vs reversed, most and least', () => {
    const scene = tableScene(['i:swim', 'i:chess', 'i:draw'], [[5, 9, 3]]);
    const most = dataItem(
      'table-max-min',
      1,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askMost' },
          options: [
            headerOpt('o0', 'i:chess', true),
            headerOpt('o1', 'i:swim', false),
            headerOpt('o2', 'i:draw', false),
          ],
        },
      ],
      [9],
      scene,
    );
    expect(explain(most, 0, 'o1')).toEqual({ key: 'dataMaxNear' });
    expect(explain(most, 0, 'o2')).toEqual({ key: 'dataMaxReversed' });
    expect(explain(most, 0, 'o0')).toBeNull();
    const least = dataItem(
      'table-max-min',
      1,
      { key: 'tableStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askLeast' },
          options: [
            headerOpt('o0', 'i:draw', true),
            headerOpt('o1', 'i:chess', false),
            headerOpt('o2', 'i:swim', false),
          ],
        },
      ],
      [3],
      scene,
    );
    expect(explain(least, 0, 'o1')).toEqual({ key: 'dataMinReversed' });
    expect(explain(least, 0, 'o2')).toEqual({ key: 'dataMinNear' });
    expect(explain(least, 0, 'o0')).toBeNull();
  });

  test('tally-count: counted the X marks too / counted X instead of O', () => {
    const it = dataItem(
      'tally-count',
      1,
      { key: 'tallyStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askTally' },
          options: [
            qty('o0', 4, true),
            qty('o1', 7, false, 'counted-all'),
            qty('o2', 3, false, 'counted-miss'),
          ],
        },
      ],
      [4],
      tallyScene([true, true, true, true, false, false, false]),
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'dataTallyCountedAll' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'dataTallyCountedMiss' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('chance-bag: certain when possible / colour is there / colour is not there', () => {
    const it = dataItem(
      'chance-bag',
      1,
      { key: 'bagStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'bagEventMixed' },
          options: [
            chanceOpt('o0', 'possible', true),
            chanceOpt('o1', 'certain', false, 'certain-when-possible'),
            chanceOpt('o2', 'impossible', false, 'impossible-when-certain'),
            chanceOpt('o3', 'possible', false, 'possible-when-impossible'),
          ],
        },
      ],
      [1],
      bagScene(
        [
          { colour: 'red', count: 2 },
          { colour: 'blue', count: 3 },
        ],
        2,
      ),
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'dataChanceBagCertain' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'dataChanceBagIsThere' });
    expect(explain(it, 0, 'o3')).toEqual({ key: 'dataChanceBagNotThere' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('chance-dice: face numbers come from the step prompt', () => {
    const face = dataItem(
      'chance-dice',
      1,
      { key: 'diceStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'diceEventFace', params: { face: 5 } },
          options: [
            chanceOpt('o0', 'possible', true),
            chanceOpt('o1', 'certain', false, 'certain-when-possible'),
            chanceOpt('o2', 'impossible', false, 'impossible-when-possible'),
            chanceOpt('o3', 'possible', false, 'possible-when-impossible'),
          ],
        },
      ],
      [1],
      diceScene(3),
    );
    expect(explain(face, 0, 'o1')).toEqual({ key: 'dataChanceDiceCertain', params: { face: 5 } });
    expect(explain(face, 0, 'o2')).toEqual({ key: 'dataChanceDiceIsThere', params: { face: 5 } });
    expect(explain(face, 0, 'o3')).toEqual({ key: 'dataChanceDiceNotThere', params: { face: 5 } });
    const all = dataItem(
      'chance-dice',
      2,
      { key: 'diceStory' },
      [
        {
          kind: 'choice',
          prompt: { key: 'diceEventAll' },
          options: [
            chanceOpt('o0', 'certain', true),
            chanceOpt('o1', 'possible', false, 'possible-when-certain'),
            chanceOpt('o2', 'impossible', false, 'impossible-when-certain'),
          ],
        },
      ],
      [6],
      diceScene(3, 5),
    );
    expect(explain(all, 0, 'o1')).toEqual({ key: 'dataChanceDiceAll' });
    expect(explain(all, 0, 'o2')).toEqual({ key: 'dataChanceDiceAll' });
    expect(explain(all, 0, 'o0')).toBeNull();
  });

  test('out-of-group skills return null', () => {
    // 'mul-table-2' is a legacy table skill no R35 matcher handles.
    const it = dataItem('mul-table-2', 1, { key: 'x' }, [num('askX', 5)], [5]);
    expect(explain(it, 0, 4)).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const skillId of [
      'tally-count',
      'table-read',
      'table-max-min',
      'table-sums',
      'table-fill-missing',
      'chance-bag',
      'chance-dice',
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
