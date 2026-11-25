// Time-family skill entries (phase 13): clock reading, 24h, elapsed, ordering, Roman
// clock, month lengths and calendar (B66, B67 via the B66 tags; B47 for the Roman clock).
// Catalog order is the phase file's list order.
import { entry, type SkillEntry, t2 } from '../learning/skill-entry';

/** Time skills, in catalog order. */
export const TIME_ENTRIES: readonly SkillEntry[] = Object.freeze([
  entry('clock-read-hour-half', 'time', [t2(66)]),
  entry('clock-read-5min', 'time', [t2(66)]),
  entry('clock-read-minute', 'time', [t2(66)]),
  entry('clock-sang-chieu-24h', 'time', [t2(66)]),
  entry('clock-elapsed-minutes', 'time', [t2(66)]),
  entry('times-order-digital', 'time', [t2(66)]),
  entry('roman-clock-hour', 'time', [t2(47)]),
  entry('months-days-count', 'time', [t2(66)]),
  entry('calendar-weekday', 'time', [t2(66)]),
  entry('calendar-days-between', 'time', [t2(66)]),
  entry('time-set-clock', 'time', [t2(66)]),
]);
