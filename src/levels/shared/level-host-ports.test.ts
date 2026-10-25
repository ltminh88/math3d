// Each level run labels its overlay (and the canvas) with its own gate's name, not a neighbour's,
// and tells the level whether this would be its first completion (celebration bonus line).
import { describe, expect, it, vi } from 'vitest';
import type { LevelGate } from '../../config/level-gate-config';
import { gateNameOf } from './level-host-strings';
import type { LevelDefinition } from './level-types';

const mountLevelRunUi = vi.fn((_title: string, _onLeave: () => void) => ({
  root: {} as HTMLElement,
  unmount: vi.fn(),
}));

vi.mock('./level-run-ui', () => ({
  mountLevelRunUi: (title: string, onLeave: () => void) => mountLevelRunUi(title, onLeave),
}));
vi.mock('../../ui/game-state', () => ({ gameState: { audio: {} } }));
vi.mock('../../ui/hud', () => ({ refreshHud: vi.fn() }));
vi.mock('../../ui/kit/aria-announcer', () => ({ announce: vi.fn() }));
vi.mock('../../ui/toast-and-persist', () => ({ showToast: vi.fn() }));
vi.mock('../../ui/progress-sync', () => ({
  commitLevelRun: vi.fn(),
  connectedStore: () => ({
    nextSessionNo: () => 1,
    getSnapshot: () => ({
      profile: { id: 'p1' },
      factStats: {},
      levelProgress: { forest: { completedAt: 5 }, city: { completedAt: 0 } },
    }),
  }),
}));

vi.stubGlobal('matchMedia', () => ({ matches: false }));

const { createLevelHostPorts } = await import('./level-host-ports');

const world = { renderer: { domElement: {} } } as unknown as Parameters<
  typeof createLevelHostPorts
>[0];

describe('level host ports: run overlay title', () => {
  it.each<LevelGate['levelId']>(['field', 'forest', 'city', 'tower'])(
    'the %s run is labelled with its own gate name',
    (id) => {
      mountLevelRunUi.mockClear();
      const definition = { id, tables: [2] } as unknown as LevelDefinition;
      const disposer = { onDispose: vi.fn() } as never;
      createLevelHostPorts(world).openRun(definition, disposer, vi.fn());
      expect(mountLevelRunUi).toHaveBeenCalledOnce();
      expect(mountLevelRunUi.mock.calls[0]?.[0]).toBe(gateNameOf(id));
    },
  );

  it.each([
    ['field', true],
    ['forest', false],
    ['city', true],
  ] as const)('the %s run knows whether it can be a first completion: %s', (id, first) => {
    const definition = { id, tables: [2] } as unknown as LevelDefinition;
    const run = createLevelHostPorts(world).openRun(
      definition,
      { onDispose: vi.fn() } as never,
      vi.fn(),
    );
    expect(run.context.firstCompletion).toBe(first);
  });
});
