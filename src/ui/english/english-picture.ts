// Shared picture rendering (R147): every place that shows a word's "picture"
// goes through here, so a self-drawn SVG data URI becomes a real <img> and an
// emoji stays text. The accessible label is always the word — never the
// data-URI string (a raw data URI once printed as a choice's text on iPad).
import { ENGLISH_WORD_BANK } from '../../english/content/word-bank';

/** True when the picture is an image (SVG data URI, path or URL), not an emoji. */
export function isImagePicture(picture: string): boolean {
  return picture.startsWith('data:') || picture.startsWith('/') || picture.startsWith('http');
}

/** One picture element: <img> for image pictures, a span for emoji. */
export function pictureEl(picture: string, doc: Document): HTMLElement {
  if (isImagePicture(picture)) {
    const img = doc.createElement('img');
    img.className = 'english-picture-img';
    img.src = picture;
    img.alt = '';
    img.draggable = false;
    return img;
  }
  const span = doc.createElement('span');
  span.className = 'english-picture-emoji';
  span.textContent = picture;
  return span;
}

/** The bank picture for a word, or null when the bank has none. */
export function pictureForWord(word: string): string | null {
  return ENGLISH_WORD_BANK.find((w) => w.word === word)?.picture ?? null;
}
