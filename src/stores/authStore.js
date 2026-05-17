import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/utils/api'

function normalizeRole(role) {
  if (!role) return role

  const normalizedRole = String(role).trim().toLowerCase().replace(/[_\s]+/g, '_')
  if (normalizedRole === 'admin') {
    return 'admin'
  }

  if (normalizedRole === 'programme_director') {
    return 'Programme Director'
  }

  return role
}

function normalizeUser(user) {
  if (!user) return user
  return {
    ...user,
    role: normalizeRole(user.role)
  }
}

function resolveLandingRoute(user) {
  const normalizedRole = normalizeRole(user?.role)
  if (normalizedRole === 'admin') {
    return '/admin'
  }
  if (normalizedRole === 'Head') {
    return '/pd-approvals'
  }
  return '/amendments'
}

function getApiConfigHint() {
  if (typeof window !== 'undefined' && window.location?.hostname?.endsWith('azurestaticapps.net')) {
    return ' This site is running on Azure Static Web Apps. Set VITE_API_BASE_URL to your backend App Service URL.'
  }
  return ''
}

async function parseJsonResponse(res, fallbackMessage) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase()
  const text = await res.text()

  if (!contentType.includes('application/json')) {
    throw new Error(`API returned a non-JSON response.${getApiConfigHint()}`)
  }

  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`API returned invalid JSON.${getApiConfigHint()}`)
  }

  if (!res.ok) {
    throw new Error(data.message || `${fallbackMessage} (${res.status})`)
  }

  return data
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(normalizeUser(JSON.parse(localStorage.getItem('user') || 'null')))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isPD = computed(() => user.value?.role === 'Programme Director')
  const isHead = computed(() => user.value?.role === 'Head')
  const userName = computed(() => user.value?.name || user.value?.email || '')

  function setAuth(tokenVal, userVal) {
    token.value = tokenVal
    user.value = normalizeUser(userVal)
    localStorage.setItem('token', tokenVal)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function login(email, password) {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await parseJsonResponse(res, 'Login failed')
    if (!data.token) throw new Error('Login response is missing token.')
    setAuth(data.token, data.user || data)
    await fetchMe()
    return data
  }

  async function loginWithCode(email, password, verificationCode) {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, verificationCode })
    })
    const data = await parseJsonResponse(res, 'Login failed')
    if (!data.token) throw new Error('Login response is missing token.')
    setAuth(data.token, data.user || data)
    await fetchMe()
    return data
  }

  async function register(name, email, password, role) {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    })
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    const text = await res.text()
    let data = {}
    if (contentType.includes('application/json')) {
      try { data = text ? JSON.parse(text) : {} } catch { data = {} }
    }
    if (!res.ok) {
      // 409 Conflict = explicit duplicate email from server
      // 500 with no message = likely duplicate email / DB unique constraint crash
      const isDuplicate = res.status === 409 ||
        (res.status === 500 && !data.message) ||
        /duplicate|already exist|already registered|unique/i.test(data.message || '') ||
        /duplicate|already exist|already registered|unique/i.test(text || '')
      if (isDuplicate) throw new Error('This email is already registered. Please log in instead.')
      throw new Error(data.message || `Registration failed (${res.status})`)
    }
    if (!contentType.includes('application/json')) {
      throw new Error(`Registration returned a non-JSON response.${getApiConfigHint()}`)
    }
    if (data.token) setAuth(data.token, data.user || data)
    return data
  }

  async function logout() {
    // Demo users just clear local state
    if (token.value?.startsWith('demo_token_')) {
      clearAuth()
      return
    }
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token.value }
      })
    } catch { /* ignore */ }
    clearAuth()
  }

  async function fetchMe() {
    if (!token.value) return
    // Demo users don't need to fetch from API
    if (token.value.startsWith('demo_token_')) return
    try {
      const res = await apiFetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token.value }
      })
      if (res.ok) {
        const text = await res.text()
        let data = {}
        try { data = text ? JSON.parse(text) : {} } catch { data = {} }
        if (data && Object.keys(data).length) {
          user.value = normalizeUser(data)
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      } else if (res.status === 401 || res.status === 403) {
        // Only clear local auth when backend explicitly rejects the token.
        clearAuth()
      }
    } catch {
      // Keep existing auth state on transient network/proxy errors
      // (e.g. ERR_CONNECTION_CLOSED), so users are not bounced to /login.
    }
  }

  function authHeaders() {
    return { 'Authorization': 'Bearer ' + token.value, 'Content-Type': 'application/json' }
  }

  async function saveSignature(signatureImage) {
    const normalizedSignature = String(signatureImage || '').trim()
    if (!normalizedSignature) {
      throw new Error('Signature data is required')
    }

    if (!token.value) {
      throw new Error('Please login before saving signature')
    }

    const previousUser = user.value ? { ...user.value } : null

    if (user.value) {
      user.value = {
        ...user.value,
        signature: normalizedSignature
      }
      localStorage.setItem('user', JSON.stringify(user.value))
    }

    if (token.value.startsWith('demo_token_')) {
      return { message: 'Signature saved locally for demo account' }
    }

    try {
      const res = await apiFetch('/api/auth/signature', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ signature: normalizedSignature })
      })

      const text = await res.text()
      let data = {}
      try { data = text ? JSON.parse(text) : {} } catch { data = {} }

      if (!res.ok) {
        throw new Error(data.message || `Failed to save signature (${res.status})`)
      }

      await fetchMe()
      return data
    } catch (error) {
      if (previousUser) {
        user.value = previousUser
        localStorage.setItem('user', JSON.stringify(previousUser))
      }
      throw error
    }
  }

  return { token, user, isLoggedIn, isAdmin, isPD, isHead, userName, setAuth, login, loginWithCode, register, logout, fetchMe, authHeaders, clearAuth, saveSignature, resolveLandingRoute }
})
