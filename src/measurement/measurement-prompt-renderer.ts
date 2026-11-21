// Measurement prompt renderer, registered in the family prompt registry (phase 07).
import type { FamilyPromptRenderer } from '../practice/family-prompt-registry';
import { renderMeasurementPrompt } from './measurement-strings';

export const promptRenderer: FamilyPromptRenderer = {
  families: ['measurement'],
  renderPrompt: renderMeasurementPrompt,
};
