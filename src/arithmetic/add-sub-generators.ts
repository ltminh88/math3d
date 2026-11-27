// Arithmetic add/sub generators (boost, Phase 1A): this file is now only a barrel.
// The generators live in add-sub-pair-pickers.ts (pair sampling), add-sub-calc-
// generators.ts (mental round, plain, chain) and add-sub-error-generators.ts
// (find-the-error, missing digit); the format generators join them below.
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { ADD_SUB_CALC_GENERATORS } from './add-sub-calc-generators';
import { ADD_SUB_ERROR_GENERATORS } from './add-sub-error-generators';
import { ADD_SUB_FORMAT_GENERATORS } from './add-sub-format-generators';

export { pickAddPair, pickSubPair, pickChainTriple, type ChainTriple } from './add-sub-pair-pickers';
export { mentalRound, addSubChain } from './add-sub-calc-generators';
export { findError, missingDigit } from './add-sub-error-generators';
export { bugChoice, trueFalse, compareEstimate, numberLine } from './add-sub-format-generators';
export { barModelWp } from './add-sub-bar-model-word-problems';

export const ADD_SUB_GENERATORS: Record<string, ReasoningGenerator> = {
  ...ADD_SUB_CALC_GENERATORS,
  ...ADD_SUB_ERROR_GENERATORS,
  ...ADD_SUB_FORMAT_GENERATORS,
};
