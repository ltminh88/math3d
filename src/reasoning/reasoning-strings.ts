// Texts of reasoning items for 7-9 year olds (vi source, en mirror). Generators only name keys.
import { defineStrings } from '../i18n/i18n';
import type { PromptRef } from './reasoning-types';

const rs = defineStrings('reasoning', {
  vi: {
    wpTimesThenAdd: '{who1} có {a} {item}. {who2} có nhiều gấp {n} lần {who1}.',
    // Phase 02: three more frames for the same a·n + a (chairs, making, picking).
    wpTimesThenAddChairs: '{who1} kê được {a} {item}. {who2} kê được nhiều gấp {n} lần {who1}.',
    wpTimesThenAddCakes: '{who1} làm được {a} {item}. {who2} làm được nhiều gấp {n} lần {who1}.',
    wpTimesThenAddHarvest:
      '{who1} hái được {a} {item}. {who2} hái được nhiều gấp {n} lần {who1}.',
    wpDivideThenAdd:
      '{who1} có {a} {item}. Lấy số {item} của {who1} giảm đi {n} lần thì được số {item} của {who2}.',
    // Phase 02: three more frames for the same a + a:n (picking, making, packing).
    wpDivideThenAddHarvest:
      '{who1} hái được {a} {item}. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần.',
    wpDivideThenAddMake:
      '{who1} làm được {a} {item}. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần.',
    wpDivideThenAddPack:
      '{who1} xếp được {a} {item} vào hộp. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần.',
    wpMoreThenTotal: '{who1} có {a} {item}. {who2} có nhiều hơn {who1} {d} {item}.',
    wpLessThenTotal: '{who1} có {a} {item}. {who2} có ít hơn {who1} {d} {item}.',
    // Phase 02: two more frames each way (picking, making).
    wpMoreThenTotalHarvest:
      '{who1} hái được {a} {item}. {who2} hái được nhiều hơn {who1} {d} {item}.',
    wpLessThenTotalHarvest:
      '{who1} hái được {a} {item}. {who2} hái được ít hơn {who1} {d} {item}.',
    wpMoreThenTotalMake:
      '{who1} làm được {a} {item}. {who2} làm được nhiều hơn {who1} {d} {item}.',
    wpLessThenTotalMake:
      '{who1} làm được {a} {item}. {who2} làm được ít hơn {who1} {d} {item}.',
    wpUnitThenTimes: 'Có {boxes} hộp như nhau, đựng tất cả {total} {item}.',
    // Phase 02: three more frames for the same total : boxes × m (packing, shop, store room).
    wpUnitThenTimesPack: 'Bạn {who} xếp {total} {item} đều vào {boxes} hộp như nhau.',
    wpUnitThenTimesShop: 'Cửa hàng có {boxes} hộp như nhau, đựng tất cả {total} {item}.',
    wpUnitThenTimesStore: 'Trong kho có {boxes} hộp như nhau, đựng tất cả {total} {item}.',
    wpTimesCompare: 'Rổ to có {big} {item}. Rổ nhỏ có {small} {item}.',
    wpDifferenceCompare: 'Rổ to có {big} {item}. Rổ nhỏ có {small} {item}.',
    // Phase 02: the same compare in three more settings (crates, classes, gardens);
    // both compare skills share these frames and their ask prompts.
    wpCompareCrates: 'Thùng to có {big} {item}. Thùng nhỏ có {small} {item}.',
    wpCompareClasses: 'Lớp 3A có {big} {item}. Lớp 3B có {small} {item}.',
    wpCompareGardens: 'Vườn A có {big} {item}. Vườn B có {small} {item}.',
    askTimesCrate: 'Số {item} ở thùng to gấp mấy lần thùng nhỏ?',
    askMoreCrate: 'Thùng to có nhiều hơn thùng nhỏ bao nhiêu {item}?',
    askTimesClass: 'Số {item} của lớp 3A gấp mấy lần lớp 3B?',
    askMoreClass: 'Lớp 3A có nhiều hơn lớp 3B bao nhiêu {item}?',
    askTimesGarden: 'Số {item} ở vườn A gấp mấy lần vườn B?',
    askMoreGarden: 'Vườn A có nhiều hơn vườn B bao nhiêu {item}?',
    divRemFloor: 'Có {total} {item}. Mình xếp vào các hộp, mỗi hộp {per} {item}.',
    divRemCeil: 'Có {total} bạn đi tham quan. Mỗi xe chở được {per} bạn.',
    // Phase 02: two more trips for the same ceil (camping, cinema).
    divRemCeilCamp: 'Có {total} bạn đi cắm trại. Mỗi xe chở được {per} bạn.',
    divRemCeilCinema: 'Có {total} bạn đi xem phim. Mỗi xe chở được {per} bạn.',
    unknownEq: 'Dấu ? là số nào? {text}',
    // Phase 02: a second wording for the same unknown.
    unknownEqFind: 'Tìm số còn thiếu: {text}',
    patternNext: 'Các số xếp theo một quy luật. Tìm số còn thiếu nhé: {terms}',
    exprValue: 'Tính giá trị của biểu thức: {text}',
    exprStoryEat: 'Mẹ mua {n} túi, mỗi túi có {p} {item}. Cả nhà đã dùng {e} {item}.',
    // Phase 02: the same n × p − e as boxes, not bags.
    exprStoryBox: 'Mẹ mua {n} hộp, mỗi hộp có {p} {item}. Cả nhà đã dùng {e} {item}.',
    exprStoryShare: 'Lớp 3A có {a} {item}, lớp 3B có {b} {item}. Gộp lại rồi chia đều cho {n} tổ.',
    // Phase 02: the same (a + b) : n shared between friends, not groups.
    exprStoryShareFriends:
      'Bạn {who1} có {a} {item}, bạn {who2} có {b} {item}. Gộp lại rồi chia đều cho {n} bạn.',
    askEachFriend: 'Mỗi bạn được bao nhiêu {item}?',
    chooseAll: 'Đọc kĩ bốn câu dưới đây.',
    tfExplain: 'Bạn Nam nói:',
    askOther: 'Trước hết, {who} có bao nhiêu {item}?',
    askBoth: 'Hỏi cả hai bạn có tất cả bao nhiêu {item}?',
    pickExpr: 'Bài này giải bằng phép tính nào?',
    askUnit: 'Trước hết, mỗi hộp có mấy {item}?',
    askTotal: 'Vậy {m} hộp như thế có bao nhiêu {item}?',
    askTimes: 'Số {item} ở rổ to gấp mấy lần rổ nhỏ?',
    askMore: 'Rổ to có nhiều hơn rổ nhỏ bao nhiêu {item}?',
    askBoxes: 'Xếp được nhiều nhất mấy hộp đầy?',
    askLeft: 'Còn thừa mấy {item}?',
    askLeftCheck: 'Còn thừa mấy {item}? Nhớ nhé: số dư phải bé hơn {per}.',
    pickBoxesLeft: 'Kết quả nào đúng?',
    askFull: 'Trước hết, có mấy xe chở đủ {per} bạn?',
    askNeed: 'Cần ít nhất mấy xe để chở hết các bạn?',
    askUnknown: 'Số còn thiếu là mấy?',
    askPart: 'Trước hết, {text} bằng bao nhiêu?',
    askTerm: 'Số thứ {pos} là số nào?',
    askValue: 'Biểu thức có giá trị bằng bao nhiêu?',
    askLeftOver: 'Cả nhà còn lại bao nhiêu {item}?',
    askEach: 'Mỗi tổ được bao nhiêu {item}?',
    pickAllTrue: 'Chạm vào mọi câu đúng, rồi bấm Xong.',
    isItTrue: 'Bạn Nam nói đúng hay sai?',
    fixRem: 'Vậy {total} : {per} thì dư mấy?',
    fixEq: 'Vậy {text} bằng bao nhiêu?',
    fixTimes: 'Vậy {big} gấp mấy lần {small}?',
    fixMore: 'Vậy {big} nhiều hơn {small} bao nhiêu?',
    num: '{n}',
    expr: '{text}',
    qr: '{q} hộp, còn thừa {r}',
    stmtRem: '{total} : {per} = {q} (dư {r})',
    stmtEq: '{text} = {value}',
    stmtTimes: 'Vì {big} {op} {small} = {n} nên số {big} gấp {n} lần số {small}.',
    stmtMore: 'Vì {big} {op} {small} = {d} nên số {big} nhiều hơn số {small} là {d}.',
    item_marble: 'viên bi',
    item_candy: 'cái kẹo',
    item_flower: 'bông hoa',
    item_book: 'quyển sách',
    item_apple: 'quả táo',
    item_fish: 'con cá',
    // Phase 02: nouns for the new word-problem contexts (KNTT settings).
    item_pencil: 'cây bút chì',
    item_chair: 'cái ghế',
    item_cake: 'cái bánh',
    item_stone: 'hòn đá',
    item_orange: 'quả cam',
    item_notebook: 'quyển vở',
    item_ball: 'quả bóng',
  },
  en: {
    wpTimesThenAdd: '{who1} has {a} {item}. {who2} has {n} times as many {item} as {who1}.',
    wpTimesThenAddChairs:
      '{who1} sets out {a} {item}. {who2} sets out {n} times as many {item} as {who1}.',
    wpTimesThenAddCakes:
      '{who1} makes {a} {item}. {who2} makes {n} times as many {item} as {who1}.',
    wpTimesThenAddHarvest:
      '{who1} picks {a} {item}. {who2} picks {n} times as many {item} as {who1}.',
    wpDivideThenAdd: '{who1} has {a} {item}. {who2} has {who1}’s number of {item} divided by {n}.',
    wpDivideThenAddHarvest:
      '{who1} picks {a} {item}. {who2} has {who1}’s number of {item} divided by {n}.',
    wpDivideThenAddMake:
      '{who1} makes {a} {item}. {who2} has {who1}’s number of {item} divided by {n}.',
    wpDivideThenAddPack:
      '{who1} packs {a} {item} into a box. {who2} has {who1}’s number of {item} divided by {n}.',
    wpMoreThenTotal: '{who1} has {a} {item}. {who2} has {d} more {item} than {who1}.',
    wpLessThenTotal: '{who1} has {a} {item}. {who2} has {d} fewer {item} than {who1}.',
    wpMoreThenTotalHarvest: '{who1} picks {a} {item}. {who2} picks {d} more {item} than {who1}.',
    wpLessThenTotalHarvest:
      '{who1} picks {a} {item}. {who2} picks {d} fewer {item} than {who1}.',
    wpMoreThenTotalMake: '{who1} makes {a} {item}. {who2} makes {d} more {item} than {who1}.',
    wpLessThenTotalMake: '{who1} makes {a} {item}. {who2} makes {d} fewer {item} than {who1}.',
    wpUnitThenTimes: '{boxes} equal boxes hold {total} {item} in all.',
    wpUnitThenTimesPack:
      '{who} packs {total} {item} equally into {boxes} equal boxes.',
    wpUnitThenTimesShop: 'A shop has {boxes} equal boxes holding {total} {item} in all.',
    wpUnitThenTimesStore:
      'In the store room there are {boxes} equal boxes holding {total} {item} in all.',
    wpTimesCompare: 'The big basket has {big} {item}, the small one has {small} {item}.',
    wpDifferenceCompare: 'The big basket has {big} {item}, the small one has {small} {item}.',
    wpCompareCrates: 'The big crate has {big} {item}, the small one has {small} {item}.',
    wpCompareClasses: 'Class 3A has {big} {item}, class 3B has {small} {item}.',
    wpCompareGardens: 'Garden A has {big} {item}, garden B has {small} {item}.',
    askTimesCrate: 'How many times as many {item} does the big crate have as the small one?',
    askMoreCrate: 'How many more {item} does the big crate have than the small one?',
    askTimesClass: 'How many times as many {item} does class 3A have as class 3B?',
    askMoreClass: 'How many more {item} does class 3A have than class 3B?',
    askTimesGarden: 'How many times as many {item} does garden A have as garden B?',
    askMoreGarden: 'How many more {item} does garden A have than garden B?',
    divRemFloor: 'There are {total} {item}, packed {per} to a box.',
    divRemCeil: '{total} children go on a trip. Each car takes {per} children.',
    divRemCeilCamp: '{total} children go camping. Each car takes {per} children.',
    divRemCeilCinema: '{total} children go to the cinema. Each car takes {per} children.',
    unknownEq: 'Which number is the ?: {text}',
    unknownEqFind: 'Find the missing number: {text}',
    patternNext: 'The numbers follow a rule. Find the missing ones: {terms}',
    exprValue: 'Work out the expression: {text}',
    exprStoryEat: 'Mum buys {n} bags with {p} {item} in each. The family uses {e} {item}.',
    exprStoryBox: 'Mum buys {n} boxes with {p} {item} in each. The family uses {e} {item}.',
    exprStoryShare:
      'Class 3A has {a} {item} and class 3B has {b} {item}. They share them all equally between {n} groups.',
    exprStoryShareFriends:
      '{who1} has {a} {item} and {who2} has {b} {item}. They share them all equally between {n} friends.',
    askEachFriend: 'How many {item} does each friend get?',
    chooseAll: 'Read the four sentences carefully.',
    tfExplain: 'Nam says:',
    askOther: 'First, how many {item} does {who} have?',
    askBoth: 'How many {item} do they have altogether?',
    pickExpr: 'Which calculation solves it?',
    askUnit: 'First, how many {item} are in one box?',
    askTotal: 'So how many {item} are in {m} such boxes?',
    askTimes: 'How many times as many {item} does the big basket have?',
    askMore: 'How many more {item} does the big basket have?',
    askBoxes: 'How many full boxes at most?',
    askLeft: 'How many {item} are left over?',
    askLeftCheck: 'How many {item} are left over? Remember: the remainder must be less than {per}.',
    pickBoxesLeft: 'Pick the right result:',
    askFull: 'First, how many cars take {per} children each?',
    askNeed: 'How many cars are needed, at least, to take everyone?',
    askUnknown: 'The missing number is:',
    askPart: 'Work out first: {text} = ?',
    askTerm: 'Number {pos} is:',
    askValue: 'The value is:',
    askLeftOver: 'How many {item} are left?',
    askEach: 'How many {item} does each group get?',
    pickAllTrue: 'Tap every true sentence, then Done.',
    isItTrue: 'Is Nam right or wrong?',
    fixRem: 'The right remainder of {total} : {per} is:',
    fixEq: 'The right value of {text} is:',
    fixTimes: 'How many times {small} is {big}?',
    fixMore: 'How much more is {big} than {small}?',
    num: '{n}',
    expr: '{text}',
    qr: '{q} boxes, {r} left over',
    stmtRem: '{total} : {per} = {q} remainder {r}',
    stmtEq: '{text} = {value}',
    stmtTimes: 'Since {big} {op} {small} = {n}, {big} is {n} times {small}.',
    stmtMore: 'Since {big} {op} {small} = {d}, {big} is {d} more than {small}.',
    item_marble: 'marbles',
    item_candy: 'sweets',
    item_flower: 'flowers',
    item_book: 'books',
    item_apple: 'apples',
    item_fish: 'fish',
    item_pencil: 'pencils',
    item_chair: 'chairs',
    item_cake: 'cakes',
    item_stone: 'stones',
    item_orange: 'oranges',
    item_notebook: 'notebooks',
    item_ball: 'balls',
  },
});

type Key = Parameters<typeof rs>[0];

/** Renders a prompt in the current language; `i:<noun>` params become the translated noun. */
export function renderPrompt(prompt: PromptRef): string {
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(prompt.params ?? {}))
    params[name] =
      typeof value === 'string' && value.startsWith('i:')
        ? rs(`item_${value.slice(2)}` as Key)
        : value;
  return rs(prompt.key as Key, params);
}
