import { defineStrings } from '../i18n/i18n';

const tw = defineStrings('core', {
  vi: {
    webglTitle: 'Máy chưa chạy được trò chơi',
    webglBody:
      'Trình duyệt này chưa hỗ trợ đồ họa 3D (WebGL). Hãy thử Safari, Chrome hoặc Edge bản mới nhất.',
  },
  en: {
    webglTitle: "This device can't run the game yet",
    webglBody:
      "This browser doesn't support 3D graphics (WebGL). Try the latest Safari, Chrome or Edge.",
  },
});

/** True when a WebGL2 context can be created. Never throws. */
export function isWebGLAvailable(doc: Document = document): boolean {
  try {
    const canvas = doc.createElement('canvas');
    return canvas.getContext('webgl2') !== null;
  } catch {
    return false;
  }
}

/** Friendly full-screen message instead of a crash. Returns the panel for removal. */
export function showWebGLFallback(root: HTMLElement): HTMLElement {
  const panel = root.ownerDocument.createElement('div');
  panel.className = 'kit-fallback';
  panel.setAttribute('role', 'alert');
  const title = root.ownerDocument.createElement('h1');
  title.textContent = tw('webglTitle');
  const body = root.ownerDocument.createElement('p');
  body.textContent = tw('webglBody');
  panel.append(title, body);
  root.appendChild(panel);
  return panel;
}
