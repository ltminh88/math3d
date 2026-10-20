import type { SessionDelta } from '../learning/learning-types';
import { assertActiveProfile } from './active-profile-guard';
import { appendOutbox, applyDelta, type WriteTx } from './progress-repository';

export type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: 'insufficient-coins' | 'already-owned' };

/** The outbox delta of a purchase (validated arguments; the batch id is drawn last). */
export function purchaseDelta(
  profileId: string,
  cosmeticId: string,
  price: number,
  at: number,
  newId: () => string,
): SessionDelta {
  if (cosmeticId === '') throw new Error('purchaseCosmetic: empty cosmetic id');
  if (!Number.isInteger(price) || price <= 0)
    throw new Error('purchaseCosmetic: price must be a positive integer');
  const base = { profileId, clientTs: at, v: 1 as const, facts: {}, levels: {}, xp: 0 };
  return { batchId: newId(), ...base, coins: -price, cosmetics: [cosmeticId] };
}

/** Debit + ownership + outbox record inside the caller's transaction, or a refusal that writes nothing. */
export async function purchaseInTransaction(
  tx: WriteTx,
  delta: SessionDelta,
  price: number,
  now: number,
  sessionNo: number,
): Promise<PurchaseResult> {
  await assertActiveProfile(tx, delta.profileId);
  const cosmeticId = delta.cosmetics?.[0] ?? '';
  if (await tx.objectStore('ownedCosmetics').get([delta.profileId, cosmeticId]))
    return { ok: false, reason: 'already-owned' };
  const wallet = await tx.objectStore('wallet').get(delta.profileId);
  if ((wallet?.coins ?? 0) < price) return { ok: false, reason: 'insufficient-coins' };
  await applyDelta(tx, delta, { now, sessionNo });
  await appendOutbox(tx, delta, now);
  return { ok: true };
}
