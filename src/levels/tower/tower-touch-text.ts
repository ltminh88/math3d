// Tower texts that name keys (phase 04 touch fix): a touch screen (coarse pointer) has no
// keyboard, so its choice guide and answer-card names leave the key hints out.
import { isCoarsePointer } from '../../ui/pointer-kind';
import type { TowerStrings } from './tower-strings';

export const choiceGuide = (ts: TowerStrings, coarse = isCoarsePointer()): string =>
  coarse ? ts('guideChoice') : `${ts('guideChoice')} ${ts('guideChoiceKeys')}`;

export const answerCardName = (
  ts: TowerStrings,
  label: string,
  n: number,
  coarse = isCoarsePointer(),
): string => (coarse ? label : ts('cardName', { label, n }));
