// Service-worker update prompt (phase 18 / TASK R22): registration gate, prompt
// show/hide, reload/later actions. Vitest runs in node, so the DOM is a fake.

import type { RegisterSWOptions } from 'virtual:pwa-register';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLanguage, setLanguage } from '../i18n/i18n';
import {
  mountSwUpdatePrompt,
  registerServiceWorker,
  shouldRegisterServiceWorker,
} from './sw-update-prompt';
import { sw } from './sw-update-prompt-strings';

/** Minimal DOM stand-in: elements record attributes/children/listeners; `focus()` flags. */
class FakeElement {
  hidden = false;
  className = '';
  type = '';
  id = '';
  readonly attributes = new Map<string, string>();
  readonly children: FakeElement[] = [];
  readonly classList = { add: vi.fn(), remove: vi.fn() };
  readonly listeners = new Map<string, Array<() => void>>();
  focused = false;
  textContentValue = '';
  set textContent(value: string) {
    this.textContentValue = value;
  }
  get textContent(): string {
    return this.textContentValue;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  addEventListener(type: string, fn: () => void) {
    const list = this.listeners.get(type) ?? [];
    list.push(fn);
    this.listeners.set(type, list);
  }
  appendChild(child: FakeElement) {
    this.children.push(child);
    return child;
  }
  click() {
    this.listeners.get('click')?.forEach((fn) => {
      fn();
    });
  }
  focus() {
    this.focused = true;
  }
}

const fakeDocument = {
  createElement: () => new FakeElement(),
  getElementById: (_id: string) => new FakeElement(),
};

const fakeSettings = { update: () => {} };

afterEach(() => {
  if (getLanguage() !== 'vi') setLanguage('vi', undefined, fakeSettings as never);
});

describe('swUpdate strings', () => {
  it('says the new version is ready in Vietnamese', () => {
    expect(sw('message')).toBe('Có bản mới – tải lại?');
    expect(sw('reload')).toBe('Tải lại');
    expect(sw('later')).toBe('Để sau');
  });

  it('mirrors every key in English', () => {
    setLanguage('en', undefined, fakeSettings as never);
    expect(sw('message')).toBe('A new version is ready – reload?');
    expect(sw('reload')).toBe('Reload');
    expect(sw('later')).toBe('Later');
  });
});

describe('shouldRegisterServiceWorker', () => {
  it('registers on production builds', () => {
    expect(shouldRegisterServiceWorker('production', '')).toBe(true);
  });

  it('never registers in dev (no sw.js is generated there)', () => {
    expect(shouldRegisterServiceWorker('development', '')).toBe(false);
    expect(shouldRegisterServiceWorker('development', '?pwa=1')).toBe(false);
  });

  it('stays off in test builds unless the offline spec opts in', () => {
    expect(shouldRegisterServiceWorker('test', '')).toBe(false);
    expect(shouldRegisterServiceWorker('test', '?pwa=1')).toBe(true);
    expect(shouldRegisterServiceWorker('test', '?pwa')).toBe(true);
  });
});

describe('mountSwUpdatePrompt', () => {
  it('starts hidden, shows with the message, focuses the reload button', () => {
    const root = new FakeElement();
    root.hidden = true;
    const onReload = vi.fn();
    const prompt = mountSwUpdatePrompt(root as never, onReload, fakeDocument as never);
    expect(root.hidden).toBe(true);
    prompt.show();
    expect(root.hidden).toBe(false);
    expect(prompt.message.textContent).toBe('Có bản mới – tải lại?');
    expect((prompt.reloadButton as unknown as FakeElement).focused).toBe(true);
  });

  it('reload calls the updater, later hides without reloading', () => {
    const root = new FakeElement();
    const onReload = vi.fn();
    const prompt = mountSwUpdatePrompt(root as never, onReload, fakeDocument as never);
    prompt.show();
    prompt.laterButton.click();
    expect(root.hidden).toBe(true);
    expect(onReload).not.toHaveBeenCalled();
    prompt.show();
    prompt.reloadButton.click();
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});

describe('registerServiceWorker', () => {
  it('does nothing when the gate is off', () => {
    const registerFn = vi.fn();
    registerServiceWorker({ registerFn, mode: 'test', search: '' });
    expect(registerFn).not.toHaveBeenCalled();
  });

  it('registers and shows the prompt when the worker reports a new version', () => {
    let onNeedRefresh: (() => void) | undefined;
    const registerFn = vi.fn((options?: RegisterSWOptions) => {
      onNeedRefresh = options?.onNeedRefresh;
      return () => Promise.resolve();
    });
    const root = new FakeElement();
    root.hidden = true;
    const doc = {
      createElement: () => new FakeElement(),
      getElementById: () => root,
    };
    registerServiceWorker({
      registerFn,
      mode: 'production',
      search: '',
      doc: doc as never,
    });
    expect(registerFn).toHaveBeenCalledTimes(1);
    expect(root.hidden).toBe(true);
    onNeedRefresh?.();
    expect(root.hidden).toBe(false);
  });

  it('checks for a new worker right after registering', async () => {
    const update = vi.fn(() => Promise.resolve());
    let onRegisteredSW:
      | ((swUrl: string, registration: ServiceWorkerRegistration | undefined) => void)
      | undefined;
    const registerFn = vi.fn((options?: RegisterSWOptions) => {
      onRegisteredSW = options?.onRegisteredSW;
      return () => Promise.resolve();
    });
    const root = new FakeElement();
    const fakeDoc = {
      createElement: () => new FakeElement(),
      getElementById: () => root,
    };
    registerServiceWorker({ registerFn, mode: 'production', doc: fakeDoc as never });
    expect(registerFn).toHaveBeenCalledTimes(1);
    onRegisteredSW?.('sw.js', { update } as unknown as ServiceWorkerRegistration);
    expect(update).toHaveBeenCalledTimes(1);
    await Promise.resolve();
  });

  it('ignores a failed update check instead of throwing', async () => {
    const update = vi.fn(() => Promise.reject(new Error('offline')));
    let onRegisteredSW:
      | ((swUrl: string, registration: ServiceWorkerRegistration | undefined) => void)
      | undefined;
    const registerFn = vi.fn((options?: RegisterSWOptions) => {
      onRegisteredSW = options?.onRegisteredSW;
      return () => Promise.resolve();
    });
    const root = new FakeElement();
    const fakeDoc = {
      createElement: () => new FakeElement(),
      getElementById: () => root,
    };
    registerServiceWorker({ registerFn, mode: 'production', doc: fakeDoc as never });
    expect(() =>
      onRegisteredSW?.('sw.js', { update } as unknown as ServiceWorkerRegistration),
    ).not.toThrow();
    expect(update).toHaveBeenCalledTimes(1);
    // The rejection must be swallowed, not left unhandled.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  it('logs registration errors instead of throwing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    let onRegisterError: ((e: unknown) => void) | undefined;
    const registerFn = vi.fn((options?: RegisterSWOptions) => {
      onRegisterError = options?.onRegisterError;
      return () => Promise.resolve();
    });
    registerServiceWorker({
      registerFn,
      mode: 'production',
      search: '',
      doc: fakeDocument as never,
    });
    onRegisterError?.(new Error('no sw'));
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
