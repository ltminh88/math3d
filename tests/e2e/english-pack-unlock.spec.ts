// English Island Phase 3B: the pack unlock dialog + the speaker, driven through
// the test-build hook `window.__game.island`. The pack endpoint is faked with
// `page.route` (the synthetic fixture); `speechSynthesis` is faked and Audio
// plays are recorded so the "🔊 Nghe" tap is observable without a real voice
// — since Phase 2C step 2 every word has a clip, so Nghe normally plays the
// mp3 and never calls speechSynthesis.
import { type Page, test } from '@playwright/test';
import { englishClipUrl } from '../../src/english/content/audio-map';
import { SYNTHETIC_PACK } from '../../src/english/fixtures/synthetic-pack';
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

async function startIsland(page: Page): Promise<void> {
  await page.evaluate(() => window.__game?.island.start(1));
  await expect(page.locator('.english-run')).toBeVisible();
}

/** Two box-1 skills (both have pack items for every kind they roll), the rest box 5. */
async function seedPackSkills(page: Page): Promise<void> {
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:en-words-a-d': { box: 1 },
      'sk:en-letters-a-d': { box: 1 },
      'sk:en-sounds-a-d': { box: 5 },
      'sk:en-pattern-i-like': { box: 5 },
      'sk:en-pattern-this-is': { box: 5 },
    }),
  );
}

/** Tap the right answer for the current item (one action per kind). */
async function answerRight(page: Page, tap: boolean): Promise<void> {
  const expected = await islandAnswer(page);
  if (!expected) throw new Error('no current answer');
  if (
    expected.kind === 'listen-pick-picture' ||
    expected.kind === 'letter-pick' ||
    expected.kind === 'fill-pattern'
  ) {
    await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  } else if (expected.kind === 'match-pairs') {
    for (const pair of expected.pairs) {
      await tapOrClick(page.getByRole('button', { name: pair.word, exact: true }), tap);
      await tapOrClick(page.getByRole('button', { name: pair.picture, exact: true }), tap);
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

/** Read the stored pack row out of the pack's own IndexedDB database. */
const readStoredPack = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ passphrase: string | null; hasPack: boolean }>((resolve) => {
        const open = indexedDB.open('english-pack-db', 1);
        open.onsuccess = () => {
          const db = open.result;
          const get = db.transaction('pack', 'readonly').objectStore('pack').get('current');
          get.onsuccess = () => {
            const v = get.result as { passphrase?: string; pack?: unknown } | undefined;
            resolve({ passphrase: v?.passphrase ?? null, hasPack: !!v?.pack });
            db.close();
          };
          get.onerror = () => {
            resolve({ passphrase: null, hasPack: false });
            db.close();
          };
        };
        open.onerror = () => resolve({ passphrase: null, hasPack: false });
      }),
  ) as Promise<{ passphrase: string | null; hasPack: boolean }>;

test('no request before a passphrase; unlock joins pack items from the next round', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  let requests = 0;
  await page.route('**/api/english-pack', async (route) => {
    requests += 1;
    const body = (route.request().postDataJSON() ?? {}) as { passphrase?: string };
    if (body.passphrase === 'gia-dinh') {
      await route.fulfill({ status: 200, json: { ok: true, pack: SYNTHETIC_PACK } });
    } else {
      await route.fulfill({ status: 401, json: { ok: false, error: 'bad-passphrase' } });
    }
  });
  await fakeSpeech(page);
  await boot(page);
  await seedPackSkills(page);
  await startIsland(page);
  expect(requests).toBe(0);

  // Wrong passphrase first: one gentle error, one request, dialog stays open.
  await tapOrClick(page.getByRole('button', { name: 'Phụ huynh' }), tap);
  await expect(page.locator('.english-unlock-dialog')).toBeVisible();
  await page.locator('.english-unlock-dialog__input').fill('sai');
  await tapOrClick(page.getByRole('button', { name: 'Mở khóa' }), tap);
  await expect(page.locator('.english-unlock-dialog__error')).toContainText('chưa đúng');
  expect(requests).toBe(1);

  // Right passphrase: pack opens, round 2 (the other box-1 skill) is a pack item.
  await page.locator('.english-unlock-dialog__input').fill('gia-dinh');
  await tapOrClick(page.getByRole('button', { name: 'Mở khóa' }), tap);
  await expect(page.locator('.english-feedback')).toContainText('Đã mở gói bài tập');
  expect(requests).toBe(2);
  await answerRight(page, tap);
  await nextRound(page, tap);
  await expect(page.locator('.english-widget')).toContainText('zib');
});

test('401 clears the stored passphrase but keeps the pack', async ({ page }, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  let mode: 'ok' | 'unauthorized' = 'ok';
  await page.route('**/api/english-pack', async (route) => {
    if (mode === 'ok') {
      await route.fulfill({ status: 200, json: { ok: true, pack: SYNTHETIC_PACK } });
    } else {
      await route.fulfill({ status: 401, json: { ok: false, error: 'bad-passphrase' } });
    }
  });
  await boot(page);
  await startIsland(page);
  await tapOrClick(page.getByRole('button', { name: 'Phụ huynh' }), tap);
  await page.locator('.english-unlock-dialog__input').fill('gia-dinh');
  await tapOrClick(page.getByRole('button', { name: 'Mở khóa' }), tap);
  await expect(page.locator('.english-feedback')).toContainText('Đã mở gói bài tập');
  expect(await readStoredPack(page)).toEqual({ passphrase: 'gia-dinh', hasPack: true });

  // The author changed the passphrase: the same one now 401s.
  mode = 'unauthorized';
  await tapOrClick(page.getByRole('button', { name: 'Phụ huynh' }), tap);
  await page.locator('.english-unlock-dialog__input').fill('gia-dinh');
  await tapOrClick(page.getByRole('button', { name: 'Mở khóa' }), tap);
  await expect(page.locator('.english-unlock-dialog__error')).toContainText('chưa đúng');
  expect(await readStoredPack(page)).toEqual({ passphrase: '', hasPack: true });
});

test('reload offline keeps the pack', async ({ page }, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  let requests = 0;
  await page.route('**/api/english-pack', async (route) => {
    requests += 1;
    await route.fulfill({ status: 200, json: { ok: true, pack: SYNTHETIC_PACK } });
  });
  await boot(page);
  await seedPackSkills(page);
  await startIsland(page);
  await tapOrClick(page.getByRole('button', { name: 'Phụ huynh' }), tap);
  await page.locator('.english-unlock-dialog__input').fill('gia-dinh');
  await tapOrClick(page.getByRole('button', { name: 'Mở khóa' }), tap);
  await expect(page.locator('.english-feedback')).toContainText('Đã mở gói bài tập');
  expect(requests).toBe(1);

  // Reload with the endpoint dead: the stored pack still joins round 2.
  await page.unroute('**/api/english-pack');
  await page.route('**/api/english-pack', (route) => route.abort());
  await page.reload();
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window && !!window.__game?.island);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await seedPackSkills(page);
  await startIsland(page);
  await answerRight(page, tap);
  await nextRound(page, tap);
  await expect(page.locator('.english-widget')).toContainText('zib');
  expect(requests).toBe(1);
});

test('Nghe speaks the shown word through a clip or speechSynthesis', async ({ page }, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  await fakeSpeech(page);
  await recordClipPlays(page);
  await boot(page);
  await startIsland(page);
  // Find a listen/letter round (its word is on screen as the prompt).
  for (let round = 1; round <= 8; round++) {
    const state = await islandState(page);
    if (state?.kind === 'listen-pick-picture' || state?.kind === 'letter-pick') break;
    await answerRight(page, tap);
    await nextRound(page, tap);
    if (round === 8) throw new Error('no listen/letter round in 8 rounds');
  }
  const prompt = (await page.locator('.english-prompt').textContent())?.trim() ?? '';
  expect(prompt.length).toBeGreaterThan(0);
  // The speaker plays the pre-generated clip first and only falls back to
  // speechSynthesis when the word has no clip — since step 2 every word has
  // one, so either signal proves Nghe spoke the shown word.
  const clipUrl = englishClipUrl(prompt);
  const playedBefore = (await playedClips(page)).length;
  await tapOrClick(page.locator('.english-listen'), tap);
  await expect
    .poll(
      async () => {
        const spoken = await spokenTexts(page);
        if (spoken.includes(prompt)) return true;
        if (clipUrl === null) return false;
        const played = await playedClips(page);
        return played.slice(playedBefore).includes(clipUrl);
      },
      { timeout: 10_000 },
    )
    .toBe(true);
});

test('abort mid-run removes the widget and records nothing', async ({ page }) => {
  await boot(page);
  await startIsland(page);
  const first = await islandState(page);
  const firstSkill = first?.skillId;
  if (!firstSkill) throw new Error('no first round');
  await page.evaluate(() => window.__game?.island.abort());
  await expect(page.locator('.english-run')).toHaveCount(0);
  await expect
    .poll(
      () =>
        page.evaluate(
          (skill) => window.__game?.snapshot()?.factStats[`sk:${skill}`]?.attempts ?? 0,
          firstSkill,
        ),
      { timeout: 10_000 },
    )
    .toBe(0);
});
