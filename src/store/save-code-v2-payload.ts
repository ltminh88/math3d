// M3D2 save-code payload: the whole store snapshot a child's progress consists of, as compact
// JSON with short keys and defaults omitted:
//   x xp · c coins · a avatar id · g [table, combo, started] · s [sound, music]
//   n committed sessions · l {levelId: [stars, bestScore, completedSec, progress, acceptedSec]}
//   o owned cosmetic ids · e equipped (M3D6 shape {vlm, avatar, decor}; M3D2–M3D5 codes carry
//   the old {slot: id} map, which decodes to the same model — phase 23) · f fact tuples
//   (save-code-v2-facts.ts)
// Decoding is strict (unknown key, wrong type or out-of-range value -> null): a code is pasted
// text, so nothing in it reaches the store unchecked. M3D3 (save-code-v3-payload.ts) reuses the
// same fields with its own level set and adds skills; M3D2 itself never changes.
import { isSkillKey } from '../learning/fact-key';
import { PLACEMENT_BY_ID } from '../shop/cosmetic-anchors';
import { migrateEquippedV1 } from '../shop/equipped-cosmetics';
import { BRIDGE_LEVEL_ID } from './legacy-save-import';
import type { ProgressRecords } from './profile-replacement';
import type { GameSnapshot } from './progress-repository';
import {
  factToTuple,
  isIntIn,
  MAX_EPOCH_SEC,
  toEpochSec,
  tuplesToFacts,
} from './save-code-v2-facts';
import {
  type CharacterAnchor,
  DEFAULT_GAME_META,
  type EquippedCosmetics,
  isEquippedEmpty,
} from './save-schema';

export interface SaveCodeAudio {
  sound: boolean;
  music: boolean;
}

/** What a decoded code imports: store records plus the audio settings it carried. */
export interface SaveCodeImport {
  records: ProgressRecords;
  audio: SaveCodeAudio;
}

export type Compact = Record<string, unknown>;

/** Same rule as the shop catalog and the server's owned_cosmetics check. */
const ID_PATTERN = /^[a-z0-9-]{1,40}$/;
/**
 * Well-formed kebab-case id (same grammar as SKILL_ID_PATTERN_SOURCE): M3D5 drops a
 * well-formed unknown skill/level id and rejects a malformed one. M3D2/M3D3/M3D4 decoding
 * never consults it — their strict behaviour is unchanged.
 */
export const WELL_FORMED_ID_PATTERN = /^[a-z][a-z0-9-]{1,38}$/;
/** Frozen: the five levels shipped with M3D2 (bridge + field, forest, city, tower gates). */
const M3D2_LEVELS: ReadonlySet<string> = new Set([
  BRIDGE_LEVEL_ID,
  'field',
  'forest',
  'city',
  'tower',
]);
const MAX_WALLET = 10_000_000;
const MAX_COMBO = 1_000_000;
const MAX_TABLE = 10;
const MAX_SCORE = 1_000_000;
const MAX_LEVEL_PROGRESS = 1000;
const MAX_SESSIONS = 10_000_000;
const MAX_COSMETICS = 64;
const MAX_SLOTS = 8;
export const M3D2_KEYS: readonly string[] = ['x', 'c', 'a', 'g', 's', 'n', 'l', 'o', 'e', 'f'];

const bit = (b: boolean): number => (b ? 1 : 0);

/** M3D2 fields of a snapshot for a level set (skills are never in `f`: M3D3 carries them in `k`). */
export function snapshotToCompactFields(
  snapshot: GameSnapshot,
  audio: SaveCodeAudio,
  knownLevels: ReadonlySet<string>,
): Compact {
  const out: Compact = {};
  const { wallet, gameMeta: m, profile } = snapshot;
  if (wallet.xp) out.x = wallet.xp;
  if (wallet.coins) out.c = wallet.coins;
  if (profile.avatarId !== 'default') out.a = profile.avatarId;
  if (m.table || m.combo || m.started) out.g = [m.table, m.combo, bit(m.started)];
  out.s = [bit(audio.sound), bit(audio.music)];
  if (snapshot.sessionCount) out.n = snapshot.sessionCount;
  const levels = Object.values(snapshot.levelProgress).filter((l) => knownLevels.has(l.levelId));
  if (levels.length)
    out.l = Object.fromEntries(
      levels.map((l) => [
        l.levelId,
        [l.stars, l.bestScore, toEpochSec(l.completedAt), l.progress, toEpochSec(l.acceptedAt)],
      ]),
    );
  if (snapshot.ownedCosmetics.length) out.o = [...snapshot.ownedCosmetics];
  const equipped = profile.settings.equipped;
  if (!isEquippedEmpty(equipped)) out.e = { ...equipped };
  const facts = Object.entries(snapshot.factStats).filter(
    ([key, s]) => s.attempts > 0 && !isSkillKey(key),
  );
  if (facts.length) out.f = facts.map(([key, stat]) => factToTuple(key, stat));
  return out;
}

export const snapshotToCompactV2 = (snapshot: GameSnapshot, audio: SaveCodeAudio): Compact =>
  snapshotToCompactFields(snapshot, audio, M3D2_LEVELS);

const isFlag = (v: unknown): v is 0 | 1 => v === 0 || v === 1;
export const isPlainObject = (v: unknown): v is Compact =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function decodeLevels(
  raw: unknown,
  knownLevels: ReadonlySet<string>,
  lenient = false,
): ProgressRecords['levels'] | null {
  if (!isPlainObject(raw)) return null;
  const levels: ProgressRecords['levels'] = {};
  for (const [id, t] of Object.entries(raw)) {
    const known = knownLevels.has(id);
    if (!known && !lenient) return null;
    if (!known && !WELL_FORMED_ID_PATTERN.test(id)) return null;
    if (!Array.isArray(t) || t.length !== 5) return null;
    const [stars, bestScore, doneSec, progress, acceptedSec] = t as unknown[];
    if (
      !isIntIn(stars, 0, 3) ||
      !isIntIn(bestScore, 0, MAX_SCORE) ||
      !isIntIn(doneSec, 0, MAX_EPOCH_SEC) ||
      !isIntIn(progress, 0, MAX_LEVEL_PROGRESS) ||
      !isIntIn(acceptedSec, 0, MAX_EPOCH_SEC)
    )
      return null;
    if (!known) continue; // well-formed future level: dropped, not rejected
    const completedAt = doneSec * 1000;
    // M3D2/M3D3 carry no stage stars: stage 1 inherits the level's stars (phase 01
    // migration), so an imported finished level still shows stage 1 complete.
    levels[id] = {
      stars,
      bestScore,
      completedAt,
      progress,
      acceptedAt: acceptedSec * 1000,
      stageStars: stars > 0 ? [stars] : [],
    };
  }
  return levels;
}

function decodeCosmetics(owned: unknown, equipped: unknown): ProgressRecords['cosmetics'] | null {
  const o = owned ?? [];
  const e = equipped ?? {};
  if (!Array.isArray(o) || o.length > MAX_COSMETICS) return null;
  if (!o.every((id) => typeof id === 'string' && ID_PATTERN.test(id))) return null;
  if (new Set(o).size !== o.length || !isPlainObject(e)) return null;
  // New shape (M3D6): {vlm, avatar, decor} — every version's decoder accepts it, so a
  // code round-trips whatever the snapshot wears.
  if ('vlm' in e || 'avatar' in e || 'decor' in e) {
    const decoded = decodeEquippedV6(e);
    if (!decoded) return null;
    return { owned: [...(o as string[])], equipped: decoded };
  }
  // Old shape (M3D2–M3D5): {slot: id} — maps to the multi-equip model on import
  // (phase 23): the same items stay worn, the 'none' sentinel and unknown ids drop.
  const slots = Object.entries(e);
  if (slots.length > MAX_SLOTS) return null;
  if (!slots.every(([k, v]) => ID_PATTERN.test(k) && typeof v === 'string' && ID_PATTERN.test(v)))
    return null;
  return { owned: [...(o as string[])], equipped: migrateEquippedV1(e as Record<string, string>) };
}

/**
 * The M3D6 `e` field ({vlm, avatar, decor}) -> the multi-equip model, or null for
 * anything malformed. A well-formed unknown id, or a known item in the wrong spot,
 * is dropped (M3D5 leniency), never a reason to reject the whole code.
 */
export function decodeEquippedV6(raw: unknown): EquippedCosmetics | null {
  if (!isPlainObject(raw)) return null;
  if (!Object.keys(raw).every((k) => k === 'vlm' || k === 'avatar' || k === 'decor')) return null;
  const vlm: Partial<Record<CharacterAnchor, string>> = {};
  const avatar: Partial<Record<CharacterAnchor, string>> = {};
  const decor: string[] = [];
  for (const owner of ['vlm', 'avatar'] as const) {
    const spots = raw[owner];
    if (spots === undefined) continue;
    if (!isPlainObject(spots)) return null;
    for (const [anchor, id] of Object.entries(spots)) {
      if (anchor !== 'head' && anchor !== 'neck' && anchor !== 'back') return null;
      if (typeof id !== 'string' || !ID_PATTERN.test(id)) return null;
      const placement = PLACEMENT_BY_ID[id];
      if (!placement || placement.owner !== owner || placement.anchor !== anchor) continue;
      (owner === 'vlm' ? vlm : avatar)[anchor] = id;
    }
  }
  const rawDecor = raw.decor;
  if (rawDecor !== undefined) {
    if (!Array.isArray(rawDecor) || rawDecor.length > MAX_COSMETICS) return null;
    if (!rawDecor.every((id) => typeof id === 'string' && ID_PATTERN.test(id))) return null;
    if (new Set(rawDecor).size !== rawDecor.length) return null;
    for (const id of rawDecor as string[]) {
      if (PLACEMENT_BY_ID[id]?.owner !== 'decor') continue;
      decor.push(id);
    }
  }
  return { vlm, avatar, decor };
}

/**
 * Compact payload -> import for a level set and allowed keys, or null for anything malformed.
 * `lenient` (M3D5 only) drops well-formed unknown level ids instead of rejecting the code;
 * M3D2/M3D3/M3D4 call without it and stay strict.
 */
export function compactFieldsToImport(
  raw: unknown,
  knownLevels: ReadonlySet<string>,
  allowedKeys: readonly string[],
  lenient = false,
): SaveCodeImport | null {
  if (!isPlainObject(raw) || !Object.keys(raw).every((k) => allowedKeys.includes(k))) return null;
  const { x = 0, c = 0, a = 'default', g, s = [1, 0], n = 0 } = raw;
  if (!isIntIn(x, 0, MAX_WALLET) || !isIntIn(c, 0, MAX_WALLET) || !isIntIn(n, 0, MAX_SESSIONS))
    return null;
  if (typeof a !== 'string' || !ID_PATTERN.test(a)) return null;
  const meta = g ?? [DEFAULT_GAME_META.table, DEFAULT_GAME_META.combo, 0];
  if (!Array.isArray(meta) || meta.length !== 3) return null;
  const [table, combo, started] = meta as unknown[];
  if (!isIntIn(table, 0, MAX_TABLE) || !isIntIn(combo, 0, MAX_COMBO) || !isFlag(started))
    return null;
  if (!Array.isArray(s) || s.length !== 2 || !s.every(isFlag)) return null;
  const levels = decodeLevels(raw.l ?? {}, knownLevels, lenient);
  const cosmetics = decodeCosmetics(raw.o, raw.e);
  const facts = tuplesToFacts(raw.f ?? []);
  if (!levels || !cosmetics || !facts) return null;
  return {
    records: {
      avatarId: a,
      wallet: { xp: x, coins: c },
      levels,
      facts,
      gameMeta: { table, combo, started: started === 1 },
      cosmetics,
      sessionCount: n,
    },
    audio: { sound: s[0] === 1, music: s[1] === 1 },
  };
}

export const compactV2ToImport = (raw: unknown): SaveCodeImport | null =>
  compactFieldsToImport(raw, M3D2_LEVELS, M3D2_KEYS);
