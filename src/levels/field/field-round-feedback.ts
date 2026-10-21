// How a finished round is told to the child: reward pop (scoring.ts values), green answer cards,
// success / gentle feedback line, the recovered `correct` chime and a screen-reader announcement.
import { questionReward } from '../../learning/scoring';
import type { QuestionOutcome } from '../../learning/session-recorder';
import type { LevelContext } from '../shared/level-types';
import type { AnswerWidget } from './field-answer-widgets';
import type { FieldHud } from './field-hud';
import type { FieldRound } from './field-round-flow';
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
  widget?.mark(round.options.filter((o) => o.correct).map((o) => o.id));
  const text = tf(correct ? 'correct' : 'revealed', {
    a: round.rows,
    b: round.cols,
    total: round.total,
  });
  hud.setFeedback(text, correct ? 'success' : 'gentle');
  hud.setTools({ rotate: true, hint: false });
  if (correct) ctx.audio.correct();
  ctx.announce(text);
}
