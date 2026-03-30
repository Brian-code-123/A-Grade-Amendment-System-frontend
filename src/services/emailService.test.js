import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendSubmissionEmail } from './emailService'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('emailService', () => {
  it('sends submission email payload and returns backend response', async () => {
    const mockResponse = {
      ok: true,
      mode: 'template',
      result: { id: 'test-id' }
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse
    })

    const submission = { _id: 'sub-1', title: 'Test Submission' }
    const amendments = [{ field: 'grade', from: 'B', to: 'A' }]
    const actor = { email: 'user@example.com' }

    const result = await sendSubmissionEmail(submission, amendments, actor)

    expect(result).toEqual(mockResponse)
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('/api/send-email')
    expect(options.method).toBe('POST')

    const payload = JSON.parse(options.body)
    expect(payload).toMatchObject({
      type: 'submission',
      submission,
      amendments,
      actor
    })
  })

  it('throws service-unavailable error message for 503 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error: 'Email service not configured',
        instructions: 'Configure Azure Communication Services in app settings'
      })
    })

    await expect(
      sendSubmissionEmail({ _id: 'sub-2' }, [], { email: 'user@example.com' })
    ).rejects.toThrow('Email service not configured')
  })
})
