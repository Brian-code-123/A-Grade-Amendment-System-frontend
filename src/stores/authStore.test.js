import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore'

function mockFetchResponse(data, ok = true, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    status,
    text: async () => JSON.stringify(data),
    json: async () => data,
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('authStore – initial state', () => {
  it('starts with empty token when localStorage is empty', () => {
    const auth = useAuthStore()
    expect(auth.token).toBe('')
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('reads token and user from localStorage on first use', () => {
    const fakeToken = 'abc123'
    const fakeUser = { name: 'Alice', role: 'Programme Director' }
    localStorage.setItem('token', fakeToken)
    localStorage.setItem('user', JSON.stringify(fakeUser))

    setActivePinia(createPinia())
    const auth = useAuthStore()
    expect(auth.token).toBe(fakeToken)
    expect(auth.user?.name).toBe('Alice')
  })
})

describe('authStore – setAuth / clearAuth', () => {
  it('setAuth persists token and user to localStorage', () => {
    const auth = useAuthStore()
    auth.setAuth('token-1', { name: 'Bob', role: 'Programme Director' })

    expect(auth.token).toBe('token-1')
    expect(auth.user?.name).toBe('Bob')
    expect(localStorage.getItem('token')).toBe('token-1')
    expect(JSON.parse(localStorage.getItem('user')).name).toBe('Bob')
  })

  it('clearAuth removes token and user from localStorage', () => {
    const auth = useAuthStore()
    auth.setAuth('token-2', { name: 'Carol', role: 'admin' })
    auth.clearAuth()

    expect(auth.token).toBe('')
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})

describe('authStore – computed roles', () => {
  it('isAdmin is true for admin role', () => {
    const auth = useAuthStore()
    auth.setAuth('tok', { role: 'admin' })
    expect(auth.isAdmin).toBe(true)
  })

  it('isPD is true for Programme Director role', () => {
    const auth = useAuthStore()
    auth.setAuth('tok', { role: 'Programme Director' })
    expect(auth.isPD).toBe(true)
  })

  it('isHead is true for Head role', () => {
    const auth = useAuthStore()
    auth.setAuth('tok', { role: 'Head' })
    expect(auth.isHead).toBe(true)
  })

  it('userName returns user name', () => {
    const auth = useAuthStore()
    auth.setAuth('tok', { name: 'Dave', role: 'Programme Director' })
    expect(auth.userName).toBe('Dave')
  })

  it('userName falls back to email when name is absent', () => {
    const auth = useAuthStore()
    auth.setAuth('tok', { email: 'dave@example.com', role: 'Programme Director' })
    expect(auth.userName).toBe('dave@example.com')
  })
})

describe('authStore – normalizeRole', () => {
  it('normalises programme_director to Programme Director', () => {
    const auth = useAuthStore()
    auth.setAuth('tok', { role: 'programme_director' })
    expect(auth.user?.role).toBe('Programme Director')
  })

  it('normalises admin to lowercase admin', () => {
    const auth = useAuthStore()
    auth.setAuth('tok', { role: 'ADMIN' })
    expect(auth.user?.role).toBe('admin')
  })
})

describe('authStore – login', () => {
  it('calls /api/auth/login and sets auth on success', async () => {
    const spy = mockFetchResponse({ token: 'tok123', user: { name: 'Eve', role: 'Programme Director' } })
    // mock fetchMe call that follows login
    spy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ token: 'tok123', user: { name: 'Eve', role: 'Programme Director' } }),
      json: async () => ({ token: 'tok123', user: { name: 'Eve', role: 'Programme Director' } }),
    }).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ name: 'Eve', role: 'Programme Director' }),
      json: async () => ({ name: 'Eve', role: 'Programme Director' }),
    })

    const auth = useAuthStore()
    await auth.login('eve@example.com', 'password123')
    expect(auth.token).toBe('tok123')
  })

  it('throws on failed login', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'Invalid credentials' }),
      json: async () => ({ message: 'Invalid credentials' }),
    })

    const auth = useAuthStore()
    await expect(auth.login('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })
})

describe('authStore – register', () => {
  it('throws duplicate email error on 409', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 409,
      text: async () => JSON.stringify({ message: 'Duplicate' }),
      json: async () => ({ message: 'Duplicate' }),
    })

    const auth = useAuthStore()
    await expect(auth.register('Eve', 'eve@example.com', 'pw', 'Programme Director'))
      .rejects.toThrow(/already registered/)
  })
})

describe('authStore – logout', () => {
  it('clears auth for demo user without hitting API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: async () => '{}', json: async () => ({}) })
    const auth = useAuthStore()
    auth.setAuth('demo_token_abc', { role: 'admin' })
    await auth.logout()

    expect(auth.token).toBe('')
    // API should not have been called for demo user
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('calls logout API for real user', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: async () => '{}', json: async () => ({}) })
    const auth = useAuthStore()
    auth.setAuth('real-token', { role: 'Programme Director' })
    await auth.logout()

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(auth.token).toBe('')
  })
})

describe('authStore – authHeaders', () => {
  it('returns correct Authorization header', () => {
    const auth = useAuthStore()
    auth.setAuth('my-token', { role: 'admin' })
    expect(auth.authHeaders()).toEqual({
      Authorization: 'Bearer my-token',
      'Content-Type': 'application/json',
    })
  })
})

describe('authStore – saveSignature', () => {
  it('throws when signature is empty', async () => {
    const auth = useAuthStore()
    auth.setAuth('tok', { role: 'Programme Director' })
    await expect(auth.saveSignature('')).rejects.toThrow('Signature data is required')
  })

  it('saves locally for demo user without calling API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: async () => '{}', json: async () => ({}) })
    const auth = useAuthStore()
    auth.setAuth('demo_token_x', { role: 'Programme Director' })
    const result = await auth.saveSignature('data:image/png;base64,abc')
    expect(result.message).toContain('demo')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
