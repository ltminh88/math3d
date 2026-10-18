import { describe, expect, it } from 'vitest';
import { pickVoice } from './speech-voice-picker';

describe('pickVoice', () => {
  it('prefers exact vi-VN over other vi variants', () => {
    const voices = [
      { lang: 'vi', name: 'generic' },
      { lang: 'vi-VN', name: 'Linh' },
    ];
    expect(pickVoice(voices, 'vi')?.name).toBe('Linh');
  });

  it('accepts Android style vi_VN and falls back to bare vi', () => {
    expect(pickVoice([{ lang: 'vi_VN', name: 'a' }], 'vi')?.name).toBe('a');
    expect(pickVoice([{ lang: 'vi', name: 'b' }], 'vi')?.name).toBe('b');
  });

  it('returns null rather than an English voice for Vietnamese', () => {
    const voices = [
      { lang: 'en-US', name: 'Samantha' },
      { lang: 'vim-XX', name: 'lookalike' },
    ];
    expect(pickVoice(voices, 'vi')).toBeNull();
    expect(pickVoice([], 'vi')).toBeNull();
  });

  it('prefers local voices among equals and picks en-US for en', () => {
    const voices = [
      { lang: 'en-GB', name: 'Daniel' },
      { lang: 'en-US', name: 'remote', localService: false },
      { lang: 'en-US', name: 'local', localService: true },
    ];
    expect(pickVoice(voices, 'en')?.name).toBe('local');
  });
});
