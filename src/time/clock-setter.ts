// Clock setter math (R37): pointer angle <-> time on a 12-hour face, minute snap,
// and the tolerance check for a set clock. The child drags hands, so the contract is
// in angles: the minute hand must sit within half a snap step of the target minute
// (15° on the 5-minute grid, 3° on the 1-minute grid) and the hour hand within half
// an hour division (15°) of its true position — which already accounts for the
// minutes, so 3:25 puts it between 3 and 4. With snapped inputs this is exact
// (h, m), but the angle form is the contract the widget and the tests share.
import type { SkillTier } from '../learning/skill-tiers';

/** A time set on the clock face: hour 1..12, minute 0..59. */
export interface ClockSetting {
  readonly h: number;
  readonly m: number;
}

/** Minute-hand snap by tier: 5 minutes on tiers 1–2, 1 minute on tier 3. */
export function snapMinutesForTier(tier: SkillTier): 5 | 1 {
  return tier === 3 ? 1 : 5;
}

/** An angle to [0, 360): 0 is 12 o'clock, clockwise. */
const normAngle = (angleDeg: number): number => ((angleDeg % 360) + 360) % 360;

/** Minutes 0..59 from a pointer angle, snapped to the grid. */
export function angleToMinutes(angleDeg: number, snapMinutes: 5 | 1): number {
  const steps = Math.round(normAngle(angleDeg) / 6 / snapMinutes);
  return (steps * snapMinutes) % 60;
}

/** Hour 1..12 from a pointer angle, given the minutes the minute hand shows: the
 * hand sits at (h + m/60)·30°, so h = round(angle/30 − m/60). The minutes matter —
 * at 10:30 the hand is exactly between 10 and 11 (315°), and the hour is 10,
 * not the nearest mark (11). */
export function angleToHour(angleDeg: number, minutes = 0): number {
  const hour = ((Math.round(normAngle(angleDeg) / 30 - minutes / 60) % 12) + 12) % 12;
  return hour === 0 ? 12 : hour;
}

/** Minute-hand angle in degrees (0 is 12 o'clock). */
export const minuteHandAngle = (m: number): number => m * 6;

/** Hour-hand angle in degrees: the hour plus the minutes already passed. */
export const hourHandAngle = (h: number, m: number): number => ((h % 12) + m / 60) * 30;

/** Smallest angle between two directions, 0..180. */
export function angularDiff(a: number, b: number): number {
  const d = Math.abs(normAngle(a - b));
  return Math.min(d, 360 - d);
}

/** True when the set hands sit within tolerance of the target time. */
export function isSetClockCorrect(
  set: ClockSetting,
  target: ClockSetting,
  snapMinutes: 5 | 1,
): boolean {
  const minuteTol = snapMinutes * 3;
  const hourTol = 15;
  return (
    angularDiff(minuteHandAngle(set.m), minuteHandAngle(target.m)) <= minuteTol &&
    angularDiff(hourHandAngle(set.h, set.m), hourHandAngle(target.h, target.m)) <= hourTol
  );
}
