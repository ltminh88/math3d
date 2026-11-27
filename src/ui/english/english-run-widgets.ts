// Run shell (two-modes Phase 1, split from english-run.ts, move-only): the
// run's DOM — header (title, round line, parent unlock), item area, feedback
// line, footer (hint + Next) — plus the Next waiter the round loop awaits
// (the Next click, or the abort path resolving it).
import { announce } from '../kit/aria-announcer';
import { createUiButton } from '../kit/ui-button';
import { tei } from './english-strings';

export interface EnglishRunShell {
  readonly root: HTMLDivElement;
  readonly roundEl: HTMLParagraphElement;
  readonly itemArea: HTMLDivElement;
  readonly feedback: HTMLParagraphElement;
  readonly hintButton: HTMLButtonElement;
  readonly nextButton: HTMLButtonElement;
  /** Write the feedback line (and announce it). */
  readonly say: (text: string) => void;
  /** Await the Next tap (or an abort resolving it). */
  readonly waitNext: () => Promise<void>;
  /** Resolve the current Next wait (the abort path). */
  readonly resolveNext: () => void;
}

export function buildEnglishRunShell(
  doc: Document,
  opts: { onParentUnlock: () => void },
): EnglishRunShell {
  const root = doc.createElement('div');
  root.className = 'english-run';
  const header = doc.createElement('div');
  header.className = 'english-run__header';
  const title = doc.createElement('h2');
  title.className = 'english-run__title';
  title.textContent = tei('runTitle');
  const roundEl = doc.createElement('p');
  roundEl.className = 'english-run__round';
  const parentButton = createUiButton(
    { label: tei('parentUnlock'), variant: 'secondary', onClick: opts.onParentUnlock },
    doc,
  );
  parentButton.classList.add('english-parent-unlock');
  header.append(title, roundEl, parentButton);
  const itemArea = doc.createElement('div');
  itemArea.className = 'english-run__item';
  const feedback = doc.createElement('p');
  feedback.className = 'english-feedback';
  feedback.setAttribute('role', 'status');
  const footer = doc.createElement('div');
  footer.className = 'english-run__footer';
  const hintButton = createUiButton(
    { label: `💡 ${tei('hint')}`, variant: 'secondary', onClick: () => {} },
    doc,
  );
  hintButton.classList.add('english-hint');
  const nextButton = createUiButton({ label: tei('next'), onClick: () => {} }, doc);
  nextButton.classList.add('english-next');
  nextButton.hidden = true;
  footer.append(hintButton, nextButton);
  root.append(header, itemArea, feedback, footer);

  const say = (text: string) => {
    feedback.textContent = text;
    announce(text, doc);
  };

  let resolveNext: (() => void) | null = null;
  nextButton.addEventListener('click', () => resolveNext?.());

  return {
    root,
    roundEl,
    itemArea,
    feedback,
    hintButton,
    nextButton,
    say,
    waitNext: () =>
      new Promise<void>((resolve) => {
        resolveNext = resolve;
      }),
    resolveNext: () => resolveNext?.(),
  };
}
