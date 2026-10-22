import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSubmissionStore } from '../submissionStore'
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

function routeFetch(handlers) {
  return vi.fn(async (url, options = {}) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, '').split('?')[0]
    const handler = handlers[`${options.method || 'GET'} ${path}`]
    if (!handler) throw new Error(`unexpected request: ${options.method || 'GET'} ${path}`)
    return handler(options)
  })
}

describe('submissionStore.resubmitSubmission', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    useAuthStore().setAuth('real-token', { name: 'Teacher', email: 't@example.com', role: 'Programme Director' })
  })

  const handlers = (emailResponse) => ({
    'POST /api/submissions/s1/resubmit': () => jsonResponse({ _id: 's1', status: 'Submitted', title: 'Case' }),
    'GET /api/submissions': () => jsonResponse([]),
    'POST /api/send-email': () => emailResponse
  })

  it('notifies the Programme Director that the case is back in the queue', async () => {
    globalThis.fetch = routeFetch(handlers(jsonResponse({ ok: true })))

    await useSubmissionStore().resubmitSubmission('s1', { amendment: { _id: 'a1', student_name: 'Alice' } })

    const emailCall = globalThis.fetch.mock.calls.find(([url]) => String(url).endsWith('/api/send-email'))
    expect(emailCall).toBeTruthy()
    const body = JSON.parse(emailCall[1].body)
    expect(body.type).toBe('submission')
    expect(body.submission._id).toBe('s1')
    expect(body.amendments).toEqual([{ _id: 'a1', student_name: 'Alice' }])
  })

  it('still succeeds when the email service is unavailable', async () => {
    globalThis.fetch = routeFetch(handlers(jsonResponse({ ok: false, error: 'Email service not configured' }, 503)))

    const result = await useSubmissionStore().resubmitSubmission('s1')
    expect(result.status).toBe('Submitted')
  })
})
