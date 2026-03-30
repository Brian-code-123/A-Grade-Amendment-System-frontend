import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Provide a global pinia instance for component tests
config.global.plugins = [createPinia()]

// Stub localStorage for all tests
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Polyfill DOMMatrix for pdfjs-dist in jsdom environment
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0
    }
  }
}

