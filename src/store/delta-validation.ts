import { isFactKey } from '../learning/fact-key';
import type { SessionDelta } from '../learning/learning-types';

const MAX_FACTS = 300;
const MAX_LEVEL_PROGRESS = 1000;

export class InvalidDeltaError extends Error {
  constructor(reason: string) {
    super(`Invalid session delta: ${reason}`);
    this.name = 'InvalidDeltaError';
  }
}

const isNonNegInt = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0;

/** Guards the store boundary: a malformed delta must never reach IndexedDB or the outbox. */
export function validateDelta(delta: SessionDelta, activeProfileId: string): void {
  const fail = (reason: string): never => {
    throw new InvalidDeltaError(reason);
  };
  if (delta.v !== 1) fail(`unsupported version ${String(delta.v)}`);
  if (typeof delta.batchId !== 'string' || delta.batchId === '') fail('missing batchId');
  if (delta.profileId !== activeProfileId) fail('profile does not match the active profile');
  if (!Number.isFinite(delta.clientTs)) fail('clientTs');
  if (!isNonNegInt(delta.xp)) fail('xp');
  if (!Number.isInteger(delta.coins)) fail('coins');
  const entries = Object.entries(delta.facts);
  if (entries.length > MAX_FACTS) fail('too many facts');
  for (const [key, f] of entries) {
    if (!isFactKey(key)) fail(`fact key "${key}"`);
    if (!isNonNegInt(f.a) || !isNonNegInt(f.c) || !isNonNegInt(f.ms) || f.c > f.a)
      fail(`counters for ${key}`);
    if (!Number.isInteger(f.box) || f.box < 1 || f.box > 5) fail(`box for ${key}`);
    if (!Number.isFinite(f.seenAt)) fail(`seenAt for ${key}`);
  }
  for (const [id, l] of Object.entries(delta.levels)) {
    if (
      id === '' ||
      !Number.isInteger(l.stars) ||
      l.stars < 0 ||
      l.stars > 3 ||
      !isNonNegInt(l.bestScore) ||
      (l.progress !== undefined && (!isNonNegInt(l.progress) || l.progress > MAX_LEVEL_PROGRESS))
    ) {
      fail(`level ${id}`);
    }
  }
  if (
    delta.cosmetics !== undefined &&
    !delta.cosmetics.every((c) => typeof c === 'string' && c !== '')
  ) {
    fail('cosmetics');
  }
}
