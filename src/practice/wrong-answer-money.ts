// Nhóm 7 (R35) — tiền: money-change-back / money-total-notes / money-pick-notes /
// money-wp. Story amounts arrive as formatted strings ("10 000", U+202F grouping),
// so the matcher parses them back to numbers — or, better, reads them from `work`
// (paid = total + change). Amount params in explanations are formatted strings, never
// raw numbers, so "10 000" stays grouped the way the story shows it. The change
// itself is the answer on the askChange step, so it is never named.
import { DENOMINATIONS } from '../money/money-ranges';
import type { MoneyScene } from '../money/money-scene-types';
import { formatMoney, renderMoneyPrompt } from '../money/money-strings';
import {
  numParam,
  type WrongAnswerContext,
  type WrongAnswerExplanation,
} from './wrong-answer-explanation';

const FALLBACK: WrongAnswerExplanation = { key: 'moneyFallback' };

/** A formatted amount ("10 000") back to a number. */
function parseMoney(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const n = Number(value.replace(/\D/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

/** An 'i:<noun>' story param rendered in the current language ("quyển vở"). */
function renderNoun(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('i:')) return undefined;
  return renderMoneyPrompt({ key: `item_${value.slice(2)}` });
}

function explainChangeBack(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (ctx.step.kind !== 'number') return FALLBACK;
  const params = ctx.item.story.params;
  const count = numParam(params, 'count');
  const price = parseMoney(params?.price);
  const work = ctx.item.work;
  const key = ctx.step.prompt.key;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  if (key === 'askChangeTotal') {
    // Step 0 of tiers 2+: the total. The total itself is the answer, so it is never
    // named; the paid note is in the story and safe to name.
    const total = work[0];
    const change = work[1];
    if (total === undefined || change === undefined) return FALLBACK;
    const paid = total + change;
    if (w === paid) {
      if (count === undefined) return FALLBACK;
      return { key: 'moneyTotalPaidNote', params: { paid: formatMoney(paid), count } };
    }
    if (w === change) return { key: 'moneyTotalChangeFirst' };
    if (count === undefined) return FALLBACK;
    return { key: 'moneyTotalFallback', params: { count } };
  }
  if (key !== 'askChange') return FALLBACK;
  const change = ctx.step.answer;
  const total =
    work.length === 2
      ? work[0]
      : count !== undefined && price !== undefined
        ? count * price
        : undefined;
  if (total === undefined) return FALLBACK;
  const paid = total + change;
  const paidText = formatMoney(paid);
  const totalText = formatMoney(total);
  if (w === total) return { key: 'moneyChangeTotal', params: { total: totalText, paid: paidText } };
  if (w === paid) return { key: 'moneyChangeWholeNote', params: { paid: paidText } };
  if (w === paid + total)
    return { key: 'moneyChangeAdded', params: { paid: paidText, total: totalText } };
  // Off by exactly one banknote — or by one extra zero (10× the change).
  if ((DENOMINATIONS.includes(Math.abs(w - change)) && w % 1000 === 0) || w === 10 * change)
    return { key: 'moneyChangeOneNote', params: { paid: paidText, total: totalText } };
  return { key: 'moneyChangeFallback', params: { paid: paidText, total: totalText } };
}

function explainTotalNotes(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (!ctx.option) return null;
  const tag = ctx.option.misconception;
  if (tag === 'missed-note') return { key: 'moneyTotalMissed' };
  if (tag === 'double-counted') return { key: 'moneyTotalDouble' };
  return { key: 'moneyCountFallback' };
}

function explainPickNotes(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (ctx.step.kind !== 'multi') return FALLBACK;
  const scene = ctx.item.scene as MoneyScene | undefined;
  const target = ctx.item.work[0];
  if (scene?.kind !== 'notes' || target === undefined) return FALLBACK;
  const chosen = new Set(ctx.chosenIds ?? []);
  let sum = 0;
  for (const option of ctx.step.options) {
    if (!chosen.has(option.id)) continue;
    const letter = option.label.params?.l;
    const note =
      typeof letter === 'string' ? scene.notes.find((n) => n.label === letter) : undefined;
    if (note) sum += note.value;
  }
  const correctCount = ctx.step.options.filter((o) => o.correct).length;
  const targetText = formatMoney(target);
  if (sum < target) return { key: 'moneyPickTooFew', params: { target: targetText } };
  if (sum > target) return { key: 'moneyPickTooMuch', params: { target: targetText } };
  if (chosen.size > correctCount)
    return { key: 'moneyPickTooMany', params: { target: targetText } };
  return { key: 'moneyPickFallback', params: { target: targetText } };
}

function explainMoneyWp(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const params = ctx.item.story.params;
  if (ctx.step.kind === 'choice') {
    if (!ctx.option) return null;
    const tag = ctx.option.misconception;
    if (tag === 'add-instead-of-times') {
      const count = numParam(params, 'count');
      const item = renderNoun(params?.item);
      const price = typeof params?.price === 'string' ? params.price : undefined;
      if (count === undefined || item === undefined || price === undefined) return FALLBACK;
      return { key: 'moneyWpAddShort', params: { count, item, price } };
    }
    if (tag === 'one-step-only') return { key: 'moneyWpOneItem' };
    return FALLBACK;
  }
  if (ctx.step.kind !== 'number') return FALLBACK;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  const key = ctx.step.prompt.key;
  if (key === 'askWpTotal') {
    // Tier 3 step 0: the total. Same two traps as the choice tiers, as formulas.
    const count = numParam(params, 'count');
    const price = parseMoney(params?.price);
    if (count === undefined || price === undefined) return FALLBACK;
    if (w === (count - 1) * price) {
      const item = renderNoun(params?.item);
      const priceText = typeof params?.price === 'string' ? params.price : undefined;
      if (item === undefined || priceText === undefined) return FALLBACK;
      return { key: 'moneyWpAddShort', params: { count, item, price: priceText } };
    }
    if (w === price) return { key: 'moneyWpOneItem' };
    return { key: 'moneyTotalFallback', params: { count } };
  }
  if (key === 'askWpLeft') {
    const total = ctx.item.work[0];
    const left = ctx.step.answer;
    if (total === undefined) return FALLBACK;
    const have = total + left;
    if (w === total) return { key: 'moneyWpLeftTotal', params: { have: formatMoney(have) } };
    if (w === have) return { key: 'moneyWpLeftHave', params: { have: formatMoney(have) } };
    return { key: 'moneyWpFallback' };
  }
  return FALLBACK;
}

export function explainMoney(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (ctx.skillId === 'money-change-back') return explainChangeBack(ctx);
  if (ctx.skillId === 'money-total-notes') return explainTotalNotes(ctx);
  if (ctx.skillId === 'money-pick-notes') return explainPickNotes(ctx);
  if (ctx.skillId === 'money-wp') return explainMoneyWp(ctx);
  return null;
}
