// Market stage plan (phase 19): stages follow the textbook order — 1 clock, 2 calendar,
// 3 money, 4 data/chance, 5 mix — so a stage never plays another family's skills. Tiers come
// from the Leitner box, never from the stage number. Later stages play attempted skills
// weakest-first, topped up from the stage's own family so a stage always plays its family.
import { describe, expect, it } from 'vitest';
import { DATA_SKILLS } from '../../data/data-item-for-skill';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import { MONEY_SKILLS } from '../../money/money-item-for-skill';
import { TIME_SKILLS } from '../../time/time-item-for-skill';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  MARKET_CALENDAR_SKILLS,
  MARKET_CLOCK_SKILLS,
  MARKET_ROUNDS,
  planMarketRun,
  planMarketStageSkills,
  stagePool,
} from './market-stage-plan';

const definition = {
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: MARKET_ROUNDS,
} as unknown as LevelDefinition;
const stat = (box: number, attempts = 3): FactStat =>
  ({ box, attempts, correct: 2, lastSeenSession: 1 }) as unknown as FactStat;

function learning(stats: Record<string, FactStat>, seed = 33): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 5,
    planSession: () => [],
    record: () => {},
    rng: mulberry32(seed),
  } as unknown as LevelLearning;
}

const skillIds = (run: { rounds: readonly { skillId: string }[] }): string[] =>
  run.rounds.map((r) => r.skillId);

describe('market stage plan', () => {
  it('stage 1 plays clock skills only, six rounds', () => {
    const run = planMarketRun(learning({}), definition, 1);
    expect(run.total).toBe(MARKET_ROUNDS);
    for (const id of skillIds(run)) expect(MARKET_CLOCK_SKILLS).toContain(id);
    expect(new Set(skillIds(run)).size).toBe(MARKET_ROUNDS);
  });

  it('stage 2 plays calendar skills only, round-robin over three skills', () => {
    const stats: Record<string, FactStat> = {
      'sk:months-days-count': stat(2),
      'sk:calendar-weekday': stat(1),
      'sk:calendar-days-between': stat(1),
    };
    const ids = planMarketStageSkills(stats, MARKET_ROUNDS, 2);
    expect(ids).toHaveLength(MARKET_ROUNDS);
    for (const id of ids) expect(MARKET_CALENDAR_SKILLS).toContain(id);
    for (let i = 1; i < ids.length; i++) expect(ids[i]).not.toBe(ids[i - 1]);
    expect(new Set(ids).size).toBe(3);
  });

  it('stage 2 tops up from its own family when the attempted pool is small', () => {
    const stats: Record<string, FactStat> = { 'sk:calendar-weekday': stat(1) };
    expect(stagePool(stats, 2)).toEqual(['calendar-weekday']);
    const ids = planMarketStageSkills(stats, MARKET_ROUNDS, 2);
    expect(ids).toHaveLength(MARKET_ROUNDS);
    for (const id of ids) expect(MARKET_CALENDAR_SKILLS).toContain(id);
    expect(ids).toContain('calendar-weekday');
  });

  it('stage 3 plays money skills only; stage 4 data skills only', () => {
    const run3 = planMarketRun(learning({}), definition, 3);
    for (const id of skillIds(run3)) expect(MONEY_SKILLS).toContain(id);
    const run4 = planMarketRun(learning({}), definition, 4);
    for (const id of skillIds(run4)) expect(DATA_SKILLS).toContain(id);
  });

  it('stage 5 mixes all four families', () => {
    const run = planMarketRun(learning({}), definition, 5);
    const ids = skillIds(run);
    expect(ids.some((id) => TIME_SKILLS.includes(id))).toBe(true);
    expect(ids.some((id) => MONEY_SKILLS.includes(id))).toBe(true);
    expect(ids.some((id) => DATA_SKILLS.includes(id))).toBe(true);
  });

  it('weakest box first, tier from the box, and the item matches its skill', () => {
    const stats: Record<string, FactStat> = {
      'sk:clock-read-5min': stat(5),
      'sk:clock-read-hour-half': stat(1),
      'sk:clock-read-minute': stat(5),
      'sk:clock-sang-chieu-24h': stat(5),
      'sk:clock-elapsed-minutes': stat(5),
      'sk:roman-clock-hour': stat(5),
    };
    const run = planMarketRun(learning(stats), definition, 1);
    const first = run.rounds[0];
    expect(first?.skillId).toBe('clock-read-hour-half');
    expect(first?.tier).toBe(1);
    expect(first?.item.skillId).toBe('clock-read-hour-half');
    expect(first?.factKey).toBe('sk:clock-read-hour-half');
    const hard = run.rounds.find((r) => r.skillId === 'clock-read-5min');
    expect(hard?.tier).toBe(3);
  });
});
