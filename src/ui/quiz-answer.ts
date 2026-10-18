// Quiz answer handling: stats, rewards (+10 XP, +5 coins, bridge segment), feedback, the hint
// ladder (0..3; a wrong answer also climbs one rung) and the floating reward pop.
import { Vector3 } from 'three';
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { levelForXp } from '../game/xp-levels';
import { translateLongText, translateText } from '../i18n/legacy-translator';
import { applyAnswerStats, isCorrect } from '../quiz/answer-stats';
import { hintText } from '../quiz/hint-text';
import type { Question } from '../quiz/question-types';
import { gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId, icon } from './icons';
import { bump, persistSave, showToast } from './toast-and-persist';

/** Shows the hint text for the current rung plus the a×b stone groups. */
export function renderHint(): void {
  const question = gameState.question;
  if (!question) return;
  const area = byId('hint-area');
  area.hidden = false;
  area.innerHTML = translateLongText(
    `<p>${hintText(question, gameState.hintLevel)}</p><div class="stone-groups" aria-label="${question.a} nhóm, mỗi nhóm có ${question.b} viên đá">${Array.from(
      { length: question.a },
      () => `<div class="stone-group">${'<i></i>'.repeat(question.b)}</div>`,
    ).join('')}</div>`,
  );
}

function showRewardPop(button: HTMLElement): void {
  const pop = document.createElement('b');
  pop.className = 'reward-pop';
  pop.textContent = '+10 XP · +5';
  pop.insertAdjacentHTML('beforeend', icon('coin'));
  button.append(pop);
  pop.addEventListener('animationend', () => pop.remove());
}

function nextButtonLabel(): string {
  const bridgeMode = gameState.quizMode === 'bridge';
  if (bridgeMode && gameState.save.bridge === BRIDGE_SEGMENTS) return 'Khám phá bên kia cầu!';
  return bridgeMode ? 'Xây đoạn cầu tiếp theo' : 'Thử thêm một câu';
}

function onCorrect(question: Question, button: HTMLButtonElement): void {
  const save = gameState.save;
  const world = getWorld();
  gameState.answered = true;
  if (gameState.hintLevel === 0) {
    save.review = save.review.filter((id) => id !== question.id);
  }
  const levelBefore = levelForXp(save.xp);
  save.xp += 10;
  save.coins += 5;
  if (gameState.quizMode === 'bridge') {
    save.bridge = Math.min(BRIDGE_SEGMENTS, save.bridge + 1);
    world.setBridge(save.bridge, true);
  }
  for (const answer of document.querySelectorAll<HTMLButtonElement>('.answer')) {
    answer.disabled = true;
  }
  button.classList.add('correct');
  showRewardPop(button);
  byId('feedback').className = 'feedback success';
  byId('feedback').textContent = translateLongText(
    `✓ Chính xác! ${question.a} × ${question.b} = ${question.answer}. +10 XP · +5 xu${save.combo >= 3 ? ` · Combo ${save.combo}!` : ''}`,
  );
  byId('next-question').hidden = false;
  byId('next-question').innerHTML = translateLongText(`${nextButtonLabel()} ${icon('arrow')}`);
  byId('hint').hidden = true;
  gameState.audio.correct();
  world.burst(world.player.position.clone().add(new Vector3(0, 1, 0)));
  bump('wallet');
  bump('xp-fill');
  if (levelForXp(save.xp) > levelBefore) {
    gameState.audio.celebrate();
    showToast(`Bạn đã đạt cấp ${levelForXp(save.xp)}. Thật tuyệt vời!`);
  }
  byId('next-question').focus();
}

function onWrong(button: HTMLButtonElement): void {
  gameState.hintLevel = Math.min(3, gameState.hintLevel + 1);
  button.classList.add('incorrect');
  button.disabled = true;
  byId('feedback').className = 'feedback gentle';
  byId('feedback').textContent = translateText('↻ Chưa đúng rồi. Mình cùng đếm lại nhé!');
  renderHint();
  gameState.audio.hint();
}

/** Handles a click on an answer button (ignored once answered or for disabled buttons). */
export function answerQuestion(value: number, button: HTMLButtonElement): void {
  const question = gameState.question;
  if (!question || gameState.answered || button.disabled) return;
  gameState.audio.unlock();
  const correct = isCorrect(question, value);
  applyAnswerStats(
    gameState.save,
    question,
    correct,
    performance.now() - gameState.questionStartedAt,
  );
  gameState.questionStartedAt = performance.now();
  if (correct) {
    onCorrect(question, button);
  } else {
    onWrong(button);
  }
  refreshHud();
  persistSave();
}
