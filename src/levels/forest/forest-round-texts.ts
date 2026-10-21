// What VLM and the panel say at the start of a round (story prompt, guide tip, deal button).
import type { ForestRound } from './forest-round-flow';
import type { ForestStrings } from './forest-strings';

export interface RoundTexts {
  prompt: string;
  guide: string;
  deal: string;
}

export function roundTexts(ts: ForestStrings, round: ForestRound): RoundTexts {
  const { kind, dividend: total, divisor: size, quotient } = round;
  if (kind === 'share') {
    return {
      prompt: ts('sharePrompt', { total, groups: size }),
      guide: ts('guideShare'),
      deal: ts('dealShare'),
    };
  }
  if (kind === 'pack') {
    return {
      prompt: ts('packPrompt', { total, size }),
      guide: ts('guidePack', { size }),
      deal: ts('dealPack'),
    };
  }
  return {
    prompt: ts('familyPrompt', { a: size, b: quotient, p: total }),
    guide: ts('guideFamily'),
    deal: ts('dealShare'),
  };
}
