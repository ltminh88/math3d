// Test-only helpers (imported by *.test.ts): recompute time facts from a scene's raw data
// (clock hands, calendar page) and from the step options, independently from the generators.
import { numbersOfItem } from '../reasoning/reasoning-test-oracles';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { ROMAN, toMinutes12 } from './time-ranges';
import type { ClockScene, MonthCalendarScene, TimeItem } from './time-scene-types';

/** The numeric value of a step: the number answer, or the correct choice's value — digital
 * times as minutes, Roman numerals as their hour, weekdays as 0 = Sunday. Sequences
 * (times-order-digital) carry no single number: use `correctSequence` for those. */
export function stepValue(step: ReasoningStep | undefined): number {
  if (step?.kind === 'number') return step.answer;
  if (step?.kind === 'choice') {
    const correct = step.options.find((o) => o.correct);
    if (!correct) throw new Error('step has no correct option');
    const { key, params } = correct.label;
    if (key === 'num') return Number(params?.n);
    if (key === 'digital') return Number(params?.h) * 60 + Number(params?.mm);
    if (key === 'roman') return ROMAN.indexOf(String(params?.r));
    if (key === 'hour') return Number(params?.h);
    if (key.startsWith('wd_')) return Number(key.slice(3));
  }
  throw new Error('step has no numeric value');
}

export const lastValue = (item: TimeItem): number => stepValue(item.steps.at(-1));

/** The clock scene of an item (throws for a calendar item). */
export function clockOf(item: TimeItem): ClockScene {
  if (item.scene?.kind !== 'clock') throw new Error('item has no clock scene');
  return item.scene;
}

/** The month-calendar scene of an item (throws for a clock item). */
export function calendarOf(item: TimeItem): MonthCalendarScene {
  if (item.scene?.kind !== 'month-calendar') throw new Error('item has no calendar scene');
  return item.scene;
}

/** The correct sequence of a times-order-digital item, as minutes after midnight. */
export function correctSequence(item: TimeItem): [number, number, number] {
  const step = item.steps[0];
  if (step?.kind !== 'choice') throw new Error('needs a choice step');
  const correct = step.options.find((o) => o.correct);
  if (correct?.label.key !== 'seq') throw new Error('needs a seq option');
  const toMin = (t: string | number | undefined): number => {
    const [h, m] = String(t).split(':');
    return Number(h) * 60 + Number(m);
  };
  const { a, b, c } = correct.label.params ?? {};
  return [toMin(a), toMin(b), toMin(c)];
}

/** Recompute every number of an item (story, steps, work, scene data) for the cap check.
 * The calendar year is a label, not a number the child computes with: it is left out
 * here (the sweep asserts it separately, 2024..2027). */
export function allNumbers(item: TimeItem): number[] {
  const scene = item.scene;
  // The year lives in the calendar scene, or in the story for the scene-free
  // months-days-count item (its story names the year February depends on).
  const year = scene?.kind === 'month-calendar' ? scene.year : Number(item.story.params?.y ?? NaN);
  const out = numbersOfItem(item).filter((n) => n !== year);
  if (!scene) return out;
  if (scene.kind === 'clock') {
    out.push(scene.h, scene.m);
    if (scene.endH !== undefined && scene.endM !== undefined) out.push(scene.endH, scene.endM);
  } else {
    out.push(scene.month, scene.firstWeekday);
  }
  return out;
}

/** Minutes after midnight on the 12-hour face (12 means 720). */
export const faceMinutes = (h: number, m: number): number => toMinutes12(h, m);
