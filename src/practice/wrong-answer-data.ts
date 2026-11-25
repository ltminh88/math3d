// Nhóm 8 (R35) — đọc bảng số liệu: table-read / table-max-min / table-sums /
// table-fill-missing, tally-count, chance-bag / chance-dice. The story holds only a
// title key — every number lives in item.scene (DataTableScene / TallyScene /
// BagScene / DiceScene), so the matcher computes row sums, column values and
// lookups from scene.rows / headers / hiddenCell at match time. Prompt params carry
// raw refs ('i:swim', 'l:week_this'), which twa cannot render — they are rendered
// here with renderDataPrompt, exactly like renderPrompt does.
import type { DataTableScene } from '../data/data-scene-types';
import { renderDataPrompt } from '../data/data-strings';
import type { PracticeItem } from './practice-scene';
import {
  numParam,
  type WrongAnswerContext,
  type WrongAnswerExplanation,
} from './wrong-answer-explanation';

const FALLBACK: WrongAnswerExplanation = { key: 'dataFallback' };

/** A prompt param that is a raw ref ('i:swim' / 'l:week_this') rendered in language. */
function renderRef(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return renderDataPrompt({ key: value });
}

function table(item: PracticeItem): DataTableScene | undefined {
  const scene = item.scene;
  // PracticeScene is a base interface, not a discriminated union — the kind check
  // alone does not narrow, so the cast mirrors the money matcher's MoneyScene cast.
  return scene?.kind === 'data-table' ? (scene as DataTableScene) : undefined;
}

function explainTableRead(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (!ctx.option) return null;
  const tag = ctx.option.misconception;
  if (tag === 'wrong-cell') {
    const header = renderRef(ctx.step.prompt.params?.header);
    if (header === undefined) return FALLBACK;
    return { key: 'dataReadWrongCell', params: { header } };
  }
  if (tag === 'wrong-total') {
    const header = renderRef(ctx.step.prompt.params?.header);
    if (header === undefined) return FALLBACK;
    return { key: 'dataReadWrongTotal', params: { header } };
  }
  return FALLBACK;
}

function explainTableSums(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (!ctx.option) return null;
  const scene = table(ctx.item);
  if (scene === undefined) return FALLBACK;
  const tag = ctx.option.misconception;
  const key = ctx.step.prompt.key;
  if (tag === 'missed-one') return { key: 'dataSumsMissedOne' };
  if (key === 'askRowSum') {
    if (tag === 'wrong-row') {
      const row = renderRef(ctx.step.prompt.params?.row);
      if (row === undefined) return FALLBACK;
      return { key: 'dataSumsWrongRow', params: { row } };
    }
    if (tag === 'wrong-column') {
      // The wrong option is some column's sum; the prompt only names the row.
      const row = renderRef(ctx.step.prompt.params?.row);
      if (row === undefined) return FALLBACK;
      return { key: 'dataSumsWrongColumnRow', params: { row } };
    }
    return FALLBACK;
  }
  if (key === 'askColSum') {
    const header = renderRef(ctx.step.prompt.params?.header);
    if (header === undefined) return FALLBACK;
    if (tag === 'wrong-column') return { key: 'dataSumsWrongColumn', params: { header } };
    if (tag === 'wrong-row') return { key: 'dataSumsWrongRowCol', params: { header } };
    return FALLBACK;
  }
  if (key === 'askTableSum') {
    if (tag === 'wrong-row') return { key: 'dataSumsOneRow' };
    return FALLBACK;
  }
  return FALLBACK;
}

function explainTableFill(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (!ctx.option) return null;
  const tag = ctx.option.misconception;
  const scene = table(ctx.item);
  if (tag === 'wrong-cell') {
    const hidden = scene?.hiddenCell;
    if (hidden === undefined) return FALLBACK;
    if (hidden.row === 2) return { key: 'dataFillWrongCellAll' };
    // A Boys/Girls cell: the child copied the other row's value.
    const rowLabel = scene?.rowLabels?.[hidden.row];
    const otherLabel = scene?.rowLabels?.[hidden.row === 0 ? 1 : 0];
    const row = renderRef(rowLabel);
    const other = renderRef(otherLabel);
    if (row === undefined || other === undefined) return FALLBACK;
    return { key: 'dataFillWrongCellRow', params: { row, other } };
  }
  if (tag === 'wrong-total') return { key: 'dataFillWrongTotal' };
  return FALLBACK;
}

function explainTableMaxMin(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (!ctx.option) return null;
  const scene = table(ctx.item);
  if (scene === undefined) return FALLBACK;
  // The option label IS the column identity: headerRef turns 'i:<noun>' into the
  // label key 'item_<noun>' and 'l:<key>' into '<key>' — there is no params.header.
  // Map the scene headers back to label keys and read that column's value.
  const labelKey = (hRef: string): string =>
    hRef.startsWith('i:') ? `item_${hRef.slice(2)}` : hRef.slice(2);
  const col = scene.headers.findIndex((h) => labelKey(h) === ctx.option?.label.key);
  const value = col >= 0 ? scene.rows[0]?.[col] : undefined;
  const values = (scene.rows[0] ?? []).filter((v): v is number => v !== null);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const key = ctx.step.prompt.key;
  if (value === undefined) return FALLBACK;
  if (key === 'askMost') {
    if (value === min) return { key: 'dataMaxReversed' };
    return { key: 'dataMaxNear' };
  }
  if (key === 'askLeast') {
    if (value === max) return { key: 'dataMinReversed' };
    return { key: 'dataMinNear' };
  }
  return { key: 'dataMaxMinFallback' };
}

function explainTally(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (!ctx.option) return null;
  const tag = ctx.option.misconception;
  if (tag === 'counted-all') return { key: 'dataTallyCountedAll' };
  if (tag === 'counted-miss') return { key: 'dataTallyCountedMiss' };
  return { key: 'dataTallyFallback' };
}

function explainChance(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (!ctx.option) return null;
  const tag = ctx.option.misconception;
  const bag = ctx.skillId === 'chance-bag';
  // The face is on the step prompt ("ra mặt {face} chấm"), not on the story.
  const face = numParam(ctx.step.prompt.params, 'face');
  // A wrong option's tag says what the child chose (before the dash) versus what is
  // right (after it): "certain-when-possible" = chose "certain", correct is "possible".
  const [chosen, right] = tag?.split('-when-') ?? [];
  if (tag === undefined || chosen === undefined || right === undefined) return FALLBACK;
  if (bag) {
    if (chosen === 'certain' && right === 'possible') return { key: 'dataChanceBagCertain' };
    if (right === 'impossible') return { key: 'dataChanceBagNotThere' };
    return { key: 'dataChanceBagIsThere' };
  }
  if (chosen === 'certain' && right === 'possible') {
    if (face === undefined) return FALLBACK;
    return { key: 'dataChanceDiceCertain', params: { face } };
  }
  if (right === 'certain') return { key: 'dataChanceDiceAll' };
  if (right === 'possible') {
    if (face === undefined) return FALLBACK;
    return { key: 'dataChanceDiceIsThere', params: { face } };
  }
  if (right === 'impossible') {
    if (face === undefined) return FALLBACK;
    return { key: 'dataChanceDiceNotThere', params: { face } };
  }
  return FALLBACK;
}

export function explainData(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (ctx.skillId === 'table-read') return explainTableRead(ctx);
  if (ctx.skillId === 'table-sums') return explainTableSums(ctx);
  if (ctx.skillId === 'table-fill-missing') return explainTableFill(ctx);
  if (ctx.skillId === 'table-max-min') return explainTableMaxMin(ctx);
  if (ctx.skillId === 'tally-count') return explainTally(ctx);
  if (ctx.skillId === 'chance-bag' || ctx.skillId === 'chance-dice') return explainChance(ctx);
  return null;
}
