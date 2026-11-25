// R35 lane 2 — group 6 (Roman clock / morning–afternoon): one choice step. The matcher
// trusts the option's misconception tag and reads its numbers from the clock scene.
// Traps to respect: morning has no am-pm trap, and on Roman tiers 1–2 picking 4/9 when
// the hour is 6/11 is a plain near-miss, not a subtractive misread.
import { describe, expect, test } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { Misconception, ReasoningStep } from '../reasoning/reasoning-types';
import type { ClockScene } from '../time/time-scene-types';
import { itemForSkill } from './item-for-skill';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const clockItem = (
  skillId: string,
  tier: SkillTier,
  storyKey: string,
  h: number,
  m: number,
  steps: ReasoningStep[],
  roman = false,
): PracticeItem => {
  const scene: ClockScene = { kind: 'clock', h, m, roman, minUnitPx: 28 };
  return { skillId, tier, story: { key: storyKey }, steps, work: [], scene };
};

const dig = (
  id: string,
  h: number,
  m: number,
  correct: boolean,
  misconception?: Misconception,
) => ({
  id,
  label: { key: 'digital', params: { h, mm: String(m).padStart(2, '0') } },
  correct,
  ...(misconception ? { misconception } : {}),
});
const hour = (id: string, h: number, correct: boolean, misconception?: Misconception) => ({
  id,
  label: { key: 'hour', params: { h } },
  correct,
  ...(misconception ? { misconception } : {}),
});
const romanOpt = (id: string, r: string, correct: boolean, misconception?: Misconception) => ({
  id,
  label: { key: 'roman', params: { r } },
  correct,
  ...(misconception ? { misconception } : {}),
});
const explain = (it: PracticeItem, stepIndex: number, answer: StepAnswer) =>
  explainWrongAnswer({
    skillId: it.skillId,
    tier: it.tier,
    item: it,
    stepIndex,
    answer,
    missNumber: 1,
  });

describe('explainWrongAnswer — group 6 clock', () => {
  test('sang-chieu afternoon: forgot +12, near hour', () => {
    const it = clockItem('clock-sang-chieu-24h', 1, 'sangChieuStoryAfternoon', 3, 0, [
      {
        kind: 'choice',
        prompt: { key: 'askClock' },
        options: [
          dig('o0', 15, 0, true),
          dig('o1', 3, 0, false, 'am-pm-12h'),
          dig('o2', 16, 0, false, 'near-miss'),
        ],
      },
    ]);
    expect(explain(it, 0, 'o1')).toEqual({ key: 'clockWrongPeriodAfternoon', params: { h: 3 } });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'clockNearHour' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('sang-chieu evening: forgot +12, read the minute mark as minutes', () => {
    const it = clockItem('clock-sang-chieu-24h', 2, 'sangChieuStoryEvening', 8, 30, [
      {
        kind: 'choice',
        prompt: { key: 'askClock' },
        options: [
          dig('o0', 20, 30, true),
          dig('o1', 8, 30, false, 'am-pm-12h'),
          dig('o2', 20, 6, false, 'five-min-misread'),
          dig('o3', 21, 30, false, 'near-miss'),
        ],
      },
    ]);
    expect(explain(it, 0, 'o1')).toEqual({ key: 'clockWrongPeriodEvening', params: { h: 8 } });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'clockFiveMin', params: { mark: 6 } });
    expect(explain(it, 0, 'o3')).toEqual({ key: 'clockNearHour' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('sang-chieu morning: no am-pm trap — an am-pm tag falls back', () => {
    const it = clockItem('clock-sang-chieu-24h', 1, 'sangChieuStoryMorning', 5, 0, [
      {
        kind: 'choice',
        prompt: { key: 'askClock' },
        options: [
          dig('o0', 5, 0, true),
          dig('o1', 5, 0, false, 'am-pm-12h'),
          dig('o2', 6, 0, false, 'near-miss'),
        ],
      },
    ]);
    expect(explain(it, 0, 'o1')).toEqual({ key: 'clockSangChieuFallback' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'clockNearHour' });
  });

  test('roman tier 3: forgot +12, subtractive misread, near hour', () => {
    const it = clockItem(
      'roman-clock-hour',
      3,
      'roman24Story',
      4,
      0,
      [
        {
          kind: 'choice',
          prompt: { key: 'askClock' },
          options: [
            dig('o0', 16, 0, true),
            dig('o1', 4, 0, false, 'am-pm-12h'),
            dig('o2', 18, 0, false, 'roman-subtractive'),
            dig('o3', 17, 0, false, 'near-miss'),
          ],
        },
      ],
      true,
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'clockWrongPeriodAfternoon', params: { h: 4 } });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'clockRomanSubtractive', params: { big: 'V' } });
    expect(explain(it, 0, 'o3')).toEqual({ key: 'clockNearHour' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('roman tier 1: IX read as XI (subtractive) vs plain near hour', () => {
    const it = clockItem(
      'roman-clock-hour',
      1,
      'clockStory',
      9,
      0,
      [
        {
          kind: 'choice',
          prompt: { key: 'askClock' },
          options: [
            hour('o0', 9, true),
            hour('o1', 11, false, 'roman-subtractive'),
            hour('o2', 8, false, 'near-miss'),
          ],
        },
      ],
      true,
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'clockRomanSubtractive', params: { big: 'X' } });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'clockNearHour' });
  });

  test('roman tier 2, hour 6: picking IV is a near-miss, not a subtractive misread', () => {
    const it = clockItem(
      'roman-clock-hour',
      2,
      'clockStory',
      6,
      0,
      [
        {
          kind: 'choice',
          prompt: { key: 'askClock' },
          options: [
            romanOpt('o0', 'VI', true),
            romanOpt('o1', 'IV', false, 'near-miss'),
            romanOpt('o2', 'V', false, 'near-miss'),
          ],
        },
      ],
      true,
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'clockNearHour' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'clockNearHour' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const skillId of ['roman-clock-hour', 'clock-sang-chieu-24h']) {
      for (const tier of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 10; seed++) {
          const it = itemForSkill(skillId, mulberry32(seed), tier);
          it.steps.forEach((step, s) => {
            const wrong: StepAnswer =
              step.kind === 'number'
                ? step.answer + 1
                : step.kind === 'choice'
                  ? (step.options.find((o) => !o.correct)?.id ?? 'o0')
                  : step.kind === 'verdict'
                    ? !step.answer
                    : [];
            const result = explain(it, s, wrong);
            if (result) expect(twa(result.key, result.params)).not.toContain('wrongAnswer.');
          });
        }
      }
    }
  });
});
