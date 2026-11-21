// Table generators (phase 15): tally marks, one- and two-row tables, and the class table
// with a cell to fill. All contexts and numbers are invented (copyright rule); table
// values run to 3 digits (B73), never past 999.
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { Candidate } from '../reasoning/reasoning-distractors';
import { ref } from '../reasoning/reasoning-distractors';
import {
  dataChoiceStep,
  dataSceneItem,
  headerRef,
  labelChoiceStep,
  tableScene,
  tallyScene,
} from './data-distractors';
import { TALLY_MAX_MARKS, TALLY_MIN_MARKS } from './data-ranges';
import type { DataGenerator } from './data-scene-types';
import { HEADER_GROUPS, type HeaderGroup, TABLE_STORY } from './data-topics';

const WEEKS = ['l:week_last', 'l:week_this'] as const;

const CLASS_ROWS = ['l:row_boys', 'l:row_girls', 'l:row_all'] as const;

/** Pick a topic group with at least `minSize` headers, then `n` of its headers. */
function pickGroup(rng: Rng, minSize: number): HeaderGroup {
  const groups = (Object.keys(HEADER_GROUPS) as HeaderGroup[]).filter(
    (g) => HEADER_GROUPS[g].length >= minSize,
  );
  return pick(rng, groups);
}

function pickHeaders(rng: Rng, group: HeaderGroup, n: number): string[] {
  return shuffle(rng, [...HEADER_GROUPS[group]]).slice(0, n);
}

/** `n` distinct integers in [min, max] (a unique most/least needs distinct values). */
function distinctValues(rng: Rng, n: number, min: number, max: number): number[] {
  const pool: number[] = [];
  for (let v = min; v <= max; v++) pool.push(v);
  return shuffle(rng, pool).slice(0, n);
}

/** Tally: a strip of O (hit) / X (miss) marks — count the O's. */
export const tallyCount: DataGenerator = (rng, tier) => {
  const len =
    tier === 1
      ? randInt(rng, TALLY_MIN_MARKS, 10)
      : tier === 2
        ? randInt(rng, 10, 18)
        : randInt(rng, 18, TALLY_MAX_MARKS);
  const hits = randInt(rng, 2, len - 1);
  const marks = shuffle(
    rng,
    Array.from({ length: len }, (_, i) => i < hits),
  );
  const step = dataChoiceStep(rng, ref('askTally'), hits, [
    { value: len, misconception: 'counted-all' },
    { value: len - hits, misconception: 'counted-miss' },
  ]);
  return dataSceneItem('tally-count', tier, ref('tallyStory'), [step], tallyScene(marks), [hits]);
};

/** Read one cell of a 1-row (T1/T2) or 2-row (T3) table, all of one topic. */
export const tableRead: DataGenerator = (rng, tier) => {
  const group = pickGroup(rng, tier === 2 ? 4 : 3);
  const headers =
    tier === 1
      ? pickHeaders(rng, group, 3)
      : tier === 2
        ? pickHeaders(rng, group, 4)
        : pickHeaders(rng, group, 3);
  const value = (min: number, max: number): number => randInt(rng, min, max);
  const rows =
    tier === 3
      ? [headers.map(() => value(10, 99)), headers.map(() => value(10, 99))]
      : [headers.map(() => (tier === 1 ? value(5, 50) : value(10, 99)))];
  const r = tier === 3 ? randInt(rng, 0, 1) : 0;
  const c = randInt(rng, 0, headers.length - 1);
  const cell = (rows[r] as readonly number[])[c] as number;
  const prompt =
    tier === 3
      ? ref('askTableCellRow', { row: WEEKS[r] as string, header: headers[c] as string })
      : ref('askTableCell', { header: headers[c] as string });
  const other = (rows[r] as readonly number[]).find((_, i) => i !== c) as number;
  const rowSum = (rows[r] as readonly number[]).reduce((a, b) => a + b, 0);
  const step = dataChoiceStep(rng, prompt, cell, [
    { value: other, misconception: 'wrong-cell' },
    { value: rowSum, misconception: 'wrong-total' },
  ]);
  return dataSceneItem(
    'table-read',
    tier,
    ref(TABLE_STORY[group]),
    [step],
    tableScene(headers, rows, tier === 3 ? [...WEEKS] : undefined),
    [cell],
  );
};

/** Which category has the most / fewest — a label choice, never a number. */
export const tableMaxMin: DataGenerator = (rng, tier) => {
  const group = pickGroup(rng, tier === 1 ? 3 : tier === 2 ? 4 : 5);
  const headers =
    tier === 1
      ? pickHeaders(rng, group, 3)
      : tier === 2
        ? pickHeaders(rng, group, 4)
        : pickHeaders(rng, group, 5);
  const values =
    tier === 1
      ? distinctValues(rng, headers.length, 5, 50)
      : distinctValues(rng, headers.length, 10, 99);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const asked =
    tier === 3 ? (['most', 'least'] as const) : ([pick(rng, ['most', 'least'] as const)] as const);
  const steps = asked.map((which) => {
    const target = which === 'most' ? max : min;
    const col = values.indexOf(target);
    const others = headers
      .filter((_, i) => i !== col)
      .map((h) => ({ value: headerRef(h), misconception: 'wrong-category' as const }));
    return labelChoiceStep(
      rng,
      ref(which === 'most' ? 'askMost' : 'askLeast'),
      headerRef(headers[col] as string),
      others,
    );
  });
  return dataSceneItem(
    'table-max-min',
    tier,
    ref(TABLE_STORY[group]),
    steps,
    tableScene(headers, [values]),
    steps.map((s) => (s.prompt.key === 'askMost' ? max : min)),
  );
};

/** Sums: one row (T1), one column (T2), the whole table (T3), all of one topic. */
export const tableSums: DataGenerator = (rng, tier) => {
  const group = pickGroup(rng, 3);
  const headers = pickHeaders(rng, group, 3);
  const value = (min: number, max: number): number => randInt(rng, min, max);
  const rows =
    tier === 1
      ? [headers.map(() => value(5, 20)), headers.map(() => value(5, 20))]
      : tier === 2
        ? [headers.map(() => value(10, 50)), headers.map(() => value(10, 50))]
        : [headers.map(() => value(10, 99)), headers.map(() => value(10, 99))];
  const rowsN = rows as readonly (readonly number[])[];
  const rowSum = (r: number): number => (rowsN[r] as readonly number[]).reduce((a, b) => a + b, 0);
  const colSum = (c: number): number => (rowsN[0]?.[c] as number) + (rowsN[1]?.[c] as number);
  const total = rowSum(0) + rowSum(1);
  let prompt: ReturnType<typeof ref>;
  let answer: number;
  let candidates: Candidate<number>[];
  if (tier === 1) {
    const r = randInt(rng, 0, 1);
    prompt = ref('askRowSum', { row: WEEKS[r] as string });
    answer = rowSum(r);
    candidates = [
      { value: rowSum(1 - r), misconception: 'wrong-row' },
      { value: colSum(randInt(rng, 0, 2)), misconception: 'wrong-column' },
    ];
  } else if (tier === 2) {
    const c = randInt(rng, 0, 2);
    prompt = ref('askColSum', { header: headers[c] as string });
    answer = colSum(c);
    candidates = [
      { value: colSum((c + 1) % 3), misconception: 'wrong-column' },
      { value: rowSum(randInt(rng, 0, 1)), misconception: 'wrong-row' },
    ];
  } else {
    prompt = ref('askTableSum');
    answer = total;
    const drop = (rowsN[randInt(rng, 0, 1)] as readonly number[])[randInt(rng, 0, 2)] as number;
    candidates = [
      { value: rowSum(randInt(rng, 0, 1)), misconception: 'wrong-row' },
      { value: total - drop, misconception: 'missed-one' },
    ];
  }
  const step = dataChoiceStep(rng, prompt, answer, candidates);
  return dataSceneItem(
    'table-sums',
    tier,
    ref(TABLE_STORY[group]),
    [step],
    tableScene(headers, rows, [...WEEKS]),
    [answer],
  );
};

/** Fill the empty cell of the class table (Nam + Nữ = Cả lớp per column). The columns
 * are activities children can like (bơi / cờ vua / vẽ) — never animals. */
export const tableFillMissing: DataGenerator = (rng, tier) => {
  const headers = pickHeaders(rng, 'likes', 3);
  const value = (min: number, max: number): number => randInt(rng, min, max);
  const [lo, hi] = tier === 1 ? [5, 20] : tier === 2 ? [10, 40] : [20, 60];
  const boys = headers.map(() => value(lo, hi));
  const girls = headers.map(() => value(lo, hi));
  const all = headers.map((_, i) => (boys[i] as number) + (girls[i] as number));
  // T1 hides a Cả-lớp cell (add); T2/T3 hide a Nam/Nữ cell (subtract).
  const row = tier === 1 ? 2 : randInt(rng, 0, 1);
  const col = randInt(rng, 0, 2);
  const missing =
    row === 2
      ? (all[col] as number)
      : (all[col] as number) - (row === 0 ? (girls[col] as number) : (boys[col] as number));
  const rows: (readonly (number | null)[])[] = [
    boys.map((v, i) => (row === 0 && i === col ? null : v)),
    girls.map((v, i) => (row === 1 && i === col ? null : v)),
    all.map((v, i) => (row === 2 && i === col ? null : v)),
  ];
  const candidates: Candidate<number>[] =
    row === 2
      ? [{ value: boys[col] as number, misconception: 'wrong-cell' }]
      : [
          { value: all[col] as number, misconception: 'wrong-total' },
          {
            value: (row === 0 ? girls : boys)[col] as number,
            misconception: 'wrong-cell',
          },
        ];
  const step = dataChoiceStep(rng, ref('askFill'), missing, candidates);
  return dataSceneItem(
    'table-fill-missing',
    tier,
    ref('tableStoryLikes'),
    [step],
    tableScene(headers, rows, [...CLASS_ROWS], { row, col }),
    [missing],
  );
};

export const tableGenerators: Readonly<Record<string, DataGenerator>> = Object.freeze({
  'tally-count': tallyCount,
  'table-read': tableRead,
  'table-max-min': tableMaxMin,
  'table-sums': tableSums,
  'table-fill-missing': tableFillMissing,
});
