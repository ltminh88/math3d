import { LEVEL_XP_THRESHOLDS } from '../config/world-constants';

export { LEVEL_XP_THRESHOLDS };

/** Player level (1..5) for an XP total: 1 + number of thresholds above level 1 reached. */
export const levelForXp = (xp: number): number =>
  1 + LEVEL_XP_THRESHOLDS.slice(1).filter((threshold) => xp >= threshold).length;
