/** Tiny synchronous event emitter; listeners are copied before dispatch so they may unsubscribe. */
export class TypedEmitter<E> {
  private listeners = new Set<(event: E) => void>();

  on(listener: (event: E) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: E): void {
    for (const listener of [...this.listeners]) listener(event);
  }

  clear(): void {
    this.listeners.clear();
  }
}
