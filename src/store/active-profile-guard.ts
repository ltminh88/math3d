// Several tabs share one database. A reset, save-code import or legacy import in one tab makes a
// new profile active; every write from another tab first checks, inside its own transaction,
// that the profile it holds is still the active one, so it never writes an orphaned profile.
import type { WriteTx } from './progress-repository';
import { META_ACTIVE_PROFILE } from './save-schema';

export class ProfileSwitchedError extends Error {
  constructor(readonly activeProfileId: string) {
    super('Another tab switched the active profile');
    this.name = 'ProfileSwitchedError';
  }
}

/** Throws ProfileSwitchedError (aborting the caller's transaction) when `profileId` is stale. */
export async function assertActiveProfile(tx: WriteTx, profileId: string): Promise<void> {
  const active = (await tx.objectStore('meta').get(META_ACTIVE_PROFILE))?.value;
  if (typeof active === 'string' && active !== profileId) throw new ProfileSwitchedError(active);
}
