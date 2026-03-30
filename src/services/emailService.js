import { buildApiUrl } from '@/utils/api'

const API = buildApiUrl('/api/send-email')

async function send(payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await res.json()
  
  // Check for service unavailable (Azure not configured)
  if (res.status === 503) {
    const msg = json.instructions 
      ? `${json.error || 'Email service not configured'}\n${json.instructions}`
      : 'Email service is temporarily unavailable. Please contact IT support.'
    throw new Error(msg)
  }
  
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
