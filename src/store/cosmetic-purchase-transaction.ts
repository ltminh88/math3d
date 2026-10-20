import type { SessionDelta } from '../learning/learning-types';
import { appendOutbox, applyDelta, type WriteTx } from './progress-repository';

export type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: 'insufficient-coins' | 'already-owned' };

/** Debit + ownership + outbox record inside the caller's transaction, or a refusal that writes nothing. */
export async function purchaseInTransaction(
  tx: WriteTx,
  delta: SessionDelta,
  price: number,
  now: number,
  sessionNo: number,
): Promise<PurchaseResult> {
  const cosmeticId = delta.cosmetics?.[0] ?? '';
  if (await tx.objectStore('ownedCosmetics').get([delta.profileId, cosmeticId]))
    return { ok: false, reason: 'already-owned' };
  const wallet = await tx.objectStore('wallet').get(delta.profileId);
  if ((wallet?.coins ?? 0) < price) return { ok: false, reason: 'insufficient-coins' };
  await applyDelta(tx, delta, { now, sessionNo });
  await appendOutbox(tx, delta, now);
  return { ok: true };
}
