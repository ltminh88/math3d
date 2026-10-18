// Player movement: keyboard (WASD / arrows) plus joystick relative to the camera yaw, or walking
// to a tapped destination; axis-separated collision against the banks, river and obstacles;
// jump with gravity; leg swing. Speed 6.5 u/s, jump velocity 6.5, gravity 18.
import type { Object3D, Vector3 } from 'three';
import { BRIDGE_SEGMENTS, RIVER, WALKABLE_BOUNDS } from '../config/world-constants';
import type { ObstacleCircle } from './world-build-context';

const WALK_SPEED = 6.5;
const JUMP_VELOCITY = 6.5;
const GRAVITY = 18;
const PLAYER_RADIUS = 0.35;

export interface JoystickVector {
  x: number;
  y: number;
}

/** World fields the controller reads and writes (the world object itself satisfies this). */
export interface PlayerControlState {
  readonly player: Object3D;
  readonly legs: readonly Object3D[];
  readonly keys: ReadonlySet<string>;
  readonly joystick: JoystickVector;
  readonly obstacles: readonly ObstacleCircle[];
  readonly bridgeCount: number;
  /** Camera yaw (radians): keyboard/joystick input is relative to it. */
  readonly yaw: number;
  /** Seconds since start, drives the leg swing. */
  readonly time: number;
  destination: Vector3 | undefined;
  jumpVelocity: number;
}

/** Standing height: on the finished bridge deck 0.36, otherwise the ground. */
export function floorHeight(state: Pick<PlayerControlState, 'player' | 'bridgeCount'>): number {
  const { x, z } = state.player.position;
  if (state.bridgeCount === BRIDGE_SEGMENTS && x >= 4 && x <= 10 && Math.abs(z) < 1.4) {
    return 0.36;
  }
  return 0;
}

/** Starts a jump when standing; returns whether it did. */
export function tryJump(state: PlayerControlState): boolean {
  if (state.player.position.y > floorHeight(state) + 0.01) {
    return false;
  }
  state.jumpVelocity = JUMP_VELOCITY;
  return true;
}

/** Walkable test: inside the banks, the river only on the finished bridge (|z| < 1.25). */
export function canMoveTo(state: PlayerControlState, x: number, z: number): boolean {
  const bounds = WALKABLE_BOUNDS;
  const margin = bounds.margin;
  if (
    x < bounds.west.minX + margin ||
    x > bounds.east.maxX - margin ||
    z < bounds.minZ + margin ||
    z > bounds.maxZ - margin ||
    (x > RIVER.riverMin - 0.3 &&
      x < RIVER.riverMax + 0.3 &&
      (state.bridgeCount < BRIDGE_SEGMENTS || Math.abs(z) > 1.25))
  ) {
    return false;
  }
  return !state.obstacles.some(
    (o) =>
      Math.abs(x - o.x) < o.radius + PLAYER_RADIUS &&
      Math.hypot(x - o.x, z - o.z) < o.radius + PLAYER_RADIUS,
  );
}

function keyAxis(keys: ReadonlySet<string>, positive: string[], negative: string[]): number {
  return (
    (positive.some((key) => keys.has(key)) ? 1 : 0) -
    (negative.some((key) => keys.has(key)) ? 1 : 0)
  );
}

/** Advances the player by `dt` seconds. */
export function stepPlayer(state: PlayerControlState, dt: number): void {
  const player = state.player;
  const inputX = keyAxis(state.keys, ['d', 'arrowright'], ['a', 'arrowleft']) + state.joystick.x;
  const inputZ = keyAxis(state.keys, ['s', 'arrowdown'], ['w', 'arrowup']) + state.joystick.y;
  let dx = inputX * Math.cos(state.yaw) + inputZ * Math.sin(state.yaw);
  let dz = -inputX * Math.sin(state.yaw) + inputZ * Math.cos(state.yaw);
  if (inputX || inputZ) {
    state.destination = undefined;
  } else if (state.destination) {
    dx = state.destination.x - player.position.x;
    dz = state.destination.z - player.position.z;
    if (Math.hypot(dx, dz) < 0.2) {
      state.destination = undefined;
      dx = dz = 0;
    }
  }
  const length = Math.hypot(dx, dz);
  if (length > 0.05) {
    dx /= length;
    dz /= length;
    walk(state, dx, dz, WALK_SPEED * dt);
  } else {
    for (const leg of state.legs) leg.rotation.x *= 0.8;
  }
  applyGravity(state, dt);
}

function walk(state: PlayerControlState, dx: number, dz: number, step: number): void {
  const player = state.player;
  const nextX = player.position.x + dx * step;
  const nextZ = player.position.z + dz * step;
  let moved = false;
  if (canMoveTo(state, nextX, player.position.z)) {
    player.position.x = nextX;
    moved = true;
  }
  if (canMoveTo(state, player.position.x, nextZ)) {
    player.position.z = nextZ;
    moved = true;
  }
  if (!moved) {
    state.destination = undefined;
  }
  player.rotation.y = Math.atan2(dx, dz);
  state.legs.forEach((leg, index) => {
    leg.rotation.x = Math.sin(state.time * 12 + index * Math.PI) * 0.55;
  });
}

function applyGravity(state: PlayerControlState, dt: number): void {
  const player = state.player;
  const floor = floorHeight(state);
  if (player.position.y > floor || state.jumpVelocity > 0) {
    state.jumpVelocity -= GRAVITY * dt;
    player.position.y = Math.max(floor, player.position.y + state.jumpVelocity * dt);
    if (player.position.y === floor) {
      state.jumpVelocity = 0;
    }
  } else {
    player.position.y = floor;
  }
}
