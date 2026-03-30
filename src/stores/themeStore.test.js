import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from './themeStore'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  // Reset DOM attributes set by theme store
  document.documentElement.removeAttribute('data-bs-theme')
  document.body.className = ''
})

describe('themeStore – initial state', () => {
  it('defaults to light when localStorage has no theme', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('light')
  })

  it('reads the theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    setActivePinia(createPinia())
    const store = useThemeStore()
    expect(store.theme).toBe('dark')
  })
})

describe('themeStore – toggleTheme', () => {
  it('switches from light to dark', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('light')
    store.toggleTheme()
    expect(store.theme).toBe('dark')
  })

  it('switches from dark back to light', () => {
    localStorage.setItem('theme', 'dark')
    setActivePinia(createPinia())
    const store = useThemeStore()
    store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  it('persists the new theme to localStorage', () => {
    const store = useThemeStore()
    store.toggleTheme()
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('sets data-bs-theme attribute on documentElement', () => {
    const store = useThemeStore()
    store.toggleTheme()
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
  })
})

describe('themeStore – initTheme', () => {
  it('applies the stored theme to the document', () => {
    localStorage.setItem('theme', 'dark')
    setActivePinia(createPinia())
    const store = useThemeStore()
    store.initTheme()
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
  })
})
