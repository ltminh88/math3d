// Look word banks, units 5–8 (two-modes Phase 4, self-written): core words +
// reading-extra words per unit, with Vietnamese glosses and pictures.
// Unit 8 adds the action verbs the farm pattern drills (can/can't).
import type { EnglishWord } from '../../english-types';
import { SVG_TABLE } from './look-svg-pictures';

/** Unit 5 — body (8 core + 4 reading). */
export const LOOK_U5_WORDS: readonly EnglishWord[] = [
  { word: 'hand', gloss: 'bàn tay', picture: '✋' },
  { word: 'foot', gloss: 'bàn chân', picture: '🦶' },
  { word: 'nose', gloss: 'mũi', picture: '👃' },
  { word: 'mouth', gloss: 'miệng', picture: '👄' },
  { word: 'ear', gloss: 'tai', picture: '👂' },
  { word: 'eye', gloss: 'mắt', picture: '👁️' },
  { word: 'hair', gloss: 'tóc', picture: '💇' },
  { word: 'arm', gloss: 'cánh tay', picture: '💪' },
  { word: 'leg', gloss: 'chân', picture: '🦵' },
  { word: 'head', gloss: 'đầu', picture: '🙂' },
  { word: 'tooth', gloss: 'răng', picture: '🦷' },
  { word: 'finger', gloss: 'ngón tay', picture: '👆' },
];

/** Unit 6 — home rooms and furniture (8 core + 3 reading). */
export const LOOK_U6_WORDS: readonly EnglishWord[] = [
  { word: 'kitchen', gloss: 'bếp', picture: '🍳' },
  { word: 'bedroom', gloss: 'phòng ngủ', picture: '🛏️' },
  { word: 'bathroom', gloss: 'phòng tắm', picture: '🚿' },
  { word: 'living room', gloss: 'phòng khách', picture: '🛋️' },
  { word: 'table', gloss: 'cái bàn', picture: SVG_TABLE },
  { word: 'chair', gloss: 'ghế', picture: '🪑' },
  { word: 'lamp', gloss: 'đèn', picture: '💡' },
  { word: 'TV', gloss: 'ti-vi', picture: '📺' },
  { word: 'door', gloss: 'cánh cửa', picture: '🚪' },
  { word: 'clock', gloss: 'đồng hồ', picture: '🕐' },
  { word: 'mirror', gloss: 'gương', picture: '🪞' },
];

/** Unit 7 — town places (8 core + 4 reading). */
export const LOOK_U7_WORDS: readonly EnglishWord[] = [
  { word: 'school', gloss: 'trường học', picture: '🏫' },
  { word: 'park', gloss: 'công viên', picture: '🌳' },
  { word: 'hospital', gloss: 'bệnh viện', picture: '🏥' },
  { word: 'shop', gloss: 'cửa hàng', picture: '🏪' },
  { word: 'bank', gloss: 'ngân hàng', picture: '🏦' },
  { word: 'store', gloss: 'cửa hiệu', picture: '🏬' },
  { word: 'library', gloss: 'thư viện', picture: '📚' },
  { word: 'cinema', gloss: 'rạp chiếu phim', picture: '🎬' },
  { word: 'post office', gloss: 'bưu điện', picture: '📮' },
  { word: 'restaurant', gloss: 'nhà hàng', picture: '🍽️' },
  { word: 'bus stop', gloss: 'trạm xe buýt', picture: '🚏' },
  { word: 'bridge', gloss: 'cây cầu', picture: '🌉' },
];

/** Unit 8 — farm animals (8 core) + action verbs (7) + reading (3). */
export const LOOK_U8_WORDS: readonly EnglishWord[] = [
  { word: 'cow', gloss: 'con bò', picture: '🐄' },
  { word: 'pig', gloss: 'con lợn', picture: '🐷' },
  { word: 'duck', gloss: 'con vịt', picture: '🦆' },
  { word: 'horse', gloss: 'con ngựa', picture: '🐴' },
  { word: 'sheep', gloss: 'con cừu', picture: '🐑' },
  { word: 'goat', gloss: 'con dê', picture: '🐐' },
  { word: 'chicken', gloss: 'con gà', picture: '🐔' },
  { word: 'dog', gloss: 'con chó', picture: '🐶' },
  { word: 'swim', gloss: 'bơi', picture: '🏊' },
  { word: 'run', gloss: 'chạy', picture: '🏃' },
  { word: 'jump', gloss: 'nhảy', picture: '🤸' },
  { word: 'fly', gloss: 'bay', picture: '🕊️' },
  { word: 'climb', gloss: 'leo', picture: '🧗' },
  { word: 'sing', gloss: 'hát', picture: '🎤' },
  { word: 'eat', gloss: 'ăn', picture: '🍽️' },
  { word: 'frog', gloss: 'con ếch', picture: '🐸' },
  { word: 'bee', gloss: 'con ong', picture: '🐝' },
  { word: 'butterfly', gloss: 'con bướm', picture: '🦋' },
];
