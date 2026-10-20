// Multiplication book (tables ×2–×10 with ✓ for facts answered right) and the how-to-play dialog.
import { TABLES } from '../config/world-constants';
import { mulKey } from '../learning/fact-key';
import { whenStoreReady } from './boot-window-action-gate';
import { closeDialog, openDialog } from './dialog';
import { gameState } from './game-state';
import { byId, icon } from './icons';
import { factCountsView, saveGameMeta } from './progress-sync';
import { openQuiz } from './quiz-dialog';

function bookGridHtml(table: number): string {
  const counts = factCountsView();
  return Array.from({ length: 10 }, (_, t) => {
    // Facts are pooled: answering 7 × 3 also checks 3 × 7.
    const stat = counts[mulKey(table, t + 1)];
    return `<div class="${stat?.correct ? 'known' : ''}"><span>${table} × ${t + 1}</span><b>= ${table * (t + 1)}</b><small>${stat?.correct ? '✓' : ''}</small></div>`;
  }).join('');
}

/** Opens the book on `table` (default: the saved table, or ×2 when "all tables" is saved). */
export function openBook(table = gameState.progress.table || 2): void {
  openDialog(
    'Sổ cửu chương',
    `<div class="dialog-eyebrow">HỌC TỪNG CHÚT, NHỚ THẬT LÂU</div><div class="table-tabs" role="group" aria-label="Chọn bảng cửu chương">${TABLES.map((t) => `<button data-table="${t}" aria-pressed="${t === table}">×${t}</button>`).join('')}</div><div class="multiplication-grid">${bookGridHtml(table)}</div><p class="book-note">Dấu ✓ là phép nhân bạn đã trả lời đúng. Mình luyện thêm nhé?</p><button id="practice-table" class="primary wide">Luyện bảng ×${table} ${icon('arrow')}</button><button id="practice-all" class="text-button centered">Trộn các bảng ×2 – ×10</button>`,
    'book',
  );
  for (const tab of document.querySelectorAll<HTMLElement>('[data-table]')) {
    tab.onclick = () => openBook(Number(tab.dataset.table));
  }
  const practice = (pick: number) => () =>
    whenStoreReady('practice', () => {
      gameState.progress.table = pick;
      void saveGameMeta({ table: pick });
      openQuiz('practice');
    });
  byId('practice-table').onclick = practice(table);
  byId('practice-all').onclick = practice(0);
}

export function openHelp(): void {
  openDialog(
    'Sẵn sàng phiêu lưu?',
    `<div class="help-list"><div><b>1</b><p><strong>Khám phá ngôi làng</strong>Nhấn WASD / phím mũi tên, hoặc chạm xuống đất để di chuyển. Trên màn hình cảm ứng, dùng cần điều khiển.</p></div><div><b>2</b><p><strong>Làm quen với VLM</strong>Đến gần chiếc mũ xanh rồi nhấn E hoặc nút “Nói chuyện”.</p></div><div><b>3</b><p><strong>Xây cầu bằng phép nhân</strong>Chọn 1 trong 3 đáp án. Cần giúp đỡ? Nhấn “Gợi ý cho mình”.</p></div><div><b>4</b><p><strong>Mở bản đồ thế giới</strong>Nhấn M hoặc chạm vào bản đồ nhỏ ở góc màn hình để xem các vùng đất.</p></div></div><div class="milo-tip"><p><b>Space</b>: nhảy · <b>Kéo trên làng</b>: xoay camera · <b>Lăn chuột</b>: phóng to / thu nhỏ · <b>Esc</b>: tạm dừng.</p></div><button id="understood" class="primary wide">Mình hiểu rồi! ${icon('check')}</button>`,
    'help',
  );
  byId('understood').onclick = closeDialog;
}

export function wireBookAndHelp(): void {
  byId('learn').onclick = () => openBook();
  byId('learn-welcome').onclick = () => openBook();
  byId('help').onclick = openHelp;
}
