// Test builds only (`vite build --mode test`): `window.__valley` lets e2e specs read the running
// round (kind, action, targets, what the card step expects) and the board; `window.__valleyPlan`
// set before entering fixes the rounds (skill + tier) so a spec can play chosen kinds. Installed
// from the scene behind `import.meta.env.MODE === 'test'`, removed when the level exits.
import { Vector3 } from 'three';
import { renderGeometryPrompt } from '../../geometry/geometry-strings';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { BOARD } from './valley-layout-constants';
import type { ValleyRoundController } from './valley-round-controller';
import type { ValleyRoundSpec } from './valley-round-plan';

export type ValleyStepState =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string; option: string }
  | { kind: 'multi'; options: string[] }
  | { kind: 'verdict'; answer: boolean };

export interface ValleyTestHook {
  state(): {
    round: number;
    total: number;
    done: boolean;
    kind: string | null;
    skillId: string | null;
    tier: number | null;
    phase: 'action' | 'steps' | 'complete' | null;
    action: string | null;
    targets: string[];
    rightTargets: string[];
    corners: { id: string; fits: boolean }[];
    step: ValleyStepState | null;
    hintRung: number;
    eke: string | null;
    selected: string[];
    aid: boolean;
    turnSteps: number;
    viewSettled: boolean;
    gardenStones: number;
  };
  /** On-screen angle (degrees, CSS px) at board point `o` between board points `a` and `b`. */
  screenAngle(o: [number, number], a: [number, number], b: [number, number]): number;
  plan(): { skillId: string; tier: number; kind: string }[];
}

declare global {
  interface Window {
    __valley?: ValleyTestHook;
    __valleyPlan?: ValleyRoundSpec[];
  }
}

export function installValleyTestHook(
  controller: ValleyRoundController,
  gardenStones: () => number,
): () => void {
  const flow = controller.flow;
  const stepState = (): ValleyStepState | null => {
    const round = flow.round;
    const card = controller.card;
    if (!round || !card || flow.phase !== 'steps') return null;
    const step = playableSteps(round.item)[card.currentStep()];
    if (!step) return null;
    if (step.kind === 'number' || step.kind === 'verdict')
      return { kind: step.kind, answer: step.answer } as ValleyStepState;
    const right = step.options.filter((o) => o.correct);
    if (step.kind === 'multi') return { kind: 'multi', options: right.map((o) => o.id) };
    const first = right[0];
    return {
      kind: 'choice',
      label: first ? renderGeometryPrompt(first.label) : '',
      option: first?.id ?? '',
    };
  };
  window.__valley = {
    state: () => {
      const round = flow.round;
      const targets = round?.layout.targets ?? [];
      return {
        round: flow.index,
        total: flow.rounds.length,
        done: flow.done,
        kind: round?.kind ?? null,
        skillId: round?.item.skillId ?? null,
        tier: round?.item.tier ?? null,
        phase: round ? flow.phase : null,
        action: round?.layout.action ?? null,
        targets: targets.map((t) => t.id),
        rightTargets: targets.filter((t) => t.right).map((t) => t.id),
        corners: targets
          .filter((t) => t.kind === 'corner')
          .map((t) => ({ id: t.id, fits: t.fits === true })),
        step: stepState(),
        hintRung: flow.hint.rung,
        eke: controller.board.eke.corner,
        selected: [...controller.board.selected],
        aid: controller.board.aid,
        turnSteps: controller.board.camera.steps,
        viewSettled: controller.board.camera.settled,
        gardenStones: gardenStones(),
      };
    },
    screenAngle: (o, a, b) => {
      const camera = controller.board.camera.camera;
      const box = document.querySelector('canvas')?.getBoundingClientRect();
      const [w, h] = [box?.width ?? window.innerWidth, box?.height ?? window.innerHeight];
      const screen = ([x, z]: [number, number]): [number, number] => {
        const p = new Vector3(x, BOARD.top, z).project(camera);
        return [((p.x + 1) / 2) * w, ((1 - p.y) / 2) * h];
      };
      const [so, sa, sb] = [screen(o), screen(a), screen(b)];
      const turn = (p: [number, number]) => Math.atan2(p[1] - so[1], p[0] - so[0]);
      const deg = Math.abs(((turn(sa) - turn(sb)) * 180) / Math.PI) % 360;
      return deg > 180 ? 360 - deg : deg;
    },
    plan: () =>
      flow.rounds.map((r) => ({ skillId: r.item.skillId, tier: r.item.tier, kind: r.kind })),
  };
  return () => {
    delete window.__valley;
  };
}
