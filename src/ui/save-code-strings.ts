import { defineStrings } from '../i18n/i18n';
import type { SaveCodeErrorReason } from '../store/save-code-codec';

export const ts = defineStrings('saveCode', {
  vi: {
    importButton: 'Nhập mã lưu',
    importTitle: 'Nhập mã lưu',
    importIntro:
      'Dán mã lưu (bắt đầu bằng M3D1-) từ thiết bị hoặc trang trò chơi cũ để mang tiến trình sang đây.',
    codeLabel: 'Mã lưu',
    importConfirm: 'Nhập tiến trình',
    overwriteTitle: 'Ghi đè tiến độ hiện tại?',
    overwriteCopy:
      'Tiến trình đang có trên thiết bị này sẽ được thay bằng tiến trình trong mã lưu.',
    overwriteYes: 'Ghi đè bằng mã lưu',
    overwriteNo: 'Giữ tiến độ hiện tại',
    imported: 'Đã nhập tiến trình từ mã lưu.',
    exportButton: 'Xuất mã lưu',
    exportTitle: 'Mã lưu của bạn',
    exportIntro:
      'Sao chép mã này rồi dán vào "Nhập mã lưu" trên thiết bị khác. Mã chỉ chứa tiến trình chơi, không có thông tin cá nhân.',
    copy: 'Sao chép mã',
    copied: 'Đã sao chép mã lưu.',
    back: 'Quay lại cài đặt',
    errorFormat: 'Mã lưu chưa đúng định dạng. Hãy dán lại toàn bộ mã, bắt đầu bằng M3D1-.',
    errorPrefix: 'Đây không phải mã lưu của math3d (mã bắt đầu bằng M3D1-).',
    errorVersion: 'Mã lưu này đến từ phiên bản mới hơn của trò chơi.',
    errorChecksum: 'Mã lưu bị thiếu hoặc sai vài ký tự. Hãy sao chép lại nguyên mã.',
    errorPayload: 'Mã lưu bị hỏng, không đọc được tiến trình.',
    errorStore: 'Chưa lưu được tiến trình trên trình duyệt này. Hãy thử lại.',
    blocked:
      'Trò chơi đang mở ở một tab khác. Hãy đóng tab đó rồi tải lại trang để lưu tiến trình.',
    notPersistent: 'Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.',
    reloadTitle: 'Cần tải lại trang',
    reloadCopy: 'Trò chơi vừa được cập nhật hoặc dữ liệu lưu đã thay đổi ở nơi khác.',
    reloadButton: 'Tải lại trang',
  },
  en: {
    importButton: 'Enter save code',
    importTitle: 'Enter save code',
    importIntro:
      'Paste a save code (starting with M3D1-) from another device or the old game site to bring your progress here.',
    codeLabel: 'Save code',
    importConfirm: 'Import progress',
    overwriteTitle: 'Replace your current progress?',
    overwriteCopy: 'The progress on this device will be replaced by the progress in the save code.',
    overwriteYes: 'Replace with the save code',
    overwriteNo: 'Keep my current progress',
    imported: 'Progress imported from the save code.',
    exportButton: 'Export save code',
    exportTitle: 'Your save code',
    exportIntro:
      'Copy this code and paste it into "Enter save code" on another device. It only holds game progress, no personal data.',
    copy: 'Copy code',
    copied: 'Save code copied.',
    back: 'Back to settings',
    errorFormat:
      'This save code is not in the right format. Paste the whole code, starting with M3D1-.',
    errorPrefix: 'This is not a math3d save code (codes start with M3D1-).',
    errorVersion: 'This save code comes from a newer version of the game.',
    errorChecksum:
      'Some characters of the save code are missing or wrong. Copy the whole code again.',
    errorPayload: 'This save code is damaged; the progress cannot be read.',
    errorStore: 'Progress could not be saved in this browser. Please try again.',
    blocked:
      'The game is open in another tab. Close it and reload this page to save your progress.',
    notPersistent: 'Your browser does not allow saving. Progress is kept for this session only.',
    reloadTitle: 'Please reload the page',
    reloadCopy: 'The game was updated, or its saved data changed somewhere else.',
    reloadButton: 'Reload page',
  },
});

const ERROR_KEYS = {
  format: 'errorFormat',
  'too-long': 'errorFormat',
  prefix: 'errorPrefix',
  version: 'errorVersion',
  checksum: 'errorChecksum',
  payload: 'errorPayload',
} as const satisfies Record<SaveCodeErrorReason, string>;

export const saveCodeErrorText = (reason: SaveCodeErrorReason): string => ts(ERROR_KEYS[reason]);
