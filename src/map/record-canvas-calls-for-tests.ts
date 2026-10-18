// Test-only canvas 2D recorder: logs every method call and property write in order, so a map
// draw can be compared call-for-call against the ORIGINAL bundle's draw function.
export type CanvasCall = readonly unknown[];

export function createRecordingContext(calls: CanvasCall[]): CanvasRenderingContext2D {
  let gradients = 0;
  const label = (value: unknown) =>
    typeof value === 'object' && value && 'gradientId' in value ? value.gradientId : value;
  const target: Record<string, unknown> = {
    createRadialGradient: (...args: number[]) => {
      const gradientId = `gradient#${gradients++}`;
      calls.push(['createRadialGradient', ...args]);
      return {
        gradientId,
        addColorStop: (...stop: unknown[]) => calls.push([gradientId, 'addColorStop', ...stop]),
      };
    },
    measureText: (text: string) => {
      calls.push(['measureText', text]);
      return { width: text.length * 7.25 };
    },
  };
  const proxy = new Proxy(target, {
    get(store, key: string) {
      if (key in store) {
        return store[key];
      }
      return (...args: unknown[]) => {
        calls.push([key, ...args.map((arg) => (Array.isArray(arg) ? [...arg] : arg))]);
      };
    },
    set(_store, key: string, value: unknown) {
      calls.push(['set', key, label(value)]);
      return true;
    },
  });
  return proxy as unknown as CanvasRenderingContext2D;
}
