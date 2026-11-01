import type { defineStrings } from '../../i18n/i18n';

/**
 * Valley strings (vi source, KNTT terms: trung điểm, tâm, bán kính, đường kính, góc vuông, ê-ke,
 * hình chữ nhật, hình vuông, khối lập phương, khối hộp chữ nhật, mặt, cạnh, đỉnh). Item texts
 * come from `src/geometry/geometry-strings.ts`. VLM is named through `tc('guideName')`.
 */
const define = (defineFn: typeof defineStrings) =>
  defineFn('valley', {
    vi: {
      title: 'Thung Lũng Hình Học',
      intro:
        'Gió thổi bay hết đá hình rồi! Mình cùng tìm trung điểm, đo hình tròn, thử ê-ke và xếp khối để dựng lại vườn đá nhé!',
      round: 'Viên đá {n}/{total}',
      actMidpoint: 'Chạm vào viên đá ở chính giữa khúc gỗ AB nhé!',
      actCentre: 'Chạm vào tâm O của hình tròn nhé!',
      actCentreRow: 'Chạm vào tâm của một hình tròn nhé!',
      actSetSquare: 'Chạm vào một góc để đặt ê-ke vào thử nhé!',
      actLift: 'Chạm vào khối đá để nhấc lên xem các mặt nhé!',
      answerNow: 'Giờ trả lời câu hỏi nhé!',
      tapShapes: 'Chạm vào hình hoặc bấm thẻ chữ để chọn.',
      tStone: 'Viên đá {n}',
      tPoint: 'Điểm {l}',
      tCentre: 'Tâm hình tròn {n}',
      tAngle: 'Góc {l}',
      tCorner: 'Góc {n}',
      tShape: 'Hình {l}',
      tBlock: 'Khối {l}',
      midFound: 'Đúng rồi, đây là điểm ở chính giữa A và B!',
      centreFound: 'Đúng rồi, đây là tâm O!',
      centreRowFound: 'Đúng rồi! Đường kính gồm hai bán kính đấy.',
      ekeFits: 'Ê-ke vừa khít: góc vuông!',
      ekeMisses: 'Ê-ke không khít: góc không vuông.',
      lifted: 'Khối đá đã nhấc lên, các mặt được tô màu!',
      notThere: 'Chưa phải chỗ này, thử chỗ khác nhé!',
      wrong: 'Chưa đúng, mình thử lại nhé!',
      stepRight: 'Đúng rồi! Làm tiếp nhé.',
      correct: 'Đúng rồi! Viên đá bay về vườn rồi!',
      revealed: 'Mình cùng xem đáp án nhé. Viên đá vẫn bay về vườn!',
      hint: 'Gợi ý',
      rotateLeft: 'Xoay trái',
      rotateRight: 'Xoay phải',
      next: 'Viên đá tiếp theo',
      nextLast: 'Dựng xong vườn đá',
      hint1: 'Nhìn thật kỹ hình rồi thử lại nhé. Bạn làm được mà!',
      defMidpoint: 'M là trung điểm của đoạn thẳng AB khi M ở giữa A và B, và AM dài bằng MB.',
      defCircle:
        'Bán kính nối tâm O với một điểm trên đường tròn. Đường kính đi qua tâm O, nối hai điểm trên đường tròn, gồm hai bán kính.',
      defRightAngle:
        'Góc vuông vừa khít góc của ê-ke. Hình có xoay nghiêng thì góc vuông vẫn là góc vuông.',
      def_triangle: 'Hình tam giác có ba cạnh và ba góc.',
      def_quad: 'Hình tứ giác có bốn cạnh và bốn góc.',
      def_rect:
        'Hình chữ nhật có bốn góc vuông, hai cạnh dài bằng nhau và hai cạnh ngắn bằng nhau.',
      def_square: 'Hình vuông có bốn góc vuông và bốn cạnh dài bằng nhau.',
      defCount: 'Đếm các hình nhỏ trước, rồi đếm tiếp các hình ghép từ hai, ba hình nhỏ.',
      defCube: 'Khối lập phương có tất cả các cạnh dài bằng nhau.',
      defParts:
        'Mặt là phần phẳng của khối, cạnh là chỗ hai mặt gặp nhau, đỉnh là chỗ các cạnh gặp nhau. Nhớ đếm cả phía sau nhé!',
      aidMidpoint: 'Nhìn hai phần của khúc gỗ được tô hai màu, đếm vạch từng xăng-ti-mét nhé.',
      aidCircle: 'Nhìn đường nét đứt: nó đi qua tâm O, gồm hai bán kính.',
      aidRightAngle: 'Ê-ke mẫu nằm ở góc bảng. Đặt ê-ke vào từng góc: góc vuông khít cả hai cạnh.',
      aidShapes: 'Các đỉnh đã được đánh dấu. Đếm số cạnh, số góc của từng hình nhé.',
      aidSolids: 'Mỗi mặt một màu, khối đá xoay chầm chậm. Đếm cả phía sau nhé.',
      doneTitle: 'Vườn đá dựng xong rồi!',
      doneLine: 'Bạn đã tìm trung điểm, đo hình tròn, thử ê-ke và xếp khối. Giỏi quá!',
      doneScore: '+{xp} XP · +{coins} xu',
      bonusLine: 'Thưởng lần đầu hoàn thành: +{xp} XP · +{coins} xu',
      stars: '{n}/3 sao',
      backToGate: 'Về cổng',
      keysHelp:
        'Mũi tên chọn điểm, Enter để chạm. Phím 1-4 chọn thẻ, gõ số rồi Enter, H gợi ý, R xoay.',
      reward: '+{xp} XP',
      ekeMark: '✓',
      ekeMiss: '✗',
    },
    en: {
      title: 'Geometry Valley',
      intro:
        'The wind blew the shape stones away! Let’s find midpoints, measure circles, try the set square and stack blocks to rebuild the stone garden!',
      round: 'Stone {n}/{total}',
      actMidpoint: 'Tap the stone right in the middle of log AB!',
      actCentre: 'Tap the centre O of the circle!',
      actCentreRow: 'Tap the centre of one circle!',
      actSetSquare: 'Tap a corner to try the set square on it!',
      actLift: 'Tap the block to lift it and see its faces!',
      answerNow: 'Now answer the question!',
      tapShapes: 'Tap a shape or its letter card to choose.',
      tStone: 'Stone {n}',
      tPoint: 'Point {l}',
      tCentre: 'Centre of circle {n}',
      tAngle: 'Angle {l}',
      tCorner: 'Corner {n}',
      tShape: 'Shape {l}',
      tBlock: 'Block {l}',
      midFound: 'Right, this point is exactly between A and B!',
      centreFound: 'Right, this is the centre O!',
      centreRowFound: 'Right! A diameter is two radii.',
      ekeFits: 'The set square fits: a right angle!',
      ekeMisses: 'The set square does not fit: not a right angle.',
      lifted: 'The block is lifted and its faces are coloured!',
      notThere: 'Not here, try another spot!',
      wrong: 'Not yet, let’s try again!',
      stepRight: 'Right! Keep going.',
      correct: 'Right! The stone flies back to the garden!',
      revealed: 'Let’s look at the answer together. The stone still flies back!',
      hint: 'Hint',
      rotateLeft: 'Turn left',
      rotateRight: 'Turn right',
      next: 'Next stone',
      nextLast: 'Finish the garden',
      hint1: 'Look at the picture carefully and try again. You can do it!',
      defMidpoint:
        'M is the midpoint of segment AB when M is between A and B and AM is as long as MB.',
      defCircle:
        'A radius joins the centre O to a point on the circle. A diameter goes through O and joins two points on the circle: it is two radii.',
      defRightAngle:
        'A right angle fits the corner of the set square. A turned shape still has its right angles.',
      def_triangle: 'A triangle has three sides and three angles.',
      def_quad: 'A quadrilateral has four sides and four angles.',
      def_rect:
        'A rectangle has four right angles, two equal long sides and two equal short sides.',
      def_square: 'A square has four right angles and four equal sides.',
      defCount: 'Count the small shapes first, then the shapes made of two or three small ones.',
      defCube: 'A cube has all its edges the same length.',
      defParts:
        'A face is a flat side, an edge is where two faces meet, a vertex is where edges meet. Count the back too!',
      aidMidpoint: 'Look at the two coloured parts of the log and count each centimetre mark.',
      aidCircle: 'Look at the dashed line: it goes through O and is two radii.',
      aidRightAngle:
        'A spare set square sits in the corner of the board. A right angle fits both of its edges.',
      aidShapes: 'The corners are marked. Count the sides and angles of each shape.',
      aidSolids: 'Each face has its own colour and the block turns slowly. Count the back too.',
      doneTitle: 'The stone garden is rebuilt!',
      doneLine:
        'You found midpoints, measured circles, tried the set square and stacked blocks. Great job!',
      doneScore: '+{xp} XP · +{coins} coins',
      bonusLine: 'First-clear bonus: +{xp} XP · +{coins} coins',
      stars: '{n}/3 stars',
      backToGate: 'Back to the gate',
      keysHelp:
        'Arrows pick a point, Enter taps it. Keys 1-4 pick a card, type a number and Enter, H for a hint, R to turn.',
      reward: '+{xp} XP',
      ekeMark: '✓',
      ekeMiss: '✗',
    },
  });

export type ValleyStrings = ReturnType<typeof define>;
export type ValleyKey = Parameters<ValleyStrings>[0];

/** Renders a key built at run time (hint ladder, target names): keys are checked by the tests. */
export const valleyText = (
  vs: ValleyStrings,
  key: string,
  params?: Readonly<Record<string, string | number>>,
): string => vs(key as ValleyKey, params);
let cached: ValleyStrings | undefined;

/** The valley translator (namespace registered on first use, reused by later runs). */
export function valleyStrings(defineFn: typeof defineStrings): ValleyStrings {
  cached ??= define(defineFn);
  return cached;
}
