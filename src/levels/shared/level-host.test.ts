import {
  BoxGeometry,
  type BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
} from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LevelHost, type LevelHostPorts } from './level-host';
import type { LevelContext, LevelDefinition, LevelModule, LevelResult } from './level-types';

/** Fake ports: frames run only when the test calls `tick`, so the loop is deterministic. */
function fakePorts() {
  let pending: ((t: number) => void) | undefined;
  let nextHandle = 1;
  const events: string[] = [];
  const closed: LevelResult[] = [];
  let exit: ((r: LevelResult) => void) | undefined;
  const ports: LevelHostPorts = {
    world: { suspend: () => events.push('suspend'), resume: () => events.push('resume') },
    renderer: {
      render: (scene) => events.push(`render:${scene.name}`),
      setSize: (w, h) => events.push(`size:${w}x${h}`),
    },
    requestFrame: (callback) => {
      pending = callback;
      return nextHandle++;
    },
    cancelFrame: () => {
      pending = undefined;
    },
    watchResize: (onResize) => {
      onResize(800, 600);
      return () => events.push('unwatch');
    },
    openRun: (_definition, _disposer, exitRun) => {
      exit = exitRun;
      return {
        context: {} as Omit<LevelContext, 'exit' | 'disposer' | 'definition'>,
        close: (result) => {
          closed.push(result);
          events.push('close');
        },
      };
    },
  };
  return {
    ports,
    events,
    closed,
    exit: (result: LevelResult) => exit?.(result),
    tick: (t: number) => {
      const callback = pending;
      pending = undefined;
      callback?.(t);
    },
    looping: () => pending !== undefined,
  };
}

/** A real (tiny) level: a scene with meshes, recording every geometry it allocates. */
function testLevel(log: { geometries: BufferGeometry[]; updates: number[] }): LevelModule {
  return {
    start(ctx: LevelContext) {
      const scene = new Scene();
      scene.name = 'level';
      for (let i = 0; i < 3; i++) {
        const geometry = new BoxGeometry(1, 1, 1);
        log.geometries.push(geometry);
        scene.add(new Mesh(geometry, new MeshBasicMaterial()));
      }
      const extra = ctx.disposer.track(new Mesh(new BoxGeometry(), new MeshBasicMaterial()));
      log.geometries.push(extra.geometry);
      scene.add(extra);
      return { scene, camera: new PerspectiveCamera(), update: (dt) => log.updates.push(dt) };
    },
  };
}

const definition = (module: () => Promise<LevelModule>): LevelDefinition => ({
  id: 'field',
  regionId: 'meadow',
  tables: [3, 4],
  rounds: 5,
  requires: 'bridge',
  load: module,
});

const disposedCount = (geometries: BufferGeometry[]) => {
  let count = 0;
  for (const g of geometries) g.addEventListener('dispose', () => count++);
  return () => count;
};

afterEach(() => vi.restoreAllMocks());

describe('level host', () => {
  it('suspends the world and renders the level scene from its own loop', async () => {
    const f = fakePorts();
    const log = { geometries: [], updates: [] as number[] };
    const host = new LevelHost(f.ports);
    expect(await host.enter(definition(async () => testLevel(log)))).toBe('entered');
    expect(host.running).toBe(true);
    expect(f.events.slice(0, 2)).toEqual(['suspend', 'size:800x600']);
    f.tick(1000);
    f.tick(1016);
    f.tick(3000); // long hitch: clamped
    expect(log.updates).toEqual([0, 0.016, 0.05]);
    expect(f.events.filter((e) => e === 'render:level')).toHaveLength(3);
  });

  it('exit stops the loop, disposes every geometry, closes the run and resumes the world', async () => {
    const f = fakePorts();
    const log = { geometries: [] as BufferGeometry[], updates: [] as number[] };
    const host = new LevelHost(f.ports);
    await host.enter(definition(async () => testLevel(log)));
    const disposed = disposedCount(log.geometries);
    f.exit({ completed: true });
    f.exit({ completed: true });
    expect(f.looping()).toBe(false);
    expect(disposed()).toBe(4);
    expect(f.closed).toEqual([{ completed: true }]);
    expect(f.events.slice(-3)).toEqual(['unwatch', 'close', 'resume']);
    expect(host.running).toBe(false);
  });

  it('10 enter/exit cycles leave no geometry undisposed and balance suspend/resume', async () => {
    const f = fakePorts();
    const log = { geometries: [] as BufferGeometry[], updates: [] as number[] };
    const host = new LevelHost(f.ports);
    let disposed = 0;
    for (let i = 0; i < 10; i++) {
      await host.enter(definition(async () => testLevel(log)));
      for (const g of log.geometries.slice(-4)) g.addEventListener('dispose', () => disposed++);
      f.tick(i * 100);
      f.exit({ completed: false });
    }
    expect(disposed).toBe(40);
    expect(f.events.filter((e) => e === 'suspend')).toHaveLength(10);
    expect(f.events.filter((e) => e === 'resume')).toHaveLength(10);
  });

  it('a level that fails to load never touches the world', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fakePorts();
    const host = new LevelHost(f.ports);
    const outcome = await host.enter(definition(() => Promise.reject(new Error('chunk 404'))));
    expect(outcome).toBe('failed');
    expect(f.events).toEqual([]);
    expect(host.running).toBe(false);
  });

  it('a level whose start throws gives the world back', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fakePorts();
    const host = new LevelHost(f.ports);
    const broken: LevelModule = {
      start: () => {
        throw new Error('scene build failed');
      },
    };
    expect(await host.enter(definition(async () => broken))).toBe('failed');
    expect(f.closed).toEqual([{ completed: false }]);
    expect(f.events.at(-1)).toBe('resume');
    expect(host.running).toBe(false);
  });

  it('a run that cannot open (no store) resumes the world', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fakePorts();
    const host = new LevelHost({
      ...f.ports,
      openRun: () => {
        throw new Error('store not connected');
      },
    });
    const log = { geometries: [], updates: [] };
    expect(await host.enter(definition(async () => testLevel(log)))).toBe('failed');
    expect(f.events).toEqual(['suspend', 'resume']);
    expect(host.running).toBe(false);
  });

  it('refuses a second level while one is loading or running', async () => {
    const f = fakePorts();
    const log = { geometries: [], updates: [] };
    const host = new LevelHost(f.ports);
    const first = host.enter(definition(async () => testLevel(log)));
    expect(await host.enter(definition(async () => testLevel(log)))).toBe('busy');
    expect(await first).toBe('entered');
    expect(await host.enter(definition(async () => testLevel(log)))).toBe('busy');
  });

  it('an update that throws ends the run as not completed', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fakePorts();
    const host = new LevelHost(f.ports);
    const crashing: LevelModule = {
      start: () => ({
        scene: new Scene(),
        camera: new PerspectiveCamera(),
        update: () => {
          throw new Error('frame failed');
        },
      }),
    };
    await host.enter(definition(async () => crashing));
    f.tick(0);
    expect(f.closed).toEqual([{ completed: false }]);
    expect(f.looping()).toBe(false);
    expect(host.running).toBe(false);
  });
});
