import { LEVEL_ORDER, type LevelId } from './curriculum-tables';

export interface LevelStars {
  stars: number;
}

/** First level is always open; each next one opens once the previous was completed once (>= 1 star). */
export function unlockedLevels(progress: Partial<Record<string, LevelStars>>): LevelId[] {
  const unlocked: LevelId[] = [];
  for (const id of LEVEL_ORDER) {
    const prev = unlocked.length === 0 ? undefined : LEVEL_ORDER[unlocked.length - 1];
    if (prev !== undefined && (progress[prev]?.stars ?? 0) < 1) break;
    unlocked.push(id);
  }
  return unlocked;
}

export function isLevelUnlocked(
  progress: Partial<Record<string, LevelStars>>,
  id: LevelId,
): boolean {
  return unlockedLevels(progress).includes(id);
}
