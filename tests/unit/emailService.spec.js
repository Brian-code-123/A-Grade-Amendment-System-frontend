import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/api', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/utils/api'
import { sendSubmissionEmail } from '@/services/emailService'

describe('emailService', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('sends submission email payload to API', async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const result = await sendSubmissionEmail({ _id: 'sub1' }, [{ _id: 'a1' }], { name: 'Teacher' })
    expect(result.ok).toBe(true)
    expect(apiFetch).toHaveBeenCalledWith('/api/send-email', expect.any(Object))
  })

  it('throws for non-JSON responses', async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response('<html>bad gateway</html>', {
        status: 502,
        headers: { 'content-type': 'text/html' },
      }),
    )

    await expect(sendSubmissionEmail({ _id: 'sub2' })).rejects.toThrow('non-JSON')
  })

  it('throws detailed message when service is unavailable', async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Email service not configured', instructions: 'Set SMTP config' }),
        { status: 503, headers: { 'content-type': 'application/json' } },
      ),
    )

    await expect(sendSubmissionEmail({ _id: 'sub3' })).rejects.toThrow('Email service not configured')
  })
})
