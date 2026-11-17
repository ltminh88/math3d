// Hint rungs on the plot (spec old-06): 1 encourage, 2 row highlight, 3 skip count per row (the
// last row left as "?"), 4 the swapped fact: the plot turns so cols x rows shows the same plants.
import type { HintRung } from '../../learning/hint-ladder';
import type { FieldHud } from './field-hud';
import type { PinnedLabel, ProjectedLabels } from './field-projected-labels';
import type { FieldRound } from './field-round-flow';
import { tf } from './field-strings';
import type { PlantingGrid } from './planting-grid';
import { type GridView, rowId } from './planting-grid-view';

export interface HintPlan {
  readonly text: string;
  readonly highlightRows: boolean;
  readonly skipLabels: readonly PinnedLabel[];
  /** Turn the plot (rung 4, non-square plots only). */
  readonly rotate: boolean;
}

/** Skip-count numbers per row: cols, 2*cols, ...; the last row is left for the child. */
export function skipCountSteps(grid: PlantingGrid): string[] {
  return Array.from({ length: grid.rows }, (_, r) =>
    r === grid.rows - 1 ? '?' : String((r + 1) * grid.cols),
  );
}

export function hintPlan(rung: HintRung, grid: PlantingGrid, view: GridView): HintPlan {
  const { rows, cols } = grid;
  if (rung <= 1) {
    return { text: tf('hint1'), highlightRows: false, skipLabels: [], rotate: false };
  }
  if (rung === 2) {
    return {
      text: tf('hint2', { rows, cols }),
      highlightRows: true,
      skipLabels: [],
      rotate: false,
    };
  }
  if (rung === 3) {
    const steps = skipCountSteps(grid);
    const skipLabels = steps.flatMap((text, r) => {
      const at = view.worldOf(rowId(r));
      return at
        ? [{ text, at: at.setY(1.1).setX(at.x - 0.75), className: 'field-label--skip' }]
        : [];
    });
    const shown = steps.slice(0, -1).join(', ');
    return {
      text: tf('hint3', { cols, steps: shown }),
      highlightRows: true,
      skipLabels,
      rotate: false,
    };
  }
  return {
    text: tf(rows === cols ? 'hint4Square' : 'hint4', { rows, cols }),
    highlightRows: true,
    skipLabels: [],
    rotate: rows !== cols,
  };
}

/** Shows a hint's text and plot effects (the caller turns the plot when `plan.rotate`). */
export function applyHintPlan(
  plan: HintPlan,
  parts: { hud: FieldHud; view: GridView; labels: ProjectedLabels; announce(text: string): void },
): void {
  parts.hud.setHint(plan.text);
  parts.announce(plan.text);
  parts.view.setRowHighlight(plan.highlightRows);
  if (plan.skipLabels.length > 0) parts.labels.set(plan.skipLabels);
}

/**
 * Hint rungs for a missing-factor round. No rung ever states the hidden factor: rung 2 names
 * only the known factor and the total, rung 3 tells the child what to count (plants in one
 * row, or rows), rung 4 turns the plot (never on a square) and asks for a recount. The
 * answer itself is only ever shown by the round's reveal after three misses.
 */
export function missingHintPlan(rung: HintRung, round: FieldRound): HintPlan {
  const { rows, cols, total, missingFactor } = round;
  if (rung <= 1) {
    return { text: tf('hint1'), highlightRows: false, skipLabels: [], rotate: false };
  }
  const hidesRows = missingFactor === rows;
  if (rung === 2) {
    return {
      text: hidesRows
        ? tf('missingHint2Cols', { cols, total })
        : tf('missingHint2Rows', { rows, total }),
      highlightRows: true,
      skipLabels: [],
      rotate: false,
    };
  }
  if (rung === 3) {
    return {
      text: tf(hidesRows ? 'missingHint3Rows' : 'missingHint3Cols'),
      highlightRows: true,
      skipLabels: [],
      rotate: false,
    };
  }
  return {
    text: tf('missingHint4'),
    highlightRows: true,
    skipLabels: [],
    rotate: rows !== cols,
  };
}
