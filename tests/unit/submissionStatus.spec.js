import { describe, expect, it } from 'vitest'
import {
  canReviewSubmissionStatus,
  isPendingSubmissionStatus,
  normalizeSubmissionStatus,
} from '@/utils/submissionStatus'

describe('submissionStatus helpers', () => {
  it('treats Submitted and Pending as Pending for display/filter', () => {
    expect(normalizeSubmissionStatus('Submitted')).toBe('Pending')
    expect(normalizeSubmissionStatus('Pending')).toBe('Pending')
    expect(normalizeSubmissionStatus('pending')).toBe('Pending')
  })

  it('identifies pending statuses for PD visibility and review actions', () => {
    expect(isPendingSubmissionStatus('Submitted')).toBe(true)
    expect(isPendingSubmissionStatus('Pending')).toBe(true)
    expect(isPendingSubmissionStatus('Approved')).toBe(false)

    expect(canReviewSubmissionStatus('Submitted')).toBe(true)
    expect(canReviewSubmissionStatus('Pending')).toBe(true)
    expect(canReviewSubmissionStatus('Rejected')).toBe(false)
  })
})
