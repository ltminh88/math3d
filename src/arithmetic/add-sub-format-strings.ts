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
    barModelPart:
      '{name} có {a} {item}. Sau khi mua thêm, {name} có tất cả {total} {item}.',
    barModelTotal: '{name} có {a} {item}. {name} mua thêm {b} {item}.',
    askUnknownBar: 'Thanh nào chưa biết?',
    barWhole: 'Thanh tổng: {n}',
    barKnown: 'Thanh đã biết: {n}',
    barUnknown: 'Thanh chưa biết: ?',
    askBarOp: 'Muốn tìm phần chưa biết, làm phép nào?',
    askUnknownPart: 'Phần chưa biết là bao nhiêu?',
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
    barModelPart:
      '{name} has {a} {item}. After buying more, {name} has {total} {item} in all.',
    barModelTotal: '{name} has {a} {item}. {name} buys {b} more {item}.',
    askUnknownBar: 'Which bar is unknown?',
    barWhole: 'Whole bar: {n}',
    barKnown: 'Known bar: {n}',
    barUnknown: 'Unknown bar: ?',
    askBarOp: 'Which operation finds the unknown part?',
    askUnknownPart: 'How many are in the unknown part?',
  },
} as const;
