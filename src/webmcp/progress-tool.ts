// WebMCP: registers the read-only `read_adventure_progress` tool when the browser exposes
// `document.modelContext`. Returns progress counters only (no personal data).
import { gameState } from '../ui/game-state';

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean };
  execute: (input: unknown) => Promise<unknown>;
}

interface ModelContext {
  registerTool?: (tool: ModelContextTool, options: { signal: AbortSignal }) => unknown;
}

export interface AdventureProgress {
  xp: number;
  coins: number;
  bridgeSegments: number;
  questComplete: boolean;
  reviewCount: number;
}

/** Reads the live save (re-read on every call: reset replaces the save object). */
export function readAdventureProgress(input: unknown): AdventureProgress {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) {
    throw new Error('Expected an empty object');
  }
  const save = gameState.save;
  return {
    xp: save.xp,
    coins: save.coins,
    bridgeSegments: save.bridge,
    questComplete: save.questComplete,
    reviewCount: save.review.length,
  };
}

const progressTool: ModelContextTool = {
  name: 'read_adventure_progress',
  description:
    'Read local progress in Multiplication Kingdom: XP, coins, completed bridge segments and review count.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true },
  execute: async (input) => readAdventureProgress(input),
};

/** Registers the tool if supported; unregisters (aborts) on pagehide. Never throws. */
export function registerProgressTool(): void {
  const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
  const controller = new AbortController();
  if (modelContext?.registerTool) {
    try {
      Promise.resolve(modelContext.registerTool(progressTool, { signal: controller.signal })).catch(
        () => {},
      );
    } catch {}
  }
  window.addEventListener('pagehide', () => controller.abort(), { once: true });
}
