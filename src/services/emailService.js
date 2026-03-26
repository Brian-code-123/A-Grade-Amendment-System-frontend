import { buildApiUrl } from '@/utils/api'

const API = buildApiUrl('/api/send-email')

async function send(payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Email send failed')
  return json
}

export async function sendSubmissionEmail(submission, amendments = [], user = {}) {
  return send({
    type: 'submission',
    submission,
    amendments,
    actor: user,
  })
}

export async function sendApprovalEmail(submission, user = {}) {
  return send({
    type: 'approval',
    submission,
    actor: user,
  })
}

export async function sendRejectionEmail(submission, reason, user = {}) {
  return send({
    type: 'rejection',
    submission,
    reason,
    actor: user,
  })
}
