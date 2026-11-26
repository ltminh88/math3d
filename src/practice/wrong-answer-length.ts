// Length bug explainers (boost, Phase 1B): one explainer per length bug, keyed to
// the ladder picture in words ("1 m = 10 dm = 100 cm = 1 000 mm") and never
// stating the answer. This module is DATA only — its imports from
// wrong-answer-explanation are type-only (erased at compile), so there is no
// runtime import cycle; wrong-answer-explanation merges this map into the
// registry right after the Map is created.
//
// The 'ignore-unit' explainer also covers the legacy meas-mm-convert and
// meas-ruler-read items: their wrong options already carry that tag.
import type { Misconception } from '../reasoning/reasoning-types';
import type {
  BugExplainer,
  WrongAnswerContext,
  WrongAnswerExplanation,
} from './wrong-answer-explanation';

const explain =
  (key: WrongAnswerExplanation['key']): BugExplainer =>
  (ctx: WrongAnswerContext): WrongAnswerExplanation | null =>
    ctx.option ? { key } : null;

export const LENGTH_BUG_EXPLAINERS: ReadonlyMap<Misconception, BugExplainer> = new Map([
  ['unit-direction', explain('lenDirection')],
  ['unit-factor', explain('lenFactor')],
  ['dm-skipped', explain('lenDmSkipped')],
  ['mixed-concat', explain('lenMixedConcat')],
  ['mixed-drop-big', explain('lenMixedDropBig')],
  ['ignore-unit', explain('lenIgnoreUnit')],
]);
