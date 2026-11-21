// Geometry prompt renderer, registered in the family prompt registry (phase 07).
import type { FamilyPromptRenderer } from '../practice/family-prompt-registry';
import { renderGeometryPrompt } from './geometry-strings';

export const promptRenderer: FamilyPromptRenderer = {
  families: ['geometry'],
  renderPrompt: renderGeometryPrompt,
};
