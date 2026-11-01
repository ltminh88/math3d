// Touch-first screens (phones, tablets) report a coarse primary pointer: hints there name the
// on-screen buttons instead of keys (no "nhấn E" / "Nhấn M" where there is no keyboard).
export const isCoarsePointer = (): boolean =>
  globalThis.matchMedia?.('(pointer: coarse)').matches ?? false;
