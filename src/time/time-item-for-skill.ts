// One entry point for the time family (phase 13): a time-family skill id + rng + tier -> item.
// Scene-free skills (months-days-count, times-order-digital) render in the shared dialog
// today; the picture skills wait for the phase-17 scene renderer.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { calendarDaysBetween, calendarWeekday, monthsDaysCount } from './calendar-generators';
import {
  clockElapsedMinutes,
  clockRead5min,
  clockReadHourHalf,
  clockReadMinute,
  clockSangChieu24h,
  clockSetClock,
  romanClockHour,
  timesOrderDigital,
} from './clock-generators';
import type { TimeGenerator, TimeItem } from './time-scene-types';

const GENERATORS: Readonly<Record<string, TimeGenerator>> = {
  'clock-read-hour-half': clockReadHourHalf,
  'clock-read-5min': clockRead5min,
  'clock-read-minute': clockReadMinute,
  'clock-sang-chieu-24h': clockSangChieu24h,
  'clock-elapsed-minutes': clockElapsedMinutes,
  'times-order-digital': timesOrderDigital,
  'roman-clock-hour': romanClockHour,
  'months-days-count': monthsDaysCount,
  'calendar-weekday': calendarWeekday,
  'calendar-days-between': calendarDaysBetween,
  'time-set-clock': clockSetClock,
};

/** The time skills (catalog order) that have a generator. */
export const TIME_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isTimeSkill = (id: string): boolean => id in GENERATORS;

/** The time skills whose items carry no scene: months-days-count and times-order-digital
 * render in the shared dialog, and time-set-clock draws its own clock in the step widget. */
export const TIME_SCENE_FREE_SKILLS: readonly string[] = Object.freeze([
  'months-days-count',
  'times-order-digital',
  'time-set-clock',
]);

/** True when the skill's items never need a picture. */
export const isTimeSceneFreeSkill = (id: string): boolean => TIME_SCENE_FREE_SKILLS.includes(id);

/** Pure and deterministic for a seeded `rng`; throws for skills without a time generator. */
export function timeItemForSkill(id: string, rng: Rng, tier: SkillTier): TimeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`time: no generator for skill "${id}"`);
  return generate(rng, tier);
}
