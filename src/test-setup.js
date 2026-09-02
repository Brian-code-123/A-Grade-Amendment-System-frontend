// Vitest's jsdom environment stubs window.localStorage as an inert object
// (no getItem/setItem/clear), so store code that reads/writes localStorage
// directly needs a working in-memory replacement while running under test.
function createMemoryStorage() {
  let store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    }
  }
}

const memoryStorage = createMemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, writable: true, configurable: true })
Object.defineProperty(window, 'localStorage', { value: memoryStorage, writable: true, configurable: true })
