// KNTT T2 B66 (xem đồng hồ, tháng–năm): month lengths, weekday of a date, days between
// two dates — all read off one month-calendar page (the scene), except month lengths,
// which a child recalls (scene-free).
import { pick } from '../learning/seeded-rng';
import { type Candidate, numberChoiceStep, ref } from '../reasoning/reasoning-distractors';
import { daysInMonth, weekdayOf } from './calendar-math';
import {
  calendarScene,
  labelChoiceStep,
  timeItem,
  timeSceneItem,
  weekdayLabel,
} from './time-distractors';
import { LEAP_YEAR, NON_LEAP_YEARS, YEARS } from './time-ranges';
import type { TimeGenerator } from './time-scene-types';

const MONTHS_30 = [4, 6, 9, 11] as const;
const MONTHS_31 = [1, 3, 5, 7, 8, 10, 12] as const;
const MONTHS_NON_FEB = [...MONTHS_30, ...MONTHS_31] as const;

export const monthsDaysCount: TimeGenerator = (rng, tier) => {
  let m: number;
  let y: number;
  if (tier === 1) {
    m = pick(rng, MONTHS_NON_FEB);
    y = pick(rng, YEARS);
  } else if (tier === 2) {
    m = pick(rng, [2, ...MONTHS_NON_FEB] as const);
    y = m === 2 ? pick(rng, NON_LEAP_YEARS) : pick(rng, YEARS);
  } else {
    m = pick(rng, [2, ...MONTHS_NON_FEB] as const);
    y = m === 2 ? LEAP_YEAR : pick(rng, YEARS);
  }
  const days = daysInMonth(y, m);
  const candidates: Candidate<number>[] = [
    { value: 31, misconception: 'wrong-month-length' as const },
    { value: 30, misconception: 'wrong-month-length' as const },
    { value: 29, misconception: 'wrong-month-length' as const },
    { value: 28, misconception: 'wrong-month-length' as const },
  ].filter((c) => c.value !== days);
  const step = numberChoiceStep(rng, ref('askMonthDays'), days, candidates);
  return timeItem('months-days-count', tier, ref('monthStory', { m, y }), [step]);
};

export const calendarWeekday: TimeGenerator = (rng, tier) => {
  const y = pick(rng, YEARS);
  const m = pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const);
  const last = daysInMonth(y, m);
  const d =
    tier === 1
      ? 1 + Math.floor(rng() * Math.min(7, last))
      : tier === 3
        ? 21 + Math.floor(rng() * (last - 20))
        : 1 + Math.floor(rng() * last);
  const w = weekdayOf(y, m, d);
  const step = labelChoiceStep(
    rng,
    ref('askWeekday', { d }),
    weekdayLabel(w),
    [1, -1, 2].map((delta) => ({
      value: weekdayLabel((((w + delta) % 7) + 7) % 7),
      misconception: 'wrong-weekday' as const,
    })),
  );
  return timeSceneItem(
    'calendar-weekday',
    tier,
    ref('calendarStory', { m, y }),
    [step],
    calendarScene(y, m),
  );
};

export const calendarDaysBetween: TimeGenerator = (rng, tier) => {
  const y = pick(rng, YEARS);
  const m = pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const);
  const last = daysInMonth(y, m);
  const d1 = 1 + Math.floor(rng() * (last - 1));
  // T1 keeps the gap inside one week; T2/T3 span the month.
  const maxDiff = tier === 1 ? Math.min(7, last - d1) : last - d1;
  const diff = 1 + Math.floor(rng() * maxDiff);
  const d2 = d1 + diff;
  const candidates: Candidate<number>[] = [
    { value: diff + 1, misconception: 'inclusive-count' as const },
  ];
  const step = numberChoiceStep(rng, ref('askBetween', { d1, d2 }), diff, candidates);
  return timeSceneItem(
    'calendar-days-between',
    tier,
    ref('calendarStory', { m, y }),
    [step],
    calendarScene(y, m),
  );
};
