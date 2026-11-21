// Data prompt renderer, registered in the family prompt registry (phase 07:
// added here because phase 15 merged before this PR, so the registry test's
// "every family with a generator has a renderer" rule needs it now).
import type { FamilyPromptRenderer } from '../practice/family-prompt-registry';
import { renderDataPrompt } from './data-strings';

export const promptRenderer: FamilyPromptRenderer = {
  families: ['data'],
  renderPrompt: renderDataPrompt,
};
