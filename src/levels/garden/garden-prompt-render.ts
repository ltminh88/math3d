// Prompt text for the garden's step cards: the garden tells the item's story in its own words
// (flower row, balance, seed bag) and adds its "first part" question and seed packets; every
// other prompt is the shared reasoning text.
import { renderPrompt } from '../../reasoning/reasoning-strings';
import type { PromptRef } from '../../reasoning/reasoning-types';
import type { GardenStrings } from './garden-strings';

const STORY_KEYS: Readonly<Record<string, Parameters<GardenStrings>[0]>> = {
  patternNext: 'patternStory',
  unknownEq: 'balanceStory',
  exprValue: 'bagStory',
  gardenFirstOp: 'gardenFirstOp',
  gardenPacket: 'gardenPacket',
};

export type PromptRenderer = (prompt: PromptRef) => string;

export function gardenPromptRenderer(gs: GardenStrings): PromptRenderer {
  return (prompt) => {
    const key = STORY_KEYS[prompt.key];
    return key ? gs(key, { ...prompt.params }) : renderPrompt(prompt);
  };
}
