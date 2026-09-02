import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../authStore'

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify(body)
  }
}

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('setAuth stores the token and user in state and localStorage', () => {
    const auth = useAuthStore()
    auth.setAuth('abc123', { name: 'Teacher', email: 't@example.com', role: 'Programme Director' })

    expect(auth.token).toBe('abc123')
    expect(auth.user.name).toBe('Teacher')
    expect(auth.isLoggedIn).toBe(true)
    expect(localStorage.getItem('token')).toBe('abc123')
    expect(JSON.parse(localStorage.getItem('user')).email).toBe('t@example.com')
  })

  it('clearAuth removes the token and user from state and localStorage', () => {
    const auth = useAuthStore()
    auth.setAuth('abc123', { name: 'Teacher', email: 't@example.com', role: 'Programme Director' })

    auth.clearAuth()

    expect(auth.token).toBe('')
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('authHeaders includes the current bearer token', () => {
    const auth = useAuthStore()
    auth.setAuth('my-token', { name: 'Head', email: 'h@example.com', role: 'Head' })

    expect(auth.authHeaders()).toEqual({
      Authorization: 'Bearer my-token',
      'Content-Type': 'application/json'
    })
  })

  it('login stores the returned token and user on success', async () => {
    const auth = useAuthStore()
    globalThis.fetch = vi.fn()
      // /api/auth/login
      .mockResolvedValueOnce(jsonResponse({ token: 'server-token', user: { name: 'Teacher', email: 't@example.com', role: 'Programme Director' } }))
      // fetchMe() called after login
      .mockResolvedValueOnce(jsonResponse({ name: 'Teacher', email: 't@example.com', role: 'Programme Director' }))

    await auth.login('t@example.com', 'password123')

    expect(auth.token).toBe('server-token')
    expect(auth.user.email).toBe('t@example.com')
  })

  it('login throws when the server does not return a token', async () => {
    const auth = useAuthStore()
    globalThis.fetch = vi.fn().mockResolvedValueOnce(jsonResponse({ message: 'Invalid credentials.' }, 401))

    await expect(auth.login('t@example.com', 'wrong-password')).rejects.toThrow()
    expect(auth.token).toBe('')
  })
})
