import { describe, expect, it } from 'vitest';
import { areaAtMapPoint } from './map-area-hit-test';
import type { MapDrawState } from './map-draw-state';
import { drawMap } from './map-render';
import { computeWorldMapView, regionAtMapPoint } from './map-view-transform';
import { type CanvasCall, createRecordingContext } from './record-canvas-calls-for-tests';

const state: MapDrawState = {
  player: { x: -8, z: 3, facing: 1.2 },
  milo: { x: -10, z: -2 },
  translate: (text) => text,
  time: 1,
  bridge: 6,
  questComplete: true,
  labels: true,
  selected: 'cave',
};

function trace(withExpansion: boolean): CanvasCall[] {
  const calls: CanvasCall[] = [];
  const view = computeWorldMapView(1280, 720);
  const expansion = withExpansion ? { name: (r: { name: string }) => `N:${r.name}` } : undefined;
  drawMap(createRecordingContext(calls), 1280, 720, view, { ...state, expansion });
  return calls;
}

/** Calls between each `save` and its matching `restore` that the expansion pass adds. */
function withoutExpansionBlocks(calls: CanvasCall[], base: CanvasCall[]): CanvasCall[] {
  const out: CanvasCall[] = [];
  let i = 0;
  for (const call of calls) {
    if (i < base.length && JSON.stringify(call) === JSON.stringify(base[i])) {
      out.push(call);
      i++;
    }
  }
  return out;
}

describe('map expansion layer', () => {
  it('only adds calls: the original draw stays a call-for-call subsequence', () => {
    const base = trace(false);
    const full = trace(true);
    expect(full.length).toBeGreaterThan(base.length);
    expect(withoutExpansionBlocks(full, base)).toEqual(base);
  });

  it('draws the 3 roads, footprints, icons and translated name pills, balanced save/restore', () => {
    const full = trace(true);
    const texts = full.filter((c) => c[0] === 'fillText').map((c) => c[1]);
    expect(texts).toEqual(expect.arrayContaining(['📐', '📏', '🧩', 'N:Hang Đố Vui']));
    const saves = full.filter((c) => c[0] === 'save').length;
    expect(full.filter((c) => c[0] === 'restore').length).toBe(saves);
    // The selected cave gets the gold selection stroke.
    expect(full).toContainEqual(['set', 'strokeStyle', '#f3b53d']);
  });

  it('hit test: expansion footprints first, the original answer elsewhere', () => {
    expect(areaAtMapPoint(40, -37)?.id).toBe('valley');
    expect(areaAtMapPoint(45, 38)?.id).toBe('workshop');
    expect(areaAtMapPoint(-32, 32)?.id).toBe('cave');
    for (const [x, z] of [
      [17, -2],
      [-13, 0],
      [57, -22],
      [40, 30],
    ] as const) {
      expect(areaAtMapPoint(x, z)?.id).toBe(regionAtMapPoint(x, z)?.id);
    }
  });
});
