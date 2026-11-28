// Format strings (boost, Phase 1A): the new add/sub formats' prompts, merged into
// the arithmetic strings table (arithmetic-strings.ts). Plain records, not a second
// defineStrings call — the family registers its strings once.
export const addSubFormatStrings = {
  vi: {
    askChooseResult: 'Kết quả đúng là số nào?',
    estimateCalc: 'Chọn số tròn trăm gần nhất với: {a} {op} {b}.',
    askNearestHundred: 'Gần với số tròn trăm nào nhất?',
    compareCalc: 'So sánh: {a} {op} {b} ? {c}.',
    askCompareSign: 'Điền dấu <, = hay >?',
    cmpLt: '<',
    cmpEq: '=',
    cmpGt: '>',
    numberLineJumps: 'Trên tia số, từ {start} nhảy {jumps}.',
    askLanding: 'Sau các bước nhảy, bạn dừng ở số nào?',
    barModelPart: '{name} có {a} {item}. Sau khi mua thêm, {name} có tất cả {total} {item}.',
    barModelTotal: '{name} có {a} {item}. {name} mua thêm {b} {item}.',
    askUnknownBar: 'Thanh nào chưa biết?',
    // The bars are named by role, never by number: a number (or '?') on the
    // label would give the answer away (R103.3).
    barPartHave: 'Phần {name} có',
    barPartAdded: 'Phần mua thêm',
    barBoth: 'Cả hai',
    askBarOpPart: 'Muốn tìm phần chưa biết, làm phép nào?',
    askBarOpTotal: 'Muốn tìm tất cả, làm phép nào?',
    askUnknownPart: 'Phần chưa biết là bao nhiêu?',
    // Boost Phase 2A column-calc: one digit step per column, units first.
    // The digit prompt shows the column's computation as one expression
    // ({text}): original digits plus the carry/borrow from the previous
    // column, borrowed top included for subtraction ("13 − 8") — the
    // expression's value is always the digit asked for (R121). The borrow
    // question (subtraction only, asked BEFORE the digit) names its column
    // and shows the raw column instead.
    columnCalc: 'Đặt tính rồi tính: {a} {op} {b}.',
    columnDigitOnes: 'Hàng đơn vị: {text}. Viết chữ số nào?',
    columnDigitTens: 'Hàng chục: {text}. Viết chữ số nào?',
    columnDigitHundreds: 'Hàng trăm: {text}. Viết chữ số nào?',
    // Boost Phase 3A match: four calculations matched to their results; one
    // result is also the bug value of another pair in the set (the decoy).
    matchAddSub: 'Nối mỗi phép tính với kết quả của nó.',
    matchAddSubPrompt: 'Chạm một phép tính, rồi chạm kết quả của nó.',
    askCarry: 'Có nhớ 1 không?',
    askBorrowOnes: 'Hàng đơn vị: {text}. Có phải vay 1 không?',
    askBorrowTens: 'Hàng chục: {text}. Có phải vay 1 không?',
    askBorrowHundreds: 'Hàng trăm: {text}. Có phải vay 1 không?',
    carryYes: 'Có nhớ 1',
    carryNo: 'Không nhớ',
    borrowYes: 'Có vay 1',
    borrowNo: 'Không vay',
  },
  en: {
    askChooseResult: 'Which number is the right answer?',
    estimateCalc: 'Pick the nearest hundred to: {a} {op} {b}.',
    askNearestHundred: 'Which hundred is it nearest to?',
    compareCalc: 'Compare: {a} {op} {b} ? {c}.',
    askCompareSign: 'Which sign goes here: <, = or >?',
    cmpLt: '<',
    cmpEq: '=',
    cmpGt: '>',
    numberLineJumps: 'On the number line, jump from {start}: {jumps}.',
    askLanding: 'After the jumps, which number do you land on?',
    barModelPart: '{name} has {a} {item}. After buying more, {name} has {total} {item} in all.',
    barModelTotal: '{name} has {a} {item}. {name} buys {b} more {item}.',
    askUnknownBar: 'Which bar is unknown?',
    barPartHave: 'The part {name} has',
    barPartAdded: 'The part bought more',
    barBoth: 'Both parts',
    askBarOpPart: 'Which operation finds the unknown part?',
    askBarOpTotal: 'Which operation finds the total?',
    askUnknownPart: 'How many are in the unknown part?',
    // Boost Phase 2A column-calc: one digit step per column, units first.
    columnCalc: 'Work it out in columns: {a} {op} {b}.',
    columnDigitOnes: 'Ones: {text}. Which digit do you write?',
    columnDigitTens: 'Tens: {text}. Which digit do you write?',
    columnDigitHundreds: 'Hundreds: {text}. Which digit do you write?',
    // Boost Phase 3A match: four calculations matched to their results; one
    // result is also the bug value of another pair in the set (the decoy).
    matchAddSub: 'Match each calculation with its result.',
    matchAddSubPrompt: 'Tap a calculation, then tap its result.',
    askCarry: 'Do you carry 1?',
    askBorrowOnes: 'Ones: {text}. Do you borrow 1?',
    askBorrowTens: 'Tens: {text}. Do you borrow 1?',
    askBorrowHundreds: 'Hundreds: {text}. Do you borrow 1?',
    carryYes: 'Carry 1',
    carryNo: 'No carry',
    borrowYes: 'Borrow 1',
    borrowNo: 'No borrow',
  },
} as const;
