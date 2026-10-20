// Quiz answer handling: rewards (+10 XP, +5 coins, bridge segment; frozen, see quiz-rewards.ts),
// combo, feedback, the hint ladder (0..3; a wrong answer also climbs one rung) and the floating
// reward pop. Each finished question goes to the Leitner recorder (progress-sync.ts).
import { Vector3 } from 'three';
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { levelForXp } from '../game/xp-levels';
import { translateLongText, translateText } from '../i18n/legacy-translator';
import { hintText } from '../quiz/hint-text';
import type { Question } from '../quiz/question-types';
import {
  BRIDGE_SEGMENTS_PER_CORRECT,
  COMBO_SHOWN_FROM,
  CORRECT_ANSWER_REWARD,
  NO_REWARD,
} from '../quiz/quiz-rewards';
import { gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId, icon } from './icons';
import { flushProgress, recordQuizQuestion } from './progress-sync';
import { bump, showToast } from './toast-and-persist';

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
  if (bridgeMode && gameState.progress.bridge === BRIDGE_SEGMENTS) return 'Khám phá bên kia cầu!';
  return bridgeMode ? 'Xây đoạn cầu tiếp theo' : 'Thử thêm một câu';
}

function onCorrect(question: Question, button: HTMLButtonElement): void {
  const progress = gameState.progress;
  const world = getWorld();
  gameState.answered = true;
  const levelBefore = levelForXp(progress.xp);
  progress.xp += CORRECT_ANSWER_REWARD.xp;
  progress.coins += CORRECT_ANSWER_REWARD.coins;
  if (gameState.quizMode === 'bridge') {
    progress.bridge = Math.min(BRIDGE_SEGMENTS, progress.bridge + BRIDGE_SEGMENTS_PER_CORRECT);
    world.setBridge(progress.bridge, true);
  }
  for (const answer of document.querySelectorAll<HTMLButtonElement>('.answer')) {
    answer.disabled = true;
  }
  button.classList.add('correct');
  showRewardPop(button);
  byId('feedback').className = 'feedback success';
  byId('feedback').textContent = translateLongText(
    `✓ Chính xác! ${question.a} × ${question.b} = ${question.answer}. +10 XP · +5 xu${progress.combo >= COMBO_SHOWN_FROM ? ` · Combo ${progress.combo}!` : ''}`,
  );
  byId('next-question').hidden = false;
  byId('next-question').innerHTML = translateLongText(`${nextButtonLabel()} ${icon('arrow')}`);
  byId('hint').hidden = true;
  gameState.audio.correct();
  world.burst(world.player.position.clone().add(new Vector3(0, 1, 0)));
  bump('wallet');
  bump('xp-fill');
  if (levelForXp(progress.xp) > levelBefore) {
    gameState.audio.celebrate();
    showToast(`Bạn đã đạt cấp ${levelForXp(progress.xp)}. Thật tuyệt vời!`);
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
  const correct = value === question.answer;
  gameState.progress.combo = correct ? gameState.progress.combo + 1 : 0;
  gameState.questionStartedAt = performance.now();
  if (correct) {
    onCorrect(question, button);
    recordQuizQuestion(questionOutcome(question, true), CORRECT_ANSWER_REWARD);
  } else {
    gameState.wrongAnswers.push(value);
    onWrong(button);
  }
  refreshHud();
}

function questionOutcome(question: Question, correct: boolean) {
  return {
    factKey: question.factKey,
    ms: performance.now() - gameState.questionShownAt,
    correct,
    firstTry: gameState.wrongAnswers.length === 0,
    usedHint: gameState.hintLevel > 0,
    wrongAnswers: [...gameState.wrongAnswers],
  };
}

/**
 * Quiz dialog closed: a question left after wrong answers counts as missed (no reward), then the
 * pending answer batch is committed.
 */
export function finishQuizOnClose(): void {
  const question = gameState.question;
  if (question && !gameState.answered && gameState.wrongAnswers.length > 0) {
    recordQuizQuestion(questionOutcome(question, false), NO_REWARD);
  }
  void flushProgress();
}
