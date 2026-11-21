/**
 * SGK Toán 3 Kết nối tri thức, tập 2: bài 45–81.
 * Titles are short paraphrases (vi ≤ 40 chars), never copied sentences from the book.
 * Lesson numbers, topics and kinds follow the in-repo gap report and researcher notes.
 * `mix` = a review/practice lesson whose skills are the union of `mixOf` (earlier lessons).
 * B76–B81 review the whole second book; B81 mixes the other review lessons, which
 * transitively covers every HK2 skill.
 */
import type { KnttLesson } from './kntt-lesson-index';

// biome-ignore format: one line per lesson (phase 01: tables stay under 200 lines).
export const KNTT_LESSONS_TAP2: readonly KnttLesson[] = Object.freeze([
  { n: 45, book: 2, topic: 8, titleVi: 'Các số có bốn chữ số, số 10 000', titleEn: '4-digit numbers and 10 000', kind: 'skills', practicable: true },
  { n: 46, book: 2, topic: 8, titleVi: 'So sánh các số trong phạm vi 10 000', titleEn: 'Compare numbers within 10 000', kind: 'skills', practicable: true },
  { n: 47, book: 2, topic: 8, titleVi: 'Số La Mã', titleEn: 'Roman numerals', kind: 'skills', practicable: true },
  { n: 48, book: 2, topic: 8, titleVi: 'Làm tròn số đến hàng chục, hàng trăm', titleEn: 'Round to tens and hundreds', kind: 'skills', practicable: true },
  { n: 49, book: 2, topic: 8, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [45, 46, 47, 48], practicable: true },
  { n: 50, book: 2, topic: 9, titleVi: 'Chu vi các hình phẳng', titleEn: 'Perimeter of plane shapes', kind: 'skills', practicable: true },
  { n: 51, book: 2, topic: 9, titleVi: 'Diện tích, xăng-ti-mét vuông', titleEn: 'Area and square centimetres', kind: 'skills', practicable: true },
  { n: 52, book: 2, topic: 9, titleVi: 'Diện tích hình chữ nhật, hình vuông', titleEn: 'Area of rectangles and squares', kind: 'skills', practicable: true },
  { n: 53, book: 2, topic: 9, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [50, 51, 52], practicable: true },
  { n: 54, book: 2, topic: 10, titleVi: 'Phép cộng trong phạm vi 10 000', titleEn: 'Add within 10 000', kind: 'skills', practicable: true },
  { n: 55, book: 2, topic: 10, titleVi: 'Phép trừ trong phạm vi 10 000', titleEn: 'Subtract within 10 000', kind: 'skills', practicable: true },
  { n: 56, book: 2, topic: 10, titleVi: 'Nhân số bốn chữ số với số một chữ số', titleEn: 'Multiply a 4-digit number by a 1-digit number', kind: 'skills', practicable: true },
  { n: 57, book: 2, topic: 10, titleVi: 'Chia số bốn chữ số cho số một chữ số', titleEn: 'Divide a 4-digit number by a 1-digit number', kind: 'skills', practicable: true },
  { n: 58, book: 2, topic: 10, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [54, 55, 56, 57], practicable: true },
  { n: 59, book: 2, topic: 11, titleVi: 'Các số có năm chữ số, số 100 000', titleEn: '5-digit numbers and 100 000', kind: 'skills', practicable: true },
  { n: 60, book: 2, topic: 11, titleVi: 'So sánh các số trong phạm vi 100 000', titleEn: 'Compare numbers within 100 000', kind: 'skills', practicable: true },
  { n: 61, book: 2, topic: 11, titleVi: 'Làm tròn đến hàng nghìn, chục nghìn', titleEn: 'Round to thousands and ten-thousands', kind: 'skills', practicable: true },
  { n: 62, book: 2, topic: 11, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [59, 60, 61], practicable: true },
  { n: 63, book: 2, topic: 12, titleVi: 'Phép cộng trong phạm vi 100 000', titleEn: 'Add within 100 000', kind: 'skills', practicable: true },
  { n: 64, book: 2, topic: 12, titleVi: 'Phép trừ trong phạm vi 100 000', titleEn: 'Subtract within 100 000', kind: 'skills', practicable: true },
  { n: 65, book: 2, topic: 12, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [63, 64], practicable: true },
  { n: 66, book: 2, topic: 13, titleVi: 'Xem đồng hồ', titleEn: 'Tell the time', kind: 'skills', practicable: true },
  { n: 67, book: 2, topic: 13, titleVi: 'Thực hành xem đồng hồ, xem lịch', titleEn: 'Practise telling time and reading the calendar', kind: 'mix', mixOf: [66], practicable: true },
  { n: 68, book: 2, topic: 13, titleVi: 'Tiền Việt Nam', titleEn: 'Vietnamese money', kind: 'skills', practicable: true },
  { n: 69, book: 2, topic: 13, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [66, 67, 68], practicable: true },
  { n: 70, book: 2, topic: 14, titleVi: 'Nhân số năm chữ số với số một chữ số', titleEn: 'Multiply a 5-digit number by a 1-digit number', kind: 'skills', practicable: true },
  { n: 71, book: 2, topic: 14, titleVi: 'Chia số năm chữ số cho số một chữ số', titleEn: 'Divide a 5-digit number by a 1-digit number', kind: 'skills', practicable: true },
  { n: 72, book: 2, topic: 14, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [70, 71], practicable: true },
  { n: 73, book: 2, topic: 15, titleVi: 'Thu thập số liệu, bảng số liệu', titleEn: 'Collect data and read data tables', kind: 'skills', practicable: true },
  { n: 74, book: 2, topic: 15, titleVi: 'Khả năng xảy ra của một sự kiện', titleEn: 'Chance of an event', kind: 'skills', practicable: true },
  { n: 75, book: 2, topic: 15, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [73, 74], practicable: true },
  { n: 76, book: 2, topic: 16, titleVi: 'Ôn tập các số đến 100 000', titleEn: 'Review numbers to 100 000', kind: 'mix', mixOf: [45, 46, 47, 48, 59, 60, 61], practicable: true },
  { n: 77, book: 2, topic: 16, titleVi: 'Ôn tập cộng, trừ trong phạm vi 100 000', titleEn: 'Review addition and subtraction within 100 000', kind: 'mix', mixOf: [54, 55, 63, 64], practicable: true },
  { n: 78, book: 2, topic: 16, titleVi: 'Ôn tập nhân, chia trong phạm vi 100 000', titleEn: 'Review multiplication and division within 100 000', kind: 'mix', mixOf: [56, 57, 70, 71], practicable: true },
  { n: 79, book: 2, topic: 16, titleVi: 'Ôn tập hình học và đo lường', titleEn: 'Review geometry and measurement', kind: 'mix', mixOf: [16, 17, 18, 19, 21, 30, 31, 32, 33, 34, 50, 51, 52], practicable: true },
  { n: 80, book: 2, topic: 16, titleVi: 'Ôn tập bảng số liệu, khả năng xảy ra', titleEn: 'Review data tables and chance', kind: 'mix', mixOf: [73, 74], practicable: true },
  { n: 81, book: 2, topic: 16, titleVi: 'Ôn tập chung', titleEn: 'General review', kind: 'mix', mixOf: [49, 53, 58, 62, 65, 69, 72, 75, 76, 77, 78, 79, 80], practicable: true },
]);
