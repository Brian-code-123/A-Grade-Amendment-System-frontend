import { describe, it, expect } from 'vitest'
import { rejectionNote } from '../rejectionNote'

describe('rejectionNote', () => {
  it('shows the reason on a rejected submission', () => {
    expect(rejectionNote({ status: 'Rejected', rejection_reason: 'Missing slip' }))
      .toEqual({ label: 'Rejection Reason', text: 'Missing slip' })
  })

  it('labels it as previous once the case has been resubmitted', () => {
    expect(rejectionNote({ status: 'Submitted', rejection_reason: 'Missing slip' }))
      .toEqual({ label: 'Previous rejection reason', text: 'Missing slip' })
    expect(rejectionNote({ status: 'Pending', rejection_reason: 'Missing slip' }))
      .toEqual({ label: 'Previous rejection reason', text: 'Missing slip' })
  })

  it('hides a stale reason on approved or printed cases', () => {
    expect(rejectionNote({ status: 'Approved', rejection_reason: 'Missing slip' })).toBeNull()
    expect(rejectionNote({ status: 'Approved', printed: true, rejection_reason: 'Missing slip' })).toBeNull()
  })

  it('returns nothing without a reason or submission', () => {
    expect(rejectionNote({ status: 'Rejected' })).toBeNull()
    expect(rejectionNote({ status: 'Rejected', rejection_reason: '   ' })).toBeNull()
    expect(rejectionNote(null)).toBeNull()
  })
})
