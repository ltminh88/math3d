// Numberfort stage plan (phase 20): stages follow the textbook order — 1 numbers to
// 10 000 + compare, 2 rounding + Roman, 3 +/−/×/: within 10 000, 4 numbers to 100 000,
// 5 +/−/×/: within 100 000 + mix — so a stage never plays another stage's skills. Tiers come
// from the Leitner box, never from the stage number. Later stages play attempted skills
// weakest-first, topped up from the stage's own range so a stage always plays its range.
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  NUMBERFORT_HUNDRED_THOUSAND_ARITHMETIC_SKILLS,
  NUMBERFORT_HUNDRED_THOUSAND_SKILLS,
  NUMBERFORT_ROUNDING_ROMAN_SKILLS,
  NUMBERFORT_ROUNDS,
  NUMBERFORT_TEN_THOUSAND_ARITHMETIC_SKILLS,
  NUMBERFORT_TEN_THOUSAND_SKILLS,
  planNumberfortRun,
  planNumberfortStageSkills,
  stagePool,
} from './numberfort-stage-plan';

const definition = {
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: NUMBERFORT_ROUNDS,
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

describe('numberfort stage plan', () => {
  it('stage 1 plays numbers-to-10000 skills only, six rounds', () => {
    const run = planNumberfortRun(learning({}), definition, 1);
    expect(run.total).toBe(NUMBERFORT_ROUNDS);
    for (const id of skillIds(run)) expect(NUMBERFORT_TEN_THOUSAND_SKILLS).toContain(id);
    expect(new Set(skillIds(run)).size).toBe(NUMBERFORT_ROUNDS);
  });

  it('stage 2 plays rounding and Roman skills only', () => {
    const stats: Record<string, FactStat> = {
      'sk:round-tens': stat(2),
      'sk:round-hundreds': stat(1),
      'sk:round-thousands': stat(1),
      'sk:round-ten-thousands': stat(2),
      'sk:round-which-place': stat(1),
      'sk:roman-to-number': stat(2),
      'sk:number-to-roman': stat(1),
      'sk:roman-sequence': stat(2),
    };
    const ids = planNumberfortStageSkills(stats, NUMBERFORT_ROUNDS, 2);
    expect(ids).toHaveLength(NUMBERFORT_ROUNDS);
    for (const id of ids) expect(NUMBERFORT_ROUNDING_ROMAN_SKILLS).toContain(id);
    for (let i = 1; i < ids.length; i++) expect(ids[i]).not.toBe(ids[i - 1]);
  });

  it('stage 3 plays 10000-range arithmetic only; stage 4 numbers-to-100000 only', () => {
    const run3 = planNumberfortRun(learning({}), definition, 3);
    for (const id of skillIds(run3))
      expect(NUMBERFORT_TEN_THOUSAND_ARITHMETIC_SKILLS).toContain(id);
    const stats4: Record<string, FactStat> = {
      'sk:num-read-write-100000': stat(2),
      'sk:num-expand-100000': stat(1),
      'sk:num-compare-100000': stat(1),
      'sk:num-order-100000': stat(2),
    };
    const ids4 = planNumberfortStageSkills(stats4, NUMBERFORT_ROUNDS, 4);
    expect(ids4).toHaveLength(NUMBERFORT_ROUNDS);
    for (const id of ids4) expect(NUMBERFORT_HUNDRED_THOUSAND_SKILLS).toContain(id);
    // Four skills for six rounds: round-robin, never twice in a row.
    for (let i = 1; i < ids4.length; i++) expect(ids4[i]).not.toBe(ids4[i - 1]);
    expect(new Set(ids4).size).toBe(4);
  });

  it('stage 4 tops up from its own range when the attempted pool is small', () => {
    const stats: Record<string, FactStat> = { 'sk:num-compare-100000': stat(1) };
    expect(stagePool(stats, 4)).toEqual(['num-compare-100000']);
    const ids = planNumberfortStageSkills(stats, NUMBERFORT_ROUNDS, 4);
    expect(ids).toHaveLength(NUMBERFORT_ROUNDS);
    for (const id of ids) expect(NUMBERFORT_HUNDRED_THOUSAND_SKILLS).toContain(id);
    expect(ids).toContain('num-compare-100000');
  });

  it('stage 5 mixes the two 100000 groups', () => {
    const run = planNumberfortRun(learning({}), definition, 5);
    const ids = skillIds(run);
    expect(ids.some((id) => NUMBERFORT_HUNDRED_THOUSAND_SKILLS.includes(id))).toBe(true);
    expect(ids.some((id) => NUMBERFORT_HUNDRED_THOUSAND_ARITHMETIC_SKILLS.includes(id))).toBe(true);
  });

  it('weakest box first, tier from the box, and the item matches its skill', () => {
    const stats: Record<string, FactStat> = {
      'sk:num-read-write-1000': stat(5),
      'sk:num-place-value-1000': stat(1),
      'sk:num-neighbors-1000': stat(5),
      'sk:num-compare-1000': stat(5),
      'sk:num-order-1000': stat(5),
      'sk:num-sequence-1000': stat(5),
    };
    const run = planNumberfortRun(learning(stats), definition, 1);
    const first = run.rounds[0];
    expect(first?.skillId).toBe('num-place-value-1000');
    expect(first?.tier).toBe(1);
    expect(first?.item.skillId).toBe('num-place-value-1000');
    expect(first?.factKey).toBe('sk:num-place-value-1000');
    const hard = run.rounds.find((r) => r.skillId === 'num-read-write-1000');
    expect(hard?.tier).toBe(3);
  });
});
