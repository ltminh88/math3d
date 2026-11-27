// SVG pictures (two-modes Phase 4, self-drawn): for Look bank words with no
// good emoji — eraser, desk, table. Same data-URI encoding as the CEC file:
// `<`/`>` as %3C/%3E, `#` as %23, single quotes inside. Each picture is a
// 64×64 SVG.
const svg = (inner: string): string =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E${inner}%3C/svg%3E`;

/** A pink eraser with a blue sleeve (word `eraser`). */
export const SVG_ERASER = svg(
  `%3Crect x='8' y='22' width='48' height='20' rx='4' fill='%23f472b6' stroke='%23be185d' stroke-width='2'/%3E` +
    `%3Crect x='8' y='22' width='16' height='20' rx='4' fill='%233b82f6'/%3E` +
    `%3Crect x='8' y='22' width='48' height='20' rx='4' fill='none' stroke='%23be185d' stroke-width='2'/%3E`,
);

/** A school desk: a slanted brown top, a drawer and two legs (word `desk`). */
export const SVG_DESK = svg(
  `%3Cpolygon points='10,26 54,20 54,28 10,34' fill='%23b45309' stroke='%2378350f' stroke-width='2'/%3E` +
    `%3Crect x='14' y='34' width='36' height='10' fill='%23d97706' stroke='%2378350f' stroke-width='2'/%3E` +
    `%3Crect x='14' y='44' width='5' height='14' fill='%2378350f'/%3E` +
    `%3Crect x='45' y='44' width='5' height='14' fill='%2378350f'/%3E`,
);

/** A dining table: a flat top and four legs (word `table`). */
export const SVG_TABLE = svg(
  `%3Crect x='6' y='20' width='52' height='6' rx='2' fill='%239ca3af' stroke='%236b7280' stroke-width='2'/%3E` +
    `%3Crect x='10' y='26' width='5' height='30' fill='%236b7280'/%3E` +
    `%3Crect x='49' y='26' width='5' height='30' fill='%236b7280'/%3E` +
    `%3Crect x='10' y='40' width='44' height='4' fill='%23d1d5db'/%3E`,
);

/** Word → self-drawn SVG picture, for Look words with no good emoji. */
export const LOOK_SVG_PICTURES: Readonly<Record<string, string>> = {
  eraser: SVG_ERASER,
  desk: SVG_DESK,
  table: SVG_TABLE,
};
