// Save codes: progress as text a child or parent can paste on another device or domain.
//   M3D<version>-<base64url(compact JSON)>-<CRC32 of the base64url payload, 8 hex>
// M3D1 (old): the legacy v1 save (xp, coins, bridge, meta, x facts + Leitner boxes); still
// decoded exactly as before. M3D2: the whole store snapshot, incl. levels and cosmetics
// (save-code-v2-payload.ts), still decoded as shipped. M3D3 (chapter 2): M3D2's fields for the
// chapter-2 levels plus skill stats (save-code-v3-payload.ts), still decoded as shipped.
// M3D4 (written now, phase 01): M3D3's fields plus stage stars (`t`) and the daily fields
// (`d`) (save-code-v4-payload.ts). The checksum catches typos and truncation. A code is
// progress, not a credential: it holds no secret, and every decoded field is validated.
import { mulKey } from '../learning/fact-key';
import { decodeSaveV1 } from '../save/save-storage';
import type { SaveV1 } from '../save/save-types';
import { mapSaveV1ToProgress } from './legacy-save-import';
import type { GameSnapshot } from './progress-repository';
import { compactToSaveV1Json, saveV1ToCompact } from './save-code-compact-json';
import {
  compactV2ToImport,
  type SaveCodeAudio,
  type SaveCodeImport,
  snapshotToCompactV2,
} from './save-code-v2-payload';
import { compactV3ToImport, snapshotToCompactV3 } from './save-code-v3-payload';
import { compactV4ToImport, snapshotToCompactV4 } from './save-code-v4-payload';

/** Version written by export. */
export const SAVE_CODE_VERSION = 4;
const PREFIX = 'M3D';
/** Refuse anything longer before decoding (a full save, every fact and item, is ~11 KB). */
export const MAX_SAVE_CODE_CHARS = 16384;
const CODE_PATTERN = /^M3D(\d+)-([A-Za-z0-9_-]+)-([0-9a-f]{8})$/;

export type SaveCodeErrorReason =
  | 'format'
  | 'prefix'
  | 'version'
  | 'checksum'
  | 'payload'
  | 'too-long';

export class SaveCodeError extends Error {
  constructor(readonly reason: SaveCodeErrorReason) {
    super(`Invalid save code: ${reason}`);
    this.name = 'SaveCodeError';
  }
}

export type DecodedSaveCode =
  | {
      version: 1;
      save: SaveV1;
      /** Leitner box per fact key carried by the code (absent for facts without one). */
      boxes: Record<string, number>;
    }
  | { version: 2 | 3 | 4; data: SaveCodeImport };

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

/** CRC-32 (IEEE) of an ASCII string as 8 lowercase hex digits. */
export function crc32Hex(text: string): string {
  let crc = 0xffffffff;
  for (let i = 0; i < text.length; i++) {
    crc = (CRC_TABLE[(crc ^ text.charCodeAt(i)) & 0xff] as number) ^ (crc >>> 8);
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

const toBase64Url = (ascii: string): string =>
  btoa(ascii).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (payload: string): string =>
  atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

function frame(version: number, compact: unknown): string {
  const payload = toBase64Url(JSON.stringify(compact));
  return `${PREFIX}${version}-${payload}-${crc32Hex(payload)}`;
}

/** Encodes an old-format M3D1 code (v1 save plus optional Leitner boxes per fact key). */
export function encodeSaveCode(save: SaveV1, boxes: Readonly<Record<string, number>>): string {
  return frame(1, saveV1ToCompact(save, boxes));
}

/** Encodes an M3D2 code (kept for tests and fixtures; export writes M3D4). */
export const encodeSaveCodeV2 = (snapshot: GameSnapshot, audio: SaveCodeAudio): string =>
  frame(2, snapshotToCompactV2(snapshot, audio));

/** Encodes an M3D3 code (kept for tests and fixtures; export writes M3D4). */
export const encodeSaveCodeV3 = (snapshot: GameSnapshot, audio: SaveCodeAudio): string =>
  frame(3, snapshotToCompactV3(snapshot, audio));

/** Encodes the current M3D4 code: the whole progress snapshot (incl. stage stars) plus audio. */
export const encodeSaveCodeV4 = (snapshot: GameSnapshot, audio: SaveCodeAudio): string =>
  frame(4, snapshotToCompactV4(snapshot, audio));

/** Store records + audio settings to import for a decoded code of either version. */
export function importOfDecodedSaveCode(decoded: DecodedSaveCode, now: number): SaveCodeImport {
  if (decoded.version !== 1) return decoded.data;
  const { save, boxes } = decoded;
  return {
    records: mapSaveV1ToProgress(save, now, boxes),
    audio: { sound: save.sound, music: save.music },
  };
}

/** Decodes a pasted code (whitespace ignored). Throws SaveCodeError; never returns partial data. */
export function decodeSaveCode(input: string): DecodedSaveCode {
  const code = input.replace(/\s+/g, '');
  if (code.length > MAX_SAVE_CODE_CHARS) throw new SaveCodeError('too-long');
  if (code === '') throw new SaveCodeError('format');
  if (!code.startsWith(PREFIX)) throw new SaveCodeError('prefix');
  const match = CODE_PATTERN.exec(code);
  if (!match) throw new SaveCodeError('format');
  const [, version, payload = '', crc] = match;
  if (version !== '1' && version !== '2' && version !== '3' && version !== '4')
    throw new SaveCodeError('version');
  if (crc32Hex(payload) !== crc) throw new SaveCodeError('checksum');
  let compact: unknown;
  try {
    compact = JSON.parse(fromBase64Url(payload));
  } catch {
    throw new SaveCodeError('payload');
  }
  if (version === '2' || version === '3' || version === '4') {
    const data =
      version === '2'
        ? compactV2ToImport(compact)
        : version === '3'
          ? compactV3ToImport(compact)
          : compactV4ToImport(compact);
    if (!data) throw new SaveCodeError('payload');
    return { version: version === '2' ? 2 : version === '3' ? 3 : 4, data };
  }
  const expanded = compactToSaveV1Json(compact);
  const save = expanded && decodeSaveV1(JSON.stringify(expanded.v1), { cap: false });
  if (!expanded || !save) throw new SaveCodeError('payload');
  const boxes: Record<string, number> = {};
  for (const [id, box] of Object.entries(expanded.boxes)) {
    const [a, b] = id.slice(1).split('_').map(Number) as [number, number];
    if (save.questionStats[id]) boxes[mulKey(a, b)] = box;
  }
  return { version: 1, save, boxes };
}
