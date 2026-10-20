// Compact JSON of a v1 save for save codes: short keys, defaults omitted, facts as tuples
//   f: [[a, b, correct, wrong, responseTimeMs, lastAnsweredEpochSeconds, box?], ...]
// Decoding is strict about shape (unknown keys or wrong types -> null) and leaves value
// clamping to the shared v1 save validator.
import { mulKey } from '../learning/fact-key';
import { defaultSave } from '../save/save-storage';
import type { QuestionStat, SaveV1 } from '../save/save-types';
import { STAT_KEY_PATTERN } from '../save/save-types';

type Compact = Record<string, unknown>;
type FactTuple = number[];

const NUMBER_KEYS = { x: 'xp', c: 'coins', b: 'bridge', t: 'table', k: 'combo' } as const;
const FLAG_KEYS = { qa: 'questAccepted', qc: 'questComplete', m: 'music', st: 'started' } as const;
const MAX_FACTS = 200;
/** Latest second a JS Date can hold (8.64e15 ms); later times would throw a RangeError. */
const MAX_SEEN_SEC = 8.64e12;

export function saveV1ToCompact(save: SaveV1, boxes: Readonly<Record<string, number>>): Compact {
  const out: Compact = {};
  const d = defaultSave();
  for (const [short, long] of Object.entries(NUMBER_KEYS))
    if (save[long] !== d[long]) out[short] = save[long];
  for (const [short, long] of Object.entries(FLAG_KEYS)) if (save[long]) out[short] = 1;
  if (save.avatar === 'girl') out.g = 1;
  if (!save.sound) out.s = 0;
  const facts: FactTuple[] = [];
  for (const [id, stat] of Object.entries(save.questionStats)) {
    const [a, b] = id.slice(1).split('_').map(Number) as [number, number];
    const seen = Date.parse(stat.lastAnsweredAt);
    const tuple = [a, b, stat.correct, stat.wrong, stat.responseTime];
    tuple.push(Number.isFinite(seen) ? Math.floor(seen / 1000) : 0);
    const box = boxes[mulKey(a, b)];
    if (box !== undefined) tuple.push(box);
    facts.push(tuple);
  }
  if (facts.length) out.f = facts;
  if (save.review.length) out.r = save.review.map((id) => id.slice(1));
  return out;
}

const isInt = (v: unknown): v is number => Number.isInteger(v);
const ALLOWED = new Set([
  ...Object.keys(NUMBER_KEYS),
  ...Object.keys(FLAG_KEYS),
  'g',
  's',
  'f',
  'r',
]);

function expandFact(tuple: unknown): [string, QuestionStat, number | undefined] | null {
  if (!Array.isArray(tuple) || tuple.length < 6 || tuple.length > 7 || !tuple.every(isInt))
    return null;
  const [a, b, correct, wrong, responseTime, seenSec, box] = tuple as number[];
  const id = `m${a}_${b}`;
  if (!STAT_KEY_PATTERN.test(id) || (seenSec as number) > MAX_SEEN_SEC) return null;
  const lastAnsweredAt =
    (seenSec as number) > 0 ? new Date((seenSec as number) * 1000).toISOString() : '';
  const stat = {
    attempts: 0,
    correct: correct as number,
    wrong: wrong as number,
    responseTime: responseTime as number,
    lastAnsweredAt,
  };
  return [id, stat, box !== undefined && box >= 1 && box <= 5 ? box : undefined];
}

/** Compact object -> v1 save JSON object (+ boxes by stat id), or null for a malformed payload. */
export function compactToSaveV1Json(
  raw: unknown,
): { v1: Record<string, unknown>; boxes: Record<string, number> } | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const c = raw as Compact;
  if (!Object.keys(c).every((k) => ALLOWED.has(k))) return null;
  const v1: Record<string, unknown> = { ...defaultSave() };
  for (const [short, long] of Object.entries(NUMBER_KEYS)) {
    if (short in c) {
      if (typeof c[short] !== 'number') return null;
      v1[long] = c[short];
    }
  }
  for (const [short, long] of Object.entries(FLAG_KEYS)) v1[long] = c[short] === 1;
  v1.avatar = c.g === 1 ? 'girl' : 'boy';
  v1.sound = c.s !== 0;
  const questionStats: Record<string, QuestionStat> = {};
  const boxes: Record<string, number> = {};
  if (c.f !== undefined) {
    if (!Array.isArray(c.f) || c.f.length > MAX_FACTS) return null;
    for (const tuple of c.f) {
      const fact = expandFact(tuple);
      if (!fact) return null;
      questionStats[fact[0]] = fact[1];
      if (fact[2] !== undefined) boxes[fact[0]] = fact[2];
    }
  }
  if (c.r !== undefined && (!Array.isArray(c.r) || !c.r.every((id) => typeof id === 'string')))
    return null;
  v1.questionStats = questionStats;
  v1.review = ((c.r as string[] | undefined) ?? []).map((id) => `m${id}`);
  return { v1, boxes };
}
