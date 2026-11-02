// Everything on and over the stone board for the current round, and the board state they show:
// the found stone/centre, the ê-ke and the corners it tested, the lifted block, the options
// chosen on the step card (mirrored on shapes/blocks) and the hint's visual aid.
import type { Scene } from 'three';
import type { GeoItem } from '../../geometry/geo-scene-types';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { StepCard } from '../../ui/kit/step-card';
import type { ValleyCamera } from './valley-camera';
import { ValleyFigureView } from './valley-figure-view';
import { ValleyLabels } from './valley-labels';
import { SPARE_AT } from './valley-layout-angles-shapes';
import type { ValleyTarget } from './valley-layout-types';
import type { ValleyRound } from './valley-round-flow';
import { ValleySetSquareView } from './valley-set-square-view';
import { ValleySolidsView } from './valley-solids-view';

export class ValleyBoardViews {
  readonly figure: ValleyFigureView;
  readonly solids: ValleySolidsView;
  readonly eke: ValleySetSquareView;
  readonly labels: ValleyLabels;
  private round: ValleyRound | undefined;
  picked: string | null = null;
  selected = new Set<string>();
  readonly tested = new Map<string, boolean>();
  aid = false;
  lifted: number | null = null;

  constructor(
    scene: Scene,
    ui: HTMLElement,
    readonly camera: ValleyCamera,
    reducedMotion: boolean,
    nameOf: (target: ValleyTarget) => string,
    onTap: (id: string) => void,
  ) {
    this.figure = new ValleyFigureView(scene);
    this.solids = new ValleySolidsView(scene, reducedMotion);
    this.eke = new ValleySetSquareView(scene);
    this.labels = new ValleyLabels(ui, nameOf, onTap);
  }

  setRound(round: ValleyRound): void {
    this.round = round;
    this.picked = null;
    this.selected = new Set();
    this.tested.clear();
    this.aid = false;
    this.lifted = null;
    const { layout } = round;
    this.solids.show(layout);
    this.eke.place(null);
    this.eke.showSpare(null);
    this.labels.setRound(layout.chips, layout.targets);
    // Flat figures are judged top-down (angles true on screen); blocks keep the 3/4 view.
    this.camera.setFlat(round.kind !== 'solids');
    this.camera.frame(layout.halfWidth, layout.halfDepth);
  }

  pick(id: string): void {
    this.picked = id;
  }

  layEke(target: ValleyTarget): void {
    this.eke.place(target);
    this.tested.set(target.id, target.fits === true);
  }

  toggleLift(index: number): void {
    this.lifted = this.lifted === index ? null : index;
  }

  showAid(): void {
    this.aid = true;
    this.refresh(true);
  }

  /** Mirrors the toggles of the card's current multi-select step on the board. */
  syncSelection(card: StepCard | null): void {
    const row = card?.element.querySelector('.kit-step:last-child');
    const pressed = row?.querySelectorAll('[data-choice][aria-pressed="true"]') ?? [];
    this.selected = new Set([...pressed].map((b) => (b as HTMLElement).dataset.choice as string));
    this.refresh(true);
  }

  /** A board tap on a shape/block: press the matching button of the card's current step. */
  chooseOption(card: StepCard | null, item: GeoItem, option: string): void {
    if (!card) return;
    const row = card.element.querySelector('.kit-step:last-child');
    const step = playableSteps(item)[card.currentStep()];
    if (!row || !step || (step.kind !== 'choice' && step.kind !== 'multi')) return;
    const index = step.options.findIndex((o) => o.id === option);
    const button =
      row.querySelector<HTMLButtonElement>(`[data-choice="${option}"]`) ??
      row.querySelectorAll<HTMLButtonElement>('.kit-choices button')[index];
    if (button && !button.disabled) button.click();
    this.syncSelection(card);
  }

  /** Re-draws the figure and the DOM marks from the board state. */
  refresh(active: boolean): void {
    const round = this.round;
    if (!round) return;
    const { layout } = round;
    this.figure.show(layout, { picked: this.picked, selected: this.selected, aid: this.aid });
    this.solids.update({ lifted: this.lifted, aid: this.aid, selected: this.selected });
    const spare = round.kind === 'right-angle' && this.aid;
    this.eke.showSpare(
      spare ? (round.item.scene.kind === 'angles' ? SPARE_AT.angles : SPARE_AT.board) : null,
    );
    this.labels.refresh({
      picked: this.picked,
      selected: this.selected,
      tested: this.tested,
      actionDone: this.picked !== null || layout.action === null,
      active,
    });
  }

  /** The garden is rebuilt: the board is swept clean for the celebration. */
  clear(): void {
    this.round = undefined;
    this.figure.hide();
    this.solids.clear();
    this.eke.place(null);
    this.eke.showSpare(null);
    this.labels.clear();
  }

  update(dt: number): void {
    this.camera.update(dt);
    this.solids.frame(dt);
    this.labels.place(this.camera.camera);
  }

  dispose(): void {
    this.figure.dispose();
    this.solids.dispose();
    this.eke.dispose();
    this.labels.destroy();
  }
}
