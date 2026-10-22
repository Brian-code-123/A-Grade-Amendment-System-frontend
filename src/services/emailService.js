import { apiFetch } from '@/utils/api'
import { useAuthStore } from '@/stores/authStore'

const API_PATH = '/api/send-email'

// The backend only sends mail for signed-in users, so the token goes with every call.
function authHeaders() {
  const auth = useAuthStore()
  const headers = { 'Content-Type': 'application/json' }
  if (auth.token) headers.Authorization = 'Bearer ' + auth.token
  return headers
}

async function send(payload) {
  const res = await apiFetch(API_PATH, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  const contentType = (res.headers?.get?.('content-type') || '').toLowerCase()
  const text = await res.text()

  if (!contentType.includes('application/json')) {
    const hostHint = typeof window !== 'undefined' && window.location?.hostname?.endsWith('azurestaticapps.net')
      ? ' Set VITE_API_BASE_URL to your backend App Service URL and redeploy.'
      : ''
    throw new Error(`Email API returned a non-JSON response.${hostHint}`)
  }

  let json = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Email API returned invalid JSON response.')
  }
  
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
