// Re-export shim (phase 7 split): the div generators live in
// div-calc-generators.ts (exact/remainder 2–3 digit) and
// div-mental-generators.ts (round tens/hundreds, "giảm n lần"). Kept because
// arithmetic-item-for-skill, mul-div-find-error and mul-div-large-generators
// import from here.
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { DIV_CALC_GENERATORS } from './div-calc-generators';
import { DIV_MENTAL_GENERATORS } from './div-mental-generators';

export * from './div-calc-generators';
export * from './div-mental-generators';

export const DIV_GENERATORS: Record<string, ReasoningGenerator> = {
  ...DIV_CALC_GENERATORS,
  ...DIV_MENTAL_GENERATORS,
};
