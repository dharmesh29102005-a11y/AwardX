import '@testing-library/jest-dom';

/** Node 22+ may expose a broken `localStorage` when `--localstorage-file` is invalid. */
const localStorageStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => (localStorageStore.has(key) ? localStorageStore.get(key)! : null),
  setItem: (key: string, value: string) => {
    localStorageStore.set(key, String(value));
  },
  removeItem: (key: string) => {
    localStorageStore.delete(key);
  },
  clear: () => {
    localStorageStore.clear();
  },
  key: (index: number) => Array.from(localStorageStore.keys())[index] ?? null,
  get length() {
    return localStorageStore.size;
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
