// The quest card's content for every quest in the chain: the bridge quest (recovered copy, kept
// byte-identical), then chapter 1 (field, forest, city, tower) and chapter 2 (garden, valley,
// workshop, cave) gates and a closing card. The row shows the current chapter only (≤5 cells) with
// a "Chương n · k/m" label. A gate whose level is not shipped yet says "Sắp ra mắt". The stage comes
// from the same state the level gates read, so the card follows a level commit and a reload.
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { tc } from '../i18n/common-strings';
import { gateNameOf } from '../levels/shared/level-host-strings';
import { progressionState } from '../levels/shared/level-progression';
import { levelDefinition } from '../levels/shared/level-registry';
import { LEVEL_COMPLETE_BONUS } from '../levels/shared/level-run-result';
import { tshop } from '../shop/shop-strings';
import { gameState } from './game-state';
import { byId, icon } from './icons';
import { isCoarsePointer } from './pointer-kind';
import { connectedStore } from './progress-sync';
import {
  CHAIN_LEVELS,
  type ChainLevel,
  type ChainStage,
  type QuestStage,
  questChapter,
  questStage,
} from './quest-chain-stage';
import { tq } from './quest-chain-strings';
import { setMarkup } from './set-markup-if-changed';
import './quest-chain-steps.css';

/** Current quest stage (bridge flag from the progress view, levels from the store). */
export function currentQuestStage(): QuestStage {
  const levels = connectedStore()?.getSnapshot().levelProgress ?? {};
  return questStage(progressionState(gameState.progress.questComplete, levels));
}

function bridgeCopy(): string {
  const progress = gameState.progress;
  if (progress.bridge === BRIDGE_SEGMENTS) {
    return 'Cây cầu đã sẵn sàng! Hãy đi qua cầu sang khu vườn bên kia sông.';
  }
  return progress.questAccepted
    ? 'Giúp VLM chọn phép nhân đúng. Mỗi câu trả lời sẽ xây thêm một đoạn cầu.'
    : 'VLM đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!';
}

function bridgeProgress(): string {
  const progress = gameState.progress;
  if (progress.bridge === BRIDGE_SEGMENTS) return 'Đi qua cầu để hoàn thành';
  return progress.questAccepted
    ? `${progress.bridge} / ${BRIDGE_SEGMENTS} đoạn cầu`
    : 'Gặp người dẫn đường';
}

function bridgeStepsHtml(): string {
  const built = gameState.progress.bridge;
  return Array.from(
    { length: BRIDGE_SEGMENTS },
    (_, s) =>
      `<span class="${s < built ? 'done' : ''}" aria-label="Đoạn ${s + 1}: ${s < built ? 'đã xây' : 'chưa xây'}">${s < built ? icon('check') : s + 1}</span>`,
  ).join('');
}

type QuestKey = Parameters<typeof tq>[0];

/** Per chain level: card title, copy, progress line, step-row name and VLM's pointer line. */
export const CHAIN_TEXT_KEYS = {
  field: ['titleField', 'copyField', 'progressField', 'stepField', 'guideField'],
  forest: ['titleForest', 'copyForest', 'progressForest', 'stepForest', 'guideForest'],
  city: ['titleCity', 'copyCity', 'progressCity', 'stepCity', 'guideCity'],
  tower: ['titleTower', 'copyTower', 'progressTower', 'stepTower', 'guideTower'],
  garden: ['titleGarden', 'copyGarden', 'progressGarden', 'stepGarden', 'guideGarden'],
  valley: ['titleValley', 'copyValley', 'progressValley', 'stepValley', 'guideValley'],
  workshop: ['titleWorkshop', 'copyWorkshop', 'progressWorkshop', 'stepWorkshop', 'guideWorkshop'],
  cave: ['titleCave', 'copyCave', 'progressCave', 'stepCave', 'guideCave'],
} as const satisfies Record<ChainLevel, readonly QuestKey[]>;

const STAGES: readonly QuestStage[] = ['bridge', ...CHAIN_LEVELS, 'done'];
const stepKey = (stage: ChainStage): QuestKey =>
  stage === 'bridge' ? 'stepBridge' : CHAIN_TEXT_KEYS[stage][3];

/** One cell per quest of the current chapter: a check once done, else its short name. */
function chainStepsHtml(stage: QuestStage): string {
  const { stages, done: doneCells } = questChapter(stage);
  return stages
    .map((cell, i) => {
      const done = i < doneCells;
      const name = tq(stepKey(cell));
      const label = tq(done ? 'stepDone' : 'stepTodo', { n: STAGES.indexOf(cell) + 1, name });
      return `<span class="${done ? 'done' : ''}" aria-label="${label}">${done ? icon('check') : name}</span>`;
    })
    .join('');
}

/** "Chương n · k/m" above the row; created on the first chain card, removed on the bridge card. */
function renderChapterLabel(stage: QuestStage | undefined): void {
  let label = document.getElementById('quest-chapter');
  byId('quest-steps').classList.toggle('chain-row', stage !== undefined);
  if (stage === undefined) {
    label?.remove();
    return;
  }
  if (!label) {
    label = document.createElement('small');
    label.id = 'quest-chapter';
    label.className = 'quest-chapter';
    byId('quest-steps').before(label);
  }
  const { chapter, stages, done } = questChapter(stage);
  const text = tq('chapterLabel', { n: chapter, k: done, m: stages.length });
  if (label.textContent !== text) label.textContent = text;
}

/** An open gate whose level folder has not shipped yet (chapter 2 until phases 05-08). */
const comingSoon = (stage: ChainLevel): boolean => levelDefinition(stage) === undefined;

/** VLM's pointer line for a chain stage (the "sắp ra mắt" variant while the level is missing). */
export function chainGuideLine(stage: ChainLevel): string {
  const gate = gateNameOf(stage);
  return comingSoon(stage)
    ? tq('guideComingSoon', { gate })
    : tq(CHAIN_TEXT_KEYS[stage][4], { gate });
}

/**
 * Sets the text after an element's icon (eyebrow, reward). `undefined` restores the recovered
 * template text, which is only ever touched once the chain moved past the bridge.
 */
const templateText = new WeakMap<Node, string>();
function setTextAfterIcon(selector: string, text: string | undefined): void {
  const node = (document.querySelector(selector) as Element).lastChild;
  if (node?.nodeType !== Node.TEXT_NODE) return;
  if (!templateText.has(node)) templateText.set(node, node.nodeValue ?? '');
  const next = text === undefined ? templateText.get(node) : ` ${text}`;
  if (node.nodeValue !== next) node.nodeValue = next ?? '';
}

interface CardCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly copy: string;
  readonly progress: string;
  readonly reward: string;
}

function chainCopy(stage: Exclude<QuestStage, 'bridge'>): CardCopy {
  const { xp, coins } = LEVEL_COMPLETE_BONUS;
  const next = { eyebrow: tq('eyebrowNext'), reward: tq('rewardLevel', { xp, coins }) };
  if (stage !== 'done') {
    const [title, copy, progress] = CHAIN_TEXT_KEYS[stage];
    const gate = gateNameOf(stage);
    if (comingSoon(stage)) {
      const soon = tq('copyComingSoon', { gate, guide: tc('guideName') });
      return { ...next, title: tq(title), copy: soon, progress: tq('progressComingSoon') };
    }
    // Touch screens have no E key: name only the Enter button there (QA p-7).
    const enter = tq(isCoarsePointer() ? 'enterTap' : 'enterKeyOrTap');
    return { ...next, title: tq(title), copy: tq(copy, { gate, enter }), progress: tq(progress) };
  }
  return {
    eyebrow: tq('eyebrowDone'),
    title: tq('titleDone'),
    copy: tq('copyDone', { guide: tc('guideName'), shop: tshop('hudButton') }),
    progress: tq('progressDone'),
    reward: tq('rewardPractice'),
  };
}

/** Writes the quest card for the current stage (DOM touched only where text changed). */
export function renderQuestCard(): void {
  const stage = currentQuestStage();
  if (stage === 'bridge') {
    setTextAfterIcon('#quest-toggle .eyebrow', undefined);
    setTextAfterIcon('#quest-card .reward', undefined);
    byId('quest-copy').textContent = bridgeCopy();
    byId('quest-title').textContent = 'Một cây cầu, ngàn niềm vui';
    byId('quest-progress').textContent = bridgeProgress();
    setMarkup('quest-steps', bridgeStepsHtml());
    renderChapterLabel(undefined);
    return;
  }
  const card = chainCopy(stage);
  setTextAfterIcon('#quest-toggle .eyebrow', card.eyebrow);
  setTextAfterIcon('#quest-card .reward', card.reward);
  byId('quest-copy').textContent = card.copy;
  byId('quest-title').textContent = card.title;
  byId('quest-progress').textContent = card.progress;
  setMarkup('quest-steps', chainStepsHtml(stage));
  renderChapterLabel(stage);
}
