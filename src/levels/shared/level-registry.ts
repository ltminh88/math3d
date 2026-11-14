// Levels self-register: every `src/levels/<id>/index.ts` default-exports its LevelDefinition.
// The definitions are tiny and eager (a gate must know whether its level exists before anyone
// walks up to it); the scene code behind `definition.load()` stays a separate chunk.
import { LEVEL_GATES } from '../../config/level-gate-config';
import type { LevelDefinition } from './level-types';

const FOLDER_PATTERN = /^\/src\/levels\/([^/]+)\/index\.ts$/;

/** Validates glob results against their folders and gates; throws on a broken definition. */
export function collectLevelDefinitions(
  modules: Readonly<Record<string, unknown>>,
): ReadonlyMap<string, LevelDefinition> {
  const registry = new Map<string, LevelDefinition>();
  for (const [path, exported] of Object.entries(modules)) {
    const folder = FOLDER_PATTERN.exec(path)?.[1];
    if (folder === undefined || folder === 'shared') continue;
    const definition = exported as Partial<LevelDefinition> | undefined;
    if (typeof definition !== 'object' || definition === null || !definition.id) {
      throw new Error(`Level folder "${folder}": index.ts must default-export a LevelDefinition`);
    }
    if (typeof definition.load !== 'function') {
      throw new Error(`Level "${definition.id}": load must be a function returning import()`);
    }
    if (definition.id !== folder) {
      throw new Error(`Level "${definition.id}" must live in folder "${folder}" (${path})`);
    }
    const gate = LEVEL_GATES.find((g) => g.levelId === definition.id);
    if (!gate || gate.regionId !== definition.regionId || gate.requires !== definition.requires) {
      throw new Error(`Level "${definition.id}" does not match its gate in LEVEL_GATES`);
    }
    if (!Number.isInteger(definition.rounds) || (definition.rounds ?? 0) < 1) {
      throw new Error(`Level "${definition.id}": rounds must be a positive integer`);
    }
    if (!Number.isInteger(definition.stages) || (definition.stages ?? 0) < 1) {
      throw new Error(`Level "${definition.id}": stages must be a positive integer`);
    }
    if (!Array.isArray(definition.tables) || definition.tables.length === 0) {
      throw new Error(`Level "${definition.id}": tables must not be empty`);
    }
    registry.set(definition.id, definition as LevelDefinition);
  }
  return registry;
}

const registry = collectLevelDefinitions(
  import.meta.glob<unknown>('/src/levels/*/index.ts', { eager: true, import: 'default' }),
);

export const levelDefinition = (levelId: string): LevelDefinition | undefined =>
  registry.get(levelId);
