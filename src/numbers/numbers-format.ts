// SGK number display (phase 07 review fix): numbers ≥ 1000 group by 3 digits with a narrow
// no-break space (U+202F) — 7 726, 77 261, 10 000. Shared by the numbers family now;
// arithmetic and money will reuse it. Data stays plain digits — only the rendered text
// is grouped, so oracles and the number pad keep comparing plain numbers.
export const GROUP_SEP = '\u202F';

/** Format a number SGK-style: 77224 → "77 224"; below 1000 unchanged. */
export function formatNumber(n: number): string {
  const sign = n < 0 ? '-' : '';
  const digits = String(Math.abs(Math.trunc(n)));
  if (digits.length <= 3) return sign + digits;
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) groups.unshift(digits.slice(Math.max(0, i - 3), i));
  return sign + groups.join(GROUP_SEP);
}

/** Group every run of 4+ digits in a display string ("70000 + 7000" → "70 000 + 7 000"). */
export function formatDigitRuns(text: string): string {
  return text.replace(/\d{4,}/g, (run) => formatNumber(Number(run)));
}
