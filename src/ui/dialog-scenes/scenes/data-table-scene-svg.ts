// Data table picture (phase 17): the grid itself — translated headers (i:/l: refs
// resolved through renderDataPrompt), row labels, and '?' in the hidden cell.

import type { DataTableScene } from '../../../data/data-scene-types';
import { renderDataPrompt } from '../../../data/data-strings';
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

/** The label text of a table header ref ('i:dog' -> 'con chó', 'l:group_1' -> 'Tổ 1'). */
export function headerText(hRef: string): string {
  return hRef.startsWith('i:')
    ? renderDataPrompt({ key: `item_${hRef.slice(2)}` })
    : renderDataPrompt({ key: hRef.slice(2) });
}

const COL_W = 84;
const ROW_H = 40;
const LABEL_W = 80;

function renderTable(scene: DataTableScene): SVGElement {
  const cols = scene.headers.length;
  const hasLabels = scene.rowLabels !== undefined;
  const labelW = hasLabels ? LABEL_W : 0;
  const width = labelW + cols * COL_W;
  const height = (scene.rows.length + 1) * ROW_H;
  const svg = sceneRoot(width, height, 'Bảng số liệu');
  scene.headers.forEach((h, c) => {
    const x = labelW + c * COL_W;
    svg.append(
      svgEl('rect', { x, y: 0, width: COL_W - 2, height: ROW_H - 2, class: 'ds-table-head' }),
      dsLabel(x + COL_W / 2, ROW_H / 2, headerText(h)),
    );
  });
  scene.rows.forEach((row, r) => {
    const y = (r + 1) * ROW_H;
    if (hasLabels) {
      const label = (scene.rowLabels as readonly string[])[r] as string;
      svg.append(
        svgEl('rect', { x: 0, y, width: LABEL_W - 2, height: ROW_H - 2, class: 'ds-table-head' }),
        dsLabel(LABEL_W / 2, y + ROW_H / 2, renderDataPrompt({ key: label.slice(2) })),
      );
    }
    row.forEach((cell, c) => {
      const x = labelW + c * COL_W;
      svg.append(
        svgEl('rect', { x, y, width: COL_W - 2, height: ROW_H - 2, class: 'ds-table-cell' }),
        dsLabel(x + COL_W / 2, y + ROW_H / 2, cell === null ? '?' : String(cell)),
      );
    });
  });
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['data-table'],
  render(scene) {
    return renderTable(scene as DataTableScene);
  },
};
