<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'
import { useAuthStore } from '@/stores/authStore'

const subStore = useSubmissionStore()
const amStore = useAmendmentStore()
const auth = useAuthStore()

const showCreate = ref(false)
const newTitle = ref('')
const newDesc = ref('')
const selectedAmendments = ref([])
const successMsg = ref('')
const errorMsg = ref('')

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
  if (!confirm('Submit to admin for review? This action cannot be undone.')) return
  try {
    await subStore.submitToAdmin(id)
    successMsg.value = 'Submitted to admin successfully. Email notification sent.'
  } catch (e) {
    errorMsg.value = e.message
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

    <!-- Submissions List -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="subStore.loading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
        <div v-else-if="subStore.submissions.length === 0" class="text-center text-muted py-4">No submissions yet</div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Amendments</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in subStore.submissions" :key="s._id">
                <td>
                  <div class="fw-semibold">{{ s.title }}</div>
                  <div class="text-muted small">{{ s.description }}</div>
                </td>
                <td><span class="badge" :class="statusBadge(s.status)">{{ s.status }}</span></td>
                <td>{{ s.amendment_count || 0 }}</td>
                <td class="small">{{ new Date(s.created_at).toLocaleDateString() }}</td>
                <td>
                  <button v-if="s.status === 'Draft'" class="btn btn-sm btn-success" @click="submitToAdmin(s._id)">
                    <i class="bi bi-send"></i> Submit to Admin
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
