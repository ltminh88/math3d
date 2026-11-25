// Per-skill explanations shown when a child answers wrong in the lesson/daily dialog
// (R35). Each key names one likely confusion; the sentence points at the mistake with
// the question's own numbers and never states the answer. Lanes 2–3 add their keys here.
import { defineStrings } from '../i18n/i18n';

export const twa = defineStrings('wrongAnswer', {
  vi: {
    // Nhóm 1 — tìm thành phần chưa biết (unknown-add-sub / unknown-mul-div + WP)
    unknownWrongInverseAdd:
      'Bạn cộng {s} với {a} rồi, nhưng dấu ? cần phép trừ. Mình thử lấy {s} trừ {a} xem bằng mấy nhé.',
    unknownWrongInverseMul:
      'Bạn lấy {p} trừ {n} rồi, nhưng dấu ? cần phép chia. Mình thử lấy {p} chia cho {n} xem bằng mấy nhé.',
    unknownWrongInverseDivBoxes:
      'Bạn lấy {p} trừ {q} rồi, nhưng dấu ? cần phép chia. Mình thử lấy {p} chia cho {q} xem bằng mấy nhé.',
    unknownWrongInverseDivShareSub:
      'Bạn lấy {q} trừ {n} rồi, nhưng dấu ? cần phép nhân. Mình thử lấy {n} nhân {q} xem bằng mấy nhé.',
    unknownWrongInverseDivShareAdd:
      'Bạn cộng {n} với {q} rồi, nhưng dấu ? cần phép nhân. Mình thử lấy {n} nhân {q} xem bằng mấy nhé.',
    unknownGivenNumberAdd:
      'Số {s} là tổng, bạn còn phải trừ {a} nữa. Mình thử lấy {s} trừ {a} xem bằng mấy nhé.',
    unknownGivenMinuend:
      'Số {s} là số bị trừ, bạn còn phải trừ {a} nữa. Mình thử lấy {s} trừ {a} xem bằng mấy nhé.',
    unknownGivenNumberMul:
      'Số {p} là tích, bạn còn phải chia cho {n} nữa. Mình thử lấy {p} chia cho {n} xem bằng mấy nhé.',
    unknownGivenNumberDivBoxes:
      'Số {q} là thương, bạn còn phải tìm số chia. Mình thử lấy {p} chia cho {q} xem bằng mấy nhé.',
    unknownGivenNumberDivShare:
      'Số {q} là thương, bạn còn phải nhân {n} với {q}. Mình thử lấy {n} nhân {q} xem bằng mấy nhé.',
    unknownGivenDividend:
      'Số {p} là số bị chia, bạn còn phải chia cho {q} nữa. Mình thử lấy {p} chia cho {q} xem bằng mấy nhé.',
    unknownGivenAddend:
      'Bạn điền số {a} rồi, nhưng {a} là số đã cho trong đề. Mình thử lấy {s} trừ {a} xem bằng mấy nhé.',
    unknownGivenFactor:
      'Bạn điền số {n} rồi, nhưng {n} là số đã cho trong đề. Mình thử lấy {p} chia cho {n} xem bằng mấy nhé.',
    unknownGivenDivisorShare:
      'Bạn điền số {n} rồi, nhưng {n} là số đã cho trong đề. Mình thử lấy {n} nhân {q} xem bằng mấy nhé.',
    unknownSubFirstRightSide:
      'Vế phải bằng {s} trừ {a}, bạn còn phải cộng {a} nữa. Mình thử cộng thêm {a} xem bằng mấy nhé.',
    unknownSubFirstDoubleSub:
      'Bạn trừ {a} thêm một lần nữa rồi. Vế phải bằng {s} trừ {a}, mình cộng thêm {a} nhé.',
    unknownSubFirstGivenA:
      'Số {a} là số trừ đi, bạn còn phải cộng thêm {a} vào {b}. Mình thử lấy {b} cộng {a} xem bằng mấy nhé.',
    unknownPartAddInstead:
      'Bạn cộng {b} với {c} rồi, nhưng chỗ này cần phép nhân. Mình thử lấy {b} nhân {c} xem bằng mấy nhé.',
    unknownPartSubInstead:
      'Bạn lấy {b} trừ {c} rồi, nhưng chỗ này cần phép nhân. Mình thử lấy {b} nhân {c} xem bằng mấy nhé.',
    unknownPartUsedA:
      'Bạn dùng số {a} rồi. Vế phải chỉ có {b} và {c}, mình thử lấy {b} nhân {c} nhé.',
    unknownPartMulInstead:
      'Bạn nhân {a} với {b} rồi, nhưng chỗ này cần phép cộng. Mình thử lấy {a} cộng {b} xem bằng mấy nhé.',
    unknownPartSubInsteadAdd:
      'Bạn lấy {a} trừ {b} rồi, nhưng chỗ này cần phép cộng. Mình thử lấy {a} cộng {b} xem bằng mấy nhé.',
    unknownPartOneAddend:
      'Bạn mới lấy số {a} thôi, vế phải còn cộng thêm {b} nữa. Mình cộng {a} với {b} xem bằng mấy nhé.',
    unknownForgotStep:
      'Bạn tính xong {b} nhân {c} rồi, còn phải cộng {a} nữa. Mình cộng thêm {a} rồi thử lại nhé.',
    unknownForgotStepSub:
      'Bạn trừ {a} rồi, nhưng phải cộng {a} mới đúng. Mình cộng thêm {a} rồi thử lại nhé.',
    unknownForgotDivide:
      'Bạn tính xong {a} cộng {b} rồi, còn phải chia cho {n} nữa. Mình chia {p} cho {n} rồi thử lại nhé.',
    unknown1Fallback: 'Số còn thiếu phải thử lại vào dấu ?, xem hai bên có bằng nhau không.',
    // Nhóm 2 — bài toán hai bước (wp-times-then-sub / wp-divide-then-sub)
    wp2Step0AddInstead:
      'Bạn cộng {a} với {n} rồi, nhưng gấp {n} lần là phép nhân. Mình thử lấy {a} nhân {n} xem bằng mấy nhé.',
    wp2Step0ForgotTimes:
      'Số {a} là của bạn thứ nhất, bạn thứ hai gấp {n} lần cơ. Mình thử lấy {a} nhân {n} xem bằng mấy nhé.',
    wp2Step0GenericTimes:
      'Bạn thứ hai gấp {n} lần bạn thứ nhất đó. Mình thử lấy {a} nhân {n} xem bằng mấy nhé.',
    wp2ForgotStep2:
      'Bạn mới tính {a} nhân {n} thôi, còn phải trừ {a} nữa. Mình trừ {a} rồi thử lại nhé.',
    wp2AddInsteadSub:
      'Bạn cộng thêm {a} rồi, nhưng bài hỏi còn lại nên phải trừ {a}. Mình thử trừ {a} xem còn bao nhiêu nhé.',
    wp2SubFirst:
      'Bạn trừ {a} cho {a} trước nên hết sạch, hãy nhân trước rồi mới trừ. Mình tính {a} nhân {n} trước đã nhé.',
    wp2SubNInsteadA:
      'Bạn trừ {n} rồi, nhưng bài trừ đi {a} cơ. Mình thử trừ {a} xem còn bao nhiêu nhé.',
    wp2Step0SubInstead:
      'Bạn lấy {a} trừ {n} rồi, nhưng giảm {n} lần là phép chia. Mình thử lấy {a} chia cho {n} xem bằng mấy nhé.',
    wp2Step0MulInstead:
      'Bạn nhân {a} với {n} rồi, nhưng giảm {n} lần là phép chia. Mình thử lấy {a} chia cho {n} xem bằng mấy nhé.',
    wp2Step0ForgotDivide:
      'Số {a} là của bạn thứ nhất, bạn thứ hai giảm {n} lần cơ. Mình thử lấy {a} chia cho {n} xem bằng mấy nhé.',
    wp2Step0GenericDivide:
      'Bạn thứ hai giảm {n} lần bạn thứ nhất đó. Mình thử lấy {a} chia cho {n} xem bằng mấy nhé.',
    wp2ForgotStep2Divide: 'Bạn mới tìm số của bạn thứ hai thôi, còn phải lấy {a} trừ số đó nữa.',
    wp2AddInsteadSubDivide:
      'Bạn cộng thêm số của bạn thứ hai rồi, nhưng bài hỏi còn lại nên phải trừ đi. Mình thử trừ số đó khỏi {a} nhé.',
    wp2MulInsteadDivide:
      'Bạn nhân {a} với {n} rồi, nhưng giảm {n} lần là phép chia. Mình thử lấy {a} chia cho {n} trước đã nhé.',
    wp2PickOneStep: 'Bạn mới chọn bước đầu thôi, bài còn một bước trừ nữa.',
    wp2PickAddInstead:
      'Bạn chọn cộng thêm {a} rồi, nhưng bài hỏi còn lại nên phải trừ {a}. Mình chọn phép trừ {a} nhé.',
    wp2PickSubN:
      'Bạn trừ {n} khỏi {a} rồi, nhưng phải nhân {a} với {n} trước đã. Mình tính {a} nhân {n} trước nhé.',
    wp2PickAddInsteadDivide:
      'Bạn chọn cộng thêm rồi, nhưng bài hỏi còn lại nên phải trừ. Mình chọn phép trừ nhé.',
    wp2PickMulInsteadDivide:
      'Bạn nhân {a} với {n} rồi, nhưng giảm {n} lần là phép chia. Mình chọn phép chia nhé.',
    wp2Fallback: 'Bạn đọc lại đề chậm nhé, bài hỏi còn lại bao nhiêu sau hai bước.',
    // Nhóm 3 — trung điểm (geo-midpoint-length)
    mid1Whole:
      'Bạn điền cả đoạn AB dài {len} cm, còn phải trừ AM dài {am} cm nữa. Mình lấy {len} trừ {am} xem bằng mấy nhé.',
    mid1AmInstead:
      'Bạn điền AM dài {am} cm, nhưng bài hỏi đoạn MB còn lại. Mình nhìn hình xem MB là đoạn nào nhé.',
    mid1AddInstead:
      'Bạn cộng {len} với {am} rồi, nhưng MB là phần còn lại sau khi trừ. Mình lấy {len} trừ {am} xem bằng mấy nhé.',
    mid1HalfInstead:
      'Bạn chia đôi cả đoạn AB, nhưng M chưa chắc là trung điểm đâu. Mình lấy {len} trừ {am} xem bằng mấy nhé.',
    mid2OnePart:
      'Bạn mới lấy một đoạn thôi, AB gồm cả AM và MB gộp lại. Mình cộng AM với MB xem bằng mấy nhé.',
    mid3Whole:
      'Bạn điền cả đoạn AB dài {len} cm, M là trung điểm nên AM chỉ bằng một nửa. Mình chia {len} thành hai phần bằng nhau nhé.',
    mid3Quarter:
      'Bạn chia AB thành bốn phần rồi, trung điểm chỉ chia AB thành hai phần bằng nhau. Mình chia {len} thành hai phần bằng nhau nhé.',
    midFallback: 'Bạn nhìn hình nhé, điểm M nằm ở đâu trên đoạn AB.',
    // Nhóm 4 — diện tích đếm ô (meas-area-count / meas-area-equal)
    areaMissOne: 'Bạn đếm sót một ô rồi. Đếm lại từng ô, đánh dấu ô đã đếm nhé.',
    areaExtraOne: 'Bạn đếm thừa một ô rồi. Đếm lại từng ô, đánh dấu ô đã đếm nhé.',
    areaEqualThoughtBigger: 'Hai hình có số ô bằng nhau đó. Bạn đếm lại số ô mỗi hình nhé.',
    areaEqualThoughtSame: 'Hai hình chưa bằng nhau đâu. Bạn đếm lại xem hình nào nhiều ô hơn nhé.',
    areaEqualReversed: 'Bạn đếm lại số ô hình A và hình B nhé, hình nào nhiều ô hơn?',
    areaForgotSub: 'Hình A có {a} ô, hình B có {b} ô. Bạn trừ đi số ô hình B nhé.',
    areaAddInstead: 'Hỏi hơn nhau bao nhiêu thì mình trừ đi, không cộng đâu nhé.',
    areaWrongUnit: 'Diện tích đếm bằng ô vuông, nên đơn vị là xăng-ti-mét vuông nhé.',
    areaDiffIsB: 'Bạn điền số ô của hình B rồi. Hiệu là số ô hình A trừ hình B, bạn thử lại nhé.',
    areaFallback: 'Bạn đếm lại từng ô một nhé, ô nào đã đếm thì đánh dấu lại.',
    // Nhóm 5 — phân số chia đều (fraction-wp + fraction-of-set-*)
    fracForgetDivide: 'Bạn lấy cả {count} cái rồi. Chỉ lấy 1/{n} số đó thôi nhé.',
    fracWrongDenominator:
      'Số {n} là số phần chia, không phải số mỗi phần. Bạn chia {count} thành {n} phần bằng nhau nhé.',
    fracLeftOnePart: 'Bạn vừa tính được một phần rồi. Còn lại thì lấy {count} trừ đi phần đó nhé.',
    fracKPartsOnePart:
      'Bạn mới tính một phần thôi. Bài hỏi {k} phần, mình nhân một phần với {k} nhé.',
    fracKPartsWhole:
      'Bạn lấy cả {count} cái rồi. Bài hỏi {k} phần thôi, mình nhân một phần với {k} nhé.',
    fracKPartsK: 'Số {k} chỉ là số phần cần tính thôi. Bạn nhân một phần với {k} xem bằng mấy nhé.',
    fracFallback: 'Nhớ nhé, 1/{n} là một phần trong {n} phần bằng nhau của {count}.',
    // Nhóm 6 — đồng hồ số La Mã / sáng–chiều (roman-clock-hour / clock-sang-chieu-24h)
    clockWrongPeriodAfternoon: 'Đồng hồ chỉ {h} giờ, mà đang buổi chiều. Bạn cộng thêm 12 giờ nhé.',
    clockWrongPeriodEvening: 'Đồng hồ chỉ {h} giờ, mà đang buổi tối. Bạn cộng thêm 12 giờ nhé.',
    clockFiveMin: 'Kim phút đang ở vạch {mark}. Mỗi vạch là 5 phút nhé.',
    clockRomanSubtractive: 'Bạn nhìn lại chữ La Mã nhé, chữ I đứng trước hay sau chữ {big} đó?',
    clockNearHour: 'Bạn nhìn lại kim giờ nhé, nó gần số nào nhất?',
    clockSangChieuFallback:
      'Bạn xem buổi trong đề rồi cộng thêm 12 giờ nếu là buổi chiều hay tối nhé.',
    clockRomanFallback:
      'Bạn đọc lại chữ La Mã trên mặt đồng hồ nhé, nhìn kĩ chữ I đứng trước hay sau.',
  },
  en: {
    unknownWrongInverseAdd:
      'You added {s} and {a}, but ? needs a subtraction. Try {s} minus {a} and see what you get.',
    unknownWrongInverseMul:
      'You took {n} away from {p}, but ? needs a division. Try {p} divided by {n} and see what you get.',
    unknownWrongInverseDivBoxes:
      'You took {q} away from {p}, but ? needs a division. Try {p} divided by {q} and see what you get.',
    unknownWrongInverseDivShareSub:
      'You took {n} away from {q}, but ? needs a multiplication. Try {n} times {q} and see what you get.',
    unknownWrongInverseDivShareAdd:
      'You added {n} and {q}, but ? needs a multiplication. Try {n} times {q} and see what you get.',
    unknownGivenNumberAdd:
      '{s} is the total; you still need to take away {a}. Try {s} minus {a} and see what you get.',
    unknownGivenMinuend:
      '{s} is the number you start with; you still need to take away {a}. Try {s} minus {a} and see what you get.',
    unknownGivenNumberMul:
      '{p} is the product; you still need to divide it by {n}. Try {p} divided by {n} and see what you get.',
    unknownGivenNumberDivBoxes:
      '{q} is the quotient; you still need to find the divisor. Try {p} divided by {q} and see what you get.',
    unknownGivenNumberDivShare:
      '{q} is the quotient; you still need to multiply {n} by {q}. Try {n} times {q} and see what you get.',
    unknownGivenDividend:
      '{p} is the dividend; you still need to divide it by {q}. Try {p} divided by {q} and see what you get.',
    unknownGivenAddend:
      'You wrote {a}, but {a} is already in the question. Try {s} minus {a} and see what you get.',
    unknownGivenFactor:
      'You wrote {n}, but {n} is already in the question. Try {p} divided by {n} and see what you get.',
    unknownGivenDivisorShare:
      'You wrote {n}, but {n} is already in the question. Try {n} times {q} and see what you get.',
    unknownSubFirstRightSide:
      'The right side is {s} minus {a}; you still need to add {a}. Try adding {a} and see what you get.',
    unknownSubFirstDoubleSub:
      'You took away {a} one more time. The right side is {s} minus {a}, so add {a} back.',
    unknownSubFirstGivenA:
      'The number {a} is what gets taken away; you still need to add {a} to {b}. Try {b} plus {a} and see what you get.',
    unknownPartAddInstead:
      'You added {b} and {c}, but this part needs a multiplication. Try {b} times {c} and see what you get.',
    unknownPartSubInstead:
      'You took {c} away from {b}, but this part needs a multiplication. Try {b} times {c} and see what you get.',
    unknownPartUsedA: 'You used {a}. The right side only has {b} and {c}; try {b} times {c}.',
    unknownPartMulInstead:
      'You multiplied {a} by {b}, but this part needs an addition. Try {a} plus {b} and see what you get.',
    unknownPartSubInsteadAdd:
      'You took {b} away from {a}, but this part needs an addition. Try {a} plus {b} and see what you get.',
    unknownPartOneAddend:
      'You only took {a}; the right side also adds {b}. Try {a} plus {b} and see what you get.',
    unknownForgotStep:
      'You worked out {b} times {c}; now add {a} as well. Add {a}, then try again.',
    unknownForgotStepSub: 'You took away {a}, but you need to add {a}. Add {a}, then try again.',
    unknownForgotDivide:
      'You worked out {a} plus {b}; now divide by {n} as well. Divide {p} by {n}, then try again.',
    unknown1Fallback: 'Put your number back in place of ? and check both sides match.',
    wp2Step0AddInstead:
      'You added {a} and {n}, but {n} times as many means multiply. Try {a} times {n} and see what you get.',
    wp2Step0ForgotTimes:
      '{a} is the first friend’s number; the second friend has {n} times as many. Try {a} times {n} and see what you get.',
    wp2Step0GenericTimes:
      'The second friend has {n} times as many as the first. Try {a} times {n} and see what you get.',
    wp2ForgotStep2:
      'You only worked out {a} times {n} so far; now take away {a}. Take away {a}, then try again.',
    wp2AddInsteadSub:
      'You added {a}, but the question asks what is left, so take away {a}. Try taking away {a} and see what is left.',
    wp2SubFirst:
      'You took {a} away first and got nothing left; multiply first, then subtract. Work out {a} times {n} first.',
    wp2SubNInsteadA:
      'You took away {n}, but the question takes away {a}. Try taking away {a} and see what is left.',
    wp2Step0SubInstead:
      'You took {n} away from {a}, but {n} times fewer means division. Try {a} divided by {n} and see what you get.',
    wp2Step0MulInstead:
      'You multiplied {a} by {n}, but {n} times fewer means division. Try {a} divided by {n} and see what you get.',
    wp2Step0ForgotDivide:
      '{a} is the first friend’s number; the second friend has {n} times fewer. Try {a} divided by {n} and see what you get.',
    wp2Step0GenericDivide:
      'The second friend has {n} times fewer than the first. Try {a} divided by {n} and see what you get.',
    wp2ForgotStep2Divide:
      'You only found the second friend’s number so far; now take it away from {a}.',
    wp2AddInsteadSubDivide:
      'You added the second friend’s number, but the question asks what is left, so subtract. Try taking that number away from {a}.',
    wp2MulInsteadDivide:
      'You multiplied {a} by {n}, but {n} times fewer means division. Try {a} divided by {n} first.',
    wp2PickOneStep: 'You only picked the first step; there is one more subtraction to do.',
    wp2PickAddInstead:
      'You picked adding {a}, but the question asks what is left, so subtract {a}. Pick subtracting {a}.',
    wp2PickSubN:
      'You took {n} away from {a}, but first multiply {a} by {n}. Work out {a} times {n} first.',
    wp2PickAddInsteadDivide:
      'You picked adding more, but the question asks what is left, so subtract. Pick the subtraction.',
    wp2PickMulInsteadDivide:
      'You multiplied {a} by {n}, but {n} times fewer means division. Pick the division.',
    wp2Fallback: 'Read the question again slowly: how many are left after two steps?',
    mid1Whole:
      'You wrote the whole AB, {len} cm; now take away AM, {am} cm. Try {len} minus {am} and see what you get.',
    mid1AmInstead:
      'You wrote AM, {am} cm, but the question asks for the leftover MB. Look at the picture and see which part MB is.',
    mid1AddInstead:
      'You added {len} and {am}, but MB is what is left after subtracting. Try {len} minus {am} and see what you get.',
    mid1HalfInstead:
      'You halved AB, but M is not necessarily the midpoint here. Try {len} minus {am} and see what you get.',
    mid2OnePart:
      'You only took one part; AB is AM and MB put together. Try adding AM and MB and see what you get.',
    mid3Whole:
      'You wrote the whole AB, {len} cm; M is the midpoint, so AM is only half of it. Split {len} into two equal parts.',
    mid3Quarter:
      'You split AB into four parts; the midpoint splits AB into two equal parts. Split {len} into two equal parts.',
    midFallback: 'Look at the picture: where is M on segment AB?',
    areaMissOne: 'You missed one square. Count again one by one, marking each square you count.',
    areaExtraOne:
      'You counted one square too many. Count again one by one, marking each square you count.',
    areaEqualThoughtBigger:
      'The two shapes have the same number of squares. Count the squares in each shape again.',
    areaEqualThoughtSame:
      'The two shapes are not equal yet. Count again and see which shape has more squares.',
    areaEqualReversed: 'Count the squares in shapes A and B again — which one has more?',
    areaForgotSub: 'Shape A has {a} squares and shape B has {b}. Take away shape B’s squares.',
    areaAddInstead: 'To find how many more, subtract — do not add.',
    areaWrongUnit: 'Area is counted in squares, so the unit is square centimetres.',
    areaDiffIsB:
      'You wrote shape B’s squares. The difference is shape A take away shape B — try again.',
    areaFallback: 'Count the squares again one by one, marking each one you have counted.',
    fracForgetDivide: 'You took all {count}. Take only 1/{n} of them.',
    fracWrongDenominator:
      'The number {n} is how many parts there are, not how many are in one part. Share {count} into {n} equal parts.',
    fracLeftOnePart: 'You already found one part. For what is left, take it away from {count}.',
    fracKPartsOnePart:
      'You only worked out one part. The question asks for {k} parts — multiply one part by {k}.',
    fracKPartsWhole:
      'You took all {count}. The question asks for {k} parts — multiply one part by {k}.',
    fracKPartsK:
      '{k} is only how many parts to count. Multiply one part by {k} and see what you get.',
    fracFallback: 'Remember, 1/{n} is one of {n} equal parts of {count}.',
    clockWrongPeriodAfternoon:
      'The clock shows {h} o’clock, and it is the afternoon. Add 12 hours.',
    clockWrongPeriodEvening: 'The clock shows {h} o’clock, and it is the evening. Add 12 hours.',
    clockFiveMin: 'The minute hand is on mark {mark}. Each mark is 5 minutes.',
    clockRomanSubtractive: 'Look at the Roman numeral again — is the I before or after the {big}?',
    clockNearHour: 'Look at the hour hand again — which number is it closest to?',
    clockSangChieuFallback:
      'Check whether it is morning or afternoon first, then add 12 hours for the afternoon or evening.',
    clockRomanFallback:
      'Read the Roman numeral on the clock face again, and check whether the I comes before or after.',
  },
});

export type WrongAnswerKey = Parameters<typeof twa>[0];
