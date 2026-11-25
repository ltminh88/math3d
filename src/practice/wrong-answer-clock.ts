// Nhóm 6 (R35) — đồng hồ số La Mã / sáng–chiều: roman-clock-hour / clock-sang-chieu-24h.
// One choice step (step 0). The scene holds the 12-hour face ({h, m}); the period
// (morning/afternoon/evening) lives only in the story key, and the right 24-hour time
// only in the correct option's label — so the matcher trusts the option's misconception
// tag and reads its numbers from the scene. Morning has no am-pm trap: the [h, m]
// candidate equals the answer and is filtered out by the generator.
import type { ClockScene } from '../time/time-scene-types';
import type { WrongAnswerContext, WrongAnswerExplanation } from './wrong-answer-explanation';

/** The big numeral of a subtractive pair: IV↔VI reads around V, IX↔XI around X. */
const ROMAN_BIG: Record<number, string> = { 4: 'V', 6: 'V', 9: 'X', 11: 'X' };

export function explainClock(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const roman = ctx.skillId === 'roman-clock-hour';
  const fallback: WrongAnswerExplanation = {
    key: roman ? 'clockRomanFallback' : 'clockSangChieuFallback',
  };
  const scene = ctx.item.scene as ClockScene | undefined;
  if (scene?.kind !== 'clock') return fallback;
  const tag = ctx.option?.misconception;
  if (tag === 'am-pm-12h') {
    const storyKey = ctx.item.story.key;
    if (storyKey === 'sangChieuStoryEvening')
      return { key: 'clockWrongPeriodEvening', params: { h: scene.h } };
    if (storyKey === 'roman24Story' || storyKey === 'sangChieuStoryAfternoon')
      return { key: 'clockWrongPeriodAfternoon', params: { h: scene.h } };
    return fallback;
  }
  if (tag === 'five-min-misread') {
    const mark = scene.m / 5;
    if (Number.isInteger(mark) && mark > 0) return { key: 'clockFiveMin', params: { mark } };
    return fallback;
  }
  if (tag === 'roman-subtractive') {
    const big = ROMAN_BIG[scene.h];
    if (big) return { key: 'clockRomanSubtractive', params: { big } };
    return fallback;
  }
  if (tag === 'near-miss') return { key: 'clockNearHour' };
  return fallback;
}
