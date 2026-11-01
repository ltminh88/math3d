// The ê-ke (set square) check, pure: a corner is a right angle when its two arms meet at 90°
// (±1° of drawing error), whichever way the figure is turned. The check is logical (vectors),
// never read from the perspective picture, so a turned right angle always fits.
export type Vec2 = readonly [x: number, y: number];

/** Tolerance of the ê-ke in degrees. */
export const SET_SQUARE_TOLERANCE_DEG = 1;

/** `p` turned by `degrees` (counter-clockwise, y up) around `centre`. */
export function turnPoint(p: Vec2, centre: Vec2, degrees: number): [number, number] {
  const r = (degrees * Math.PI) / 180;
  const [dx, dy] = [p[0] - centre[0], p[1] - centre[1]];
  return [
    centre[0] + dx * Math.cos(r) - dy * Math.sin(r),
    centre[1] + dx * Math.sin(r) + dy * Math.cos(r),
  ];
}

/** Angle in degrees (0-180) at `at` between the arms towards `a` and `b`. */
export function cornerAngleDeg(a: Vec2, at: Vec2, b: Vec2): number {
  const [ux, uy] = [a[0] - at[0], a[1] - at[1]];
  const [vx, vy] = [b[0] - at[0], b[1] - at[1]];
  const cos = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

export const fitsSetSquare = (degrees: number): boolean =>
  Math.abs(degrees - 90) <= SET_SQUARE_TOLERANCE_DEG;

/**
 * How to lay the ê-ke on a corner: its right-angle corner on `at`, one leg along the arm to `a`
 * (direction in radians, y up) and the other leg turned towards `b` (+1 counter-clockwise).
 */
export function setSquarePose(a: Vec2, at: Vec2, b: Vec2): { armAngle: number; turn: 1 | -1 } {
  const [ux, uy] = [a[0] - at[0], a[1] - at[1]];
  const [vx, vy] = [b[0] - at[0], b[1] - at[1]];
  return { armAngle: Math.atan2(uy, ux), turn: ux * vy - uy * vx >= 0 ? 1 : -1 };
}
