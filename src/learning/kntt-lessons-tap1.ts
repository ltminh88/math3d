/**
 * SGK Toán 3 Kết nối tri thức, tập 1: bài 1–44.
 * Titles are short paraphrases (vi ≤ 40 chars), never copied sentences from the book.
 * Lesson numbers, topics and kinds follow the in-repo gap report and researcher notes.
 * `mix` = a review/practice lesson whose skills are the union of `mixOf` (earlier lessons).
 * B7 reviews grade-2 geometry/measurement, so it mixes nothing in this book and is not
 * practicable yet; B20 practises its geometry content (right angles, circles, plane
 * shapes) through its mix instead of the drawing part.
 */
import type { KnttLesson } from './kntt-lesson-index';

// biome-ignore format: one line per lesson (phase 01: tables stay under 200 lines).
export const KNTT_LESSONS_TAP1: readonly KnttLesson[] = Object.freeze([
  { n: 1, book: 1, topic: 1, titleVi: 'Ôn các số đến 1 000', titleEn: 'Review numbers to 1 000', kind: 'skills', practicable: true },
  { n: 2, book: 1, topic: 1, titleVi: 'Cộng, trừ trong phạm vi 1 000', titleEn: 'Add and subtract within 1 000', kind: 'skills', practicable: true },
  { n: 3, book: 1, topic: 1, titleVi: 'Tìm thành phần trong phép cộng, trừ', titleEn: 'Find the missing addend or subtrahend', kind: 'skills', practicable: true },
  { n: 4, book: 1, topic: 1, titleVi: 'Bảng nhân 2, 5 và bảng chia 2, 5', titleEn: 'Times tables 2 and 5', kind: 'tables', tables: [2, 5], practicable: true },
  { n: 5, book: 1, topic: 1, titleVi: 'Bảng nhân 3, bảng chia 3', titleEn: 'Times table 3', kind: 'tables', tables: [3], practicable: true },
  { n: 6, book: 1, topic: 1, titleVi: 'Bảng nhân 4, bảng chia 4', titleEn: 'Times table 4', kind: 'tables', tables: [4], practicable: true },
  { n: 7, book: 1, topic: 1, titleVi: 'Ôn tập hình học và đo lường', titleEn: 'Review shapes and measurement', kind: 'mix', mixOf: [], practicable: true },
  { n: 8, book: 1, topic: 1, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [1, 2, 3, 4, 5, 6, 7], practicable: true },
  { n: 9, book: 1, topic: 2, titleVi: 'Bảng nhân 6, bảng chia 6', titleEn: 'Times table 6', kind: 'tables', tables: [6], practicable: true },
  { n: 10, book: 1, topic: 2, titleVi: 'Bảng nhân 7, bảng chia 7', titleEn: 'Times table 7', kind: 'tables', tables: [7], practicable: true },
  { n: 11, book: 1, topic: 2, titleVi: 'Bảng nhân 8, bảng chia 8', titleEn: 'Times table 8', kind: 'tables', tables: [8], practicable: true },
  { n: 12, book: 1, topic: 2, titleVi: 'Bảng nhân 9, bảng chia 9', titleEn: 'Times table 9', kind: 'tables', tables: [9], practicable: true },
  { n: 13, book: 1, topic: 2, titleVi: 'Tìm thành phần trong phép nhân, chia', titleEn: 'Find the missing factor or divisor', kind: 'skills', practicable: true },
  { n: 14, book: 1, topic: 2, titleVi: 'Một phần mấy', titleEn: 'Unit fractions', kind: 'skills', practicable: true },
  { n: 15, book: 1, topic: 2, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [9, 10, 11, 12, 13, 14], practicable: true },
  { n: 16, book: 1, topic: 3, titleVi: 'Điểm ở giữa, trung điểm', titleEn: 'Midpoint of a segment', kind: 'skills', practicable: true },
  { n: 17, book: 1, topic: 3, titleVi: 'Hình tròn, tâm, bán kính, đường kính', titleEn: 'Circle: centre, radius, diameter', kind: 'skills', practicable: true },
  { n: 18, book: 1, topic: 3, titleVi: 'Góc vuông, góc không vuông', titleEn: 'Right angles', kind: 'skills', practicable: true },
  { n: 19, book: 1, topic: 3, titleVi: 'Các hình phẳng cơ bản', titleEn: 'Basic plane shapes', kind: 'skills', practicable: true },
  { n: 20, book: 1, topic: 3, titleVi: 'Thực hành vẽ hình', titleEn: 'Hands-on drawing practice', kind: 'mix', mixOf: [17, 18, 19], practicable: true },
  { n: 21, book: 1, topic: 3, titleVi: 'Khối lập phương, khối hộp chữ nhật', titleEn: 'Cubes and rectangular boxes', kind: 'skills', practicable: true },
  { n: 22, book: 1, topic: 3, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [16, 17, 18, 19, 20, 21], practicable: true },
  { n: 23, book: 1, topic: 4, titleVi: 'Nhân số hai chữ số với số một chữ số', titleEn: 'Multiply a 2-digit number by a 1-digit number', kind: 'skills', practicable: true },
  { n: 24, book: 1, topic: 4, titleVi: 'Gấp một số lên một số lần', titleEn: 'Multiply a number several times', kind: 'skills', practicable: true },
  { n: 25, book: 1, topic: 4, titleVi: 'Phép chia hết, phép chia có dư', titleEn: 'Exact division and division with remainder', kind: 'skills', practicable: true },
  { n: 26, book: 1, topic: 4, titleVi: 'Chia số hai chữ số cho số một chữ số', titleEn: 'Divide a 2-digit number by a 1-digit number', kind: 'skills', practicable: true },
  { n: 27, book: 1, topic: 4, titleVi: 'Giảm một số đi một số lần', titleEn: 'Divide a number down several times', kind: 'skills', practicable: true },
  { n: 28, book: 1, topic: 4, titleVi: 'Bài toán giải bằng hai bước tính', titleEn: 'Two-step word problems', kind: 'skills', practicable: true },
  { n: 29, book: 1, topic: 4, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [23, 24, 25, 26, 27, 28], practicable: true },
  { n: 30, book: 1, topic: 5, titleVi: 'Mi-li-mét', titleEn: 'Millimetres', kind: 'skills', practicable: true },
  { n: 31, book: 1, topic: 5, titleVi: 'Gam', titleEn: 'Grams', kind: 'skills', practicable: true },
  { n: 32, book: 1, topic: 5, titleVi: 'Mi-li-lít', titleEn: 'Millilitres', kind: 'skills', practicable: true },
  { n: 33, book: 1, topic: 5, titleVi: 'Nhiệt độ', titleEn: 'Temperature', kind: 'skills', practicable: true },
  { n: 34, book: 1, topic: 5, titleVi: 'Thực hành với các đơn vị đo', titleEn: 'Hands-on practice with units', kind: 'mix', mixOf: [30, 31, 32, 33], practicable: true },
  { n: 35, book: 1, topic: 5, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [30, 31, 32, 33, 34], practicable: true },
  { n: 36, book: 1, topic: 6, titleVi: 'Nhân số ba chữ số với số một chữ số', titleEn: 'Multiply a 3-digit number by a 1-digit number', kind: 'skills', practicable: true },
  { n: 37, book: 1, topic: 6, titleVi: 'Chia số ba chữ số cho số một chữ số', titleEn: 'Divide a 3-digit number by a 1-digit number', kind: 'skills', practicable: true },
  { n: 38, book: 1, topic: 6, titleVi: 'Biểu thức số', titleEn: 'Number expressions', kind: 'skills', practicable: true },
  { n: 39, book: 1, topic: 6, titleVi: 'Số lớn gấp mấy lần số bé', titleEn: 'How many times greater', kind: 'skills', practicable: true },
  { n: 40, book: 1, topic: 6, titleVi: 'Luyện tập chung', titleEn: 'Mixed practice', kind: 'mix', mixOf: [36, 37, 38, 39], practicable: true },
  { n: 41, book: 1, topic: 7, titleVi: 'Ôn tập nhân, chia phạm vi 100, 1 000', titleEn: 'Review multiplication and division within 100 and 1 000', kind: 'mix', mixOf: [4, 5, 6, 9, 10, 11, 12, 13, 23, 25, 26, 36, 37], practicable: true },
  { n: 42, book: 1, topic: 7, titleVi: 'Ôn tập biểu thức số', titleEn: 'Review number expressions', kind: 'mix', mixOf: [38], practicable: true },
  { n: 43, book: 1, topic: 7, titleVi: 'Ôn tập hình học và đo lường', titleEn: 'Review geometry and measurement', kind: 'mix', mixOf: [16, 17, 18, 19, 21, 30, 31, 32, 33, 34], practicable: true },
  { n: 44, book: 1, topic: 7, titleVi: 'Ôn tập chung', titleEn: 'General review', kind: 'mix', mixOf: [8, 15, 22, 29, 35, 40, 41, 42, 43], practicable: true },
]);
