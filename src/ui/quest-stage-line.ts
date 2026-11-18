// Stage sub-line under the quest card's step row ("Chặng n/m · s sao" / "Đã qua hết các
// chặng!"). The closing card shows the cave's line (the last level); the bridge card shows
// none. Split out of quest-chain.ts so that file stays under 200 lines.
import { levelDefinition } from '../levels/shared/level-registry';
import { byId } from './icons';
import { connectedStore } from './progress-sync';
import { type QuestStage, questStageLine } from './quest-chain-stage';
import { tq } from './quest-chain-strings';

/** Writes (or removes) the stage sub-line for `stage` (DOM touched only when it changes). */
export function renderStageLine(stage: QuestStage): void {
  let line = document.getElementById('quest-stage');
  const levelId = stage === 'bridge' ? undefined : stage === 'done' ? 'cave' : stage;
  let text: string | null = null;
  if (levelId) {
    const definition = levelDefinition(levelId);
    if (definition && definition.stages > 1) {
      const progress = connectedStore()?.getSnapshot().levelProgress[levelId];
      const result = questStageLine(definition.stages, progress?.stageStars ?? []);
      text =
        result === 'all-done'
          ? tq('stageAllDone')
          : result
            ? tq('stageLine', { n: result.n, m: result.m, stars: result.stars, max: result.max })
            : null;
    }
  }
  if (text === null) {
    line?.remove();
    return;
  }
  if (!line) {
    line = document.createElement('small');
    line.id = 'quest-stage';
    line.className = 'quest-stage';
    byId('quest-steps').after(line);
  }
  if (line.textContent !== text) line.textContent = text;
}
