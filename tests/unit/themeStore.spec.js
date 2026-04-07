import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from '@/stores/themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.removeAttribute('data-bs-theme')
    document.body.className = ''
  })

  it('initializes and toggles theme', () => {
    localStorage.setItem('theme', 'light')
    const store = useThemeStore()

    store.initTheme()
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
    expect(document.body.classList.contains('light-mode')).toBe(true)

    store.toggleTheme()
    expect(store.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
    expect(document.body.classList.contains('dark-mode')).toBe(true)
  })
})
