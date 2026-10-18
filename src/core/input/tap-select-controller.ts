import type { DropZone } from './drop-zone';
import type { InteractionEvent } from './interaction-types';

/**
 * Tap-select and keyboard alternative to dragging: pick an item, then pick a zone.
 * Keyboard: arrows move focus, Enter/Space activates, Escape cancels. Tab is never consumed so
 * focus can always leave the 3D scene (WCAG 2.1.2). Pure state machine.
 */
export class TapSelectController {
  private items: string[] = [];
  private zones: DropZone[] = [];
  private selected: string | null = null;
  private focusIndex = -1;

  constructor(private readonly emit: (event: InteractionEvent) => void) {}

  setTargets(items: readonly string[], zones: readonly DropZone[]): void {
    this.items = [...items];
    this.zones = [...zones];
    if (this.selected !== null && !this.items.includes(this.selected)) this.selected = null;
    this.focusIndex = Math.min(this.focusIndex, this.focusables().length - 1);
  }

  getSelected(): string | null {
    return this.selected;
  }

  /** Ids currently reachable by keyboard: items, or the zones accepting the selected item. */
  private focusables(): string[] {
    if (this.selected === null) return this.items;
    const selected = this.selected;
    return this.zones.filter((z) => z.accepts(selected)).map((z) => z.id);
  }

  tapItem(itemId: string, source: 'tap' | 'keyboard' = 'tap'): void {
    if (!this.items.includes(itemId)) return;
    this.selected = this.selected === itemId ? null : itemId;
    this.focusIndex = this.selected === null ? this.items.indexOf(itemId) : 0;
    this.emit({ type: 'tap-select', itemId: this.selected, source });
    if (source === 'keyboard') this.emitFocus();
  }

  /** zoneId null = the tap/Enter missed every accepting zone. Ends the selection either way. */
  tapZone(zoneId: string | null, source: 'tap' | 'keyboard' = 'tap'): void {
    const itemId = this.selected;
    if (itemId === null) return;
    this.selected = null;
    this.focusIndex = -1;
    this.emit({ type: 'drop', itemId, zoneId, position: null, source });
    this.emit({ type: 'tap-select', itemId: null, source });
    if (source === 'keyboard') this.emitFocus();
  }

  /** Returns true when the key was consumed (caller should preventDefault). */
  handleKey(key: string): boolean {
    const count = this.focusables().length;
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowUp': {
        if (count === 0) return false;
        const backwards = key === 'ArrowLeft' || key === 'ArrowUp';
        const step = backwards ? -1 : 1;
        const start = this.focusIndex < 0 ? (backwards ? 0 : -1) : this.focusIndex;
        this.focusIndex = (start + step + count) % count;
        this.emitFocus();
        return true;
      }
      case 'Enter':
      case ' ':
        return this.activate();
      case 'Escape':
        return this.cancel();
      default:
        return false;
    }
  }

  private activate(): boolean {
    const list = this.focusables();
    if (this.selected === null) {
      // No keyboard focus on a 3D item yet: leave Enter/Space to the DOM (e.g. number pad submit).
      if (list.length === 0 || this.focusIndex < 0) return false;
      const id = list[this.focusIndex];
      if (id !== undefined) this.tapItem(id, 'keyboard');
      return true;
    }
    const zoneId = list[this.focusIndex] ?? null;
    this.tapZone(zoneId, 'keyboard');
    return true;
  }

  private cancel(): boolean {
    if (this.selected !== null) {
      this.selected = null;
      this.focusIndex = -1;
      this.emit({ type: 'tap-select', itemId: null, source: 'keyboard' });
      this.emitFocus();
      return true;
    }
    if (this.focusIndex >= 0) {
      this.focusIndex = -1;
      this.emitFocus();
      return true;
    }
    return false;
  }

  private emitFocus(): void {
    const id = this.focusables()[this.focusIndex] ?? null;
    const kind = id === null ? 'none' : this.selected === null ? 'item' : 'zone';
    this.emit({ type: 'focus', kind, id });
  }

  reset(): void {
    this.items = [];
    this.zones = [];
    this.selected = null;
    this.focusIndex = -1;
  }
}
