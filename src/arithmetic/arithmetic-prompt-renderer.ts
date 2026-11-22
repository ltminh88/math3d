// Prompt renderer for the arithmetic family (phase 09): wires renderArithmeticPrompt
// into the family prompt registry, so arithmetic items never fall back to the reasoning
// renderer (which would show raw keys).
import type { FamilyPromptRenderer } from '../practice/family-prompt-registry';
import { renderArithmeticPrompt } from './arithmetic-strings';

export const promptRenderer: FamilyPromptRenderer = {
  families: ['arithmetic'],
  renderPrompt: renderArithmeticPrompt,
};
