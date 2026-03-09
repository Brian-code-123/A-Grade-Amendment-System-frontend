import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isPD = computed(() => user.value?.role === 'Programme Director')
  const userName = computed(() => user.value?.name || user.value?.email || '')

  function setAuth(tokenVal, userVal) {
    token.value = tokenVal
    user.value = userVal
    localStorage.setItem('token', tokenVal)
    localStorage.setItem('user', JSON.stringify(userVal))
  }

  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    setAuth(data.token, data.user || data)
    return data
  }

  async function loginWithCode(email, password, verificationCode) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, verificationCode })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    setAuth(data.token, data.user || data)
    return data
  }

  async function register(name, email, password, role) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed')
    setAuth(data.token, data.user || data)
    return data
  }

  async function logout() {
    // Demo users just clear local state
    if (token.value?.startsWith('demo_token_')) {
      clearAuth()
      return
    }
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token.value }
      })
    } catch (e) { /* ignore */ }
    clearAuth()
  }

  async function fetchMe() {
    if (!token.value) return
    // Demo users don't need to fetch from API
    if (token.value.startsWith('demo_token_')) return
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token.value }
      })
      if (res.ok) {
        const data = await res.json()
        user.value = data
        localStorage.setItem('user', JSON.stringify(data))
      } else {
        clearAuth()
      }
    } catch (e) {
      clearAuth()
    }
  }

  function authHeaders() {
    return { 'Authorization': 'Bearer ' + token.value, 'Content-Type': 'application/json' }
  }

  return { token, user, isLoggedIn, isAdmin, userName, setAuth, login, loginWithCode, register, logout, fetchMe, authHeaders, clearAuth }
})
