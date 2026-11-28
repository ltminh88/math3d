// Big-number contexts for add/sub word problems (Phase 8): the places a
// ≥ 1 000 story happens in. R137 (reviewer, #63): ONLY school/home/market
// (trường/nhà/chợ) for add/sub — the old Kho (warehouse) and Thư viện
// (library) contexts were dropped for this family; other families keep theirs.
// Each context names the story keys for giving some away: `give` (one step),
// `giveTwoStep` (buy more, then give away), `giveStart` (start unknown: gave
// some away, now has some left). A school hands out to its students; a home
// or a market sells. The items avoid the five personal nouns the context test
// pins (bi, kẹo, hoa, táo, cá), so a big story never reads as a personal one.
export interface BigNumberContext {
  readonly name: string;
  readonly item: string;
  readonly give: string;
  readonly giveTwoStep: string;
  readonly giveStart: string;
}

/** The eight big-number places: school × 2, home × 3, market × 3. */
export const BIG_CONTEXTS: readonly BigNumberContext[] = [
  {
    name: 'Trường',
    item: 'i:book',
    give: 'wpSubGiveHandout',
    giveTwoStep: 'wpTwoStepLeftHandout',
    giveStart: 'wpStartUnknownSubHandout',
  },
  {
    name: 'Trường',
    item: 'i:notebook',
    give: 'wpSubGiveHandout',
    giveTwoStep: 'wpTwoStepLeftHandout',
    giveStart: 'wpStartUnknownSubHandout',
  },
  {
    name: 'Nhà',
    item: 'i:riceKg',
    give: 'wpSubGiveSell',
    giveTwoStep: 'wpTwoStepLeftSell',
    giveStart: 'wpStartUnknownSubSell',
  },
  {
    name: 'Nhà',
    item: 'i:orange',
    give: 'wpSubGiveSell',
    giveTwoStep: 'wpTwoStepLeftSell',
    giveStart: 'wpStartUnknownSubSell',
  },
  {
    name: 'Nhà',
    item: 'i:mango',
    give: 'wpSubGiveSell',
    giveTwoStep: 'wpTwoStepLeftSell',
    giveStart: 'wpStartUnknownSubSell',
  },
  {
    name: 'Chợ',
    item: 'i:cake',
    give: 'wpSubGiveSell',
    giveTwoStep: 'wpTwoStepLeftSell',
    giveStart: 'wpStartUnknownSubSell',
  },
  {
    name: 'Chợ',
    item: 'i:banana',
    give: 'wpSubGiveSell',
    giveTwoStep: 'wpTwoStepLeftSell',
    giveStart: 'wpStartUnknownSubSell',
  },
  {
    name: 'Chợ',
    item: 'i:chicken',
    give: 'wpSubGiveSell',
    giveTwoStep: 'wpTwoStepLeftSell',
    giveStart: 'wpStartUnknownSubSell',
  },
];
