// RED-first: pure logic of the clip generator — clip ids, TTS input text,
// text hashes, skip planning, audio-map + credits emission. No TTS or ffmpeg
// runs here; the runner shells out to those.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  clipFileName,
  clipIdFor,
  emitAudioMap,
  emitCredits,
  planClips,
  SEED_TEXTS,
  textHash,
  ttsTextFor,
} from './generate-clips.mjs';

type ClipItem = { text: string; kind: 'word' | 'letter' | 'sentence' };

const word = (text: string): ClipItem => ({ text, kind: 'word' });
const letter = (text: string): ClipItem => ({ text, kind: 'letter' });
const sentence = (text: string): ClipItem => ({ text, kind: 'sentence' });

describe('clipIdFor', () => {
  it('is the word itself for words', () => {
    expect(clipIdFor(word('cat'))).toBe('cat');
    expect(clipIdFor(word('yellow'))).toBe('yellow');
  });

  it('prefixes single letters so they cannot collide with words', () => {
    expect(clipIdFor(letter('b'))).toBe('letter-b');
    expect(clipIdFor(letter('a'))).toBe('letter-a');
  });

  it('slugs sentences, dropping punctuation', () => {
    expect(clipIdFor(sentence('This is a cat'))).toBe('this-is-a-cat');
    expect(clipIdFor(sentence('What is this? It is a cat'))).toBe('what-is-this-it-is-a-cat');
    expect(clipIdFor(sentence('My favourite colour is red'))).toBe('my-favourite-colour-is-red');
  });

  it('is injective over the seed set', () => {
    const ids = SEED_TEXTS.map((text) =>
      clipIdFor({
        text,
        kind: text.length === 1 ? 'letter' : text.includes(' ') ? 'sentence' : 'word',
      }),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('ttsTextFor', () => {
  it('adds a trailing period to words (Kokoro glitches on bare short inputs)', () => {
    expect(ttsTextFor(word('cat'))).toBe('cat.');
    expect(ttsTextFor(word('yellow'))).toBe('yellow.');
  });

  it('spells letter names phonetically so the engine does not read "capital B"', () => {
    expect(ttsTextFor(letter('a'))).toBe('ay.');
    expect(ttsTextFor(letter('b'))).toBe('bee.');
    expect(ttsTextFor(letter('e'))).toBe('ee.');
    expect(ttsTextFor(letter('h'))).toBe('aych.');
    expect(ttsTextFor(letter('z'))).toBe('zee.');
  });

  it('adds a trailing period to sentences that lack one, keeps the question mark', () => {
    expect(ttsTextFor(sentence('This is a cat'))).toBe('This is a cat.');
    expect(ttsTextFor(sentence('What is this? It is a cat'))).toBe('What is this? It is a cat.');
  });
});

describe('textHash', () => {
  it('is deterministic and differs between texts', () => {
    expect(textHash('cat.')).toBe(textHash('cat.'));
    expect(textHash('cat.')).not.toBe(textHash('dog.'));
    expect(textHash('cat.')).toHaveLength(12);
  });

  // R89 fix 1: the hash must cover voice + speed, or a voice/speed change
  // leaves planClips on 'skip' and children keep hearing the old clip.
  it('differs when the voice changes', () => {
    expect(textHash('cat.', 'af_heart', 0.9)).not.toBe(textHash('cat.', 'af_sarah', 0.9));
  });

  it('differs when the speed changes', () => {
    expect(textHash('cat.', 'af_heart', 0.9)).not.toBe(textHash('cat.', 'af_heart', 1.0));
  });

  it('is stable for the same text + voice + speed', () => {
    expect(textHash('cat.', 'af_heart', 0.9)).toBe(textHash('cat.', 'af_heart', 0.9));
  });
});

describe('clipFileName', () => {
  // R89 fix 2: the hash rides in the file name, so a regenerated clip is a
  // new URL and the SW CacheFirst cache cannot serve the stale one.
  it('is slug + first 8 hash chars + .mp3', () => {
    expect(clipFileName('cat', 'abcdef012345')).toBe('cat-abcdef01.mp3');
    expect(clipFileName('letter-b', '0123456789ab')).toBe('letter-b-01234567.mp3');
  });
});

describe('planClips', () => {
  it('generates everything when the manifest is empty', () => {
    const items = [word('cat'), letter('b')];
    const plan = planClips(items, { clips: {} }, '/nonexistent-dir');
    expect(plan.map((p) => p.action)).toEqual(['generate', 'generate']);
  });

  it('skips a clip whose hashed mp3 exists and whose hash matches, regenerates the rest', () => {
    const dir = mkdtempSync(join(tmpdir(), 'clips-'));
    const items = [word('cat'), word('dog')];
    const catHash = textHash(ttsTextFor(word('cat')), 'af_heart', 0.9);
    writeFileSync(join(dir, clipFileName('cat', catHash)), Buffer.from([0x49, 0x44, 0x33]));
    const manifest = { clips: { cat: { text: 'cat', hash: catHash } } };
    const plan = planClips(items, manifest, dir);
    expect(plan.map((p) => p.action)).toEqual(['skip', 'generate']);
  });

  it('regenerates when only the old bare mp3 exists (hash is now in the file name)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'clips-'));
    const items = [word('cat')];
    const catHash = textHash(ttsTextFor(word('cat')), 'af_heart', 0.9);
    writeFileSync(join(dir, 'cat.mp3'), Buffer.from([0x49, 0x44, 0x33]));
    const manifest = { clips: { cat: { text: 'cat', hash: catHash } } };
    expect(planClips(items, manifest, dir)[0]?.action).toBe('generate');
  });

  it('regenerates when the hash changed or the mp3 is missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'clips-'));
    const items = [word('cat')];
    const stale = { clips: { cat: { text: 'cat', hash: 'deadbeef0000' } } };
    expect(planClips(items, stale, dir)[0]?.action).toBe('generate');
    mkdirSync(join(dir, 'sub'), { recursive: true });
    const missing = { clips: { cat: { text: 'cat', hash: textHash('cat.') } } };
    expect(planClips(items, missing, dir)[0]?.action).toBe('generate');
  });
});

describe('emitAudioMap', () => {
  it('emits the 3B map shape (text -> hashed mp3 URL) plus the englishClipUrl helper', () => {
    const src = emitAudioMap([
      { text: 'cat', id: 'cat', hash: 'abcdef012345' },
      { text: 'This is a cat', id: 'this-is-a-cat', hash: '0123456789ab' },
    ]);
    expect(src).toContain('ENGLISH_AUDIO_CLIPS');
    expect(src).toContain(`cat: '/english-audio/cat-abcdef01.mp3'`);
    expect(src).toContain(`'This is a cat': '/english-audio/this-is-a-cat-01234567.mp3'`);
    expect(src).toContain('export function englishClipUrl(text: string): string | null');
  });
});

describe('emitCredits', () => {
  it('records engine, voice, version and license', () => {
    const md = emitCredits({ kokoroVersion: '0.9.2', speed: 0.9 });
    expect(md).toContain('Kokoro');
    expect(md).toContain('af_heart');
    expect(md).toContain('Apache-2.0');
    expect(md).toContain('0.9.2');
  });
});

describe('SEED_TEXTS', () => {
  it('is 12 words + 5 letters + 4 sentences', () => {
    expect(SEED_TEXTS).toHaveLength(12 + 5 + 4);
  });
});
