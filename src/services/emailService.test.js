import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendSubmissionEmail, sendApprovalEmail, sendRejectionEmail } from './emailService'

beforeEach(() => {
  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ ok: true }),
  }))
})

describe('emailService payload delegation', () => {
  it('sends submission payload to backend API', async () => {
    await sendSubmissionEmail({ title: 'Batch A' }, [{ student_no: 'S001' }], { name: 'PD' })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [, options] = fetch.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.type).toBe('submission')
    expect(body.submission.title).toBe('Batch A')
  })

  it('sends approval payload to backend API', async () => {
    await sendApprovalEmail({ title: 'Batch B' }, { name: 'Admin' })

    const [, options] = fetch.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.type).toBe('approval')
  })

  it('sends rejection payload to backend API', async () => {
    await sendRejectionEmail({ title: 'Batch C' }, 'Invalid data', { name: 'Admin' })

    const [, options] = fetch.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.type).toBe('rejection')
    expect(body.reason).toBe('Invalid data')
  })
})
