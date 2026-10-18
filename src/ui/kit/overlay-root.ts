import './styles/design-tokens.css';
import './styles/ui-kit.css';

/** The `#ui` element from index.html: pointer-events none, children opt in via `.kit-layer > *`. */
export function getOverlayRoot(doc: Document = document): HTMLElement {
  const root = doc.getElementById('ui');
  if (!root) throw new Error('Missing #ui overlay root in index.html');
  return root;
}

/** A full-size layer for one scene/screen; remove() it when done. */
export function createLayer(root: HTMLElement, name: string): HTMLElement {
  const layer = root.ownerDocument.createElement('div');
  layer.className = 'kit-layer';
  layer.dataset.layer = name;
  root.appendChild(layer);
  return layer;
}
