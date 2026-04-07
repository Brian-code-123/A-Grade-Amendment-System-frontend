import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/utils/api', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/api'
import { useAuthStore } from '@/stores/authStore'

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(apiFetch).mockReset()
  })

  it('stores auth data and normalizes role', () => {
    const store = useAuthStore()
    store.setAuth('token123', { name: 'Alex', role: 'admin' })

    expect(store.isLoggedIn).toBe(true)
    expect(store.user.role).toBe('admin')
    expect(localStorage.getItem('token')).toBe('token123')
  })

  it('logs in with code and fetches profile', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'abc', user: { name: 'Dr. Test', role: 'programme_director' } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ name: 'Dr. Test', role: 'Programme Director' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )

    const store = useAuthStore()
    await store.loginWithCode('test@hkbu.edu.hk', 'secret123', '123456')

    expect(store.token).toBe('abc')
    expect(store.user.name).toBe('Dr. Test')
    expect(apiFetch).toHaveBeenCalledTimes(2)
  })

  it('supports demo signature save and validates required inputs', async () => {
    const store = useAuthStore()

    await expect(store.saveSignature('')).rejects.toThrow('Signature data is required')

    store.setAuth('demo_token_1', { name: 'Demo User', role: 'Programme Director' })
    const result = await store.saveSignature('data:image/png;base64,abc')

    expect(result.message).toContain('Signature saved locally')
    expect(store.user.signature).toContain('data:image/png;base64,abc')
  })

  it('rolls back optimistic signature update when API fails', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'boom' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const store = useAuthStore()
    store.setAuth('real_token_1', { name: 'Real User', role: 'Programme Director', signature: 'old-sig' })

    await expect(store.saveSignature('new-sig')).rejects.toThrow('boom')
    expect(store.user.signature).toBe('old-sig')
  })
})
