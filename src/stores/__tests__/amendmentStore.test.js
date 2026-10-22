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

describe('amendmentStore.createAmendment notifies the reviewer', () => {
  function routeFetch(handlers) {
    return vi.fn(async (url, options = {}) => {
      const key = `${options.method || 'GET'} ${String(url).replace(/^https?:\/\/[^/]+/, '')}`
      const handler = handlers[key]
      if (!handler) throw new Error(`unexpected request: ${key}`)
      return handler(options)
    })
  }

  const baseHandlers = () => ({
    'POST /api/amendments': () => jsonResponse({ _id: 'a1', status: 'Pending', student_name: 'Alice' }, 201),
    'POST /api/submissions': () => jsonResponse({ _id: 's1', status: 'Draft', title: 'Case' }, 201),
    'POST /api/submissions/s1/submit': () => jsonResponse({ _id: 's1', status: 'Submitted', title: 'Case' }),
    'PUT /api/amendments/a1': () => jsonResponse({ _id: 'a1', submission_id: 's1', status: 'Pending' })
  })

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    useAuthStore().setAuth('real-token', { name: 'Teacher', email: 't@example.com', role: 'Programme Director', signature: 'data:image/png;base64,AAAA' })
  })

  it('sends the submitted-case email once the case reaches the approval queue', async () => {
    globalThis.fetch = routeFetch({
      ...baseHandlers(),
      'POST /api/send-email': () => jsonResponse({ ok: true })
    })

    await useAmendmentStore().createAmendment({ student_name: 'Alice' })

    const emailCall = globalThis.fetch.mock.calls.find(([url]) => String(url).endsWith('/api/send-email'))
    expect(emailCall).toBeTruthy()
    const body = JSON.parse(emailCall[1].body)
    expect(body.type).toBe('submission')
    expect(body.submission._id).toBe('s1')
    expect(emailCall[1].headers.Authorization).toBe('Bearer real-token')
  })

  it('still succeeds when the email service is unavailable', async () => {
    globalThis.fetch = routeFetch({
      ...baseHandlers(),
      'POST /api/send-email': () => jsonResponse({ ok: false, error: 'Email service not configured' }, 503)
    })

    const result = await useAmendmentStore().createAmendment({ student_name: 'Alice' })
    expect(result._id).toBe('a1')
    expect(result.submission_id).toBe('s1')
  })
})
