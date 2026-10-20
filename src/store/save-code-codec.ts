// Save codes: progress as text a child or parent can paste on another device or domain.
//   M3D1-<base64url(compact JSON)>-<CRC32 of the base64url payload, 8 hex>
// The version digit allows M3D2 later; the checksum catches typos and truncation. A code is
// progress, not a credential: it holds no secret, and a decoded code passes the same v1 save
// validator as the localStorage blob (clamped numbers, regex fact keys).
import { mulKey } from '../learning/fact-key';
import { decodeSaveV1 } from '../save/save-storage';
import type { SaveV1 } from '../save/save-types';
import { compactToSaveV1Json, saveV1ToCompact } from './save-code-compact-json';

export const SAVE_CODE_VERSION = 1;
const PREFIX = 'M3D';
/** Refuse anything longer before decoding (a full 90-fact save is ~3 KB). */
export const MAX_SAVE_CODE_CHARS = 4096;
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

export interface DecodedSaveCode {
  save: SaveV1;
  /** Leitner box per fact key carried by the code (absent for facts without one). */
  boxes: Record<string, number>;
}

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

/** Encodes a v1 save (plus optional Leitner boxes per fact key). */
export function encodeSaveCode(save: SaveV1, boxes: Readonly<Record<string, number>>): string {
  const payload = toBase64Url(JSON.stringify(saveV1ToCompact(save, boxes)));
  return `${PREFIX}${SAVE_CODE_VERSION}-${payload}-${crc32Hex(payload)}`;
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
  if (Number(version) !== SAVE_CODE_VERSION) throw new SaveCodeError('version');
  if (crc32Hex(payload) !== crc) throw new SaveCodeError('checksum');
  let compact: unknown;
  try {
    compact = JSON.parse(fromBase64Url(payload));
  } catch {
    throw new SaveCodeError('payload');
  }
  const expanded = compactToSaveV1Json(compact);
  const save = expanded && decodeSaveV1(JSON.stringify(expanded.v1), { cap: false });
  if (!expanded || !save) throw new SaveCodeError('payload');
  const boxes: Record<string, number> = {};
  for (const [id, box] of Object.entries(expanded.boxes)) {
    const [a, b] = id.slice(1).split('_').map(Number) as [number, number];
    if (save.questionStats[id]) boxes[mulKey(a, b)] = box;
  }
  return { save, boxes };
}
