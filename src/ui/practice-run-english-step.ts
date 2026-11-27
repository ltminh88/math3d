// The English branch of the practice run (R114, split out of practice-run.ts):
// one English item in the shared dialog. The widget loads lazily (dynamic
// import) so the daily dialog's chunk does not carry it until the first
// English item is shown; a failed chunk shows the load-failed toast and skips
// the item instead of leaving the dialog stuck (offline, or a stale tab whose
// chunk hash the new deploy deleted). The previous item's Next button is
// locked while the chunk loads, so a second tap cannot advance twice and
// silently skip this item.
import { unitForSkill } from '../english/content/units';
import { generateItem } from '../english/engine/item-generators';
import { kindsForSkill } from '../english/engine/item-planner';
import type { EnglishItemKind, EnglishSkillId } from '../english/english-types';
import type { FactKey } from '../learning/fact-key';
import { mulberry32 } from '../learning/seeded-rng';
import type { QuestionOutcome } from '../learning/session-recorder';
import { skillTierOf } from '../learning/skill-tiers';
import { tl } from '../levels/shared/level-host-strings';
import { openDialog } from './dialog';
import { byId } from './icons';
import type { PracticeRunState } from './practice-run';
import { showToast } from './toast-and-persist';

export interface EnglishStepCallbacks {
  onAnswered(outcome: QuestionOutcome): void;
  onNext(): void;
  onLeave(): void;
}

/**
 * True when an English skill renders — judged on the item, never on the
 * skill's family: its generator can build an item for it from its home unit.
 * The widget itself loads lazily at render time, so this only proves the
 * content exists.
 */
export function isEnglishKeyRenderable(id: string, box: number): boolean {
  try {
    const skillId = id as EnglishSkillId;
    const kinds = kindsForSkill(skillId);
    generateItem(
      skillId,
      kinds[0] as EnglishItemKind,
      skillTierOf({ box }),
      unitForSkill(skillId),
      mulberry32(0),
    );
    return true;
  } catch {
    return false;
  }
}

/** Locks the previous item's Next button so a second tap cannot advance twice. */
export function lockPreviousNext(): void {
  // No DOM in the node test run — nothing to lock there.
  if (typeof document === 'undefined') return;
  const root = byId('dialog-content');
  // The previous item is a skill/English item (.daily-next) or a quiz fact
  // (#next-question); either stays clickable until the new dialog opens.
  for (const selector of ['.daily-next', '#next-question']) {
    const button = root.querySelector(selector) as HTMLButtonElement | null;
    if (button) button.disabled = true;
  }
}

/**
 * Shows one English item: locks Next, loads the widget chunk, then opens the
 * dialog. `getRun` reads the live run — the run may have ended (leave /
 * finish) while the chunk was in flight, in which case nothing is shown.
 */
export async function renderEnglishItemStep(
  key: FactKey,
  skillId: EnglishSkillId,
  title: string,
  isLast: boolean,
  getRun: () => PracticeRunState | null,
  cb: EnglishStepCallbacks,
): Promise<void> {
  lockPreviousNext();
  let mod: typeof import('./english/english-daily-item');
  try {
    mod = await import('./english/english-daily-item');
  } catch {
    showToast(tl('loadFailed'));
    cb.onNext();
    return;
  }
  const run = getRun();
  if (!run || run.keys[run.index] !== key) return;
  const { store } = run;
  openDialog(title, mod.englishItemHtml(run.index, run.keys.length, run.alreadyCounted), run.kind);
  const mounted = mod.mountEnglishDailyItem({
    skillId,
    box: store.getSnapshot().factStats[key]?.box ?? 1,
    isLast,
    rng: run.rng,
    signal: run.signal.signal,
    cb,
  });
  run.current = { destroy: () => mounted.destroy(), missed: () => null };
}
