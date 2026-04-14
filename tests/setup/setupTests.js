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

// Mock DOMMatrix for PDF.js
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init) {
      this.m11 = 1
      this.m12 = 0
      this.m21 = 0
      this.m22 = 1
      this.m41 = 0
      this.m42 = 0
      if (init) {
        Object.assign(this, init)
      }
    }
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
