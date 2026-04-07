import { beforeEach, vi } from 'vitest'

function createMemoryStorage() {
  const store = new Map()
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(String(key), String(value))
    },
    removeItem(key) {
      store.delete(String(key))
    },
    clear() {
      store.clear()
    },
  }
}

if (typeof globalThis.localStorage?.getItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
  })
}

if (typeof globalThis.sessionStorage?.getItem !== 'function') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createMemoryStorage(),
    configurable: true,
  })
}

beforeEach(() => {
  if (typeof localStorage?.clear === 'function') {
    localStorage.clear()
  }
  if (typeof sessionStorage?.clear === 'function') {
    sessionStorage.clear()
  }
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
