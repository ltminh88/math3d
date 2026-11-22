// Month-calendar picture (phase 17): one month page — 7-col grid, short weekday
// header, title from the existing `monthStory` key.
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import { daysInMonth } from '../../../time/calendar-math';
import type { MonthCalendarScene } from '../../../time/time-scene-types';
import { renderTimePrompt } from '../../../time/time-strings';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

function renderCalendar(scene: MonthCalendarScene): SVGElement {
  const days = daysInMonth(scene.year, scene.month);
  const cols = 7;
  const cellW = 46;
  const cellH = 38;
  const rows = Math.ceil((scene.firstWeekday + days) / cols);
  const width = cols * cellW + 8;
  const height = 44 + 30 + rows * cellH + 8;
  const svg = sceneRoot(width, height, `Lịch tháng ${scene.month}`);
  svg.append(
    dsLabel(
      width / 2,
      24,
      renderTimePrompt({ key: 'monthStory', params: { m: scene.month, y: scene.year } }),
    ),
  );
  for (let w = 0; w < cols; w++) {
    const x = 4 + w * cellW + cellW / 2;
    svg.append(dsLabel(x, 58, renderTimePrompt({ key: `wds_${w}` })));
  }
  for (let d = 1; d <= days; d++) {
    const slot = scene.firstWeekday + d - 1;
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const x = 4 + col * cellW;
    const y = 74 + row * cellH;
    svg.append(
      svgEl('rect', { x, y, width: cellW - 3, height: cellH - 3, class: 'ds-cal-cell' }),
      dsLabel(x + cellW / 2, y + cellH / 2, String(d)),
    );
  }
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['month-calendar'],
  render(scene) {
    return renderCalendar(scene as MonthCalendarScene);
  },
};
