// Look word banks, units 1–4 (two-modes Phase 4, self-written): core words +
// reading-extra words per unit, with Vietnamese glosses and pictures.
// American spelling (eraser, mom). Every word has a picture.
import type { EnglishWord } from '../../english-types';
import { SVG_DESK, SVG_ERASER } from './look-svg-pictures';

/** Unit 1 — school things (8 core + 4 reading). */
export const LOOK_U1_WORDS: readonly EnglishWord[] = [
  { word: 'pen', gloss: 'bút mực', picture: '🖊️' },
  { word: 'pencil', gloss: 'bút chì', picture: '✏️' },
  { word: 'book', gloss: 'quyển sách', picture: '📖' },
  { word: 'bag', gloss: 'cặp sách', picture: '🎒' },
  { word: 'ruler', gloss: 'thước kẻ', picture: '📏' },
  { word: 'eraser', gloss: 'cục tẩy', picture: SVG_ERASER },
  { word: 'crayon', gloss: 'bút sáp màu', picture: '🖍️' },
  { word: 'desk', gloss: 'bàn học', picture: SVG_DESK },
  { word: 'notebook', gloss: 'vở', picture: '📓' },
  { word: 'scissors', gloss: 'kéo', picture: '✂️' },
  { word: 'glue', gloss: 'keo dán', picture: '🧴' },
  { word: 'lunchbox', gloss: 'hộp cơm trưa', picture: '🍱' },
];

/** Unit 2 — toys (8 core + 3 reading). */
export const LOOK_U2_WORDS: readonly EnglishWord[] = [
  { word: 'ball', gloss: 'quả bóng', picture: '⚽' },
  { word: 'doll', gloss: 'búp bê', picture: '🪆' },
  { word: 'kite', gloss: 'con diều', picture: '🪁' },
  { word: 'robot', gloss: 'rô-bốt', picture: '🤖' },
  { word: 'car', gloss: 'ô tô', picture: '🚗' },
  { word: 'train', gloss: 'tàu hỏa', picture: '🚂' },
  { word: 'teddy bear', gloss: 'gấu bông', picture: '🧸' },
  { word: 'blocks', gloss: 'khối xếp hình', picture: '🧱' },
  { word: 'yo-yo', gloss: 'con quay yo-yo', picture: '🪀' },
  { word: 'puzzle', gloss: 'trò xếp hình', picture: '🧩' },
  { word: 'balloon', gloss: 'quả bóng bay', picture: '🎈' },
];

/** Unit 3 — people and roles (8 core + 3 reading). */
export const LOOK_U3_WORDS: readonly EnglishWord[] = [
  { word: 'teacher', gloss: 'cô giáo', picture: '👩‍🏫' },
  { word: 'doctor', gloss: 'bác sĩ', picture: '🧑‍⚕️' },
  { word: 'farmer', gloss: 'nông dân', picture: '🧑‍🌾' },
  { word: 'cook', gloss: 'đầu bếp', picture: '🧑‍🍳' },
  { word: 'singer', gloss: 'ca sĩ', picture: '🧑‍🎤' },
  { word: 'police officer', gloss: 'cảnh sát', picture: '👮' },
  { word: 'firefighter', gloss: 'lính cứu hỏa', picture: '🧑‍🚒' },
  { word: 'driver', gloss: 'tài xế', picture: '🚗' },
  { word: 'student', gloss: 'học sinh', picture: '🧑‍🎓' },
  { word: 'pilot', gloss: 'phi công', picture: '👨‍✈️' },
  { word: 'artist', gloss: 'họa sĩ', picture: '👩‍🎨' },
];

/** Unit 4 — family (9 core + 3 reading). */
export const LOOK_U4_WORDS: readonly EnglishWord[] = [
  { word: 'mom', gloss: 'mẹ', picture: '👩' },
  { word: 'dad', gloss: 'bố', picture: '👨' },
  { word: 'brother', gloss: 'anh trai', picture: '👦' },
  { word: 'sister', gloss: 'chị gái', picture: '👧' },
  { word: 'baby', gloss: 'em bé', picture: '👶' },
  { word: 'grandma', gloss: 'bà', picture: '👵' },
  { word: 'grandpa', gloss: 'ông', picture: '👴' },
  { word: 'family', gloss: 'gia đình', picture: '👨‍👩‍👧' },
  { word: 'cousin', gloss: 'anh/chị/em họ', picture: '🧒' },
  { word: 'aunt', gloss: 'dì, cô', picture: '👱‍♀️' },
  { word: 'uncle', gloss: 'chú, bác', picture: '👱' },
  { word: 'friend', gloss: 'bạn', picture: '🧑' },
];
