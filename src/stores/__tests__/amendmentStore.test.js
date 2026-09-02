import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAmendmentStore } from '../amendmentStore'
import { useAuthStore } from '../authStore'

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => JSON.stringify(body)
  }
}

describe('amendmentStore.fetchAmendments', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.setAuth('real-token', { name: 'Teacher', email: 't@example.com', role: 'Programme Director' })
  })

  it('populates amendments from the API for a non-demo user', async () => {
    const amendment = { _id: '1', title: 'Case A', status: 'Pending' }
    globalThis.fetch = vi.fn().mockResolvedValueOnce(jsonResponse([amendment]))

    const store = useAmendmentStore()
    await store.fetchAmendments()

    expect(store.amendments).toEqual([amendment])
    expect(store.loading).toBe(false)
    expect(store.error).toBe('')

    const calledUrl = globalThis.fetch.mock.calls[0][0]
    expect(calledUrl).toContain('/api/amendments')
    expect(calledUrl).toContain('includeAll=true')
  })

  it('records an error and clears loading when the request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce(jsonResponse({ message: 'nope' }, 500))

    const store = useAmendmentStore()
    await store.fetchAmendments()

    expect(store.amendments).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe('Failed to fetch amendments')
  })
})
