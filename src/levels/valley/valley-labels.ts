// DOM over the board, projected from 3D points every frame: letter/size chips (aria-hidden, crisp,
// no draw calls) and the tap targets, real <button>s of at least 48 px over each point, corner,
// shape or block. Buttons give touch, mouse and keyboard (arrows + Enter) the same path, so no
// step needs a drag or a precise tap on a small 3D point (WCAG 2.5.7, 2.5.8).
import { type Camera, Matrix4, Vector3 } from 'three';
import type { ValleyChip, ValleyTarget } from './valley-layout-types';

const projected = new Vector3();

export interface TargetLook {
  /** The found target (gold ring). */
  picked: string | null;
  /** Card options chosen (shapes, blocks). */
  selected: ReadonlySet<string>;
  /** Tested corners: true ✓ (ê-ke fits), false ✗. */
  tested: ReadonlyMap<string, boolean>;
  actionDone: boolean;
  /** Targets take taps (false once the round is over). */
  active: boolean;
}

interface Placed {
  el: HTMLElement;
  x: number;
  y: number;
  z: number;
}

export class ValleyLabels {
  readonly root = document.createElement('div');
  private readonly chipLayer = document.createElement('div');
  private readonly targetLayer = document.createElement('div');
  private placed: Placed[] = [];
  private chips: { chip: ValleyChip; el: HTMLElement }[] = [];
  private targets: { target: ValleyTarget; el: HTMLButtonElement }[] = [];
  private width = 1;
  private height = 1;
  /** The view the DOM was last placed for: a still camera writes nothing. */
  private readonly lastWorld = new Matrix4();
  private readonly lastProjection = new Matrix4();
  private stale = true;

  constructor(
    parent: HTMLElement,
    private readonly nameOf: (target: ValleyTarget) => string,
    private readonly onTap: (id: string) => void,
  ) {
    this.root.className = 'valley-board-dom';
    this.chipLayer.className = 'valley-chips';
    this.chipLayer.setAttribute('aria-hidden', 'true');
    this.targetLayer.className = 'valley-targets';
    this.root.append(this.chipLayer, this.targetLayer);
    parent.prepend(this.root);
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.stale = true;
  }

  setRound(chips: readonly ValleyChip[], targets: readonly ValleyTarget[]): void {
    this.chips = chips.map((chip) => {
      const el = document.createElement('span');
      el.className = `valley-chip valley-chip--${chip.kind}`;
      el.textContent = chip.text;
      return { chip, el };
    });
    this.targets = targets.map((target) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `valley-target valley-target--${target.kind}`;
      el.dataset.target = target.id;
      el.setAttribute('aria-label', this.nameOf(target));
      el.addEventListener('click', () => this.onTap(target.id));
      return { target, el };
    });
    this.stale = true;
    this.chipLayer.replaceChildren(...this.chips.map((c) => c.el));
    this.targetLayer.replaceChildren(...this.targets.map((t) => t.el));
    this.placed = [
      ...this.chips.map(({ chip, el }) => ({
        el,
        x: chip.at[0],
        y: 0.35 + (chip.y ?? 0),
        z: chip.at[1],
      })),
      ...this.targets.map(({ target, el }) => ({ el, x: target.at[0], y: 0.2, z: target.at[1] })),
    ];
  }

  /** Classes and marks from the board state (focus survives: buttons are kept). */
  refresh(look: TargetLook): void {
    for (const { chip, el } of this.chips) el.hidden = !!chip.afterAction && !look.actionDone;
    for (const { target, el } of this.targets) {
      const tested = look.tested.get(target.id);
      el.classList.toggle('is-picked', look.picked === target.id);
      el.classList.toggle('is-selected', !!target.option && look.selected.has(target.option));
      el.classList.toggle('is-fit', tested === true);
      el.classList.toggle('is-miss', tested === false);
      el.textContent = tested === undefined ? '' : tested ? '✓' : '✗';
      el.disabled = !look.active;
      if (target.option) el.setAttribute('aria-pressed', String(look.selected.has(target.option)));
    }
  }

  /** The target buttons in board order (keyboard arrows walk them). */
  buttons(): HTMLButtonElement[] {
    return this.targets.map((t) => t.el);
  }

  /** Positions chips and targets for `camera` (after the camera or the canvas changed). */
  place(camera: Camera): void {
    camera.updateMatrixWorld();
    const still =
      this.lastWorld.equals(camera.matrixWorld) &&
      this.lastProjection.equals(camera.projectionMatrix);
    if (still && !this.stale) return;
    this.lastWorld.copy(camera.matrixWorld);
    this.lastProjection.copy(camera.projectionMatrix);
    this.stale = false;
    for (const p of this.placed) {
      projected.set(p.x, p.y, p.z).project(camera);
      const x = ((projected.x + 1) / 2) * this.width;
      const y = ((1 - projected.y) / 2) * this.height;
      p.el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }
  }

  clear(): void {
    this.chipLayer.replaceChildren();
    this.targetLayer.replaceChildren();
    this.chips = [];
    this.targets = [];
    this.placed = [];
  }

  destroy(): void {
    this.root.remove();
  }
}
