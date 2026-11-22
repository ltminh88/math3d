// M3D6 save-code payload (written by export since phase 23): exactly the M3D5 fields —
// the only change is `e`, which now carries the multi-equip model ({vlm, avatar,
// decor}) instead of the old slot -> id map. Decoding is shared with M3D5:
// decodeCosmetics (save-code-v2-payload.ts) accepts both `e` shapes, so an M3D5 code
// imports with the same items worn and an M3D6 code round-trips. A new file exists so
// the codec can dispatch on the version and the export name says what it writes.
import type { GameSnapshot } from './progress-repository';
import type { SaveCodeAudio } from './save-code-v2-payload';
import { compactV5ToImport, snapshotToCompactV5 } from './save-code-v5-payload';

/** M3D6 writes the same fields as M3D5; only `e` changed shape. */
export const snapshotToCompactV6 = (snapshot: GameSnapshot, audio: SaveCodeAudio) =>
  snapshotToCompactV5(snapshot, audio);

/** Compact payload -> import, or null for anything malformed (same rules as M3D5). */
export const compactV6ToImport = compactV5ToImport;
