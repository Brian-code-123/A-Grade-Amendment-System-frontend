const STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

const PENDING_SUBMISSION_STATUSES = new Set([
  STATUS.SUBMITTED.toLowerCase(),
  STATUS.PENDING.toLowerCase(),
])

function normalizeSubmissionStatus(status) {
  const raw = String(status || '').trim().toLowerCase()
  if (!raw) return ''

  if (raw === STATUS.DRAFT.toLowerCase()) return STATUS.DRAFT
  if (raw === STATUS.APPROVED.toLowerCase()) return STATUS.APPROVED
  if (raw === STATUS.REJECTED.toLowerCase()) return STATUS.REJECTED
  if (PENDING_SUBMISSION_STATUSES.has(raw)) return STATUS.PENDING

  return status
}

function isPendingSubmissionStatus(status) {
  return normalizeSubmissionStatus(status) === STATUS.PENDING
}

function canReviewSubmissionStatus(status) {
  return isPendingSubmissionStatus(status)
}

export {
  STATUS,
  normalizeSubmissionStatus,
  isPendingSubmissionStatus,
  canReviewSubmissionStatus,
}