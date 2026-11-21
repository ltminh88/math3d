// Numbers prompt renderer, registered in the family prompt registry (phase 07).
import type { FamilyPromptRenderer } from '../practice/family-prompt-registry';
import { renderNumbersPrompt } from './numbers-strings';

export const promptRenderer: FamilyPromptRenderer = {
  families: ['number'],
  renderPrompt: renderNumbersPrompt,
};
