export interface ContextLossCallbacks {
  onLost: () => void;
  onRestored: () => void;
}

/** Pause on `webglcontextlost` (and allow restoration), re-init on `webglcontextrestored`. */
export function attachContextLossHandler(
  canvas: HTMLCanvasElement,
  callbacks: ContextLossCallbacks,
): () => void {
  const abort = new AbortController();
  const options = { signal: abort.signal };
  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault(); // required, otherwise the browser never restores the context
      callbacks.onLost();
    },
    options,
  );
  canvas.addEventListener('webglcontextrestored', () => callbacks.onRestored(), options);
  return () => abort.abort();
}
