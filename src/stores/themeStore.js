import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  function applyTheme(t) {
    document.documentElement.setAttribute('data-bs-theme', t)
    document.body.classList.toggle('dark-mode', t === 'dark')
    document.body.classList.toggle('light-mode', t === 'light')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', theme.value)
    applyTheme(theme.value)
  }

  function initTheme() {
    applyTheme(theme.value)
  }

  return { theme, toggleTheme, initTheme }
})
