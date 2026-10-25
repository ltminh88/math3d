// How a finished round is told to the child: reward pop (scoring.ts values), green answer cards,
// success / gentle feedback line, the recovered `correct` chime and a screen-reader announcement.
import { questionReward } from '../../learning/scoring';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext } from '../shared/level-types';
import type { AnswerWidget } from './field-answer-widgets';
import type { FieldHud } from './field-hud';
import type { FieldRound } from './field-round-flow';
import type { FieldRunTally } from './field-run-tally';
import { tf } from './field-strings';

export function showRoundResult(
  ctx: Pick<LevelContext, 'audio' | 'announce'>,
  hud: FieldHud,
  widget: AnswerWidget | undefined,
  round: FieldRound,
  outcome: QuestionOutcome,
): void {
  const { correct } = outcome;
  const reward = questionReward(outcome);
  if (reward.xp > 0) hud.rewardPop(`+${reward.xp} XP · +${reward.coins} 🪙`);
  widget?.setDisabled(true);
  if (!correct) widget?.clear();
  widget?.mark(round.options.filter((o) => o.correct).map((o) => o.id));
  const square = round.rows === round.cols;
  const text = tf(correct ? (square ? 'correctSquare' : 'correct') : 'revealed', {
    a: round.rows,
    b: round.cols,
    total: round.total,
  });
  hud.setFeedback(text, correct ? 'success' : 'gentle');
  hud.setTools({ rotate: true, hint: false });
  if (correct) ctx.audio.correct();
  ctx.announce(text);
}

/**
 * The celebration card: score, stars and, on the first clear that earns a star, the one-time
 * bonus the host pays on commit (QA m-12). "Về cổng" ends the run as completed.
 */
export function showFieldCelebration(
  ctx: Pick<LevelContext, 'audio' | 'announce' | 'exit' | 'firstCompletion'>,
  hud: FieldHud,
  tally: FieldRunTally,
): void {
  const stars = tally.stars();
  const bonus = ctx.firstCompletion && stars >= 1 ? tf('bonusLine', LEVEL_COMPLETE_BONUS) : null;
  hud.celebrate(tf('doneScore', tally.score()), stars, () => ctx.exit({ completed: true }), bonus);
  ctx.audio.celebrate();
  ctx.announce(tf('doneTitle'));
}
