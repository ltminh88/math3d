// Skill stats in an M3D3 save code, one tuple per skill (trailing defaults dropped):
//   [id, attempts, correct, totalMs, box, lastSeenSession, lastSeenSec, streak, fluent]
// id is the catalog id without the `sk:` prefix. The error bank (errs) is device-only for skills
// and is not carried. Decoding is strict: an unknown id, a repeat or a bad field rejects the code.
import { type FactKey, isSkillKey, skillKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { LEITNER } from '../learning/leitner-box';
import { isSkillId, SKILL_CATALOG } from '../learning/skill-catalog';
import { isIntIn, MAX_EPOCH_SEC, toEpochSec } from './save-code-v2-facts';

const MAX_COUNT = 1_000_000;
const MAX_TOTAL_MS = 1e12;
const MAX_SESSION = 10_000_000;

type SkillTuple = (string | number)[];

export function skillStatsToTuples(stats: Readonly<Record<FactKey, FactStat>>): SkillTuple[] {
  const tuples: SkillTuple[] = [];
  for (const [key, s] of Object.entries(stats)) {
    if (!isSkillKey(key) || s.attempts <= 0) continue;
    const tuple: SkillTuple = [
      key.slice(3),
      s.attempts,
      s.correct,
      s.totalMs,
      s.box,
      s.lastSeenSession,
      toEpochSec(s.lastSeenAt),
      s.streak,
      s.fluent ? 1 : 0,
    ];
    while (tuple.length > 7 && tuple[tuple.length - 1] === 0) tuple.pop();
    tuples.push(tuple);
  }
  return tuples;
}

function tupleToSkill(raw: unknown): [FactKey, FactStat] | null {
  if (!Array.isArray(raw) || raw.length < 7 || raw.length > 9) return null;
  const [id, attempts, correct, totalMs, box, session, seenSec, streak = 0, fluent = 0] =
    raw as unknown[];
  if (
    typeof id !== 'string' ||
    !isSkillId(id) ||
    !isIntIn(attempts, 0, MAX_COUNT) ||
    !isIntIn(correct, 0, attempts) ||
    !isIntIn(totalMs, 0, MAX_TOTAL_MS) ||
    !isIntIn(box, LEITNER.minBox, LEITNER.maxBox) ||
    !isIntIn(session, 0, MAX_SESSION) ||
    !isIntIn(seenSec, 0, MAX_EPOCH_SEC) ||
    !isIntIn(streak, 0, MAX_COUNT) ||
    (fluent !== 0 && fluent !== 1)
  )
    return null;
  const stat: FactStat = {
    attempts,
    correct,
    totalMs,
    box,
    lastSeenSession: session,
    lastSeenAt: seenSec * 1000,
    streak,
    fluent: fluent === 1,
    errs: [],
  };
  return [skillKey(id), stat];
}

/** Tuples -> skill stats keyed `sk:<id>`; null when the list or any tuple is invalid or repeats. */
export function tuplesToSkillStats(raw: unknown): Record<FactKey, FactStat> | null {
  if (!Array.isArray(raw) || raw.length > SKILL_CATALOG.length) return null;
  const stats: Record<FactKey, FactStat> = {};
  for (const tuple of raw) {
    const skill = tupleToSkill(tuple);
    if (!skill || skill[0] in stats) return null;
    stats[skill[0]] = skill[1];
  }
  return stats;
}
