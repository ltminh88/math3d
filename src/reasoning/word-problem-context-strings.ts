// Word-problem context strings (phase 02, vi source, en mirror). Plain objects,
// spread into the single defineStrings('reasoning', …) table in reasoning-strings.ts
// (a second defineStrings call for the same namespace would overwrite it). The frames
// are the new story contexts from word-problem-contexts.ts, plus the two extra trip
// frames for div-rem-ceil and the nouns the new contexts use.
export const WORD_PROBLEM_CONTEXT_VI = {
  // Three more frames for the same a·n + a (chairs, making, picking).
  wpTimesThenAddChairs: '{who1} kê được {a} {item}. {who2} kê được nhiều gấp {n} lần {who1}.',
  wpTimesThenAddCakes: '{who1} làm được {a} {item}. {who2} làm được nhiều gấp {n} lần {who1}.',
  wpTimesThenAddHarvest: '{who1} hái được {a} {item}. {who2} hái được nhiều gấp {n} lần {who1}.',
  // Three more frames for the same a + a:n (picking, making, packing).
  wpDivideThenAddHarvest:
    '{who1} hái được {a} {item}. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần.',
  wpDivideThenAddMake:
    '{who1} làm được {a} {item}. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần.',
  wpDivideThenAddPack:
    '{who1} xếp được {a} {item} vào hộp. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần.',
  // R8: the same a·n − a (chairs, making, picking).
  wpTimesThenSub:
    '{who1} có {a} {item}. {who2} có nhiều gấp {n} lần {who1}. {who2} đã dùng {a} {item}.',
  wpTimesThenSubChairs:
    '{who1} kê được {a} {item}. {who2} kê được nhiều gấp {n} lần {who1}. {who2} cất đi {a} {item}.',
  wpTimesThenSubCakes:
    '{who1} làm được {a} {item}. {who2} làm được nhiều gấp {n} lần {who1}. {who2} ăn hết {a} {item}.',
  wpTimesThenSubHarvest:
    '{who1} hái được {a} {item}. {who2} hái được nhiều gấp {n} lần {who1}. {who2} cho {who1} {a} {item}.',
  // R8: the same a − a:n (picking, making, packing).
  wpDivideThenSub:
    '{who1} có {a} {item}. Lấy số {item} của {who1} giảm đi {n} lần thì được số {item} của {who2}. {who1} đã dùng số {item} bằng số {item} của {who2}.',
  wpDivideThenSubHarvest:
    '{who1} hái được {a} {item}. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần. {who1} đã ăn số {item} bằng số {item} của {who2}.',
  wpDivideThenSubMake:
    '{who1} làm được {a} {item}. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần. {who1} đã dùng số {item} bằng số {item} của {who2}.',
  wpDivideThenSubPack:
    '{who1} xếp được {a} {item} vào hộp. Số {item} của {who2} bằng số {item} của {who1} giảm đi {n} lần. {who1} đã lấy ra số {item} bằng số {item} của {who2}.',
  // Two more frames each way (picking, making).
  wpMoreThenTotalHarvest:
    '{who1} hái được {a} {item}. {who2} hái được nhiều hơn {who1} {d} {item}.',
  wpLessThenTotalHarvest: '{who1} hái được {a} {item}. {who2} hái được ít hơn {who1} {d} {item}.',
  wpMoreThenTotalMake: '{who1} làm được {a} {item}. {who2} làm được nhiều hơn {who1} {d} {item}.',
  wpLessThenTotalMake: '{who1} làm được {a} {item}. {who2} làm được ít hơn {who1} {d} {item}.',
  // Three more frames for the same total : boxes × m (packing, shop, store room).
  wpUnitThenTimesPack: 'Bạn {who} xếp {total} {item} đều vào {boxes} hộp như nhau.',
  wpUnitThenTimesShop: 'Cửa hàng có {boxes} hộp như nhau, đựng tất cả {total} {item}.',
  wpUnitThenTimesStore: 'Trong kho có {boxes} hộp như nhau, đựng tất cả {total} {item}.',
  // The same compare in three more settings (crates, classes, gardens);
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
  // Two more trips for the same ceil (camping, cinema).
  divRemCeilCamp: 'Có {total} bạn đi cắm trại. Mỗi xe chở được {per} bạn.',
  divRemCeilCinema: 'Có {total} bạn đi xem phim. Mỗi xe chở được {per} bạn.',
  // Nouns for the new word-problem contexts (KNTT settings).
  item_pencil: 'cây bút chì',
  item_chair: 'cái ghế',
  item_cake: 'cái bánh',
  item_stone: 'hòn đá',
  item_orange: 'quả cam',
  item_notebook: 'quyển vở',
  item_ball: 'quả bóng',
};

export const WORD_PROBLEM_CONTEXT_EN: Record<keyof typeof WORD_PROBLEM_CONTEXT_VI, string> = {
  wpTimesThenAddChairs:
    '{who1} sets out {a} {item}. {who2} sets out {n} times as many {item} as {who1}.',
  wpTimesThenAddCakes: '{who1} makes {a} {item}. {who2} makes {n} times as many {item} as {who1}.',
  wpTimesThenAddHarvest:
    '{who1} picks {a} {item}. {who2} picks {n} times as many {item} as {who1}.',
  wpDivideThenAddHarvest:
    '{who1} picks {a} {item}. {who2} has {who1}’s number of {item} divided by {n}.',
  wpDivideThenAddMake:
    '{who1} makes {a} {item}. {who2} has {who1}’s number of {item} divided by {n}.',
  wpDivideThenAddPack:
    '{who1} packs {a} {item} into a box. {who2} has {who1}’s number of {item} divided by {n}.',
  wpTimesThenSub:
    '{who1} has {a} {item}. {who2} has {n} times as many {item} as {who1}. {who2} uses {a} {item}.',
  wpTimesThenSubChairs:
    '{who1} sets out {a} {item}. {who2} sets out {n} times as many {item} as {who1}. {who2} puts {a} {item} away.',
  wpTimesThenSubCakes:
    '{who1} makes {a} {item}. {who2} makes {n} times as many {item} as {who1}. {who2} eats {a} {item}.',
  wpTimesThenSubHarvest:
    '{who1} picks {a} {item}. {who2} picks {n} times as many {item} as {who1}. {who2} gives {who1} {a} {item}.',
  wpDivideThenSub:
    '{who1} has {a} {item}. {who2} has {who1}’s number of {item} divided by {n}. {who1} uses as many {item} as {who2} has.',
  wpDivideThenSubHarvest:
    '{who1} picks {a} {item}. {who2} has {who1}’s number of {item} divided by {n}. {who1} eats as many {item} as {who2} has.',
  wpDivideThenSubMake:
    '{who1} makes {a} {item}. {who2} has {who1}’s number of {item} divided by {n}. {who1} uses as many {item} as {who2} has.',
  wpDivideThenSubPack:
    '{who1} packs {a} {item} into a box. {who2} has {who1}’s number of {item} divided by {n}. {who1} takes out as many {item} as {who2} has.',
  wpMoreThenTotalHarvest: '{who1} picks {a} {item}. {who2} picks {d} more {item} than {who1}.',
  wpLessThenTotalHarvest: '{who1} picks {a} {item}. {who2} picks {d} fewer {item} than {who1}.',
  wpMoreThenTotalMake: '{who1} makes {a} {item}. {who2} makes {d} more {item} than {who1}.',
  wpLessThenTotalMake: '{who1} makes {a} {item}. {who2} makes {d} fewer {item} than {who1}.',
  wpUnitThenTimesPack: '{who} packs {total} {item} equally into {boxes} equal boxes.',
  wpUnitThenTimesShop: 'A shop has {boxes} equal boxes holding {total} {item} in all.',
  wpUnitThenTimesStore:
    'In the store room there are {boxes} equal boxes holding {total} {item} in all.',
  wpCompareCrates: 'The big crate has {big} {item}, the small one has {small} {item}.',
  wpCompareClasses: 'Class 3A has {big} {item}, class 3B has {small} {item}.',
  wpCompareGardens: 'Garden A has {big} {item}, garden B has {small} {item}.',
  askTimesCrate: 'How many times as many {item} does the big crate have as the small one?',
  askMoreCrate: 'How many more {item} does the big crate have than the small one?',
  askTimesClass: 'How many times as many {item} does class 3A have as class 3B?',
  askMoreClass: 'How many more {item} does class 3A have than class 3B?',
  askTimesGarden: 'How many times as many {item} does garden A have as garden B?',
  askMoreGarden: 'How many more {item} does garden A have than garden B?',
  divRemCeilCamp: '{total} children go camping. Each car takes {per} children.',
  divRemCeilCinema: '{total} children go to the cinema. Each car takes {per} children.',
  item_pencil: 'pencils',
  item_chair: 'chairs',
  item_cake: 'cakes',
  item_stone: 'stones',
  item_orange: 'oranges',
  item_notebook: 'notebooks',
  item_ball: 'balls',
};
