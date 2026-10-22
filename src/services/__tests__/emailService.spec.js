import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/utils/api', () => ({ apiFetch: vi.fn() }))

import { apiFetch } from '@/utils/api'
import { useAuthStore } from '@/stores/authStore'
import { sendApprovalEmail } from '../emailService'

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify(body)
  }
}

describe('emailService', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    apiFetch.mockReset()
    apiFetch.mockResolvedValue(jsonResponse({ ok: true }))
  })

  it('sends the signed-in user token as a Bearer header', async () => {
    useAuthStore().setAuth('token-123', { email: 'head@example.com', role: 'Head' })

    await sendApprovalEmail({ _id: 's1', title: 'Case' }, { name: 'Head' })

    const [path, options] = apiFetch.mock.calls[0]
    expect(path).toBe('/api/send-email')
    expect(options.headers.Authorization).toBe('Bearer token-123')
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('does not send a Bearer header when nobody is signed in', async () => {
    await sendApprovalEmail({ _id: 's1' }, {})

    const [, options] = apiFetch.mock.calls[0]
    expect(options.headers.Authorization).toBeUndefined()
  })
})
