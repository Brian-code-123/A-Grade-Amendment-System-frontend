// What to show about an earlier rejection. The reason stays on the record (the
// audit log is the history), so the UI decides whether it is still relevant:
// shown on a rejected case, shown as "previous" while a resubmitted case waits
// for review, hidden once the case has been approved.
export function rejectionNote(submission) {
  const text = String((submission && submission.rejection_reason) || '').trim()
  if (!text) return null
  const status = String(submission.status || '')
  if (status === 'Rejected') return { label: 'Rejection Reason', text }
  if (status === 'Approved') return null
  return { label: 'Previous rejection reason', text }
}
