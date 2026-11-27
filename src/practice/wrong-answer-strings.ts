// Per-skill explanations shown when a child answers wrong in the lesson/daily dialog
// (R35). Each key names one likely confusion; the sentence points at the mistake with
// the question's own numbers and never states the answer. Lanes 2–3 add their keys here.
import { defineStrings } from '../i18n/i18n';

export const twa = defineStrings('wrongAnswer', {
  vi: {
    // Nhóm 1 — tìm thành phần chưa biết (unknown-add-sub / unknown-mul-div + WP)
    unknownWrongInverseAdd:
      'Bạn cộng {s} với {a} rồi. Muốn tìm số ở dấu ?, mình làm phép trừ: lấy {s} trừ {a} nhé.',
    unknownWrongInverseMul:
      'Bạn lấy {p} trừ {n} rồi. Muốn tìm số ở dấu ?, mình làm phép chia: lấy {p} chia cho {n} nhé.',
    unknownWrongInverseDivBoxes:
      'Bạn lấy {p} trừ {q} rồi. Muốn tìm số ở dấu ?, mình làm phép chia: lấy {p} chia cho {q} nhé.',
    unknownWrongInverseDivShareSub:
      'Bạn lấy {q} trừ {n} rồi. Muốn tìm số ở dấu ?, mình làm phép nhân: lấy {n} nhân {q} nhé.',
    unknownWrongInverseDivShareAdd:
      'Bạn cộng {n} với {q} rồi. Muốn tìm số ở dấu ?, mình làm phép nhân: lấy {n} nhân {q} nhé.',
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
    unknown1Fallback: 'Bạn thử thay số vừa tìm vào dấu ? xem hai bên có bằng nhau không nhé.',
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
    mid1HalfInstead: 'M không nằm chính giữa AB đâu. Mình lấy {len} trừ {am} nhé.',
    mid2OnePart:
      'Bạn mới lấy một đoạn thôi, AB gồm cả AM và MB gộp lại. Mình cộng AM với MB xem bằng mấy nhé.',
    mid3Whole:
      'Bạn điền cả đoạn AB dài {len} cm, M là trung điểm nên AM chỉ bằng một nửa. Mình chia {len} thành hai phần bằng nhau nhé.',
    mid3Quarter:
      'Bạn chia AB thành bốn phần rồi, trung điểm chỉ chia AB thành hai phần bằng nhau. Mình chia {len} thành hai phần bằng nhau nhé.',
    midFallback: 'Bạn nhìn hình nhé, điểm M nằm ở đâu trên đoạn AB.',
    // Nhóm 4 — diện tích đếm ô (meas-area-count / meas-area-equal)
    areaMissOne: 'Bạn đếm sót một ô rồi. Đếm lại từng ô, chỉ tay vào từng ô nhé.',
    areaExtraOne: 'Bạn đếm thừa một ô rồi. Đếm lại từng ô, chỉ tay vào từng ô nhé.',
    areaEqualThoughtBigger: 'Hai hình có số ô bằng nhau đó. Bạn đếm lại số ô mỗi hình nhé.',
    areaEqualThoughtSame: 'Hai hình chưa bằng nhau đâu. Bạn đếm lại xem hình nào nhiều ô hơn nhé.',
    areaEqualReversed: 'Bạn đếm lại số ô hình A và hình B nhé, hình nào nhiều ô hơn?',
    areaForgotSub: 'Hình A có {a} ô, hình B có {b} ô. Bạn trừ đi số ô hình B nhé.',
    areaAddInstead: 'Hỏi hơn nhau bao nhiêu thì mình trừ đi, không cộng đâu nhé.',
    areaWrongUnit: 'Diện tích đếm bằng ô vuông, nên đơn vị là xăng-ti-mét vuông nhé.',
    areaDiffIsB: 'Bạn điền số ô của hình B rồi. Hiệu là số ô hình A trừ hình B, bạn thử lại nhé.',
    areaFallback: 'Bạn đếm lại từng ô một nhé, chỉ tay vào từng ô đã đếm.',
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
    // Nhóm 7 — tiền (money-change-back / money-total-notes / money-pick-notes / money-wp)
    moneyChangeTotal:
      'Bạn tính đúng tổng {total} đồng rồi. Giờ mình trừ tiếp {total} khỏi {paid} nhé.',
    moneyChangeWholeNote:
      'Bạn đưa lại cả tờ {paid} đồng rồi. Mình chỉ trả phần thừa thôi, bạn thử lại nhé.',
    moneyChangeAdded:
      'Bạn cộng {paid} với {total} rồi. Tiền thừa là lấy {paid} trừ đi {total}, bạn thử lại nhé.',
    moneyChangeOneNote:
      'Bạn lệch đúng một tờ tiền rồi. Mình đếm lại từng tờ {paid} trừ {total} nhé.',
    moneyChangeFallback:
      'Bạn kiểm tra lại phép tính với {paid} và {total} nhé, mình trừ từng bước một.',
    moneyTotalPaidNote: 'Bạn điền tờ {paid} đồng rồi. Mình tính tổng {count} món trước đã nhé.',
    moneyTotalChangeFirst: 'Bạn tính ra tiền thừa rồi. Mình tính tổng tiền trước đã nhé.',
    moneyTotalFallback: 'Bạn tính tổng tiền nhé, {count} món nhân với giá mỗi món.',
    moneyTotalMissed: 'Bạn sót một tờ tiền rồi. Mình đếm lại từng tờ trên bàn nhé.',
    moneyTotalDouble: 'Bạn đếm trùng một tờ rồi. Mình chỉ tay đếm mỗi tờ một lần nhé.',
    moneyCountFallback: 'Bạn đếm lại từng tờ tiền trên bàn nhé.',
    moneyPickTooFew: 'Bạn chọn chưa đủ {target} đồng. Mình cộng lại các tờ đã chọn nhé.',
    moneyPickTooMuch: 'Bạn chọn nhiều hơn {target} đồng rồi. Mình thử bỏ bớt một tờ nhé.',
    moneyPickTooMany: 'Bạn đủ {target} đồng rồi, nhưng mình thử dùng ít tờ hơn nhé.',
    moneyPickFallback: 'Bạn cộng lại các tờ đã chọn xem đủ {target} đồng chưa nhé.',
    moneyWpAddShort:
      'Bạn cộng thiếu một lần rồi. {count} {item} thì mình cộng {price} đủ {count} lần nhé.',
    moneyWpOneItem: 'Bạn mới tính một món thôi. Mình cộng thêm món còn lại nữa nhé.',
    moneyWpLeftTotal: 'Bạn điền tổng tiền rồi. Còn lại thì lấy {have} trừ đi tổng đó nhé.',
    moneyWpLeftHave: 'Bạn điền số tiền có rồi. Còn lại thì lấy {have} trừ đi tổng tiền nhé.',
    moneyWpFallback: 'Bạn lấy số tiền có trừ đi tổng tiền nhé.',
    moneyFallback: 'Bạn kiểm tra lại phép tính tiền nhé, tính từng bước một.',
    // Nhóm 8 — đọc bảng số liệu (table-*, tally-count, chance-*)
    dataReadWrongCell: 'Bạn đọc nhầm cột rồi. Mình tìm lại cột {header} nhé.',
    dataReadWrongTotal: 'Bạn cộng cả hàng rồi. Đề chỉ hỏi một ô ở cột {header} thôi.',
    dataSumsWrongRow: 'Bạn cộng nhầm hàng rồi. Mình chỉ cộng các số ở hàng {row} thôi.',
    dataSumsWrongRowCol: 'Bạn cộng nhầm hàng rồi. Đề hỏi cộng cột {header} cơ.',
    dataSumsWrongColumn: 'Bạn cộng nhầm cột rồi. Mình chỉ cộng các số ở cột {header} thôi.',
    dataSumsWrongColumnRow: 'Bạn cộng nhầm một cột rồi. Đề hỏi cộng hàng {row} cơ.',
    dataSumsOneRow: 'Bạn mới cộng một hàng thôi. Mình cộng hết các số trong bảng nhé.',
    dataSumsMissedOne: 'Bạn sót một ô rồi. Mình đếm lại xem đã cộng đủ mọi ô chưa nhé.',
    dataSumsFallback: 'Bạn đọc lại đề rồi cộng lại từng số một nhé.',
    dataFillWrongCellAll: 'Ô trống ở hàng Cả lớp mà. Mình cộng hai hàng trên lại nhé.',
    dataFillWrongTotal: 'Bạn lấy số ở hàng Cả lớp rồi. Mình lấy số đó trừ đi hàng đã biết nhé.',
    dataFillWrongCellRow:
      'Bạn lấy số ở hàng {other} rồi. Ô trống ở hàng {row} cơ, mình lấy số Cả lớp trừ đi nhé.',
    dataFillFallback: 'Bạn nhìn lại bảng nhé, ô trống ở hàng nào, cột nào?',
    dataMaxNear: 'Cột bạn chọn cũng nhiều, nhưng chưa phải nhiều nhất. Mình so lại các cột nhé.',
    dataMinNear: 'Cột bạn chọn cũng ít, nhưng chưa phải ít nhất. Mình so lại các cột nhé.',
    dataMaxReversed: 'Bạn chọn ngược rồi. Đề hỏi nhiều nhất, mình tìm cột cao nhất nhé.',
    dataMinReversed: 'Bạn chọn ngược rồi. Đề hỏi ít nhất, mình tìm cột thấp nhất nhé.',
    dataMaxMinFallback: 'Bạn so lại các cột nhé, cột nào cao nhất, cột nào thấp nhất?',
    dataTallyCountedAll: 'Bạn đếm cả dấu X rồi. Đề chỉ hỏi dấu O thôi, bạn đếm lại nhé.',
    dataTallyCountedMiss: 'Bạn đếm dấu X rồi. Đề hỏi dấu O cơ, bạn đếm lại nhé.',
    dataTallyFallback: 'Bạn đếm lại từng dấu một nhé, O là trúng, X là trượt.',
    dataChanceBagCertain:
      'Bạn thấy màu đó có trong túi, nhưng trong túi còn màu khác nữa. Mình xem lại trong túi có những màu nào nhé.',
    dataChanceBagIsThere: 'Màu đó có trong túi đó. Mình xem lại trong túi có những màu nào nhé.',
    dataChanceBagNotThere:
      'Màu đó không có trong túi đâu. Mình xem lại trong túi có những màu nào nhé.',
    dataChanceDiceCertain:
      'Mặt {face} có thể ra, nhưng còn mặt khác nữa. Mình xem lại xúc xắc có những mặt nào nhé.',
    dataChanceDiceIsThere: 'Mặt {face} chấm có thể ra đó. Mình xem lại các mặt của xúc xắc nhé.',
    dataChanceDiceNotThere:
      'Mặt {face} chấm không có trên xúc xắc đâu. Xúc xắc chỉ có từ 1 đến 6 chấm thôi nhé.',
    dataChanceDiceAll:
      'Gieo một lần thì ra mặt nào đó từ 1 đến 6 chấm, chắc chắn luôn. Mình xem lại các mặt của xúc xắc nhé.',
    dataFallback: 'Bạn đọc lại tiêu đề bảng và tìm đúng hàng, đúng cột rồi tính lại nhé.',
    // Nhóm 9 — cộng/trừ có nhớ (add-sub-1000 + wp/chain, add/sub 4–5 chữ số, find-error, missing-digit)
    carryWrongOpAdd: 'Đề hỏi cộng mà bạn trừ rồi. Mình tính lại {a} cộng {b} nhé.',
    carryWrongOpSub: 'Đề hỏi trừ mà bạn cộng rồi. Mình tính lại {a} trừ {b} nhé.',
    carryCheckAdd: 'Bạn kiểm tra lại hàng {col} xem đã nhớ 1 chưa nhé.',
    carryCheckSub: 'Bạn kiểm tra lại hàng {col} xem đã mượn 1 chưa nhé.',
    carryChainSkipped: 'Bạn tính ra kết quả sau rồi. Mình tính bước đầu {a} {op1} {b} trước nhé.',
    carryChainForgotSecond: 'Bạn điền kết quả bước đầu rồi. Còn phải tính tiếp {op2} {c} nữa nhé.',
    carryFixRepeat:
      'Bạn điền lại đúng số bạn vừa xem rồi. Số đó sai đó, mình tính lại {a} {op} {b} nhé.',
    carryFallback: 'Bạn đặt tính lại {a} {op} {b}, tính từng hàng từ phải sang trái nhé.',
    carryFallbackPlain: 'Bạn đặt tính lại rồi tính từng hàng từ phải sang trái nhé.',
    // Nhóm 10 — chia có dư (div-*-remainder, div-rem-floor / div-rem-ceil)
    remQuotientOneMore:
      'Bạn cộng thêm một rồi. {a} chia {b} chưa đủ một lần nữa đâu, mình thử lại nhé.',
    remQuotientOneLess:
      'Bạn dừng sớm một lần chia rồi. Mình xem {a} còn chia {b} được nữa không nhé.',
    remQuotientRemainder:
      'Bạn điền số dư vào ô thương rồi. Thương là số lần chia được, bạn thử lại nhé.',
    remQuotientZero: 'Thương có chữ số 0 ở giữa, bạn đừng bỏ mất nhé. Mình chia lại từng hàng nhé.',
    remRemainderTooBig:
      'Số dư {w} còn lớn hơn {b} thì vẫn chia tiếp được. Mình chia thêm một lần nữa nhé.',
    remRemainderQuotient:
      'Bạn điền thương {q} vào ô số dư rồi. Số dư là phần còn thừa sau khi chia {a} cho {b}, bạn thử lại nhé.',
    remFallback:
      'Bạn thử lại nhé: {a} chia {b} được mấy lần, còn thừa mấy? Nhớ số dư phải bé hơn {b}.',
    remFloorBoxesOneMore:
      'Bạn xếp thêm một hộp nữa rồi. Mình thử xếp {per} cái một hộp xem được mấy hộp nhé.',
    remFloorBoxesOneLess:
      'Bạn dừng sớm một hộp rồi. Mình xem còn đủ {per} cái để xếp thêm một hộp không nhé.',
    remFloorBoxesRemainder:
      'Bạn điền số thừa vào ô số hộp rồi. Số hộp là số lần xếp được {per} cái, bạn thử lại nhé.',
    remFloorLeftQuotient:
      'Bạn điền số hộp vào ô còn thừa rồi. Số còn thừa là phần chưa xếp hết, bạn thử lại nhé.',
    remFloorLeftTooBig:
      'Số thừa {w} còn đủ {per} thì vẫn xếp thêm được một hộp nữa. Mình xếp thêm một hộp nhé.',
    remFloorPickTooBig:
      'Bạn xếp thiếu một hộp rồi. Số còn thừa vẫn đủ xếp thêm một hộp nữa, bạn thử lại nhé.',
    remFloorPickOneMore:
      'Bạn xếp thêm một hộp nữa rồi. Mình thử xếp {per} cái một hộp xem được mấy hộp nhé.',
    remFloorPickRemainderWrong:
      'Số hộp đúng rồi, nhưng số còn thừa chưa đúng. Bạn lấy {total} trừ đi số đã xếp nhé.',
    remFloorPickSwapped:
      'Bạn điền ngược hai số rồi. Số hộp là số lần xếp được, số thừa là phần còn lại nhé.',
    remFloorFallback: 'Bạn thử lại nhé: xếp {per} cái một hộp thì được mấy hộp, còn thừa mấy?',
    remCeilFullOneMore: 'Bạn tính cả xe chưa đầy rồi. Mình tính xe đầy thôi nhé.',
    remCeilFullRemainder:
      'Bạn điền số thừa vào ô xe đầy rồi. Xe đầy là xe chở đủ {per} bạn, bạn thử lại nhé.',
    remCeilNeedRoundedDown:
      'Bạn tính được {q} xe đầy rồi, còn thừa {r} bạn nữa nên cần thêm một xe.',
    remCeilNeedRemainder:
      'Bạn điền số thừa vào ô số xe rồi. Số xe là số chuyến cần đi, bạn thử lại nhé.',
    remCeilFallback: 'Bạn thử lại nhé: còn thừa thì cần thêm một xe nữa đó.',
    // Nhóm 11 — thang đo độ dài (meas-len-*, meas-mm-convert, meas-ruler-read)
    lenDirection:
      'Bạn đổi ngược chiều rồi. Nhớ thang đo: 1 m = 10 dm = 100 cm = 1 000 mm, đi xuống thì nhân, đi lên thì chia nhé.',
    lenFactor:
      'Bạn mới nhân có một lần 10. Thang đo là 1 m = 10 dm = 100 cm = 1 000 mm, bạn đếm lại xem qua mấy bậc nhé.',
    lenDmSkipped:
      'Bạn nhảy qua mất một bậc rồi. Thang đo là 1 m = 10 dm = 100 cm = 1 000 mm, bạn đi từng bậc một nhé.',
    lenMixedConcat:
      'Bạn ghép hai số lại thành một số rồi. Đổi từng phần ra đơn vị nhỏ rồi cộng lại nhé.',
    lenMixedDropBig:
      'Bạn bỏ mất phần lớn rồi. Số đo có hai phần, bạn đổi cả hai phần ra đơn vị nhỏ nhé.',
    lenIgnoreUnit:
      'Bạn tính số mà quên đơn vị rồi. Hai số khác đơn vị thì phải đổi về cùng một đơn vị trước nhé.',
    lenFallback:
      'Bạn thử lại nhé: nhìn thang đo 1 m = 10 dm = 100 cm = 1 000 mm rồi đổi từng bậc một.',
    // Nhóm 12 — các lỗi cộng/trừ (add-sub-bug-choice, add-sub-compare-estimate,
    // add-sub-number-line, add-sub-find-error)
    bugForgotCarry:
      'Bạn cộng từng hàng mà quên nhớ 1 sang hàng bên trái. Mình đặt tính rồi cộng từng hàng từ phải sang trái nhé.',
    bugCarryNotAdded:
      'Bạn nhớ 1 rồi nhưng chưa cộng nó vào hàng tiếp theo. Mình cộng thêm số nhớ vào hàng đó nhé.',
    bugSmallerFromLarger:
      'Bạn trừ số bé cho số lớn ở từng hàng. Khi số trên bé hơn số dưới thì mình mượn 1 ở hàng bên trái nhé.',
    bugBorrowNoDecrement:
      'Bạn mượn 1 rồi nhưng quên bớt 1 ở số cho mượn. Mình bớt 1 ở hàng cho mượn rồi tính lại nhé.',
    bugZeroBorrowSkip:
      'Bạn gặp số 0 thì dừng mượn. Số 0 mượn 1 thành 9 rồi mượn tiếp sang hàng bên trái nhé.',
    bugZeroMinusNZero:
      'Bạn thấy 0 trừ một số thì viết 0. Mình mượn 1 cho số 0 rồi tính lại nhé.',
    bugMisalignedColumns:
      'Bạn đặt các chữ số chưa thẳng hàng. Mình viết số dưới sao cho hàng đơn vị thẳng hàng đơn vị nhé.',
    bugSecondRegroupDropped:
      'Bạn nhớ lần đầu rồi nhưng quên nhớ lần thứ hai. Mình tính từng hàng, có nhớ thì cộng vào hàng tiếp theo nhé.',
  },
  en: {
    unknownWrongInverseAdd:
      'You added {s} and {a}. To find the number at ?, subtract: try {s} minus {a}.',
    unknownWrongInverseMul:
      'You took {n} away from {p}. To find the number at ?, divide: try {p} divided by {n}.',
    unknownWrongInverseDivBoxes:
      'You took {q} away from {p}. To find the number at ?, divide: try {p} divided by {q}.',
    unknownWrongInverseDivShareSub:
      'You took {n} away from {q}. To find the number at ?, multiply: try {n} times {q}.',
    unknownWrongInverseDivShareAdd:
      'You added {n} and {q}. To find the number at ?, multiply: try {n} times {q}.',
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
    unknown1Fallback: 'Try your number in place of ? and check whether both sides are equal.',
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
    mid1HalfInstead: 'M is not in the middle of AB. Try {len} minus {am}.',
    mid2OnePart:
      'You only took one part; AB is AM and MB put together. Try adding AM and MB and see what you get.',
    mid3Whole:
      'You wrote the whole AB, {len} cm; M is the midpoint, so AM is only half of it. Split {len} into two equal parts.',
    mid3Quarter:
      'You split AB into four parts; the midpoint splits AB into two equal parts. Split {len} into two equal parts.',
    midFallback: 'Look at the picture: where is M on segment AB?',
    areaMissOne:
      'You missed one square. Count again one by one, pointing at each square as you count.',
    areaExtraOne:
      'You counted one square too many. Count again one by one, pointing at each square as you count.',
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
    areaFallback: 'Count the squares again one by one, pointing at each one you have counted.',
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
    moneyChangeTotal: 'You found the total {total} dong. Now take {total} away from {paid}.',
    moneyChangeWholeNote:
      'You gave back the whole {paid} dong note. Only the extra part comes back.',
    moneyChangeAdded: 'You added {paid} and {total}. Change is {paid} take away {total}.',
    moneyChangeOneNote:
      'You are off by exactly one banknote. Count again from {paid} take away {total}.',
    moneyChangeFallback: 'Check your sum with {paid} and {total} again, one step at a time.',
    moneyTotalPaidNote:
      'You wrote the {paid} dong note. Work out the total of {count} items first.',
    moneyTotalChangeFirst: 'You already worked out the change. Work out the total first.',
    moneyTotalFallback: 'Work out the total: {count} items times the price of each one.',
    moneyTotalMissed: 'You missed one banknote. Count each note on the table again.',
    moneyTotalDouble: 'You counted one note twice. Point at each note once as you count.',
    moneyCountFallback: 'Count each banknote on the table again.',
    moneyPickTooFew: 'Your notes add up to less than {target} dong. Add your chosen notes again.',
    moneyPickTooMuch: 'You picked more than {target} dong. Try leaving one note out.',
    moneyPickTooMany: 'You reached {target} dong, but try using fewer notes.',
    moneyPickFallback: 'Add your chosen notes again and check whether they make {target} dong.',
    moneyWpAddShort: 'You added one time too few. For {count} {item}, add {price} {count} times.',
    moneyWpOneItem: 'You worked out only one item. Add the other item too.',
    moneyWpLeftTotal: 'You wrote the total. For what is left, take it away from {have}.',
    moneyWpLeftHave:
      'You wrote the money you have. For what is left, take the total away from {have}.',
    moneyWpFallback: 'Take the total away from the money you have.',
    moneyFallback: 'Check your money sum again, one step at a time.',
    dataReadWrongCell: 'You read the wrong column. Find the {header} column again.',
    dataReadWrongTotal:
      'You added the whole row. The question asks for just one cell in the {header} column.',
    dataSumsWrongRow: 'You added the wrong row. Add only the numbers in the {row} row.',
    dataSumsWrongRowCol: 'You added the wrong row. The question asks for the {header} column.',
    dataSumsWrongColumn: 'You added the wrong column. Add only the numbers in the {header} column.',
    dataSumsWrongColumnRow: 'You added a column by mistake. The question asks for the {row} row.',
    dataSumsOneRow: 'You only added one row. Add all the numbers in the table.',
    dataSumsMissedOne: 'You missed one cell. Check that you added every cell.',
    dataSumsFallback: 'Read the question again, then add the numbers one by one.',
    dataFillWrongCellAll: 'The empty cell is in the All row. Add the two rows above it.',
    dataFillWrongTotal: 'You took the All-row number. Take that number and subtract the known row.',
    dataFillWrongCellRow:
      'You took the {other} row’s number. The empty cell is in the {row} row — take it away from the All row.',
    dataFillFallback: 'Look at the table again: which row and column is the empty cell in?',
    dataMaxNear: 'Your column is big, but not the biggest. Compare the columns again.',
    dataMinNear: 'Your column is small, but not the smallest. Compare the columns again.',
    dataMaxReversed:
      'You picked the opposite one. The question asks for the most, so find the tallest column.',
    dataMinReversed:
      'You picked the opposite one. The question asks for the fewest, so find the shortest column.',
    dataMaxMinFallback: 'Compare the columns again: which is the tallest, which is the shortest?',
    dataTallyCountedAll: 'You counted the X marks too. Only count the O marks.',
    dataTallyCountedMiss: 'You counted the X marks. The question asks for the O marks.',
    dataTallyFallback: 'Count the marks again one by one: O is a hit, X is a miss.',
    dataChanceBagCertain:
      'That colour is in the bag, but there are other colours too. Look again at which colours are in the bag.',
    dataChanceBagIsThere: 'That colour is in the bag. Look again at which colours are in the bag.',
    dataChanceBagNotThere:
      'That colour is not in the bag. Look again at which colours are in the bag.',
    dataChanceDiceCertain:
      'Face {face} can come up, but so can other faces. Look again at the faces of the die.',
    dataChanceDiceIsThere: 'Face {face} can come up. Look again at the faces of the die.',
    dataChanceDiceNotThere:
      'There is no {face} face on the die. The die only has faces from 1 to 6.',
    dataChanceDiceAll:
      'One roll always lands on a face from 1 to 6, so it is certain. Look again at the faces of the die.',
    dataFallback:
      'Read the table title again, find the right row and column, then work it out again.',
    carryWrongOpAdd:
      'The question asks you to add, but you subtracted. Work out {a} plus {b} again.',
    carryWrongOpSub:
      'The question asks you to subtract, but you added. Work out {a} take away {b} again.',
    carryCheckAdd: 'Check the {col} column again — did you carry the 1?',
    carryCheckSub: 'Check the {col} column again — did you borrow 1?',
    carryChainSkipped: 'You worked out the later step. Do the first step, {a} {op1} {b}, first.',
    carryChainForgotSecond:
      'You wrote the first step’s answer. You still need to work out {op2} {c}.',
    carryFixRepeat:
      'You wrote the same number you just saw, but that number is wrong. Work out {a} {op} {b} again.',
    carryFallback: 'Set out {a} {op} {b} again, working column by column from right to left.',
    carryFallbackPlain: 'Set it out again and work column by column from right to left.',
    remQuotientOneMore: 'You added one extra. {a} shared by {b} does not make one more full time.',
    remQuotientOneLess:
      'You stopped one share too early. Check whether {a} can still be shared by {b}.',
    remQuotientRemainder:
      'You put the remainder in the quotient box. The quotient is how many times you can share.',
    remQuotientZero:
      'The quotient has a 0 in it — do not leave it out. Divide column by column again.',
    remRemainderTooBig:
      'A remainder of {w} is still bigger than {b}, so you can share once more. Divide one more time.',
    remRemainderQuotient:
      'You put the quotient {q} in the remainder box. The remainder is what is left after sharing {a} by {b}.',
    remFallback:
      'Try again: how many times does {b} go into {a}, and what is left? Remember the remainder must be less than {b}.',
    remFloorBoxesOneMore:
      'You packed one more box. Try packing {per} in each box and see how many boxes you get.',
    remFloorBoxesOneLess:
      'You stopped one box too early. Check whether there are still enough for one more box of {per}.',
    remFloorBoxesRemainder:
      'You put the leftover number in the boxes box. The boxes are how many times you can pack {per}.',
    remFloorLeftQuotient:
      'You put the number of boxes in the leftover box. The leftover is what did not fit — try again.',
    remFloorLeftTooBig: 'A leftover of {w} still fills another box of {per}. Pack one more box.',
    remFloorPickTooBig:
      'You packed one box too few. The leftover still fills another box — try again.',
    remFloorPickOneMore:
      'You packed one more box. Try packing {per} in each box and see how many boxes you get.',
    remFloorPickRemainderWrong:
      'The boxes are right, but the leftover is not. Take the packed amount away from {total}.',
    remFloorPickSwapped:
      'You swapped the two numbers. The boxes are how many times you packed; the leftover is what is left.',
    remFloorFallback:
      'Try again: packing {per} in each box, how many boxes do you get, and what is left?',
    remCeilFullOneMore: 'You counted the part-filled car too. Count only the full cars.',
    remCeilFullRemainder:
      'You put the leftover in the full-cars box. A full car carries {per} children.',
    remCeilNeedRoundedDown:
      'You found {q} full cars, and {r} children are still left, so one more car is needed.',
    remCeilNeedRemainder:
      'You put the leftover in the cars box. The cars are the trips you need to make.',
    remCeilFallback: 'Try again: if anything is left over, one more car is needed.',
    // Group 11 — the length ladder (meas-len-*, meas-mm-convert, meas-ruler-read)
    lenDirection:
      'You converted the wrong way round. Remember the ladder: 1 m = 10 dm = 100 cm = 1 000 mm — going down you multiply, going up you divide.',
    lenFactor:
      'You only multiplied by 10 once. The ladder is 1 m = 10 dm = 100 cm = 1 000 mm — count how many steps you crossed.',
    lenDmSkipped:
      'You skipped a step. The ladder is 1 m = 10 dm = 100 cm = 1 000 mm — go one step at a time.',
    lenMixedConcat:
      'You joined the two numbers into one. Convert each part to the small unit, then add them.',
    lenMixedDropBig:
      'You dropped the big part. A mixed measure has two parts — convert both to the small unit.',
    lenIgnoreUnit:
      'You worked with the numbers and forgot the units. When the units differ, convert them to the same unit first.',
    lenFallback:
      'Try again: look at the ladder 1 m = 10 dm = 100 cm = 1 000 mm and convert one step at a time.',
    // Group 12 — the add/sub bugs (add-sub-bug-choice, add-sub-compare-estimate,
    // add-sub-number-line, add-sub-find-error)
    bugForgotCarry:
      'You added column by column but forgot to carry 1 to the next column. Set it out again and add column by column from right to left.',
    bugCarryNotAdded:
      'You carried 1 but did not add it to the next column. Add the carried 1 to that column.',
    bugSmallerFromLarger:
      'You subtracted the smaller digit from the larger one in each column. When the top digit is smaller, borrow 1 from the column on the left.',
    bugBorrowNoDecrement:
      'You borrowed 1 but forgot to take 1 away from the digit you borrowed from. Take 1 away there and work it out again.',
    bugZeroBorrowSkip:
      'You stopped borrowing when you met a 0. A 0 that borrows 1 becomes 9 — borrow on to the next column.',
    bugZeroMinusNZero:
      'You saw 0 minus a number and wrote 0. Borrow 1 for the 0 and work it out again.',
    bugMisalignedColumns:
      'Your digits are not lined up. Write the lower number so the units line up under the units.',
    bugSecondRegroupDropped:
      'You remembered the first carry but forgot the second one. Work column by column and carry every regroup into the next column.',
  },
});

export type WrongAnswerKey = Parameters<typeof twa>[0];
