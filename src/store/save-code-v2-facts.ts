// Fact stats in an M3D2 save code, one tuple per fact (trailing defaults dropped):
//   [key, attempts, correct, totalMs, box, lastSeenSession, lastSeenSec, streak, fluent, errs]
// key is the fact key without its op prefix: `mul:3x7` -> "3x7", `div:21/3` -> "21/3".
// Decoding is strict: any out-of-range or mistyped field rejects the whole code (null).
import { type FactKey, isFactKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { LEITNER } from '../learning/leitner-box';

/** More than every fact the curriculum can ask (tables 1-10, x and :). */
export const MAX_CODE_FACTS = 300;
const MAX_COUNT = 1_000_000;
const MAX_TOTAL_MS = 1e12;
const MAX_SESSION = 10_000_000;
const MAX_ERR_ANSWER = 1_000_000;
/** Latest second a JS Date can hold (8.64e15 ms); later times would throw a RangeError. */
export const MAX_EPOCH_SEC = 8.64e12;

type FactTuple = (string | number | number[])[];

const shortKey = (key: FactKey): string => key.slice(4);
const longKey = (short: unknown): FactKey | null => {
  if (typeof short !== 'string') return null;
  const key = /^\d+x\d+$/.test(short) ? `mul:${short}` : `div:${short}`;
  return isFactKey(key) ? key : null;
};

export const toEpochSec = (ms: number): number => (ms > 0 ? Math.floor(ms / 1000) : 0);

export function factToTuple(key: FactKey, s: FactStat): FactTuple {
  const tuple: FactTuple = [
    shortKey(key),
    s.attempts,
    s.correct,
    s.totalMs,
    s.box,
    s.lastSeenSession,
    toEpochSec(s.lastSeenAt),
    s.streak,
    s.fluent ? 1 : 0,
    s.errs,
  ];
  // Drop trailing defaults (no errs, not fluent, no streak) to keep the code short.
  const isDefault = (v: FactTuple[number]) => v === 0 || (Array.isArray(v) && v.length === 0);
  while (tuple.length > 7 && isDefault(tuple[tuple.length - 1] as FactTuple[number])) tuple.pop();
  return tuple;
}

export const isIntIn = (v: unknown, min: number, max: number): v is number =>
  Number.isSafeInteger(v) && (v as number) >= min && (v as number) <= max;

function tupleToFact(raw: unknown): [FactKey, FactStat] | null {
  if (!Array.isArray(raw) || raw.length < 7 || raw.length > 10) return null;
  const [
    short,
    attempts,
    correct,
    totalMs,
    box,
    session,
    seenSec,
    streak = 0,
    fluent = 0,
    errs = [],
  ] = raw as unknown[];
  const key = longKey(short);
  if (
    !key ||
    !isIntIn(attempts, 0, MAX_COUNT) ||
    !isIntIn(correct, 0, attempts) ||
    !isIntIn(totalMs, 0, MAX_TOTAL_MS) ||
    !isIntIn(box, LEITNER.minBox, LEITNER.maxBox) ||
    !isIntIn(session, 0, MAX_SESSION) ||
    !isIntIn(seenSec, 0, MAX_EPOCH_SEC) ||
    !isIntIn(streak, 0, MAX_COUNT) ||
    (fluent !== 0 && fluent !== 1) ||
    !Array.isArray(errs) ||
    errs.length > LEITNER.errsKept ||
    !errs.every((e) => isIntIn(e, 0, MAX_ERR_ANSWER))
  ) {
    return null;
  }
  return [
    key,
    {
      attempts,
      correct,
      totalMs,
      box,
      lastSeenSession: session,
      lastSeenAt: seenSec * 1000,
      streak,
      fluent: fluent === 1,
      errs: [...(errs as number[])],
    },
  ];
}

/** Tuples -> fact stats; null when the list or any tuple is invalid or a key repeats. */
export function tuplesToFacts(raw: unknown): Record<FactKey, FactStat> | null {
  if (!Array.isArray(raw) || raw.length > MAX_CODE_FACTS) return null;
  const facts: Record<FactKey, FactStat> = {};
  for (const tuple of raw) {
    const fact = tupleToFact(tuple);
    if (!fact || fact[0] in facts) return null;
    facts[fact[0]] = fact[1];
  }
  return facts;
}
