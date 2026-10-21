// The quest card's content for every quest in the chain: the bridge quest (recovered copy, kept
// byte-identical), then the field gate, the forest gate and a closing card. The stage comes from
// the same state the level gates read, so the card follows a level commit and a reload.
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { tc } from '../i18n/common-strings';
import { tl } from '../levels/shared/level-host-strings';
import { progressionState } from '../levels/shared/level-progression';
import { LEVEL_COMPLETE_BONUS } from '../levels/shared/level-run-result';
import { tshop } from '../shop/shop-strings';
import { gameState } from './game-state';
import { byId, icon } from './icons';
import { connectedStore } from './progress-sync';
import { type QuestStage, questStage } from './quest-chain-stage';
import { tq } from './quest-chain-strings';
import { setMarkup } from './set-markup-if-changed';

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

const CHAIN_STEPS = ['stepBridge', 'stepField', 'stepForest'] as const;
const STAGE_INDEX: Record<QuestStage, number> = { bridge: 0, field: 1, forest: 2, done: 3 };

/** One cell per quest of the chain: a check once done, else its short name. */
function chainStepsHtml(stage: QuestStage): string {
  return CHAIN_STEPS.map((key, i) => {
    const done = i < STAGE_INDEX[stage];
    const name = tq(key);
    const label = tq(done ? 'stepDone' : 'stepTodo', { n: i + 1, name });
    return `<span class="${done ? 'done' : ''}" aria-label="${label}">${done ? icon('check') : name}</span>`;
  }).join('');
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
  if (stage === 'field') {
    const copy = tq('copyField', { gate: tl('gateField') });
    return { ...next, title: tq('titleField'), copy, progress: tq('progressField') };
  }
  if (stage === 'forest') {
    const copy = tq('copyForest', { gate: tl('gateForest') });
    return { ...next, title: tq('titleForest'), copy, progress: tq('progressForest') };
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
    return;
  }
  const card = chainCopy(stage);
  setTextAfterIcon('#quest-toggle .eyebrow', card.eyebrow);
  setTextAfterIcon('#quest-card .reward', card.reward);
  byId('quest-copy').textContent = card.copy;
  byId('quest-title').textContent = card.title;
  byId('quest-progress').textContent = card.progress;
  setMarkup('quest-steps', chainStepsHtml(stage));
}
