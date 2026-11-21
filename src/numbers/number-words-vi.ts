// Reading a number aloud in Vietnamese (KNTT wording for grades 1–3): "lẻ" for a zero tens,
// "mốt" / "tư" / "lăm" for 1 / 4 / 5 after a tens, "không trăm" for a zero hundreds inside a
// 4–5 digit number, "mười nghìn" for 10 000, "một trăm nghìn" for 100 000. Pure helper;
// the hand-written oracle table lives in number-words-vi.test.ts.
const ONES = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'] as const;

/** The ones digit after a tens: 1 → "mốt", 4 → "tư", 5 → "lăm", else the plain word. */
const onesAfterTens = (o: number): string =>
  o === 1 ? 'mốt' : o === 4 ? 'tư' : o === 5 ? 'lăm' : (ONES[o] ?? '');

/** Tens + ones of a group: "mười lăm", "hai mươi mốt"; after a hundreds a zero tens
    shows as "lẻ năm", without one it is just "năm". */
function readTensOnes(t: number, o: number, afterHundreds: boolean): string {
  if (t === 0) return o === 0 ? '' : afterHundreds ? `lẻ ${ONES[o]}` : (ONES[o] ?? '');
  if (t === 1) return o === 0 ? 'mười' : `mười ${o === 5 ? 'lăm' : ONES[o]}`;
  return o === 0 ? `${ONES[t]} mươi` : `${ONES[t]} mươi ${onesAfterTens(o)}`;
}

/** A 1–999 group: "một trăm lẻ năm", "mười lăm", "hai mươi mốt", "năm". */
function readBelowThousand(n: number): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  const hundreds = h > 0 ? `${ONES[h]} trăm` : '';
  const rest = readTensOnes(t, o, h > 0);
  if (hundreds === '') return rest;
  return rest === '' ? hundreds : `${hundreds} ${rest}`;
}

/** The units group after "nghìn": a zero hundreds shows as "không trăm ...". */
function readUnitsGroup(n: number): string {
  if (n === 0) return '';
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return `không trăm ${readTensOnes(t, o, true)}`;
  }
  return readBelowThousand(n);
}

/** Vietnamese words for 0–100 000 ("một trăm nghìn" at the top). */
export function numberToVietnameseWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 100000)
    throw new RangeError(`numberToVietnameseWords needs 0-100000, got ${n}`);
  if (n === 0) return 'không';
  const thousands = Math.floor(n / 1000);
  const units = n % 1000;
  if (thousands === 0) return readBelowThousand(n);
  const head = `${readBelowThousand(thousands)} nghìn`;
  const tail = readUnitsGroup(units);
  return tail === '' ? head : `${head} ${tail}`;
}
