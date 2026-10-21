import { describe, expect, it } from 'vitest';
import { collectLevelDefinitions } from './level-registry';
import type { LevelDefinition } from './level-types';

const definition = (patch: Partial<LevelDefinition> = {}): LevelDefinition => ({
  id: 'field',
  regionId: 'meadow',
  tables: [3, 4],
  rounds: 5,
  requires: 'bridge',
  load: () => Promise.reject(new Error('not loaded in tests')),
  ...patch,
});

describe('level registry', () => {
  it('registers definitions by folder and skips the shared folder', () => {
    const registry = collectLevelDefinitions({
      '/src/levels/field/index.ts': definition(),
      '/src/levels/shared/index.ts': definition({ id: 'forest' }),
    });
    expect([...registry.keys()]).toEqual(['field']);
  });

  it('refuses a definition whose id differs from its folder', () => {
    expect(() => collectLevelDefinitions({ '/src/levels/meadow/index.ts': definition() })).toThrow(
      /folder "meadow"/,
    );
  });

  it('refuses a level without a gate or with a requirement/region other than its gate', () => {
    expect(() =>
      collectLevelDefinitions({ '/src/levels/field/index.ts': definition({ requires: null }) }),
    ).toThrow(/gate/);
    expect(() =>
      collectLevelDefinitions({
        '/src/levels/forest/index.ts': definition({ id: 'forest', regionId: 'meadow' }),
      }),
    ).toThrow(/gate/);
  });

  it('refuses invalid rounds or tables', () => {
    expect(() =>
      collectLevelDefinitions({ '/src/levels/field/index.ts': definition({ rounds: 0 }) }),
    ).toThrow(/rounds/);
    expect(() =>
      collectLevelDefinitions({ '/src/levels/field/index.ts': definition({ tables: [] }) }),
    ).toThrow(/tables/);
  });

  it('names the folder of an index.ts without a default export or without a load function', () => {
    expect(() => collectLevelDefinitions({ '/src/levels/field/index.ts': undefined })).toThrow(
      /field.*default-export/,
    );
    const noLoad = { ...definition(), load: 'scene.ts' } as unknown as LevelDefinition;
    expect(() => collectLevelDefinitions({ '/src/levels/field/index.ts': noLoad })).toThrow(/load/);
  });
});
