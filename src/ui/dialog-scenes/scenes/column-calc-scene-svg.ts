// Column-calc scene renderer (boost, Phase 2A): the column layout — operands
// right-aligned by place, the op sign, the rule, the result row. The result row
// shows '?' for columns not yet filled, the confirmed digits once the child
// answers them, or the buggy row for find-error. The focus column is a gold
// rect behind the whole column. Carry marks ('1' above the next column) draw
// only for entries in `carries` — the scene never pre-draws them. No tappable
// SVG elements: answers come from the number pad / verdict buttons, which are
// >= 44px kit controls.

import type { ColumnCalcScene } from '../../../arithmetic/column-calc-scene-types';
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

const WIDTH = 420;
const HEIGHT = 190;
const PITCH = 64;
const CARRY_Y = 30;
const TOP_Y = 66;
const BOTTOM_Y = 110;
const RULE_Y = 130;
const RESULT_Y = 168;

const digitAt = (value: number, col: number): number => Math.floor(value / 10 ** col) % 10;
const digitCount = (value: number): number => String(value).length;

function fromDigits(digits: readonly number[]): number {
  return digits.reduce((total, d, i) => total + d * 10 ** i, 0);
}

function renderColumnCalc(scene: ColumnCalcScene): SVGElement {
  const result = scene.op === '+' ? scene.top + scene.bottom : scene.top - scene.bottom;
  const n = Math.max(
    digitCount(scene.top),
    digitCount(scene.bottom),
    digitCount(result),
    scene.buggy === undefined ? 0 : digitCount(fromDigits(scene.buggy)),
  );
  // The pitch shrinks so the block always fits the 420-wide viewBox: a
  // six-digit result (find-error T3, up to 100 000) at PITCH 64 would be
  // 6×64+56 = 440 wide and overflow (R119.5). Five columns and fewer keep 64.
  const pitch = Math.min(PITCH, Math.floor((WIDTH - 56) / n));
  const blockW = n * pitch + 56;
  const x0 = (WIDTH - blockW) / 2;
  const opX = x0 + 20;
  const colCenter = (col: number): number => x0 + 56 + (n - 1 - col) * pitch + pitch / 2;
  const svg = sceneRoot(WIDTH, HEIGHT, `Đặt tính: ${scene.top} ${scene.op} ${scene.bottom}`);

  // Focus column: a gold rect behind the whole column.
  svg.append(
    svgEl('rect', {
      x: colCenter(scene.focusCol) - pitch / 2 + 4,
      y: 14,
      width: pitch - 8,
      height: 168,
      rx: 8,
      class: 'ds-shape ds-highlight',
    }),
  );

  // Carry marks: a small "1" above the NEXT column for each confirmed carry.
  for (let col = 0; col < scene.carries.length; col++) {
    if (scene.carries[col] !== 1 || col + 1 >= n) continue;
    svg.append(dsLabel(colCenter(col + 1), CARRY_Y, '1'));
  }

  // Operands, left-to-right in DOM order (most significant first).
  for (let col = n - 1; col >= 0; col--) {
    if (col < digitCount(scene.top)) {
      svg.append(dsLabel(colCenter(col), TOP_Y, String(digitAt(scene.top, col))));
    }
    if (col < digitCount(scene.bottom)) {
      svg.append(dsLabel(colCenter(col), BOTTOM_Y, String(digitAt(scene.bottom, col))));
    }
  }
  svg.append(dsLabel(opX, BOTTOM_Y, scene.op));

  svg.append(
    svgEl('line', {
      x1: x0 + 8,
      y1: RULE_Y,
      x2: x0 + blockW - 8,
      y2: RULE_Y,
      class: 'ds-line',
    }),
  );

  // Result row: the buggy digits for find-error, the confirmed digits, or '?'.
  for (let col = n - 1; col >= 0; col--) {
    const text =
      scene.buggy !== undefined
        ? col < scene.buggy.length
          ? String(scene.buggy[col])
          : ''
        : scene.filled[col] !== undefined
          ? String(scene.filled[col])
          : '?';
    if (text !== '') svg.append(dsLabel(colCenter(col), RESULT_Y, text));
  }
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['column-calc'],
  render(scene) {
    return renderColumnCalc(scene as ColumnCalcScene);
  },
};
