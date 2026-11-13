// Field round lifecycle with fake parts (no DOM, no WebGL): round identity guards the plot turn
// (QA M-1), the tip matches the tools (m-1), the pad clears on reveal (m-2), square wording (p-5)
// and the first-clear bonus on the celebration (m-12).
import { describe, expect, it, vi } from 'vitest';
import type { LevelContext } from '../shared/level-types';
import type { FieldDiorama } from './field-diorama-builder';
import { createFieldGame } from './field-game';
import type { FieldHud } from './field-hud';
import type { PlantingInput } from './field-planting-input';
import type { ProjectedLabels } from './field-projected-labels';
import type { GridView } from './planting-grid-view';

const widgets = vi.hoisted(() => ({
  submit: undefined as ((value: number) => void) | undefined,
  clear: [] as number[],
}));

vi.mock('./field-answer-widgets', () => {
  const widget = () => ({
    key: () => false,
    setDisabled: () => {},
    mark: () => {},
    clear: () => widgets.clear.push(1),
    destroy: () => {},
  });
  return {
    mountNumberPad: (_body: unknown, onSubmit: (value: number) => void) => {
      widgets.submit = onSubmit;
      return widget();
    },
    mountEquationChoices: () => widget(),
  };
});

const noop = () => {};

function setup(facts: string[], firstCompletion = true) {
  let pendingTurn: (() => void) | undefined;
  const view = {
    animating: false,
    show: noop,
    setFocus: noop,
    setRowHighlight: noop,
    worldOf: () => null,
    rotate: () =>
      new Promise<void>((resolve) => {
        view.animating = true;
        pendingTurn = () => {
          view.animating = false;
          pendingTurn = undefined;
          resolve();
        };
      }),
    stopTurn: () => pendingTurn?.(),
  };
  const hud = {
    body: {},
    tips: [] as { tip: string; rotate: boolean }[],
    feedback: '',
    tools: { rotate: false, hint: false },
    next: undefined as (() => void) | undefined,
    celebrated: undefined as { bonus: string | null } | undefined,
    speak: noop,
    resetRound: noop,
    setPrompt(_title: string, tip: string) {
      hud.tips.push({ tip, rotate: hud.tools.rotate });
    },
    setFeedback(text: string) {
      hud.feedback = text;
    },
    setHint: noop,
    setTools(tools: { rotate: boolean; hint: boolean }) {
      hud.tools = tools;
    },
    setNext(_label: string | null, onClick?: () => void) {
      hud.next = onClick;
    },
    rewardPop: noop,
    celebrate(_score: string, _stars: number, _onBack: () => void, bonus: string | null) {
      hud.celebrated = { bonus };
    },
  };
  const hidden: boolean[] = [];
  const labels = { set: noop, place: noop, hide: (h: boolean) => hidden.push(h) };
  const audio = new Proxy({}, { get: () => noop });
  const ctx = {
    definition: { tables: [3, 4], rounds: facts.length, stages: 1 },
    stage: 1,
    learning: {
      stats: () => ({}),
      sessionNo: 1,
      planSession: () => facts,
      record: noop,
      rng: () => 0.3,
    },
    audio,
    announce: noop,
    reducedMotion: false,
    firstCompletion,
    exit: noop,
  } as unknown as LevelContext;
  const game = createFieldGame({
    ctx,
    view: view as unknown as GridView,
    hud: hud as unknown as FieldHud,
    labels: labels as unknown as ProjectedLabels,
    diorama: { restorePatch: noop } as unknown as FieldDiorama,
    planting: { enable: noop, disable: noop, refresh: noop } as unknown as PlantingInput,
  });
  game.start();
  const plantAll = () => {
    for (let r = 0; r < game.status().grid.rows; r++) game.plantRow(r);
  };
  return { game, view, hud, hidden, plantAll, finishTurn: () => pendingTurn?.() };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('field game rounds', () => {
  it('a turn still running when the next round starts never turns the new plot (M-1)', async () => {
    const { game, hud, hidden, plantAll, finishTurn } = setup(['mul:3x6', 'mul:4x7']);
    plantAll();
    widgets.submit?.(18);
    expect(game.status().phase).toBe('solved');
    hud.next?.(); // "Luống tiếp theo" while the plot still turns
    finishTurn();
    await flush();
    expect(game.status().index).toBe(1);
    expect(game.status().grid).toMatchObject({ rows: 4, cols: 7 });
    expect(hidden.at(-1)).toBe(false);
  });

  it('the planting tip never offers the disabled R key (m-1)', () => {
    const { hud } = setup(['mul:3x6']);
    const planting = hud.tips.at(-1);
    expect(planting?.rotate).toBe(false);
    expect(planting?.tip).not.toMatch(/\bR\b/);
  });

  it('the pad is cleared when the answer is revealed after three misses (m-2)', () => {
    const { game, plantAll } = setup(['mul:3x6']);
    plantAll();
    widgets.clear.length = 0;
    for (const wrong of [21, 20, 19]) widgets.submit?.(wrong);
    expect(game.status().phase).toBe('solved');
    expect(widgets.clear.length).toBeGreaterThan(0);
  });

  it('a square plot is praised once, not as "3 × 3 and 3 × 3" (p-5)', () => {
    const { hud, plantAll } = setup(['mul:3x3']);
    plantAll();
    widgets.submit?.(9);
    expect(hud.feedback).toContain('3 × 3 = 9');
    expect(hud.feedback.match(/3 × 3/g)).toHaveLength(1);
  });

  it('the celebration shows the one-time bonus only on the first clear (m-12)', () => {
    for (const first of [true, false]) {
      const { hud, plantAll } = setup(['mul:3x3'], first);
      plantAll();
      widgets.submit?.(9);
      hud.next?.();
      const bonus = hud.celebrated?.bonus ?? null;
      if (first) expect(bonus).toContain('+50 XP');
      else expect(bonus).toBeNull();
    }
  });
});
