/**
 * Email Service — sends automated noreply notification emails via the backend API
 * Backend routes to Azure Communication Services (production) or console log (demo)
 *
 * All emails are sent automatically — no mailto: popups.
 */

import { buildApiUrl } from '@/utils/api'

const API = buildApiUrl('/api/send-email')
const ADMIN_EMAIL = '22240802@life.hkbu.edu.hk' // admin inbox — not displayed in UI

/**
 * Low-level send helper — POSTs to the backend email endpoint.
 * Works in both dev (Vite proxy) and production (same-origin Express).
 */
async function send({ to, subject, htmlBody, plainBody }) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, htmlBody, plainBody }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Email send failed')
  return json
}

/* ── Public API ───────────────────────────────────────────────── */

/**
 * Notify admin that a new submission is ready for review.
 * Called automatically when the user clicks "Submit to Program Director".
 */
export async function sendSubmissionEmail(submission, amendments = [], user = {}) {
  const date = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  let rows = ''
  if (amendments.length) {
    rows = amendments.map((a, i) =>
      `<tr>
        <td>${i + 1}</td>
        <td>${a.student_no || a.student_id || ''}</td>
        <td>${a.student_name || ''}</td>
        <td>${a.course_code || ''}</td>
        <td>${a.original_grade || ''} → ${a.new_grade || ''}</td>
        <td>${a.reason_type || 'N/A'}</td>
      </tr>`
    ).join('')
  }

  const plainList = amendments.length
    ? amendments.map((a, i) =>
        `  ${i + 1}. ${a.student_no || a.student_id} - ${a.student_name} | ${a.course_code} | ${a.original_grade} → ${a.new_grade}`
      ).join('\n')
    : `  ${submission.amendment_count || 0} amendment(s)`

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
      <h2 style="color:#003366">Grade Amendment — New Submission</h2>
      <p>Dear Admin,</p>
      <p>A grade amendment submission has been submitted for your review.</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0" cellpadding="6">
        <tr><td style="color:#666">Title</td><td><strong>${submission.title}</strong></td></tr>
        <tr><td style="color:#666">Submitted by</td><td>${user.name || submission.submitted_by_name || 'Programme Director'}</td></tr>
        <tr><td style="color:#666">Date</td><td>${date}</td></tr>
        <tr><td style="color:#666">Amendments</td><td>${amendments.length || submission.amendment_count || 0}</td></tr>
      </table>
      ${rows ? `
      <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px" border="1" cellpadding="4">
        <thead style="background:#003366;color:#fff">
          <tr><th>#</th><th>Student</th><th>Name</th><th>Course</th><th>Grade</th><th>Reason</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>` : ''}
      <p>Please log in to the <a href="${typeof window !== 'undefined' ? window.location.origin : ''}">Grade Amendment System</a> to review.</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
      <p style="font-size:11px;color:#999">This is an automated message from the HKBU Grade Amendment System. Do not reply.</p>
    </div>`

  const plainBody =
`Grade Amendment — New Submission

Title: ${submission.title}
Submitted by: ${user.name || submission.submitted_by_name || 'Programme Director'}
Date: ${date}

Amendments:
${plainList}

Please log in to the Grade Amendment System to review.
`

  return send({
    to: ADMIN_EMAIL,
    subject: `[Grade Amendment] ${submission.title} — Submitted for Review`,
    htmlBody,
    plainBody,
  })
}

/**
 * Notify submitter that a submission was approved.
 */
export async function sendApprovalEmail(submission, user = {}) {
  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
      <h2 style="color:#198754">Submission Approved ✓</h2>
      <p>The grade amendment submission <strong>${submission.title}</strong> has been approved.</p>
      <p>Approved by: ${user.name || 'Admin'}<br>Date: ${new Date().toLocaleDateString('en-GB')}</p>
      <p>The amendments will now be processed by the Academic Registry.</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
      <p style="font-size:11px;color:#999">HKBU Grade Amendment System — Automated notification.</p>
    </div>`

  return send({
    to: submission.submitted_by_email || ADMIN_EMAIL,
    subject: `[Grade Amendment] Approved: ${submission.title}`,
    htmlBody,
    plainBody: `Submission "${submission.title}" has been approved by ${user.name || 'Admin'}.`,
  })
}

/**
 * Notify submitter that a submission was rejected.
 */
export async function sendRejectionEmail(submission, reason, user = {}) {
  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
      <h2 style="color:#dc3545">Submission Rejected ✗</h2>
      <p>The grade amendment submission <strong>${submission.title}</strong> has been rejected.</p>
      <p>Rejected by: ${user.name || 'Admin'}<br>Date: ${new Date().toLocaleDateString('en-GB')}</p>
      <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
      <p>Please review the feedback and resubmit if necessary.</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
      <p style="font-size:11px;color:#999">HKBU Grade Amendment System — Automated notification.</p>
    </div>`

  return send({
    to: submission.submitted_by_email || ADMIN_EMAIL,
    subject: `[Grade Amendment] Rejected: ${submission.title}`,
    htmlBody,
    plainBody: `Submission "${submission.title}" was rejected. Reason: ${reason || 'N/A'}`,
  })
}
