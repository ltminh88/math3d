import { BoxGeometry, Mesh, PerspectiveCamera } from 'three';
import { describe, expect, it } from 'vitest';
import { projectToGround, RaycastPicker } from './raycast-picker';

function topDownCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 10, 0);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  return camera;
}

describe('RaycastPicker', () => {
  it('picks the registered object under the pointer and ignores empty space', () => {
    const camera = topDownCamera();
    const box = new Mesh(new BoxGeometry(2, 2, 2));
    box.updateMatrixWorld(true);
    const picker = new RaycastPicker();
    picker.set([{ id: 'stone-1', object: box }]);
    expect(picker.pick({ x: 0, y: 0 }, camera)).toBe('stone-1');
    expect(picker.pick({ x: 0.9, y: 0.9 }, camera)).toBeNull();
  });

  it('picks even when the proxy is invisible', () => {
    const camera = topDownCamera();
    const box = new Mesh(new BoxGeometry(2, 2, 2));
    box.visible = false;
    box.updateMatrixWorld(true);
    const picker = new RaycastPicker();
    picker.set([{ id: 'proxy', object: box }]);
    expect(picker.pick({ x: 0, y: 0 }, camera)).toBe('proxy');
  });
});

describe('projectToGround', () => {
  it('maps the screen center to the point below a top-down camera', () => {
    const point = projectToGround({ x: 0, y: 0 }, topDownCamera());
    expect(point?.x).toBeCloseTo(0);
    expect(point?.z).toBeCloseTo(0);
  });

  it('returns null when the ray never reaches the plane', () => {
    const camera = new PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 20, 0.001);
    camera.updateMatrixWorld(true);
    expect(projectToGround({ x: 0, y: 0 }, camera)).toBeNull();
  });
});
