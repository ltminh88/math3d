import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadGoldenTrace, mulberry32 } from '../config/load-golden-trace-for-tests';
import { TABLES } from '../config/world-constants';
import { defaultSave, parseSave } from '../save/save-storage';
import { applyAnswerStats, isCorrect } from './answer-stats';
import { hintText } from './hint-text';
import { buildQuestion, pickNextFact } from './question-generator';

interface PickerRun {
  seed: number;
  table: number;
  steps: string[];
  final: { review: string[]; combo: number };
  statsKeys: number;
}

// Mirrors pickerRun() in tools/recovery/golden/generate-golden-traces.mjs (answer flow of fg()).
function pickerRun(seed: number, table: number): PickerRun {
  const rng = mulberry32(seed);
  const state = defaultSave();
  state.table = table;
  let last = '';
  const steps: string[] = [];
  for (let i = 0; i < 500; i++) {
    const mode = i % 2 ? 'practice' : 'bridge';
    const q = pickNextFact(state, mode, last, rng);
    const wantCorrect = rng() < 0.7;
    const hinted = rng() < 0.3;
    const wrong = q.options.find((o) => o.value !== q.answer);
    const chosen = wantCorrect || !wrong ? q.answer : wrong.value;
    const ok = isCorrect(q, chosen);
    applyAnswerStats(state, q, ok, 900 + i);
    if (ok && !hinted) state.review = state.review.filter((id) => id !== q.id);
    const opts = q.options.map((o) => `${o.value}:${o.label}`).join(',');
    steps.push(`${q.id} ${q.review ? 'R' : '-'} ${opts} ${ok ? 1 : 0}${hinted ? 'h' : ''}`);
    last = q.id;
  }
  const final = { review: state.review, combo: state.combo };
  return { seed, table, steps, final, statsKeys: Object.keys(state.questionStats).length };
}

describe('quiz golden traces', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([1, 42, 20261018])('picker seed %i: 500 steps x every table filter', (seed) => {
    const golden = loadGoldenTrace<{ seed: number; legend: string; runs: PickerRun[] }>(
      `picker-seed-${seed}.json`,
    );
    const runs = [0, ...TABLES].map((table) => pickerRun(seed, table));
    expect({ seed, legend: golden.legend, runs }).toEqual(golden);
  });

  it('applyAnswerStats reproduces the stats trace and the 30-entry reload cap', () => {
    const golden = loadGoldenTrace<{
      trace: unknown[];
      finalStatsCount: number;
      reparsed: unknown;
    }>('stats-update.json');
    vi.useFakeTimers();
    const epoch = Date.UTC(2026, 9, 18, 12, 0, 0);
    const rng = mulberry32(7);
    const state = defaultSave();
    const trace: unknown[] = [];
    for (let i = 0; i < 60; i++) {
      const a = TABLES[i % 9] as number;
      const b = 1 + ((i * 7) % 10);
      const q = buildQuestion(a, b, 'practice', rng);
      const ok = i % 3 !== 1;
      vi.setSystemTime(epoch + 1000 * i);
      applyAnswerStats(state, q, ok, 1234.5 + i * 10.25);
      trace.push({
        id: q.id,
        ok,
        stat: structuredClone(state.questionStats[q.id]),
        combo: state.combo,
        review: [...state.review],
      });
    }
    const reparsed = parseSave(JSON.stringify(state));
    expect({
      trace,
      finalStatsCount: Object.keys(state.questionStats).length,
      reparsed,
    }).toEqual(golden);
  });

  it('hintText reproduces the ladder for every fact', () => {
    const golden = loadGoldenTrace<unknown[]>('hint-ladder.json');
    const rng = mulberry32(3);
    const rows: unknown[] = [];
    for (const a of TABLES) {
      for (let b = 1; b <= 10; b++) {
        const q = buildQuestion(a, b, 'practice', rng);
        rows.push({ id: q.id, hints: [1, 2, 3].map((level) => hintText(q, level)) });
      }
    }
    expect(rows).toEqual(golden);
    expect(hintText(buildQuestion(3, 4, 'practice'), 0)).toBe(
      hintText({ a: 3, b: 4, answer: 12 }, 3),
    );
  });
});
