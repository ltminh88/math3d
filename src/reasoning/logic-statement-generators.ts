// True/false statements (KNTT T1 B25, B38, B39): a remainder, an expression value, "gấp mấy lần",
// "hơn bao nhiêu". A false statement always carries the misconception that produced it.
// choose-all-correct: tick every true statement of four; tf-explain: Đúng/Sai, then fix it.
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { reasoningItem, ref } from './reasoning-distractors';
import { MAX_NUMBER, REMAINDER_DIVISORS, TIER_RANGES } from './reasoning-ranges';
import type { ChoiceOption, Misconception, PromptRef, ReasoningGenerator } from './reasoning-types';

type Kind = 'rem' | 'times' | 'more' | 'eq';

interface Statement {
  label: PromptRef;
  truth: boolean;
  misconception?: Misconception;
  /** The right value a "fix" step asks for. */
  fix: { prompt: PromptRef; answer: number };
}

const KINDS: Readonly<Record<SkillTier, readonly Kind[]>> = {
  1: ['rem', 'times', 'more'],
  2: ['rem', 'times', 'more', 'eq'],
  3: ['rem', 'times', 'more', 'eq'],
};

function remStatement(rng: Rng, tier: SkillTier, truth: boolean): Statement {
  const per = pick(rng, REMAINDER_DIVISORS[tier]);
  const r = randInt(rng, 1, per - 1);
  const q = randInt(rng, 2, Math.floor((MAX_NUMBER - r) / per));
  const total = q * per + r;
  const fix = { prompt: ref('fixRem', { total, per }), answer: r };
  if (truth) return { label: ref('stmtRem', { total, per, q, r }), truth, fix };
  const label = ref('stmtRem', { total, per, q: q - 1, r: r + per });
  return { label, truth, misconception: 'remainder-too-big', fix };
}

function compareStatement(
  rng: Rng,
  tier: SkillTier,
  kind: 'times' | 'more',
  truth: boolean,
): Statement {
  const n = pick(
    rng,
    TIER_RANGES[tier].factors.filter((f) => f > 2),
  );
  const small = randInt(rng, 2, Math.floor(MAX_NUMBER / n));
  const big = small * n;
  if (kind === 'times') {
    const fix = { prompt: ref('fixTimes', { big, small }), answer: n };
    const shown = truth ? n : big - small;
    const label = ref('stmtTimes', { big, small, n: shown });
    return truth
      ? { label, truth, fix }
      : { label, truth, misconception: 'difference-not-quotient', fix };
  }
  const fix = { prompt: ref('fixMore', { big, small }), answer: big - small };
  const label = ref('stmtMore', { big, small, d: truth ? big - small : n });
  return truth
    ? { label, truth, fix }
    : { label, truth, misconception: 'quotient-not-difference', fix };
}

function eqStatement(rng: Rng, tier: SkillTier, truth: boolean): Statement {
  const b = randInt(rng, 2, 9);
  const c = randInt(rng, 2, Math.floor(50 / b));
  const a = randInt(rng, 1, Math.min(MAX_NUMBER - b * c, Math.floor(MAX_NUMBER / c) - b));
  const brackets = tier === 3 && rng() < 0.5;
  const text = brackets ? `(${a} + ${b}) × ${c}` : `${a} + ${b} × ${c}`;
  const value = brackets ? (a + b) * c : a + b * c;
  const wrong = brackets ? a + b * c : (a + b) * c;
  const fix = { prompt: ref('fixEq', { text }), answer: value };
  if (truth) return { label: ref('stmtEq', { text, value }), truth, fix };
  const misconception = brackets ? 'ignore-brackets' : 'left-to-right';
  return { label: ref('stmtEq', { text, value: wrong }), truth, misconception, fix };
}

function statement(rng: Rng, tier: SkillTier, kind: Kind, truth: boolean): Statement {
  if (kind === 'rem') return remStatement(rng, tier, truth);
  if (kind === 'eq') return eqStatement(rng, tier, truth);
  return compareStatement(rng, tier, kind, truth);
}

export const chooseAllCorrect: ReasoningGenerator = (rng, tier) => {
  const kinds = shuffle(rng, [...KINDS[tier], ...KINDS[tier]]).slice(0, 4);
  const truths = kinds.map(() => rng() < 0.5);
  if (!truths.includes(true)) truths[randInt(rng, 0, 3)] = true;
  const seen = new Set<string>();
  const options: ChoiceOption[] = kinds.map((kind, i) => {
    let s = statement(rng, tier, kind, truths[i] as boolean);
    // Redraw the rare exact repeat so the four statements stay distinct.
    while (seen.has(JSON.stringify(s.label))) s = statement(rng, tier, kind, s.truth);
    seen.add(JSON.stringify(s.label));
    return s.truth
      ? { id: `o${i}`, label: s.label, correct: true }
      : {
          id: `o${i}`,
          label: s.label,
          correct: false,
          misconception: s.misconception as Misconception,
        };
  });
  const steps = [{ kind: 'multi' as const, prompt: ref('pickAllTrue'), options }];
  return reasoningItem('choose-all-correct', tier, ref('chooseAll'), steps);
};

export const tfExplain: ReasoningGenerator = (rng, tier) => {
  const truth = rng() < 0.5;
  const s = statement(rng, tier, pick(rng, KINDS[tier]), truth);
  const step = {
    kind: 'verdict' as const,
    prompt: ref('isItTrue'),
    statement: s.label,
    answer: truth,
    ...(truth ? {} : { fix: s.fix }),
  };
  return reasoningItem('tf-explain', tier, ref('tfExplain'), [step], [s.fix.answer]);
};
