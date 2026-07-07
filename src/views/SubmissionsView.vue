<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useAuthStore } from '@/stores/authStore'
import { sendSubmissionEmail } from '@/services/emailService'

const router = useRouter()
const subStore = useSubmissionStore()
const amStore = useAmendmentStore()
const auth = useAuthStore()

const showCreate = ref(false)
const newTitle = ref('')
const newDesc = ref('')
const selectedAmendments = ref([])
const successMsg = ref('')
const errorMsg = ref('')
const emailSending = ref(false)
const submitting = reactive({})

/* ── Batch selection for submissions ───────────────────────────── */
const selectedSubIds = reactive([])

const draftSubmissions = computed(() => subStore.submissions.filter(s => s.status === 'Draft'))

const allDraftsSelected = computed(() => {
  return draftSubmissions.value.length > 0 && draftSubmissions.value.every(s => selectedSubIds.includes(s._id))
})

function toggleSelectAllDrafts() {
  if (allDraftsSelected.value) {
    draftSubmissions.value.forEach(s => {
      const idx = selectedSubIds.indexOf(s._id)
      if (idx >= 0) selectedSubIds.splice(idx, 1)
    })
  } else {
    draftSubmissions.value.forEach(s => {
      if (!selectedSubIds.includes(s._id)) selectedSubIds.push(s._id)
    })
  }
}

function toggleSubSelect(id) {
  const idx = selectedSubIds.indexOf(id)
  idx >= 0 ? selectedSubIds.splice(idx, 1) : selectedSubIds.push(id)
}

const selectedDraftCount = computed(() => {
  return selectedSubIds.filter(id => {
    const s = subStore.submissions.find(s => s._id === id)
    return s && s.status === 'Draft'
  }).length
})

async function batchSubmitToAdmin() {
  const ids = selectedSubIds.filter(id => {
    const s = subStore.submissions.find(s => s._id === id)
    return s && s.status === 'Draft'
  })
  if (ids.length === 0) { errorMsg.value = 'No draft submissions selected'; return }
  if (!confirm(`Submit ${ids.length} submission(s) to Program Director for review? Email notifications will be sent.`)) return

  emailSending.value = true
  errorMsg.value = ''
  let count = 0
  let emailFailedCount = 0
  for (const id of ids) {
    try {
      const submission = subStore.submissions.find(s => s._id === id)
      if (!submission) continue

      const amendments = (submission.amendment_ids || [])
        .map(aid => amStore.amendments.find(a => a._id === aid))
        .filter(Boolean)

      await subStore.submitToAdmin(id)

      try {
        await sendSubmissionEmail(submission, amendments, auth.user)
      } catch {
        emailFailedCount++
      }

      count++
    } catch { /* continue */ }
  }
  selectedSubIds.splice(0)
  emailSending.value = false
  if (count > 0) {
    successMsg.value = `${count} submission(s) submitted to Program Director successfully!`
    if (emailFailedCount > 0) {
      errorMsg.value = `${emailFailedCount} email notification(s) failed to send. Please notify Program Director manually.`
    }
  } else {
    errorMsg.value = 'Failed to submit any submissions'
  }
}

const pendingAmendments = computed(() => {
  return amStore.amendments.filter(a => !a.submission_id && a.status === 'Pending')
})

async function createAndSubmit() {
  if (!newTitle.value) { errorMsg.value = 'Title is required'; return }
  if (selectedAmendments.value.length === 0) { errorMsg.value = 'Select at least one amendment'; return }
  errorMsg.value = ''
  try {
    const selectedAmendmentPayload = selectedAmendments.value
      .map(aid => amStore.amendments.find(a => a._id === aid))
      .filter(Boolean)

    const sub = await subStore.createSubmission({
      title: newTitle.value,
      description: newDesc.value,
      amendment_ids: selectedAmendments.value,
      amendments: selectedAmendmentPayload
    })

    // Demo flow: auto-submit to PD so the pending case appears immediately.
    if (auth.token?.startsWith('demo_token_') && sub?._id) {
      await subStore.submitToAdmin(sub._id)
      successMsg.value = 'Submission created and sent to Program Director: ' + sub.title
    } else {
      successMsg.value = 'Submission created: ' + sub.title
    }

    newTitle.value = ''
    newDesc.value = ''
    selectedAmendments.value = []
    showCreate.value = false
    await subStore.fetchSubmissions()
    await amStore.fetchAmendments()
  } catch (e) {
    errorMsg.value = e.message
  }
}

async function submitToAdmin(id) {
  if (!confirm('Submit to Program Director for review? An email notification will be sent to the Program Director.')) return
  submitting[id] = true
  errorMsg.value = ''
  try {
    // Get submission details
    const submission = subStore.submissions.find(s => s._id === id)
    if (!submission) throw new Error('Submission not found')

    // Resolve amendment details for the email
    const amendments = (submission.amendment_ids || [])
      .map(aid => amStore.amendments.find(a => a._id === aid))
      .filter(Boolean)

    // Update submission status
    await subStore.submitToAdmin(id)

    // Send automated noreply email to admin
    try {
      await sendSubmissionEmail(submission, amendments, auth.user)
      successMsg.value = 'Submitted successfully. Email sent to Program Director.'
    } catch (emailErr) {
      // Check if it's a configuration error
      if (emailErr.message && emailErr.message.includes('not configured')) {
        errorMsg.value = emailErr.message + ' However, submission has been saved.'
      } else {
        successMsg.value = 'Submitted to Program Director successfully. (Email notification failed — please notify Program Director manually)'
      }
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    submitting[id] = false
  }
}

async function resubmitToPD(id) {
  if (!confirm('Resubmit this to the Program Director for review?')) return
  submitting[id] = true
  errorMsg.value = ''
  try {
    const submission = subStore.submissions.find(s => s._id === id)
    if (!submission) throw new Error('Submission not found')

    const relatedAmendments = [...(submission.amendment_ids || [])]
    await subStore.resubmitSubmission(id)

    if (relatedAmendments.length) {
      relatedAmendments.forEach(aid => {
        const amendment = amStore.amendments.find(a => a._id === aid)
          if (amendment) {
            amendment.status = 'Pending'
            amendment.created_at = new Date().toISOString()
          }
      })
    }

    try {
      await amStore.fetchAmendments()
    } catch {
      // resubmit already succeeded; refresh failure is non-fatal
    }
    successMsg.value = 'Submission resubmitted successfully! The Program Director will review it shortly.'
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    submitting[id] = false
  }
}

const statusLabel = (status) => {
  if (status !== 'Submitted') return status
  if (auth.user?.role === 'Teacher') return 'Approved'
  return 'Pending'
}

const statusBadge = (status) => {
  const normalized = statusLabel(status)
  const map = { Draft: 'bg-warning text-dark', Pending: 'bg-info', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[normalized] || 'bg-secondary'
}

const amendmentLookup = computed(() => new Map(amStore.amendments.map(amendment => [amendment._id, amendment])))

function getSubmissionAmendments(submission) {
  return (submission.amendment_ids || [])
    .map(id => amendmentLookup.value.get(id))
    .filter(Boolean)
}

function getPrimaryAmendment(submission) {
  return getSubmissionAmendments(submission)[0] || null
}

function getAmendmentHeadline(amendment) {
  if (!amendment) return ''
  const studentNo = amendment.student_no ? ` (${amendment.student_no})` : ''
  return `${amendment.student_name || 'Unknown student'}${studentNo} · ${amendment.course_code || 'Unknown course'}`
}

function getAmendmentSummary(amendment) {
  if (!amendment) return ''
  const yearTerm = [amendment.academic_year ? `AY ${amendment.academic_year}` : '', amendment.term ? `Term ${amendment.term}` : '']
    .filter(Boolean)
    .join(' · ')
  const gradeChange = [amendment.original_grade, amendment.new_grade].filter(Boolean).join(' → ')
  const reasonMap = {
    conversion: 'Conversion',
    makeup: 'Make-up exam',
    supplementary: 'Supplementary exam',
    review: 'Staff review',
    appeal: 'Appeal',
    others: 'Other',
  }
  const reason = reasonMap[amendment.reason_type] || amendment.reason_type || 'Amendment'
  return [yearTerm, gradeChange ? `Grade ${gradeChange}` : '', reason].filter(Boolean).join(' · ')
}

function getSubmissionHeadline(submission) {
  const primary = getPrimaryAmendment(submission)
  if (!primary) return submission.title || 'Unnamed submission'
  return getAmendmentHeadline(primary)
}

function getSubmissionSummary(submission) {
  const amendments = getSubmissionAmendments(submission)
  const primary = amendments[0]
  const parts = []
  if (primary) parts.push(getAmendmentSummary(primary))
  if (submission.title) parts.push(`Batch title: ${submission.title}`)
  if (amendments.length > 1) parts.push(`+${amendments.length - 1} more amendment${amendments.length > 2 ? 's' : ''}`)
  return parts.filter(Boolean).join(' · ')
}

onMounted(() => {
  subStore.fetchSubmissions()
  amStore.fetchAmendments()
})
</script>

<template>
  <div class="container py-4 submissions-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fw-bold mb-0"><i class="bi bi-send"></i> Submissions</h3>
      <button class="btn btn-primary btn-sm" @click="showCreate = !showCreate">
        <i class="bi" :class="showCreate ? 'bi-x' : 'bi-plus'"></i> {{ showCreate ? 'Cancel' : 'New Submission' }}
      </button>
    </div>

    <div class="alert alert-secondary border-0 small mb-3">
      <i class="bi bi-info-circle me-1"></i>
      This page lists submissions built from linked grade amendment forms.
    </div>

    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show">
      {{ successMsg }}<button class="btn-close" @click="successMsg = ''"></button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show">
      {{ errorMsg }}<button class="btn-close" @click="errorMsg = ''"></button>
    </div>

    <!-- Create Submission -->
    <div v-if="showCreate" class="card shadow-sm mb-4">
      <div class="card-header fw-bold">Create New Submission</div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input v-model="newTitle" class="form-control" placeholder="e.g. Semester 1 Grade Amendments - COMP Department" />
        </div>
        <div class="mb-3">
          <label class="form-label">Description (Optional)</label>
          <textarea v-model="newDesc" class="form-control" rows="2"></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Select Amendments to Include</label>
          <div v-if="pendingAmendments.length === 0" class="text-muted">No pending amendments available. Create some first.</div>
          <div v-else class="border rounded p-2" style="max-height:200px;overflow-y:auto">
            <div v-for="a in pendingAmendments" :key="a._id" class="form-check">
              <input class="form-check-input" type="checkbox" :value="a._id" v-model="selectedAmendments" :id="'am-' + a._id" />
              <label class="form-check-label small" :for="'am-' + a._id">
                {{ a.student_no }} - {{ a.student_name }} ({{ a.course_code }}: {{ a.original_grade }} → {{ a.new_grade }})
              </label>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" @click="createAndSubmit"><i class="bi bi-check"></i> Create Submission</button>
      </div>
    </div>

    <!-- Batch submit toolbar -->
    <div v-if="draftSubmissions.length > 0" class="card shadow-sm mb-3 border-0 batch-toolbar">
      <div class="card-body py-3">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <input type="checkbox" class="form-check-input" :checked="allDraftsSelected" @change="toggleSelectAllDrafts" />
            <span class="fw-semibold small text-muted">
              <i class="bi bi-send-check me-1"></i>Select draft submissions for batch submit
            </span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span v-if="selectedDraftCount > 0" class="badge bg-dark rounded-pill px-3 py-2">
              <i class="bi bi-check2-square me-1"></i>{{ selectedDraftCount }} selected
            </span>
            <button
              v-if="selectedDraftCount > 0"
              class="btn btn-sm btn-success rounded-pill px-3"
              @click="batchSubmitToAdmin"
              :disabled="emailSending"
            >
              <span v-if="emailSending" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-send-fill me-1"></i>
              Submit {{ selectedDraftCount }} to Program Director
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Workflow -->
    <div class="card shadow-sm mb-3">
      <div class="card-header fw-bold"><i class="bi bi-diagram-3"></i> Submission Workflow</div>
      <div class="card-body">
        <div class="d-flex flex-wrap align-items-center justify-content-center gap-2">
          <span class="badge bg-secondary p-2">Notification Received</span>
          <i class="bi bi-arrow-right"></i>
          <span class="badge bg-primary p-2">Fill Form / Upload Excel</span>
          <i class="bi bi-arrow-right"></i>
          <span class="badge bg-info p-2">Validate Data</span>
          <i class="bi bi-arrow-right"></i>
          <span class="badge bg-warning text-dark p-2">Create Submission</span>
          <i class="bi bi-arrow-right"></i>
          <span class="badge bg-success p-2">Director Submits</span>
          <i class="bi bi-arrow-right"></i>
          <span class="badge bg-dark p-2">Admin Review</span>
          <i class="bi bi-arrow-right"></i>
          <span class="badge bg-success p-2">Complete</span>
        </div>
      </div>
    </div>

    <!-- Submissions List -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="subStore.loading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        <div v-else-if="subStore.submissions.length === 0" class="text-center text-muted py-4">No submissions yet</div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="width:40px"></th>
                <th>Amendment / Submission</th>
                <th>Status</th>
                <th>Number of Cases</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in subStore.submissions" :key="s._id" :class="{ 'table-active': selectedSubIds.includes(s._id), 'table-danger': s.status === 'Rejected' }">
                <td>
                  <input
                    v-if="s.status === 'Draft'"
                    type="checkbox"
                    class="form-check-input"
                    :checked="selectedSubIds.includes(s._id)"
                    @change="toggleSubSelect(s._id)"
                  />
                </td>
                <td>
                  <div class="fw-semibold">{{ getSubmissionHeadline(s) }}</div>
                  <div class="text-muted small">{{ getSubmissionSummary(s) }}</div>
                  <div class="text-muted small" v-if="s.description">{{ s.description }}</div>
                  <div v-if="s.status === 'Rejected' && s.rejection_reason" class="d-flex align-items-start gap-1 mt-1">
                    <i class="bi bi-exclamation-circle-fill text-danger mt-1 flex-shrink-0"></i>
                    <span class="text-danger small"><strong>Reason:</strong> {{ s.rejection_reason }}</span>
                  </div>
                </td>
                <td><span class="badge" :class="statusBadge(s.status)">{{ statusLabel(s.status) }}</span></td>
                <td>{{ s.amendment_count || 0 }}</td>
                <td class="small">{{ new Date(s.created_at).toLocaleDateString() }}</td>
                <td>
                  <button v-if="s.status === 'Draft'" class="btn btn-sm btn-success" @click="submitToAdmin(s._id)" :disabled="emailSending || submitting[s._id]">
                    <span v-if="submitting[s._id]" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi bi-send"></i> Submit to Program Director
                  </button>
                  <span v-else-if="s.status === 'Submitted'" class="text-muted small">
                    {{ auth.user?.role === 'Teacher' ? 'Approved' : 'Pending review' }}
                  </span>
                  <span v-else-if="s.status === 'Approved'" class="text-success small"><i class="bi bi-check-circle"></i> Approved</span>
                  <div v-else-if="s.status === 'Rejected'" class="d-flex flex-column gap-1">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="router.push({ path: '/amendments', query: { source: 'submission', submissionId: s._id } })"
                    >
                      <i class="bi bi-pencil me-1"></i>Edit Amendments
                    </button>
                    <button class="btn btn-sm btn-warning" @click="resubmitToPD(s._id)" :disabled="submitting[s._id]">
                      <span v-if="submitting[s._id]" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="bi bi-arrow-counterclockwise me-1"></i>Resubmit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.batch-toolbar {
  background: linear-gradient(135deg,#f1fbf5 0%,#dff0e7 100%);
}

.submissions-page {
  --submissions-forest-900: #050d0a;
  --submissions-forest-850: #091410;
  --submissions-forest-800: #0d1914;
  --submissions-forest-700: #14241d;
  --submissions-forest-600: #1d3228;
  --submissions-forest-500: #2a473b;
  --submissions-forest-400: #486d5d;
  --submissions-accent: #8db7a4;
  --submissions-accent-2: #bfd4ca;
  --submissions-text: #edf5f1;
  --submissions-muted: #cad7d1;
  --submissions-danger: #704048;
  --submissions-danger-soft: #d3a0a7;
}

[data-bs-theme="dark"] .submissions-page {
  color: var(--submissions-text);
}

[data-bs-theme="dark"] .submissions-page > .card,
[data-bs-theme="dark"] .submissions-page .batch-toolbar {
  background: rgba(10,21,16,0.92);
  border-color: rgba(141,183,164,0.18);
  box-shadow: 0 4px 24px rgba(0,0,0,0.28);
}

[data-bs-theme="dark"] .submissions-page h3,
[data-bs-theme="dark"] .submissions-page .fw-semibold,
[data-bs-theme="dark"] .submissions-page .fw-bold {
  color: var(--submissions-text);
}

[data-bs-theme="dark"] .submissions-page .form-label,
[data-bs-theme="dark"] .submissions-page .form-check-label,
[data-bs-theme="dark"] .submissions-page .small,
[data-bs-theme="dark"] .submissions-page td,
[data-bs-theme="dark"] .submissions-page th {
  color: var(--submissions-text);
}

[data-bs-theme="dark"] .submissions-page .batch-toolbar .text-muted,
[data-bs-theme="dark"] .submissions-page .batch-toolbar .small,
[data-bs-theme="dark"] .submissions-page .text-muted {
  color: var(--submissions-muted) !important;
}

[data-bs-theme="dark"] .submissions-page .batch-toolbar .badge.bg-dark {
  background: rgba(141,183,164,0.16) !important;
  color: var(--submissions-text) !important;
}

[data-bs-theme="dark"] .submissions-page .batch-toolbar .btn-success,
[data-bs-theme="dark"] .submissions-page .btn-primary,
[data-bs-theme="dark"] .submissions-page .btn-success {
  background: linear-gradient(135deg, #4f7f69, #3c6653);
  border-color: transparent;
  color: #f4fbf7;
}

[data-bs-theme="dark"] .submissions-page .btn-success:hover,
[data-bs-theme="dark"] .submissions-page .btn-primary:hover {
  background: linear-gradient(135deg, #5c9278, #4f7f69);
}

[data-bs-theme="dark"] .submissions-page table {
  color: var(--submissions-text);
}

[data-bs-theme="dark"] .submissions-page thead {
  background: rgba(8,19,14,0.95);
}

[data-bs-theme="dark"] .submissions-page thead th {
  border-bottom-color: rgba(141,183,164,0.22);
  color: var(--submissions-accent-2);
}

[data-bs-theme="dark"] .submissions-page tbody tr {
  background: rgba(10,21,16,0.88);
}

[data-bs-theme="dark"] .submissions-page tbody tr:hover,
[data-bs-theme="dark"] .submissions-page tbody tr.table-active {
  background: rgba(29,50,40,0.88) !important;
}

[data-bs-theme="dark"] .submissions-page tbody tr.table-danger {
  background: rgba(92,48,54,0.42) !important;
  border-left: 4px solid rgba(211,160,167,0.72);
}

[data-bs-theme="dark"] .submissions-page tbody tr.table-danger:hover {
  background: rgba(104,54,61,0.5) !important;
}

[data-bs-theme="dark"] .submissions-page tbody tr.table-danger,
[data-bs-theme="dark"] .submissions-page tbody tr.table-danger td,
[data-bs-theme="dark"] .submissions-page tbody tr.table-danger .text-danger,
[data-bs-theme="dark"] .submissions-page tbody tr.table-danger .text-muted,
[data-bs-theme="dark"] .submissions-page tbody tr.table-danger .small {
  color: #ffe5e8 !important;
}

[data-bs-theme="dark"] .submissions-page tbody tr.table-danger > * {
  background-color: rgba(92,48,54,0.42) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.18);
}

[data-bs-theme="dark"] .submissions-page tbody tr.table-danger .btn-outline-primary {
  color: #ffe5e8;
  border-color: rgba(255,229,232,0.42);
}

[data-bs-theme="dark"] .submissions-page tbody tr.table-danger .btn-outline-primary:hover {
  background: rgba(255,229,232,0.14);
  color: #fff;
}

[data-bs-theme="dark"] .submissions-page .card-header {
  background: linear-gradient(135deg, rgba(10,27,20,0.94), rgba(16,35,26,0.88));
  color: var(--submissions-accent-2);
}

[data-bs-theme="dark"] .submissions-page .table-responsive {
  border-color: rgba(121,179,151,0.14);
}

[data-bs-theme="dark"] .submissions-page .btn-outline-primary {
  color: var(--submissions-accent-2);
  border-color: rgba(191,212,202,0.42);
}

[data-bs-theme="dark"] .submissions-page .btn-outline-primary:hover {
  background: rgba(141,183,164,0.14);
  color: #f4fbf7;
}

[data-bs-theme="dark"] .submissions-page .btn-warning {
  background: linear-gradient(135deg, #e0b84e, #c79d2f);
  border-color: transparent;
  color: #1d1a10;
}

[data-bs-theme="dark"] .submissions-page .btn-close {
  filter: invert(1) grayscale(100%);
}
</style>
