export interface QualityTier {
  id: 'high' | 'medium' | 'low';
  /** Upper bound for renderer pixel ratio (also capped by devicePixelRatio). */
  pixelRatioCap: number;
  /** Only applied when the renderer is created, i.e. on the next load after a tier change. */
  antialias: boolean;
  blobShadows: boolean;
  /** 0..1 multiplier scenes apply to decorative object counts. */
  decorDensity: number;
}

export const QUALITY_TIERS: readonly QualityTier[] = [
  { id: 'high', pixelRatioCap: 2, antialias: true, blobShadows: true, decorDensity: 1 },
  { id: 'medium', pixelRatioCap: 1.5, antialias: true, blobShadows: true, decorDensity: 0.6 },
  { id: 'low', pixelRatioCap: 1, antialias: false, blobShadows: false, decorDensity: 0.3 },
];

const STORAGE_KEY = 'nsq.qualityTier';

export function clampTierIndex(index: number): number {
  if (!Number.isInteger(index)) return 0;
  return Math.min(QUALITY_TIERS.length - 1, Math.max(0, index));
}

export function tierAt(index: number): QualityTier {
  return QUALITY_TIERS[clampTierIndex(index)] ?? (QUALITY_TIERS[0] as QualityTier);
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadTierIndex(storage?: StorageLike): number {
  try {
    const raw = (storage ?? localStorage).getItem(STORAGE_KEY);
    return raw === null ? 0 : clampTierIndex(Number(raw));
  } catch {
    return 0;
  }
}

export function saveTierIndex(index: number, storage?: StorageLike): void {
  try {
    (storage ?? localStorage).setItem(STORAGE_KEY, String(clampTierIndex(index)));
  } catch {
    // Persistence is best-effort; the tier still applies for this session.
  }
}
