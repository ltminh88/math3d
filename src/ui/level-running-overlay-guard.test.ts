// While a level loads or runs, the shared dialog (except a reload notice) and the world map stay
// closed: closing either one would rewrite the suspended world's `paused` flag.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => {
  const elements = new Map<string, Record<string, unknown>>();
  const element = (id: string) => {
    let el = elements.get(id);
    if (!el) {
      el = { id, hidden: true, open: false, innerHTML: '', focus: vi.fn() };
      el.showModal = vi.fn(() => {
        (el as { open: boolean }).open = true;
      });
      elements.set(id, el);
    }
    return el;
  };
  const world = { active: true, paused: false, clearInput: vi.fn() };
  return { elements, element, world, levelRunning: { value: false } };
});

vi.mock('../levels/shared/level-gates', () => ({
  isLevelRunning: () => h.levelRunning.value,
  currentGateStatus: () => 'open',
  gateStateText: () => '',
}));
vi.mock('./icons', () => ({ byId: (id: string) => h.element(id), icon: () => '' }));
vi.mock('./game-state', () => ({
  gameState: { mapOpen: false, dialogKind: '', progress: {} },
  getWorld: () => h.world,
}));
vi.mock('./quiz-answer', () => ({ finishQuizOnClose: vi.fn() }));
vi.mock('../i18n/legacy-translator', () => ({
  translateLongText: (s: string) => s,
  translateText: (s: string) => s,
  translateDomTree: () => {},
}));

const { openDialog } = await import('./dialog');
const { openMap } = await import('./map-overlay');
const { gameState } = await import('./game-state');

beforeEach(() => {
  h.elements.clear();
  h.world.paused = false;
  gameState.mapOpen = false;
  h.levelRunning.value = true;
});

describe('overlays while a level runs', () => {
  it('the shared dialog does not open', () => {
    openDialog('VLM', '<p>hi</p>', 'milo');
    expect(h.element('dialog').showModal).not.toHaveBeenCalled();
    expect(gameState.dialogKind).toBe('');
    expect(h.world.paused).toBe(false);
  });

  it('a reload notice still opens', () => {
    openDialog('Reload', '<p>reload</p>', 'notice');
    expect(h.element('dialog').showModal).toHaveBeenCalledTimes(1);
  });

  it('the world map does not open', () => {
    openMap();
    expect(gameState.mapOpen).toBe(false);
    expect(h.element('world-map').hidden).toBe(true);
    expect(h.world.paused).toBe(false);
  });
});
