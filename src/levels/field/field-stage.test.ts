// Phase 25b (issue #46): the field stage scales its fitted distance by the zoom
// factor, clamps it to 0.6×–1.6×, and keeps the free-area view offset untouched.
import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { createFieldStage, type FieldViewport, plotBox } from './field-stage';

const VIEW: FieldViewport = { width: 800, height: 600, top: 0, bottom: 0, right: 0 };

const fitted = () => {
  const stage = createFieldStage(false);
  const box = plotBox(3, 3);
  stage.fit(VIEW, box, true);
  return { stage, center: box.getCenter(new Vector3()) };
};

const distance = (stage: ReturnType<typeof createFieldStage>, center: Vector3): number => {
  const p = stage.camera.position;
  return Math.hypot(p.x - center.x, p.y - center.y, p.z - center.z);
};

describe('FieldStage zoom (phase 25b)', () => {
  it('scales the fitted distance by the zoom factor', () => {
    const { stage, center } = fitted();
    const base = distance(stage, center);
    stage.setZoomFactor(0.8);
    expect(distance(stage, center)).toBeCloseTo(base * 0.8, 6);
    stage.setZoomFactor(1.25);
    expect(distance(stage, center)).toBeCloseTo(base * 1.25, 6);
  });

  it('clamps the factor to 0.6×–1.6×', () => {
    const { stage, center } = fitted();
    const base = distance(stage, center);
    stage.setZoomFactor(0.5);
    expect(stage.zoomFactor).toBe(0.6);
    expect(distance(stage, center)).toBeCloseTo(base * 0.6, 6);
    stage.setZoomFactor(2);
    expect(stage.zoomFactor).toBe(1.6);
    expect(distance(stage, center)).toBeCloseTo(base * 1.6, 6);
  });

  it('keeps the free-area view offset when zooming', () => {
    const { stage } = fitted();
    const before = { ...stage.camera.view };
    stage.setZoomFactor(0.7);
    const after = stage.camera.view;
    expect(after?.enabled).toBe(true);
    expect(after?.offsetX).toBe(before?.offsetX);
    expect(after?.offsetY).toBe(before?.offsetY);
    expect(after?.fullWidth).toBe(before?.fullWidth);
    expect(after?.fullHeight).toBe(before?.fullHeight);
  });

  it('resetZoom returns to the unfitted distance', () => {
    const { stage, center } = fitted();
    const base = distance(stage, center);
    stage.setZoomFactor(1.4);
    stage.resetZoom();
    expect(stage.zoomFactor).toBe(1);
    expect(distance(stage, center)).toBeCloseTo(base, 6);
  });

  it('keeps the zoom across a later reframe (resize)', () => {
    const { stage, center } = fitted();
    stage.setZoomFactor(0.7);
    const box = plotBox(3, 3);
    stage.fit({ ...VIEW, width: 700 }, box, true);
    const base = distance(stage, center);
    stage.resetZoom();
    expect(distance(stage, center)).toBeCloseTo(base / 0.7, 6);
  });
});
