// English Island bug-fix regressions (R143/R146/R147/R148): seeded island runs
// so each round kind is deterministic — stage 1 seed 1 has an order-words and
// a letter-pick round; stage 2 seed 2 has a listen-pick-picture round whose
// choices include a self-drawn SVG data URI (quilt). Runs on desktop +
// tablet only (mobile-pixel is covered by the shared specs).
import { type Page, test } from '@playwright/test';
import { englishClipUrl } from '../../src/english/content/audio-map';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

type IslandState = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['state']>>;
type Expected = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['currentAnswer']>>;

const islandState = (page: Page) =>
  page.evaluate(() => window.__game?.island.state()) as Promise<IslandState | null>;
const islandAnswer = (page: Page) =>
  page.evaluate(() => window.__game?.island.currentAnswer()) as Promise<Expected | null>;

async function tapOrClick(locator: ReturnType<Page['locator']>, tap: boolean): Promise<void> {
  if (tap) await locator.tap();
  else await locator.click();
}

async function boot(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window && !!window.__game?.island);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

async function startIsland(page: Page, stage: number, seed: number): Promise<void> {
  await page.evaluate(([s, sd]) => window.__game?.island.start(s, sd), [stage, seed] as const);
  await expect(page.locator('.english-run')).toBeVisible();
}

/** Tap the right answer for the current item (one action per kind). */
async function answerRight(page: Page, tap: boolean): Promise<void> {
  const expected = await islandAnswer(page);
  if (!expected) throw new Error('no current answer');
  if (expected.kind === 'listen-pick-picture' || expected.kind === 'letter-pick') {
    await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  } else if (expected.kind === 'fill-pattern') {
    await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  } else if (expected.kind === 'match-pairs') {
    for (const pair of expected.pairs) {
      await tapOrClick(
        page
          .locator('.english-pair-column')
          .nth(0)
          .getByRole('button', { name: pair.word, exact: true }),
        tap,
      );
      await tapOrClick(
        page
          .locator('.english-pair-column')
          .nth(1)
          .getByRole('button', { name: pair.word, exact: true }),
        tap,
      );
    }
  } else {
    for (const word of expected.words) {
      await tapOrClick(page.getByRole('button', { name: word, exact: true }), tap);
    }
    await tapOrClick(page.locator('.english-check'), tap);
  }
  await expect(page.locator('.english-next')).toBeVisible();
}

async function nextRound(page: Page, tap: boolean): Promise<void> {
  await tapOrClick(page.locator('.english-next'), tap);
  await expect(page.locator('.english-next')).toBeHidden();
}

/** Fake speechSynthesis that records every spoken text on `window.__spoken`. */
async function fakeSpeech(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __spoken: string[];
      SpeechSynthesisUtterance: new (text: string) => unknown;
      speechSynthesis: unknown;
    };
    w.__spoken = [];
    // `speechSynthesis` is a getter-only property on Window.prototype — a
    // plain assignment silently does nothing, so define it outright.
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [{ lang: 'en-US', name: 'Fake English US', localService: true }],
        speak: (u: { text: string }) => {
          w.__spoken.push(u.text);
        },
        cancel: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      configurable: true,
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class {
        text: string;
        lang = '';
        voice: unknown = null;
        volume = 1;
        rate = 1;
        constructor(text: string) {
          this.text = text;
        }
      },
      configurable: true,
    });
  });
}

const spokenTexts = (page: Page) =>
  page.evaluate(() => (window as unknown as { __spoken?: string[] }).__spoken ?? []) as Promise<
    string[]
  >;

/** Record every Audio URL the page constructs (the 2C clip path) on `window.__playedClips`. */
async function recordClipPlays(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __playedClips: string[];
      Audio: typeof Audio;
    };
    w.__playedClips = [];
    const RealAudio = w.Audio;
    w.Audio = class extends RealAudio {
      constructor(url?: string) {
        super(url);
        if (url) w.__playedClips.push(url);
      }
    } as typeof Audio;
  });
}

const playedClips = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __playedClips?: string[] }).__playedClips ?? [],
  ) as Promise<string[]>;

/**
 * Play rounds until `kind` appears (or the run ends). Returns the round's
 * expected answer. The seeded runs below always contain the wanted kind.
 */
async function findKind(
  page: Page,
  tap: boolean,
  kind: string,
  extra?: (state: IslandState) => boolean,
): Promise<Expected> {
  for (let round = 1; round <= 8; round++) {
    const state = await islandState(page);
    if (!state || state.done) break;
    if (state.kind === kind && (!extra || extra(state))) {
      const expected = await islandAnswer(page);
      if (!expected) throw new Error('no current answer');
      return expected;
    }
    await answerRight(page, tap);
    await nextRound(page, tap);
  }
  throw new Error(`no ${kind} round in 8 rounds`);
}

test('R143: word tiles lay out in one horizontal row, hint is enabled from the start', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-pixel',
    'R143–R148 e2e runs on desktop + tablet only',
  );
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await startIsland(page, 1, 1);
  await findKind(page, tap, 'order-words');
  // The widget CSS loads on the island path: the bank is a flex row, so tiles
  // that fit share one top line instead of stacking one word per row.
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const bank = document.querySelector('.english-bank');
          if (!bank) return null;
          const tiles = [...document.querySelectorAll('.english-bank .english-tile')];
          const slots = [...document.querySelectorAll('.english-slot')];
          return {
            bankDisplay: getComputedStyle(bank).display,
            tileTops: [...new Set(tiles.map((t) => Math.round(t.getBoundingClientRect().top)))],
            slotTops: [...new Set(slots.map((s) => Math.round(s.getBoundingClientRect().top)))],
          };
        }),
      { timeout: 10_000 },
    )
    .toEqual({
      bankDisplay: 'flex',
      tileTops: [expect.any(Number)],
      slotTops: [expect.any(Number)],
    });
  // R143: the hint button is usable before the first miss.
  await expect(page.locator('.english-hint')).toBeEnabled();
});

test('R143: the first hint places the first word, the second hint the second', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-pixel',
    'R143–R148 e2e runs on desktop + tablet only',
  );
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await startIsland(page, 1, 1);
  const expected = await findKind(page, tap, 'order-words');
  if (expected.kind !== 'order-words') throw new Error('expected an order-words round');
  await tapOrClick(page.locator('.english-hint'), tap);
  await expect(page.locator('.english-feedback')).toContainText('nhìn kĩ');
  await expect(page.locator('.english-slot').nth(0)).toHaveText(expected.words[0] as string);
  await tapOrClick(page.locator('.english-hint'), tap);
  await expect(page.locator('.english-feedback')).toContainText('bỏ một đáp án sai');
  await expect(page.locator('.english-slot').nth(1)).toHaveText(expected.words[1] as string);
  await expect(page.locator('.english-hint')).toBeDisabled();
});

test('R146: a letter-pick round shows the picture, not the word, until solved', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-pixel',
    'R143–R148 e2e runs on desktop + tablet only',
  );
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await startIsland(page, 1, 1);
  const expected = await findKind(
    page,
    tap,
    'letter-pick',
    (state) => state.skillId !== 'en-alphabet-order',
  );
  if (expected.kind !== 'letter-pick') throw new Error('expected a letter-pick round');
  // Before answering, the prompt holds a picture — no two-letter word text.
  const promptText = (await page.locator('.english-prompt').textContent()) ?? '';
  expect(promptText).not.toMatch(/[a-z]{2,}/);
  await expect(
    page.locator('.english-prompt img, .english-prompt .english-picture-emoji'),
  ).toHaveCount(1);
  await expect(page.locator('.english-listen')).toBeVisible();
  // After the right tap, the spelling appears.
  await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  await expect(page.locator('.english-prompt')).toContainText(/[a-z]{2,}/);
  await expect(page.locator('.english-next')).toBeVisible();
});

test('R146: the word auto-plays once when a letter-pick round opens', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-pixel',
    'R143–R148 e2e runs on desktop + tablet only',
  );
  const tap = !!testInfo.project.use.hasTouch;
  await fakeSpeech(page);
  await recordClipPlays(page);
  await boot(page);
  await startIsland(page, 1, 1);
  const expected = await findKind(
    page,
    tap,
    'letter-pick',
    (state) => state.skillId !== 'en-alphabet-order',
  );
  if (expected.kind !== 'letter-pick') throw new Error('expected a letter-pick round');
  // Answer right: the prompt reveals the word, which the auto-play must
  // already have spoken on mount (clip, or speechSynthesis as fallback).
  await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  const word = ((await page.locator('.english-prompt').textContent()) ?? '').trim();
  expect(word.length).toBeGreaterThan(1);
  const clipUrl = englishClipUrl(word);
  await expect
    .poll(
      async () => {
        const spoken = await spokenTexts(page);
        if (spoken.includes(word)) return true;
        if (clipUrl === null) return false;
        const played = await playedClips(page);
        return played.includes(clipUrl);
      },
      { timeout: 10_000 },
    )
    .toBe(true);
  await expect(page.locator('.english-next')).toBeVisible();
});

test('R147: a data-URI picture renders as an <img>, never as button text', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-pixel',
    'R143–R148 e2e runs on desktop + tablet only',
  );
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await startIsland(page, 2, 2);
  let foundImageChoice = false;
  for (let round = 1; round <= 8; round++) {
    const state = await islandState(page);
    if (!state || state.done) break;
    if (state.kind === 'listen-pick-picture' || state.kind === 'match-pairs') {
      // No button anywhere shows the raw data URI as text or label.
      const bad = await page.evaluate(() => {
        const bad: string[] = [];
        for (const b of [...document.querySelectorAll('.english-choice')]) {
          const text = b.textContent ?? '';
          const label = b.getAttribute('aria-label') ?? '';
          if (text.startsWith('data:') || label.startsWith('data:')) bad.push(text.slice(0, 30));
        }
        return bad;
      });
      expect(bad).toEqual([]);
      if (state.kind === 'listen-pick-picture') {
        const imgCount = await page.locator('.english-choice-grid .english-choice img').count();
        if (imgCount > 0) {
          foundImageChoice = true;
          const src = await page
            .locator('.english-choice-grid .english-choice img')
            .first()
            .getAttribute('src');
          expect(src).toMatch(/^data:image\/svg\+xml,/);
          break;
        }
      }
    }
    await answerRight(page, tap);
    await nextRound(page, tap);
  }
  expect(foundImageChoice).toBe(true);
});

test('R148: picture choices are big square cells with ~80 px pictures', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile-pixel',
    'R143–R148 e2e runs on desktop + tablet only',
  );
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await startIsland(page, 2, 2);
  await findKind(page, tap, 'listen-pick-picture');
  const box = await page
    .locator('.english-choice-grid .english-picture-choice')
    .first()
    .boundingBox();
  expect(box).not.toBeNull();
  const { width, height } = box as { width: number; height: number };
  expect(Math.abs(width - height) / width).toBeLessThan(0.05);
  const fontSize = await page
    .locator('.english-choice-grid .english-picture-choice')
    .first()
    .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(56);
  const img = page.locator('.english-choice-grid .english-choice img').first();
  if ((await img.count()) > 0) {
    const imgBox = await img.boundingBox();
    expect(imgBox).not.toBeNull();
    expect((imgBox as { width: number }).width).toBeGreaterThanOrEqual(56);
    expect((imgBox as { width: number }).width).toBeLessThanOrEqual(88);
  }
});
