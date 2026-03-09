<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useAuthStore } from '@/stores/authStore'
import { sendSubmissionEmail } from '@/services/emailService'

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
  if (!confirm(`Submit ${ids.length} submission(s) to admin for review? Email notifications will be sent.`)) return

  emailSending.value = true
  errorMsg.value = ''
  let count = 0
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
      } catch { /* email optional */ }

      count++
    } catch { /* continue */ }
  }
  selectedSubIds.splice(0)
  emailSending.value = false
  if (count > 0) {
    successMsg.value = `${count} submission(s) submitted to admin successfully!`
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
    const sub = await subStore.createSubmission({
      title: newTitle.value,
      description: newDesc.value,
      amendment_ids: selectedAmendments.value
    })
    successMsg.value = 'Submission created: ' + sub.title
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
  if (!confirm('Submit to admin for review? An email notification will be sent to the administrator.')) return
  emailSending.value = true
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
      const emailResult = await sendSubmissionEmail(submission, amendments, auth.user)
      if (emailResult.demo) {
        successMsg.value = 'Submitted to admin successfully! (Email logged — Azure not configured yet)'
      } else {
        successMsg.value = 'Submitted successfully. The administrator has been notified.'
      }
    } catch {
      successMsg.value = 'Submitted to admin successfully. (Email notification failed — please notify admin manually)'
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    emailSending.value = false
  }
}

const statusBadge = (status) => {
  const map = { Draft: 'bg-warning text-dark', Submitted: 'bg-info', Approved: 'bg-success', Rejected: 'bg-danger' }
  return map[status] || 'bg-secondary'
}

onMounted(() => {
  subStore.fetchSubmissions()
  amStore.fetchAmendments()
})
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fw-bold mb-0"><i class="bi bi-send"></i> Submissions</h3>
      <button class="btn btn-primary btn-sm" @click="showCreate = !showCreate">
        <i class="bi" :class="showCreate ? 'bi-x' : 'bi-plus'"></i> {{ showCreate ? 'Cancel' : 'New Submission' }}
      </button>
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
    <div v-if="draftSubmissions.length > 0" class="card shadow-sm mb-3 border-0" style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)">
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
              Submit {{ selectedDraftCount }} to Admin
            </button>
          </div>
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
                <th>Title</th>
                <th>Status</th>
                <th>Amendments</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in subStore.submissions" :key="s._id" :class="{ 'table-active': selectedSubIds.includes(s._id) }">
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
                  <div class="fw-semibold">{{ s.title }}</div>
                  <div class="text-muted small">{{ s.description }}</div>
                </td>
                <td><span class="badge" :class="statusBadge(s.status)">{{ s.status }}</span></td>
                <td>{{ s.amendment_count || 0 }}</td>
                <td class="small">{{ new Date(s.created_at).toLocaleDateString() }}</td>
                <td>
                  <button v-if="s.status === 'Draft'" class="btn btn-sm btn-success" @click="submitToAdmin(s._id)" :disabled="emailSending">
                    <span v-if="emailSending" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi bi-send"></i> Submit to Admin
                  </button>
                  <span v-else-if="s.status === 'Submitted'" class="text-muted small">Awaiting review</span>
                  <span v-else-if="s.status === 'Approved'" class="text-success small"><i class="bi bi-check-circle"></i> Approved</span>
                  <span v-else-if="s.status === 'Rejected'" class="text-danger small"><i class="bi bi-x-circle"></i> Rejected</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Workflow -->
    <div class="card shadow-sm mt-4">
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
  </div>
</template>
