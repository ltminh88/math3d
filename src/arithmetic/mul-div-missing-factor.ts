// Shared forms for the mental ×/÷ skills (phase 7): a missing-number item and a
// true/false verdict item.
// - missing-digit: the blank is one digit ("Chữ số còn thiếu là mấy?").
// - missing-number: the blank is a round ten/hundred, asked with its own key
//   `askMissingNumber` ("Số còn thiếu là bao nhiêu?") — NOT `askResult`,
//   because the result is already on screen (R132: "□ × 3 = 60" with
//   "Kết quả là bao nhiêu?" invites the child to type 60).
// - verdict: the find-error shape ("{name} tính … = …", Đúng/Sai + fix when wrong).
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { pickName } from '../reasoning/reasoning-distractors';
import type { ReasoningItem, ReasoningStep } from '../reasoning/reasoning-types';
import { arithmeticItem, numberStep, ref, wrongBySlip } from './arithmetic-distractors';

/** "Tính nhẩm: {expr}." with one digit blank — the child finds that digit. */
export function missingDigitItem(
  skillId: string,
  tier: SkillTier,
  expr: string,
  digit: number,
): ReasoningItem {
  return arithmeticItem(skillId, tier, ref('mentalCalc', { expr }), [
    numberStep(ref('askMissingDigit'), digit),
  ]);
}

/** "Tính nhẩm: {expr}." with a round number blank — the child finds that number. */
export function missingNumberItem(
  skillId: string,
  tier: SkillTier,
  expr: string,
  value: number,
): ReasoningItem {
  return arithmeticItem(skillId, tier, ref('mentalCalc', { expr }), [
    numberStep(ref('askMissingNumber'), value),
  ]);
}

/** Đúng/Sai on a worked mental × or : — same shape as mul-div-find-error.
 *  `cap` is the skill's number cap (99 for tens, 999 for hundreds): a wrong
 *  `shown` that would exceed it falls back to correct − 10 instead. */
export function mentalVerdictItem(
  skillId: string,
  tier: SkillTier,
  isMul: boolean,
  a: number,
  b: number,
  rng: Rng,
  cap = 999,
): ReasoningItem {
  const correct = isMul ? a * b : a / b;
  const truth = rng() < 0.5;
  let shown = correct;
  if (!truth) {
    shown = wrongBySlip(correct, rng);
    if (shown === correct) shown = wrongBySlip(correct, rng);
    if (shown > cap) shown = correct - 10;
  }
  const name = pickName(rng);
  const step: ReasoningStep = {
    kind: 'verdict',
    prompt: ref('isNameTrue', { name }),
    statement: ref('stmtEq', { text: `${a} ${isMul ? '×' : ':'} ${b}`, value: shown }),
    answer: truth,
    ...(truth ? {} : { fix: { prompt: ref('askCorrect'), answer: correct } }),
  };
  return arithmeticItem(
    skillId,
    tier,
    ref(isMul ? 'errorMul' : 'errorDiv', { name, a, b, shown }),
    [step],
    truth ? [] : [correct],
  );
}
