// R42: the shared level wiring for per-skill wrong-answer explanations (R35 selector).
// Each level passes its own skill/item/step/answer/missNumber; the helper returns the
// explanation sentence, or null so the caller keeps its generic sentence. Items below
// are built with the levels' own generators, so a specific sentence here proves the
// wiring data really reaches the selector (Q4: unknown-* in city/garden).
import { describe, expect, it } from 'vitest';
import { geometryItemForSkill } from '../../geometry/geometry-item-for-skill';
import { mulberry32 } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import { itemForSkill } from '../../practice/item-for-skill';
import {
  isStepAnswerCorrect,
  playableSteps,
  type StepAnswer,
} from '../../reasoning/reasoning-step-answers';
import type { ReasoningItem, ReasoningStep } from '../../reasoning/reasoning-types';
import { buildCaveChambers } from '../cave/cave-chamber-formats';
import { buildGardenItem } from '../garden/garden-round-plan';
import { planWorkshopRounds } from '../workshop/workshop-round-plan';
import { must } from './level-controller-test-harness';
import { wrongAnswerFeedback } from './wrong-answer-feedback';

/** A wrong answer for one playable step (never the right one). */
function wrongAnswerFor(step: ReasoningStep): StepAnswer {
  switch (step.kind) {
    case 'number':
      return step.answer + 1;
    case 'choice': {
      const wrong = step.options.find((o) => !o.correct);
      if (!wrong) throw new Error('choice step without a wrong option');
      return wrong.id;
    }
    case 'multi': {
      const wrongIds = step.options.filter((o) => !o.correct).map((o) => o.id);
      if (wrongIds.length > 0) return wrongIds;
      return step.options
        .filter((o) => o.correct)
        .slice(1)
        .map((o) => o.id);
    }
    case 'verdict':
      return !step.answer;
    case 'order': {
      const wrong = [...step.answer];
      if (wrong.length > 1) [wrong[0], wrong[1]] = [wrong[1] as number, wrong[0] as number];
      else return [];
      return wrong;
    }
    case 'match': {
      const wrong = [...step.pairs];
      if (wrong.length > 1) [wrong[0], wrong[1]] = [wrong[1] as number, wrong[0] as number];
      else return [];
      return wrong;
    }
    case 'set-clock':
      return { h: (step.h + 1) % 12, m: step.m };
  }
}

/** First specific sentence any step of this item yields, or null when none does. */
function specificFeedback(
  skillId: string,
  item: ReasoningItem,
  tier: SkillTier,
  missNumber = 1,
): string | null {
  for (const [stepIndex, step] of playableSteps(item).entries()) {
    const answer = wrongAnswerFor(step);
    if (isStepAnswerCorrect(step, answer)) continue;
    const text = wrongAnswerFeedback({ skillId, tier, item, stepIndex, answer, missNumber });
    if (text) return text;
  }
  return null;
}

/** True when no step of this item yields a specific sentence. */
function hasNoSpecificFeedback(skillId: string, item: ReasoningItem, tier: SkillTier): boolean {
  return specificFeedback(skillId, item, tier) === null;
}

const GENERIC = 'Chưa đúng, mình thử lại nhé!';

describe('wrongAnswerFeedback — levels', () => {
  it('city unknown-mul-div gives a specific sentence (Q4)', () => {
    const item = itemForSkill('unknown-mul-div', mulberry32(7), 1);
    const text = specificFeedback('unknown-mul-div', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('garden unknown-add-sub gives a specific sentence (Q4)', () => {
    const item = buildGardenItem('unknown-add-sub', mulberry32(7), 1);
    const text = specificFeedback('unknown-add-sub', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('wp-times-then-sub gives a specific sentence (lesson skill, no level asks it)', () => {
    const item = itemForSkill('wp-times-then-sub', mulberry32(7), 1);
    const text = specificFeedback('wp-times-then-sub', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('valley geo-midpoint-length gives a specific sentence', () => {
    const item = geometryItemForSkill('geo-midpoint-length', mulberry32(7), 1);
    const text = specificFeedback('geo-midpoint-length', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('workshop meas-area-count gives a specific sentence', () => {
    const round = must(
      planWorkshopRounds(['meas-area-count'], {}, mulberry32(7))[0],
      'workshop round',
    );
    const text = specificFeedback('meas-area-count', round.item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('workshop meas-area-equal gives a specific sentence', () => {
    const round = must(
      planWorkshopRounds(['meas-area-equal'], {}, mulberry32(7))[0],
      'workshop round',
    );
    const text = specificFeedback('meas-area-equal', round.item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market roman-clock-hour gives a specific sentence', () => {
    const item = itemForSkill('roman-clock-hour', mulberry32(7), 1);
    const text = specificFeedback('roman-clock-hour', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market clock-sang-chieu-24h gives a specific sentence', () => {
    const item = itemForSkill('clock-sang-chieu-24h', mulberry32(7), 1);
    const text = specificFeedback('clock-sang-chieu-24h', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market money-change-back gives a specific sentence', () => {
    const item = itemForSkill('money-change-back', mulberry32(7), 1);
    const text = specificFeedback('money-change-back', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market money-total-notes gives a specific sentence', () => {
    const item = itemForSkill('money-total-notes', mulberry32(7), 1);
    const text = specificFeedback('money-total-notes', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market money-pick-notes gives a specific sentence', () => {
    const item = itemForSkill('money-pick-notes', mulberry32(7), 1);
    const text = specificFeedback('money-pick-notes', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market money-wp gives a specific sentence', () => {
    const item = itemForSkill('money-wp', mulberry32(7), 1);
    const text = specificFeedback('money-wp', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market tally-count gives a specific sentence', () => {
    const item = itemForSkill('tally-count', mulberry32(7), 1);
    const text = specificFeedback('tally-count', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market table-read gives a specific sentence', () => {
    const item = itemForSkill('table-read', mulberry32(7), 1);
    const text = specificFeedback('table-read', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('market chance-bag gives a specific sentence', () => {
    const item = itemForSkill('chance-bag', mulberry32(7), 1);
    const text = specificFeedback('chance-bag', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('numberfort add-4digit gives a specific sentence', () => {
    const item = itemForSkill('add-4digit', mulberry32(7), 1);
    const text = specificFeedback('add-4digit', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('numberfort sub-5digit gives a specific sentence', () => {
    const item = itemForSkill('sub-5digit', mulberry32(7), 1);
    const text = specificFeedback('sub-5digit', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('forest div-rem-floor gives a specific sentence', () => {
    const item = itemForSkill('div-rem-floor', mulberry32(7), 1);
    const text = specificFeedback('div-rem-floor', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('cave div-rem-ceil gives a specific sentence', () => {
    const chamber = must(buildCaveChambers(['div-rem-ceil'], {}, mulberry32(7))[0], 'cave chamber');
    const text = specificFeedback('div-rem-ceil', chamber.item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('numberfort div-4d-1d-remainder gives a specific sentence', () => {
    const item = itemForSkill('div-4d-1d-remainder', mulberry32(7), 1);
    const text = specificFeedback('div-4d-1d-remainder', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('fraction-wp gives a specific sentence', () => {
    const item = itemForSkill('fraction-wp', mulberry32(7), 1);
    const text = specificFeedback('fraction-wp', item, 1);
    expect(text).not.toBeNull();
    expect(text).not.toBe(GENERIC);
  });

  it('second miss shows the same sentence as the first (Q5)', () => {
    const item = itemForSkill('money-change-back', mulberry32(7), 1);
    const first = specificFeedback('money-change-back', item, 1, 1);
    const second = specificFeedback('money-change-back', item, 1, 2);
    expect(first).not.toBeNull();
    expect(second).toBe(first);
  });

  it('garden pattern-add keeps the generic sentence', () => {
    const item = buildGardenItem('pattern-add', mulberry32(7), 1);
    expect(hasNoSpecificFeedback('pattern-add', item, 1)).toBe(true);
  });

  it('wp-times-then-add keeps the generic sentence', () => {
    const item = itemForSkill('wp-times-then-add', mulberry32(7), 1);
    expect(hasNoSpecificFeedback('wp-times-then-add', item, 1)).toBe(true);
  });

  it('market time-set-clock keeps the generic sentence', () => {
    const item = itemForSkill('time-set-clock', mulberry32(7), 1);
    expect(hasNoSpecificFeedback('time-set-clock', item, 1)).toBe(true);
  });

  it('workshop meas-area-rect keeps the generic sentence', () => {
    const round = must(
      planWorkshopRounds(['meas-area-rect'], {}, mulberry32(7))[0],
      'workshop round',
    );
    expect(hasNoSpecificFeedback('meas-area-rect', round.item, 1)).toBe(true);
  });

  it('market money-recognize keeps the generic sentence', () => {
    const item = itemForSkill('money-recognize', mulberry32(7), 1);
    expect(hasNoSpecificFeedback('money-recognize', item, 1)).toBe(true);
  });
});
