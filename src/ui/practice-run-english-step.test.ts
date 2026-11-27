// R114: a failed English widget chunk shows the load-failed toast and skips
// the item instead of leaving the dialog stuck; the previous item's Next
// button is locked while the chunk loads.
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import type { EnglishSkillId } from '../english/english-types';
import type { FactKey } from '../learning/fact-key';
import { tl } from '../levels/shared/level-host-strings';
import { lockPreviousNext, renderEnglishItemStep } from './practice-run-english-step';
import * as toastModule from './toast-and-persist';

// The widget chunk fails to load (offline, or a stale tab whose chunk hash the
// new deploy deleted).
vi.mock('./english/english-daily-item', () => {
  throw new Error('chunk load failed');
});

const stepCallbacks = () => ({
  onAnswered: vi.fn(),
  onNext: vi.fn(),
  onLeave: vi.fn(),
});

describe('renderEnglishItemStep (failed chunk)', () => {
  let showToastSpy: MockInstance;

  beforeEach(() => {
    // The real toast touches the DOM (and window); the step's contract is only
    // that it is called with the load-failed text.
    showToastSpy = vi.spyOn(toastModule, 'showToast').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as unknown as { document?: unknown }).document;
  });

  it('shows the load-failed toast and skips the item', async () => {
    const cb = stepCallbacks();
    await renderEnglishItemStep(
      'sk:en-letters-a-d' as FactKey,
      'en-letters-a-d' as EnglishSkillId,
      'Luyện tập',
      false,
      () => null,
      cb,
    );
    expect(showToastSpy).toHaveBeenCalledWith(tl('loadFailed'));
    expect(cb.onNext).toHaveBeenCalledTimes(1);
    expect(cb.onAnswered).not.toHaveBeenCalled();
  });

  it('locks the previous Next button before loading', async () => {
    const dailyNext = { disabled: false };
    const quizNext = { disabled: false };
    (globalThis as unknown as { document?: unknown }).document = {
      getElementById: () => ({
        querySelector: (selector: string) =>
          selector === '.daily-next' ? dailyNext : selector === '#next-question' ? quizNext : null,
      }),
    };
    const cb = stepCallbacks();
    const promise = renderEnglishItemStep(
      'sk:en-letters-a-d' as FactKey,
      'en-letters-a-d' as EnglishSkillId,
      'Luyện tập',
      false,
      () => null,
      cb,
    );
    // The lock runs synchronously, before the import is awaited.
    expect(dailyNext.disabled).toBe(true);
    expect(quizNext.disabled).toBe(true);
    await promise;
    expect(cb.onNext).toHaveBeenCalledTimes(1);
  });

  it('lockPreviousNext is a no-op without a DOM', () => {
    expect(() => lockPreviousNext()).not.toThrow();
  });
});
