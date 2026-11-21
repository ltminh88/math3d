// Ranges for the data family (phase 15): table values up to 3 digits (B73, researcher
// note), tally marks and bag items small enough to count by eye.
export const DATA_CAP = 999;

export const MIN_UNIT_PX = 24;

export const TALLY_MIN_MARKS = 6;
export const TALLY_MAX_MARKS = 30;

export const BAG_MAX_TOTAL = 20;

export const COLOURS = ['red', 'blue', 'yellow', 'green'] as const;
export type Colour = (typeof COLOURS)[number];
