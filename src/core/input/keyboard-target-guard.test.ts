import { describe, expect, it } from 'vitest';
import {
  INTERACTIVE_SELECTOR,
  isInteractiveNode,
  shouldIgnoreSceneKey,
} from './keyboard-target-guard';

const el = (interactive: boolean) => ({
  closest: (selector: string) => (selector === INTERACTIVE_SELECTOR && interactive ? {} : null),
});
const key = (target: unknown, extra: Partial<KeyboardEvent> = {}) => ({
  defaultPrevented: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  target: target as EventTarget,
  ...extra,
});

describe('keyboard target guard', () => {
  it('detects controls and ignores non-elements', () => {
    expect(isInteractiveNode(el(true))).toBe(true);
    expect(isInteractiveNode(el(false))).toBe(false);
    expect(isInteractiveNode(null)).toBe(false);
    expect(isInteractiveNode({})).toBe(false);
  });

  it('skips keys aimed at a DOM control, by target or by focus', () => {
    expect(shouldIgnoreSceneKey(key(el(true)), el(false))).toBe(true);
    expect(shouldIgnoreSceneKey(key(el(false)), el(true))).toBe(true);
    expect(shouldIgnoreSceneKey(key(el(false)), el(false))).toBe(false);
  });

  it('skips modifier chords and handled events', () => {
    expect(shouldIgnoreSceneKey(key(el(false), { ctrlKey: true }), null)).toBe(true);
    expect(shouldIgnoreSceneKey(key(el(false), { defaultPrevented: true }), null)).toBe(true);
  });
});
