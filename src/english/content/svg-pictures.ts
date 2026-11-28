// SVG pictures (Phase 2A, self-drawn): for bank words with no good emoji.
// Same data-URI encoding as the synthetic pack fixture: `<`/`>` as %3C/%3E,
// `#` as %23, single quotes inside. Each picture is drawn on a 64×64
// viewBox (R148: no fixed width/height, so it scales up sharp).
const svg = (inner: string): string =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E${inner}%3C/svg%3E`;

/** A patchwork quilt: four coloured squares (word `quilt`). */
export const SVG_QUILT = svg(
  `%3Crect x='4' y='4' width='28' height='28' fill='%23ef4444'/%3E` +
    `%3Crect x='32' y='4' width='28' height='28' fill='%23f59e0b'/%3E` +
    `%3Crect x='4' y='32' width='28' height='28' fill='%233b82f6'/%3E` +
    `%3Crect x='32' y='32' width='28' height='28' fill='%2322c55e'/%3E` +
    `%3Crect x='4' y='4' width='56' height='56' fill='none' stroke='%23ffffff' stroke-width='2'/%3E`,
);

/** A xylophone: five rainbow bars with two mallets (word `xylophone`). */
export const SVG_XYLOPHONE = svg(
  `%3Crect x='6' y='8' width='52' height='8' rx='2' fill='%23ef4444'/%3E` +
    `%3Crect x='9' y='18' width='46' height='8' rx='2' fill='%23f59e0b'/%3E` +
    `%3Crect x='12' y='28' width='40' height='8' rx='2' fill='%2322c55e'/%3E` +
    `%3Crect x='15' y='38' width='34' height='8' rx='2' fill='%233b82f6'/%3E` +
    `%3Crect x='18' y='48' width='28' height='8' rx='2' fill='%23a855f7'/%3E` +
    `%3Cline x1='20' y1='14' x2='14' y2='4' stroke='%2378350f' stroke-width='2'/%3E` +
    `%3Ccircle cx='13' cy='4' r='3' fill='%23ef4444'/%3E` +
    `%3Cline x1='44' y1='14' x2='50' y2='4' stroke='%2378350f' stroke-width='2'/%3E` +
    `%3Ccircle cx='51' cy='4' r='3' fill='%233b82f6'/%3E`,
);

/** A zigzag line (word `zigzag`). */
export const SVG_ZIGZAG = svg(
  `%3Cpolyline points='8,50 20,14 32,50 44,14 56,50' fill='none' stroke='%23f59e0b' stroke-width='6' stroke-linejoin='round' stroke-linecap='round'/%3E`,
);

/** A yogurt cup with a spoon (word `yogurt`). */
export const SVG_YOGURT = svg(
  `%3Cpath d='M18 18 L46 18 L42 54 L22 54 Z' fill='%23ffffff' stroke='%23ef4444' stroke-width='2'/%3E` +
    `%3Crect x='19' y='26' width='26' height='6' fill='%23f472b6'/%3E` +
    `%3Cline x1='44' y1='6' x2='38' y2='20' stroke='%239ca3af' stroke-width='3'/%3E` +
    `%3Cellipse cx='45' cy='6' rx='5' ry='3' fill='%239ca3af'/%3E`,
);

/** A zoo gate: two posts, a green sign reading ZOO, a fence (word `zoo`). */
export const SVG_ZOO = svg(
  `%3Crect x='8' y='20' width='6' height='40' fill='%2378350f'/%3E` +
    `%3Crect x='50' y='20' width='6' height='40' fill='%2378350f'/%3E` +
    `%3Crect x='8' y='12' width='48' height='13' rx='3' fill='%2322c55e'/%3E` +
    `%3Ctext x='32' y='22' font-size='10' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-weight='bold'%3EZOO%3C/text%3E` +
    `%3Cline x1='14' y1='34' x2='50' y2='34' stroke='%2378350f' stroke-width='2'/%3E` +
    `%3Cline x1='14' y1='46' x2='50' y2='46' stroke='%2378350f' stroke-width='2'/%3E` +
    `%3Crect x='4' y='58' width='56' height='4' fill='%2322c55e'/%3E`,
);

/** Word → self-drawn SVG picture, for words with no good emoji. */
export const SVG_PICTURES: Readonly<Record<string, string>> = {
  quilt: SVG_QUILT,
  xylophone: SVG_XYLOPHONE,
  zigzag: SVG_ZIGZAG,
  yogurt: SVG_YOGURT,
  zoo: SVG_ZOO,
};
