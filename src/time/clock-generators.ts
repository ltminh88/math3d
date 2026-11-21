// KNTT T2 B66 (xem đồng hồ) and B47 (số La Mã): clock reading MCQ on an analog face,
// sáng/chiều ↔ 24h, elapsed minutes between two clocks, ordering digital times.
// The clock scene is plain data; the phase-17 renderer draws the face.
import { pick, shuffle } from '../learning/seeded-rng';
import { type Candidate, numberChoiceStep, ref } from '../reasoning/reasoning-distractors';
import type { PromptRef } from '../reasoning/reasoning-types';
import {
  clockScene,
  digitalChoiceStep,
  hourLabel,
  labelChoiceStep,
  NEAR_BY_TIER,
  romanLabel,
  seqLabel,
  timeItem,
  timeSceneItem,
} from './time-distractors';
import { clock12, digitalText, romanFor } from './time-ranges';
import type { TimeGenerator } from './time-scene-types';

const HOURS_1_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const FIVE_MIN = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;

/** The swapped-hands trap: the minute hand read as the hour, the hour hand as minutes. */
const swapped = (h: number, m: number): Candidate<readonly [number, number]>[] =>
  m % 5 === 0 && m > 0 && h <= 11
    ? [{ value: [m / 5, h * 5] as const, misconception: 'swapped-hands' as const }]
    : [];

/** The 5-minute misread: the minute hand on 3 read as 3 minutes, not 15. */
const fiveMinMisread = (h: number, m: number): Candidate<readonly [number, number]>[] =>
  m % 5 === 0 && m > 0
    ? [{ value: [h, m / 5] as const, misconception: 'five-min-misread' as const }]
    : [];

export const clockReadHourHalf: TimeGenerator = (rng, tier) => {
  const h = pick(rng, HOURS_1_12);
  const m = pick(rng, [0, 30] as const);
  const candidates: Candidate<readonly [number, number]>[] = [];
  if (tier >= 2) candidates.push(...swapped(h, m));
  if (tier === 3 && m === 30)
    candidates.push({
      value: [h === 12 ? 1 : h + 1, 30] as const,
      misconception: 'next-hour' as const,
    });
  const step = digitalChoiceStep(rng, ref('askClock'), h, m, candidates, false, NEAR_BY_TIER[tier]);
  return timeSceneItem('clock-read-hour-half', tier, ref('clockStory'), [step], clockScene(h, m));
};

export const clockRead5min: TimeGenerator = (rng, tier) => {
  const h = pick(rng, HOURS_1_12);
  const m = tier === 1 ? pick(rng, [0, 15, 30, 45] as const) : pick(rng, FIVE_MIN);
  const candidates: Candidate<readonly [number, number]>[] = [];
  if (tier >= 2) candidates.push(...fiveMinMisread(h, m), ...swapped(h, m));
  const step = digitalChoiceStep(rng, ref('askClock'), h, m, candidates, false, NEAR_BY_TIER[tier]);
  return timeSceneItem('clock-read-5min', tier, ref('clockStory'), [step], clockScene(h, m));
};

export const clockReadMinute: TimeGenerator = (rng, tier) => {
  const h = pick(rng, HOURS_1_12);
  const m = tier === 1 ? pick(rng, FIVE_MIN) : Math.floor(rng() * 60);
  const candidates: Candidate<readonly [number, number]>[] = [];
  if (tier >= 2) candidates.push(...fiveMinMisread(h, m), ...swapped(h, m));
  const step = digitalChoiceStep(rng, ref('askClock'), h, m, candidates, false, NEAR_BY_TIER[tier]);
  return timeSceneItem('clock-read-minute', tier, ref('clockStory'), [step], clockScene(h, m));
};

const PERIOD_STORIES = {
  morning: 'sangChieuStoryMorning',
  afternoon: 'sangChieuStoryAfternoon',
  evening: 'sangChieuStoryEvening',
} as const;

export const clockSangChieu24h: TimeGenerator = (rng, tier) => {
  // 12 is excluded: 12 sáng would be 00:xx and 12 chiều 12:xx, a different lesson.
  const h = pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const);
  const m = tier === 1 ? 0 : tier === 2 ? pick(rng, FIVE_MIN) : Math.floor(rng() * 60);
  const period = pick(rng, ['morning', 'afternoon', 'evening'] as const);
  const h24 = period === 'morning' ? h : h + 12;
  const candidates: Candidate<readonly [number, number]>[] = [
    { value: [h, m] as const, misconception: 'am-pm-12h' as const },
  ];
  if (tier >= 2) candidates.push(...fiveMinMisread(h24, m));
  const step = digitalChoiceStep(
    rng,
    ref('askClock'),
    h24,
    m,
    candidates,
    true,
    NEAR_BY_TIER[tier],
  );
  return timeSceneItem(
    'clock-sang-chieu-24h',
    tier,
    ref(PERIOD_STORIES[period]),
    [step],
    clockScene(h, m),
  );
};

export const clockElapsedMinutes: TimeGenerator = (rng, tier) => {
  const startH = pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const);
  // T1 stays inside one hour, so the start minute leaves room for at least 5 minutes.
  const startM =
    tier === 1
      ? pick(rng, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const)
      : pick(rng, FIVE_MIN);
  const startMin = startH * 60 + startM;
  const minE = tier === 3 ? 10 : 5;
  const maxE = tier === 1 ? 30 : tier === 2 ? 60 : 100;
  const possible: number[] = [];
  for (let e = minE; e <= maxE; e += 5)
    if (tier === 1 ? startM + e < 60 : startMin + e <= 835) possible.push(e);
  const elapsed = pick(rng, possible);
  const end = clock12(startMin + elapsed);
  const candidates: Candidate<number>[] = [
    { value: elapsed + 60, misconception: 'elapsed-hour' as const },
  ];
  const step = numberChoiceStep(rng, ref('askElapsed'), elapsed, candidates);
  return timeSceneItem(
    'clock-elapsed-minutes',
    tier,
    ref('elapsedStory'),
    [step],
    clockScene(startH, startM, { endH: end.h, endM: end.m }),
    [elapsed],
  );
};

export const timesOrderDigital: TimeGenerator = (rng, tier) => {
  // Three distinct 24h times: T1 hour-only far apart, T2 mixed minutes, T3 close together.
  let times: { h: number; m: number }[];
  if (tier === 1) {
    const hours = shuffle(rng, [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
    times = hours.slice(0, 3).map((h) => ({ h, m: 0 }));
  } else if (tier === 2) {
    const seen = new Set<number>();
    times = [];
    while (times.length < 3) {
      const h = 6 + Math.floor(rng() * 17);
      const m = pick(rng, FIVE_MIN);
      const key = h * 60 + m;
      if (!seen.has(key)) {
        seen.add(key);
        times.push({ h, m });
      }
    }
  } else {
    const baseH = 6 + Math.floor(rng() * 15);
    const baseM = pick(rng, FIVE_MIN);
    const base = baseH * 60 + baseM;
    times = [0, 1, 2].map((k) => {
      const total = base + k * pick(rng, [5, 10, 15, 20, 25, 30]);
      return { h: Math.floor(total / 60), m: total % 60 };
    });
    times = [...new Map(times.map((t) => [t.h * 60 + t.m, t])).values()];
    while (times.length < 3) {
      const total = base + 35 + times.length * 5;
      times.push({ h: Math.floor(total / 60), m: total % 60 });
    }
  }
  const sorted = [...times].sort((a, b) => a.h * 60 + a.m - (b.h * 60 + b.m));
  const shuffled = shuffle(rng, times);
  const story = ref('orderStory', {
    a: digitalText(shuffled[0]?.h ?? 0, shuffled[0]?.m ?? 0),
    b: digitalText(shuffled[1]?.h ?? 0, shuffled[1]?.m ?? 0),
    c: digitalText(shuffled[2]?.h ?? 0, shuffled[2]?.m ?? 0),
  });
  const correctSeq = seqLabel(
    digitalText(sorted[0]?.h ?? 0, sorted[0]?.m ?? 0),
    digitalText(sorted[1]?.h ?? 0, sorted[1]?.m ?? 0),
    digitalText(sorted[2]?.h ?? 0, sorted[2]?.m ?? 0),
  );
  const PERMS = [
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ] as const;
  const perms = shuffle(
    rng,
    PERMS.map(([a, b, c]) => [sorted[a], sorted[b], sorted[c]]),
  ).slice(0, 3);
  const step = labelChoiceStep(
    rng,
    ref('askOrder'),
    correctSeq,
    perms.map((seq) => ({
      value: seqLabel(
        digitalText(seq[0]?.h ?? 0, seq[0]?.m ?? 0),
        digitalText(seq[1]?.h ?? 0, seq[1]?.m ?? 0),
        digitalText(seq[2]?.h ?? 0, seq[2]?.m ?? 0),
      ),
      misconception: 'wrong-order' as const,
    })),
  );
  return timeItem('times-order-digital', tier, story, [step]);
};

export const romanClockHour: TimeGenerator = (rng, tier) => {
  const h =
    tier === 3 ? pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const) : pick(rng, HOURS_1_12);
  const sceneData = clockScene(h, 0, { roman: true });
  if (tier === 3) {
    const candidates: Candidate<readonly [number, number]>[] = [
      { value: [h, 0] as const, misconception: 'am-pm-12h' as const },
    ];
    const step = digitalChoiceStep(
      rng,
      ref('askClock'),
      h + 12,
      0,
      candidates,
      true,
      NEAR_BY_TIER[3],
    );
    return timeSceneItem('roman-clock-hour', tier, ref('roman24Story'), [step], sceneData);
  }
  if (tier === 2) {
    const candidates: Candidate<string>[] = [];
    const wrongHours = shuffle(
      rng,
      HOURS_1_12.filter((x) => x !== h),
    ).slice(0, 3);
    for (const w of wrongHours)
      candidates.push({ value: romanFor(w), misconception: 'near-miss' as const });
    if (h === 4 || h === 9) {
      // IV read as VI, IX read as XI: adding instead of subtracting.
      candidates[0] = {
        value: romanFor(h === 4 ? 6 : 11),
        misconception: 'roman-subtractive' as const,
      };
    }
    const step = labelChoiceStep(
      rng,
      ref('askClock'),
      romanLabel(romanFor(h)),
      candidates.map((c) => ({ value: romanLabel(c.value), misconception: c.misconception })),
    );
    return timeSceneItem('roman-clock-hour', tier, ref('clockStory'), [step], sceneData);
  }
  const candidates: Candidate<PromptRef>[] = [];
  const wrongHours = shuffle(
    rng,
    HOURS_1_12.filter((x) => x !== h),
  ).slice(0, 3);
  for (const w of wrongHours)
    candidates.push({ value: hourLabel(w), misconception: 'near-miss' as const });
  if (h === 4 || h === 9) {
    candidates[0] = {
      value: hourLabel(h === 4 ? 6 : 11),
      misconception: 'roman-subtractive' as const,
    };
  }
  const step = labelChoiceStep(rng, ref('askClock'), hourLabel(h), candidates);
  return timeSceneItem('roman-clock-hour', tier, ref('clockStory'), [step], sceneData);
};
