// The prompt and answer widget of a field round, mounted into the HUD (key tips only for fine
// pointers: a touch screen gets no "phím 1-4" / "R" / "H" hints).
import { type AnswerWidget, mountEquationChoices, mountNumberPad } from './field-answer-widgets';
import type { FieldHud } from './field-hud';
import type { FieldRound } from './field-round-flow';
import { tf, tipWithKeys } from './field-strings';

/** The round's prompt and answer widget: equation choices (pick two), else the number pad. */
export function mountRoundAnswer(
  hud: FieldHud,
  round: FieldRound,
  on: { equations(ids: string[]): void; total(value: number): void },
): AnswerWidget {
  if (round.type === 'equations') {
    hud.setPrompt(tf('equationsPrompt'), tipWithKeys(tf('equationsTip'), 'equationsKeysTip'));
    return mountEquationChoices(hud.body, round.options, (ids) =>
      ids.length === 2 ? on.equations(ids) : hud.setFeedback(tf('pickTwo'), 'gentle'),
    );
  }
  const title = round.type === 'build' ? tf('totalPrompt') : tf('recallPrompt');
  hud.setPrompt(title, tipWithKeys('', 'toolsKeysTip'));
  return mountNumberPad(hud.body, on.total);
}
