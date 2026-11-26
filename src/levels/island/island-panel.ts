// The island HUD inside the level overlay: VLM's speech card and the island panel
// (stage title + the run's own DOM, mounted by `startEnglishRun`). The panel stays
// mounted for the whole run — the run's widgets live inside it, and the done card
// replaces them when the run resolves — so the panel is always there to be seen.
// Recovered classes: glass, question-intro.
import { tc } from '../../i18n/common-strings';
import type { IslandStrings } from './island-strings';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export class IslandPanel {
  readonly guide = el('div', 'island-guide glass');
  readonly panel = el('section', 'island-panel glass');
  readonly title = el('p', 'question-intro island-stage');
  /** Where `startEnglishRun` mounts the run's DOM (and the done card afterwards). */
  readonly runRoot = el('div', 'island-run');
  private readonly guideText = el('p');

  constructor(
    root: HTMLElement,
    private readonly cs: IslandStrings,
  ) {
    const name = el('strong', 'island-guide__name', tc('guideName'));
    this.guide.append(el('span', 'island-guide__dot', '✦'), name, this.guideText);
    this.title.id = 'island-stage';
    this.panel.setAttribute('aria-labelledby', this.title.id);
    this.panel.append(this.title, this.runRoot);
    root.append(this.guide, this.panel);
  }

  /** Shows the stage line for a run ("Chặng 3/8 · Chữ I–L"). */
  showStage(stage: number, block: string): void {
    this.title.textContent = this.cs('stageName', { n: stage, block });
  }

  say(text: string): void {
    this.guideText.textContent = text;
  }

  hide(): void {
    this.panel.hidden = true;
  }

  destroy(): void {
    this.guide.remove();
    this.panel.remove();
  }
}
