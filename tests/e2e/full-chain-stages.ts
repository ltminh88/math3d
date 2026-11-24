// Expected quest card, gate and map data for each level stage of the full-chain e2e walk
// (field → numberfort). The bridge stage and the closing card are checked inline in the spec.

export const CHAIN = [
  'field',
  'forest',
  'city',
  'tower',
  'garden',
  'valley',
  'workshop',
  'cave',
  'market',
  'numberfort',
] as const;

export type LevelId = (typeof CHAIN)[number];

export interface Stage {
  readonly levelId: LevelId;
  readonly region: string;
  readonly gate: string;
  readonly title: string;
  readonly progress: string;
}

/** Cell names of each chapter row, in chain order (chapter 1 starts with the bridge). */
export const CHAPTER_CELLS = [
  ['Cây cầu', 'Cánh Đồng', 'Khu Rừng', 'Thành Phố', 'Tháp'],
  ['Khu Vườn', 'Thung Lũng', 'Xưởng', 'Hang'],
  ['Khu Chợ', 'Lâu Đài'],
] as const;

export const STAGES: readonly Stage[] = [
  ['field', 'meadow', 'Cánh Đồng Phép Tính', 'Đến Cổng Cánh Đồng'],
  ['forest', 'forest', 'Rừng Nhân Chia', 'Đến Cổng Rừng Nhân Chia'],
  ['city', 'city', 'Thành Phố Con Số', 'Đến Cổng Thành Phố Con Số'],
  ['tower', 'tower', 'Tháp Toán Học', 'Đến Cổng Tháp Toán Học'],
  ['garden', 'garden', 'Khu Vườn Quy Luật', 'Đến Cổng Khu Vườn'],
  ['valley', 'valley', 'Thung Lũng Hình Học', 'Đến Cổng Thung Lũng'],
  ['workshop', 'workshop', 'Xưởng Đo Đạc', 'Đến Cổng Xưởng Đo Đạc'],
  ['cave', 'cave', 'Hang Đố Vui', 'Đến Cổng Hang Đố Vui'],
  ['market', 'market', 'Chợ Phiên Tí Hon', 'Đến Cổng Chợ Phiên'],
  ['numberfort', 'numberfort', 'Lâu Đài Số', 'Đến Cổng Lâu Đài Số'],
].map(([levelId, region, title, progress]) => ({
  levelId: levelId as LevelId,
  region: region as string,
  gate: `Cổng ${title}`,
  title: title as string,
  progress: progress as string,
}));

/** Chapter row the card shows while `stage` (index into STAGES) is the next gate. */
export function chapterRow(stage: number): {
  label: string;
  cells: string[];
  done: number;
} {
  // Chain position 1..11 (bridge = 0); chapter 1 holds positions 0..4, chapter 2 holds
  // 5..8, chapter 3 holds 9..10.
  const position = stage + 1;
  const chapter = position < 5 ? 0 : position < 9 ? 1 : 2;
  const first = chapter === 0 ? 0 : chapter === 1 ? 5 : 9;
  const names = CHAPTER_CELLS[chapter] ?? [];
  const done = Math.min(position - first, names.length);
  const cells = names.map(
    (name, i) => `Thử thách ${first + i + 1}: ${name}, ${i < done ? 'đã xong' : 'chưa xong'}`,
  );
  return { label: `Chương ${chapter + 1} · ${done}/${names.length}`, cells, done };
}
