// WebMCP: registers the read-only `read_adventure_progress` tool when the browser exposes
// `document.modelContext`. Returns progress counters from the game store only (no personal data).
import { connectedStore, flushProgress } from '../ui/progress-sync';
import { type AdventureProgress, adventureProgressFromSnapshot } from './adventure-progress';

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

/** Commits pending quiz answers, then reads the store (re-read on every call). */
export async function readAdventureProgress(input: unknown): Promise<AdventureProgress> {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) {
    throw new Error('Expected an empty object');
  }
  await flushProgress();
  const store = connectedStore();
  if (!store) throw new Error('Progress is still loading');
  return adventureProgressFromSnapshot(store.getSnapshot());
}

const progressTool: ModelContextTool = {
  name: 'read_adventure_progress',
  description:
    'Read local progress in math3d (Multiplication Kingdom): XP, coins, level, bridge segments built and avatar.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true },
  execute: (input) => readAdventureProgress(input),
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
