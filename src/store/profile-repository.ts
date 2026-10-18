import type { GameDb } from './idb-database';
import { META_ACTIVE_PROFILE, newProfile, type Profile } from './save-schema';

/** Returns the active profile, creating a guest (uuid, no PII) with an empty wallet on first launch. */
export async function loadOrCreateActiveProfile(db: GameDb, newId: () => string): Promise<Profile> {
  const tx = db.transaction(['profiles', 'wallet', 'meta'], 'readwrite');
  const active = await tx.objectStore('meta').get(META_ACTIVE_PROFILE);
  const existing =
    typeof active?.value === 'string'
      ? await tx.objectStore('profiles').get(active.value)
      : undefined;
  if (existing) {
    await tx.done;
    return existing;
  }
  const profile = newProfile(newId(), 'guest');
  await tx.objectStore('profiles').put(profile);
  await tx.objectStore('wallet').put({ profileId: profile.id, coins: 0, xp: 0 });
  await tx.objectStore('meta').put({ key: META_ACTIVE_PROFILE, value: profile.id });
  await tx.done;
  return profile;
}

export async function saveProfile(db: GameDb, profile: Profile): Promise<void> {
  await db.put('profiles', profile);
}
