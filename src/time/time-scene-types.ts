// Time scenes (phase 13): plain data the phase-17 dialog renderer draws — an analog
// clock face (optionally Roman, optionally a start/end pair) or one month-calendar page.
// Scenes carry values, never pixels, so tests run in node.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeScene } from '../practice/practice-scene';
import type { ReasoningItem } from '../reasoning/reasoning-types';

/** One analog clock: hour 1..12, minute 0..59. `roman` draws Roman numerals I..XII. */
export interface ClockScene extends PracticeScene {
  readonly kind: 'clock';
  readonly h: number;
  readonly m: number;
  readonly roman?: boolean;
  /** Elapsed only: the end clock, drawn right of the start clock (end is after start). */
  readonly endH?: number;
  readonly endM?: number;
  readonly minUnitPx: number;
}

/** One month-calendar page: `firstWeekday` is the weekday of the 1st (0 = Sunday). */
export interface MonthCalendarScene extends PracticeScene {
  readonly kind: 'month-calendar';
  readonly year: number;
  readonly month: number;
  readonly firstWeekday: number;
  readonly minUnitPx: number;
}

export type TimeScene = ClockScene | MonthCalendarScene;

/** A time item: a ReasoningItem, with a scene exactly when the question shows a picture. */
export interface TimeItem extends ReasoningItem {
  readonly scene?: TimeScene;
}

export type TimeGenerator = (rng: Rng, tier: SkillTier) => TimeItem;
