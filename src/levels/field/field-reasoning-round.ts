// The field's reasoning round: once the tables are known (or always, in stage 4), the last
// patch is a word problem about rows of plants ("mỗi luống 6 cây, gấp 4 lần…") or a
// skip-count pattern, answered with the step kit. The run keeps its five patches; a fresh
// profile never gets one (the stage plan in field-stage-plan.ts decides when it appears).
import { questionReward } from '../../learning/scoring';
import type { LevelContext } from '../shared/level-types';
import { mountReasoningRound, type ReasoningRoundPanel } from '../shared/reasoning-round-panel';
import type { ReasoningRoundPlan } from '../shared/reasoning-round-slot';
import type { FieldHud } from './field-hud';
import type { FieldRunTally } from './field-run-tally';
import { tf } from './field-strings';

/** Shows the reasoning round over the field; the field's own panel hides meanwhile. */
export function startFieldReasoningRound(
  ctx: LevelContext,
  hud: FieldHud,
  plan: ReasoningRoundPlan,
  tally: FieldRunTally,
  onNext: () => void,
): ReasoningRoundPanel {
  hud.panel.hidden = true;
  hud.speak(tf('reasoningLine'));
  const total = tally.score().total + 1;
  const panel = mountReasoningRound({
    ui: ctx.ui,
    signal: ctx.disposer.signal,
    audio: ctx.audio,
    announce: ctx.announce,
    plan,
    eyebrow: tf('round', { n: total, total }).toUpperCase(),
    title: tf('reasoningTitle'),
    onRecorded: (outcome) => {
      ctx.learning.record(outcome);
      tally.add(outcome);
      return questionReward(outcome);
    },
    nextLabel: tf('finish'),
    onNext: () => {
      panel.destroy();
      hud.panel.hidden = false;
      onNext();
    },
  });
  return panel;
}
