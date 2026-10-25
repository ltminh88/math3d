// English terms corrected after the recovery (QA m-9), applied to every English string the UI
// shows: legacy translator output and defineStrings tables. An override layer instead of edits,
// because the legacy table stays byte-equal to the original (golden test) and the level string
// tables belong to the level folders. The golden tests apply the same layer to the original
// corpus, like the math3d/VLM product rename.

/** [wrong English, corrected English]: "Rừng Nhân Chia" is the division (sharing) level. */
export const ENGLISH_TERM_OVERRIDES: ReadonlyArray<readonly [string, string]> = [
  ['Multiplication Forest', 'Sharing Forest'],
];

export function applyEnglishTermOverrides(text: string): string {
  return ENGLISH_TERM_OVERRIDES.reduce((acc, [from, to]) => acc.split(from).join(to), text);
}
