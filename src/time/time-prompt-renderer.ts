// Time prompt renderer, registered in the family prompt registry (phase 07:
// added here because phase 13 merged before this PR, so the registry test's
// "every family with a generator has a renderer" rule needs it now — same
// reason as the fraction renderer above).
import type { FamilyPromptRenderer } from '../practice/family-prompt-registry';
import { renderTimePrompt } from './time-strings';

export const promptRenderer: FamilyPromptRenderer = {
  families: ['time'],
  renderPrompt: renderTimePrompt,
};
