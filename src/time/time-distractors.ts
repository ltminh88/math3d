// Builders shared by the time generators: items with or without a scene, digital /
// Roman / weekday options, and clock and month-calendar scenes. Distractors each stand
// for a named misconception; digital near misses stay on the 12-hour face.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  type Candidate,
  optionsFrom,
  reasoningItem,
  ref,
} from '../reasoning/reasoning-distractors';
import type { ChoiceOption, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { firstWeekday } from './calendar-math';
import { clock12, digitalText, MIN_UNIT_PX } from './time-ranges';
import type { ClockScene, MonthCalendarScene, TimeItem, TimeScene } from './time-scene-types';

/** The digital time "8:15" as a prompt. */
export const digitalLabel = (h: number, m: number): PromptRef =>
  ref('digital', { h, mm: String(m).padStart(2, '0') });

/** The hour "8 giờ" as a prompt. */
export const hourLabel = (h: number): PromptRef => ref('hour', { h });

/** The Roman numeral "VIII" as a prompt. */
export const romanLabel = (r: string): PromptRef => ref('roman', { r });

/** The weekday "thứ Hai" (0 = Sunday) as a prompt. */
export const weekdayLabel = (w: number): PromptRef => ref(`wd_${w}`);

/** A sequence "8:15, 9:30, 10:00" as a prompt (times-order-digital options). */
export const seqLabel = (a: string, b: string, c: string): PromptRef => ref('seq', { a, b, c });

/** A clock scene: one face, or a start/end pair for elapsed (end is after start). */
export const clockScene = (
  h: number,
  m: number,
  opts: { roman?: boolean; endH?: number; endM?: number } = {},
): ClockScene => ({ kind: 'clock', h, m, ...opts, minUnitPx: MIN_UNIT_PX });

/** A month-calendar scene: the page for `month` of `year`, first weekday computed. */
export const calendarScene = (year: number, month: number): MonthCalendarScene => ({
  kind: 'month-calendar',
  year,
  month,
  firstWeekday: firstWeekday(year, month),
  minUnitPx: MIN_UNIT_PX,
});

/** A scene-free item (months-days-count, times-order-digital): it renders in the shared
 * dialog today, with no phase-17 renderer needed. */
export const timeItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  work: readonly number[] = [],
): TimeItem => reasoningItem(skillId, tier, story, steps, work);

/** An item with a picture: the scene is exactly what the phase-17 renderer draws. */
export const timeSceneItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  sceneData: TimeScene,
  work: readonly number[] = [],
): TimeItem => ({ ...reasoningItem(skillId, tier, story, steps, work), scene: sceneData });

/** A choice among prompt labels: the correct one first, then misconception distractors. */
export function labelChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  correct: PromptRef,
  candidates: readonly Candidate<PromptRef>[],
): ReasoningStep {
  const options = optionsFrom(rng, correct, candidates, (label) => label);
  return { kind: 'choice', prompt, options };
}

/** Shift a 12-hour-face time by `delta` minutes (wraps the hour, never leaves 1..12). */
const shiftFace = (h: number, m: number, delta: number): { h: number; m: number } => {
  const total = (h === 12 ? 720 : h * 60) + m + delta;
  return clock12(((total - 1) % 720) + 1);
};

/** Shift a 24-hour time by `delta` minutes (wraps at midnight). */
const shift24 = (h: number, m: number, delta: number): { h: number; m: number } => {
  const total = (((h * 60 + m + delta) % 1440) + 1440) % 1440;
  return { h: Math.floor(total / 60), m: total % 60 };
};

const NEAR_MIN: readonly number[] = [1, -1, 5, -5, 60, -60, 10, -10];

/** Near-miss steps (minutes) by tier: T1 stays far (hours apart), T3 stays close (minutes). */
export const NEAR_BY_TIER: Record<SkillTier, readonly number[]> = {
  1: [60, -60, 120, -120, 5, -5, 1, -1],
  2: [5, -5, 60, -60, 1, -1, 10, -10],
  3: [1, -1, 2, -2, 5, -5, 60, -60],
};

/** Digital options (3-4): misconception values first, then near misses.
 * `face24` shifts near misses in 24-hour minutes (sáng/chiều answers); otherwise they
 * stay on the 12-hour face. `nearMin` orders the near misses (tiers stay far or close). */
export function digitalOptions(
  rng: Rng,
  h: number,
  m: number,
  candidates: readonly Candidate<readonly [number, number]>[],
  count = 4,
  face24 = false,
  nearMin: readonly number[] = NEAR_MIN,
): ChoiceOption[] {
  const correctKey = digitalText(h, m);
  const valid = candidates.filter((c) => {
    const [ch, cm] = c.value;
    return ch >= 0 && ch <= 23 && cm >= 0 && cm <= 59 && digitalText(ch, cm) !== correctKey;
  });
  const near: Candidate<readonly [number, number]>[] = nearMin.map((d) => {
    const shifted = face24 ? shift24(h, m, d) : shiftFace(h, m, d);
    return { value: [shifted.h, shifted.m] as const, misconception: 'near-miss' as const };
  });
  return optionsFrom(
    rng,
    [h, m] as const,
    [...valid, ...near],
    ([ch, cm]) => digitalLabel(ch, cm),
    count,
  );
}

/** A choice of 3-4 digital times: the answer h:m, then misconception times. */
export function digitalChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  h: number,
  m: number,
  candidates: readonly Candidate<readonly [number, number]>[],
  face24 = false,
  nearMin: readonly number[] = NEAR_MIN,
): ReasoningStep {
  return {
    kind: 'choice',
    prompt,
    options: digitalOptions(rng, h, m, candidates, 4, face24, nearMin),
  };
}
