// How-to-play text for touch screens (coarse pointer): the recovered help names keys (WASD, E, M,
// Space, mouse wheel) that a phone or tablet does not have. Desktop keeps the recovered text byte
// for byte (DOM parity); titles stay the recovered ones (the legacy translator handles them).
import { defineStrings } from '../i18n/i18n';

const th = defineStrings('helpTouch', {
  vi: {
    move: 'Kéo cần điều khiển, hoặc chạm xuống đất để đi tới đó.',
    talk: 'Đến gần chiếc mũ xanh rồi chạm nút “Nói chuyện” hiện ở cuối màn hình.',
    quiz: 'Chạm 1 trong 3 đáp án. Cần giúp đỡ? Chạm “Gợi ý cho mình”.',
    map: 'Chạm vào bản đồ nhỏ ở góc màn hình, hoặc nút “Bản đồ”, để xem các vùng đất.',
    tip: '<b>Nút nhảy</b>: nhảy · <b>Kéo trên làng</b>: xoay camera · <b>Nút Vào cổng</b>: vào màn chơi khi đứng trước cổng.',
  },
  en: {
    move: 'Drag the joystick, or tap the ground to walk there.',
    talk: 'Come near the blue hat, then tap the “Talk” button at the bottom of the screen.',
    quiz: 'Tap 1 of 3 answers. Need help? Tap “Give me a hint”.',
    map: 'Tap the minimap in the corner, or the “Map” button, to see every land.',
    tip: '<b>Jump button</b>: jump · <b>Drag across the village</b>: turn the camera · <b>Enter button</b>: go into a level in front of its gate.',
  },
});

/** The help list + tip for touch screens, same markup shape as the recovered help. */
export const touchHelpHtml = (): string =>
  `<div class="help-list"><div><b>1</b><p><strong>Khám phá ngôi làng</strong>${th('move')}</p></div><div><b>2</b><p><strong>Làm quen với VLM</strong>${th('talk')}</p></div><div><b>3</b><p><strong>Xây cầu bằng phép nhân</strong>${th('quiz')}</p></div><div><b>4</b><p><strong>Mở bản đồ thế giới</strong>${th('map')}</p></div></div><div class="milo-tip"><p>${th('tip')}</p></div>`;
