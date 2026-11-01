// Bridge word problems on the chosen table (pure, numbers <= 100): "đội A chở a viên đá, đội B
// gấp n lần" (wp-times-then-add) and "bên này gấp mấy lần bên kia?" (wp-times-compare). Three
// numeric options from the reasoning distractors: tier 1 one misconception + a near miss, tier 2+
// two misconceptions. Rewards, recording and the dialog stay the quiz's own.
import { TABLES } from '../config/world-constants';
import { type FactKey, skillKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import { skillTierOf } from '../learning/skill-tiers';
import { type Candidate, numberOptions } from '../reasoning/reasoning-distractors';
import { MAX_NUMBER } from '../reasoning/reasoning-ranges';
import type { Question, WordProblemSkill } from './question-types';

export const WORD_PROBLEM_SKILLS: readonly WordProblemSkill[] = [
  'wp-times-then-add',
  'wp-times-compare',
];
const MAX_TIMES = 9;

interface Built {
  answer: number;
  b: number;
  params: Record<string, number>;
  work: number[];
  candidates: Candidate<number>[];
}

function timesThenAdd(a: number, rng: Rng): Built {
  const n = randInt(rng, 2, Math.min(MAX_TIMES, Math.floor(MAX_NUMBER / a) - 1));
  return {
    answer: a * n + a,
    b: n,
    params: { a, n },
    work: [a * n, a * n + a],
    candidates: [
      { value: a * n, misconception: 'one-step-only' },
      { value: a + n + a, misconception: 'add-instead-of-times' },
    ],
  };
}

function timesCompare(small: number, rng: Rng): Built {
  const n = randInt(rng, 2, Math.min(MAX_TIMES, Math.floor(MAX_NUMBER / small)));
  const big = small * n;
  return {
    answer: n,
    b: n,
    params: { big, small },
    work: [n],
    candidates: [
      { value: big - small, misconception: 'difference-not-quotient' },
      { value: small, misconception: 'wrong-step' },
    ],
  };
}

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

/** A word problem over `table` (0 = all tables: one is drawn). */
export function buildWordProblemQuestion(
  skillId: WordProblemSkill,
  table: number,
  stats: Stats,
  rng: Rng,
): Question {
  const t = table || pick(rng, TABLES);
  const factKey = skillKey(skillId);
  const tier = skillTierOf(stats[factKey]);
  const built = skillId === 'wp-times-then-add' ? timesThenAdd(t, rng) : timesCompare(t, rng);
  const candidates = tier === 1 ? built.candidates.slice(0, 1) : built.candidates;
  const options = numberOptions(rng, built.answer, candidates, 3).map((o) => {
    const value = Number(o.label.params?.n);
    return { value, label: String(value) };
  });
  return {
    id: factKey,
    factKey,
    a: t,
    b: built.b,
    answer: built.answer,
    options,
    review: false,
    word: { skillId, params: built.params, work: built.work },
  };
}
