// R147: a picture is an <img> when it is image data, emoji text otherwise —
// the raw data-URI string must never reach a button's text or label.
import { describe, expect, test } from 'vitest';
import { SVG_QUILT } from '../../english/content/svg-pictures';
import { isImagePicture, pictureEl, pictureForWord } from './english-picture';

type FakeEl = {
  readonly tagName: string;
  className: string;
  textContent: string | null;
  readonly children: FakeEl[];
  appendChild(child: FakeEl): FakeEl;
  [key: string]: unknown;
};

function fakeDoc(): Document {
  const createElement = (tag: string): FakeEl => {
    const children: FakeEl[] = [];
    return {
      tagName: tag.toUpperCase(),
      className: '',
      textContent: null,
      children,
      appendChild(child: FakeEl) {
        children.push(child);
        return child;
      },
    };
  };
  return { createElement } as unknown as Document;
}

describe('isImagePicture', () => {
  test('image sources vs emoji', () => {
    expect(isImagePicture(SVG_QUILT)).toBe(true);
    expect(isImagePicture('/pictures/cat.png')).toBe(true);
    expect(isImagePicture('https://example.com/cat.png')).toBe(true);
    expect(isImagePicture('🐱')).toBe(false);
    expect(isImagePicture('')).toBe(false);
  });
});

describe('pictureEl', () => {
  test('a data-URI picture becomes an <img> with an empty alt', () => {
    const el = pictureEl(SVG_QUILT, fakeDoc()) as unknown as FakeEl;
    expect(el.tagName).toBe('IMG');
    expect(String(el.src)).toBe(SVG_QUILT);
    expect(el.alt).toBe('');
    expect(el.className).toBe('english-picture-img');
  });

  test('an emoji picture stays a text span', () => {
    const el = pictureEl('🐱', fakeDoc()) as unknown as FakeEl;
    expect(el.tagName).toBe('SPAN');
    expect(el.textContent).toBe('🐱');
  });
});

describe('pictureForWord', () => {
  test('the bank picture for a word, null for an unknown word', () => {
    expect(pictureForWord('quilt')).toBe(SVG_QUILT);
    expect(pictureForWord('cat')).toBe('🐱');
    expect(pictureForWord('no-such-word')).toBeNull();
  });
});
